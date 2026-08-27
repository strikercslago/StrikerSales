import type { SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseClient } from "@/lib/supabase/client";
import type { Database, Json } from "@/types/database.generated";
import type {
  CreateSiteProjectInput,
  Client,
  ClientInsert,
  SiteProject,
  SiteProjectDecision,
  SiteProjectStageDetail,
  SiteProjectStageItem,
  SiteProjectStageKey,
  SiteProjectStageStatus,
  SiteProjectSummary,
  SiteProjectOverview,
  StageDataUpdate,
  StageItemUpdate,
} from "@/types/site-project";
import type { SiteProjectRepository } from "./project-repository";

const concurrentEditMessage = "Este conteúdo foi alterado em outra sessão. Atualize a etapa antes de tentar novamente.";

export class SupabaseSiteProjectRepository implements SiteProjectRepository {
  constructor(private readonly client: SupabaseClient<Database> = getSupabaseClient()) {}

  async listClients(): Promise<Client[]> {
    const { data, error } = await this.client.from("clients").select("*").is("deleted_at", null).order("name");
    if (error) throw new Error(`Não foi possível carregar os clientes: ${error.message}`);
    return data;
  }

  async createClient(input: ClientInsert): Promise<Client> {
    const { data, error } = await this.client.from("clients").insert(input).select("*").single();
    if (error) throw new Error(`Não foi possível criar o cliente: ${error.message}`);
    return data;
  }

  async deleteClient(clientId: string) {
    const { error } = await this.client.from("clients").delete().eq("id", clientId);
    if (error) throw new Error(`Não foi possível remover o cliente incompleto: ${error.message}`);
  }

  async listProjects(includeDeleted = false): Promise<SiteProjectSummary[]> {
    let query = this.client.from("site_projects").select("*").order("updated_at", { ascending: false });
    if (!includeDeleted) query = query.is("deleted_at", null);
    const { data, error } = await query;
    if (error) throw new Error(`Não foi possível carregar os projetos: ${error.message}`);

    const projectIds = data.map((project) => project.id);
    const clientIds = data.flatMap((project) => project.client_id ? [project.client_id] : []);
    const [clientsResult, stagesResult, scoresResult] = await Promise.all([
      clientIds.length ? this.client.from("clients").select("id,name,company,segment").in("id", clientIds) : Promise.resolve({ data: [], error: null }),
      projectIds.length ? this.client.from("site_project_stages").select("project_id,stage_key,title,status").in("project_id", projectIds) : Promise.resolve({ data: [], error: null }),
      projectIds.length ? this.client.from("site_project_scores").select("project_id,dimension,score,is_pending").in("project_id", projectIds) : Promise.resolve({ data: [], error: null }),
    ]);
    if (clientsResult.error || stagesResult.error || scoresResult.error) throw new Error("Não foi possível completar os dados da listagem.");

    return Promise.all(data.map(async (project) => {
      const client = clientsResult.data.find((item) => item.id === project.client_id);
      const currentStage = stagesResult.data.find((stage) => stage.project_id === project.id && stage.stage_key === project.current_stage_key);
      const score = scoresResult.data.find((item) => item.project_id === project.id && item.dimension === "overall" && !item.is_pending);
      return {
        ...project,
        clientName: client?.name,
        clientCompany: client?.company ?? undefined,
        segment: client?.segment ?? undefined,
        currentStageTitle: currentStage?.title ?? "Descoberta",
        currentStageStatus: (currentStage?.status ?? "pending") as SiteProjectStageStatus,
        strikerScore: score?.score == null ? undefined : Number(score.score),
        progressPercent: await this.getProgress(project.id),
      };
    }));
  }

  async getProject(projectId: string): Promise<SiteProject | undefined> {
    const { data, error } = await this.client.from("site_projects").select("*").eq("id", projectId).maybeSingle();
    if (error) throw new Error(`Não foi possível carregar o projeto: ${error.message}`);
    return data ?? undefined;
  }

  async createProject(input: CreateSiteProjectInput): Promise<SiteProject> {
    const projectId = input.id ?? crypto.randomUUID();
    const { error } = await this.client.from("site_projects").insert({ ...input, id: projectId });
    if (error) throw new Error(`Não foi possível criar o projeto: ${error.message}`);
    const project = await this.getProject(projectId);
    if (!project) throw new Error("Projeto criado, mas não foi possível carregá-lo após a inicialização.");
    return project;
  }

  async getStage(projectId: string, stageKey: SiteProjectStageKey): Promise<SiteProjectStageDetail | undefined> {
    const { data, error } = await this.client
      .from("site_project_stages")
      .select("*, site_project_stage_items(*)")
      .eq("project_id", projectId)
      .eq("stage_key", stageKey)
      .order("sort_order", { referencedTable: "site_project_stage_items", ascending: true })
      .maybeSingle();
    if (error) throw new Error(`Não foi possível carregar a etapa: ${error.message}`);
    if (!data) return undefined;
    const { site_project_stage_items: items, ...stage } = data;
    return { ...stage, items };
  }

  async getOverview(projectId: string): Promise<SiteProjectOverview | undefined> {
    const project = await this.getProject(projectId);
    if (!project) return undefined;
    const [clientResult, stagesResult, historyResult, qaResult, filesResult, scoresResult, progressPercent] = await Promise.all([
      project.client_id
        ? this.client.from("clients").select("*").eq("id", project.client_id).maybeSingle()
        : Promise.resolve({ data: null, error: null }),
      this.client.from("site_project_stages").select("*").eq("project_id", projectId).order("position"),
      this.client.from("site_project_history").select("*").eq("project_id", projectId).order("created_at", { ascending: false }).limit(8),
      this.client.from("site_project_qa_items").select("*").eq("project_id", projectId).eq("severity", "critical").neq("status", "resolved").order("created_at", { ascending: false }),
      this.client.from("site_project_files").select("id", { count: "exact", head: true }).eq("project_id", projectId).is("deleted_at", null),
      this.client.from("site_project_scores").select("*").eq("project_id", projectId).order("dimension"),
      this.getProgress(projectId),
    ]);
    const queryError = clientResult.error ?? stagesResult.error ?? historyResult.error ?? qaResult.error ?? filesResult.error ?? scoresResult.error;
    if (queryError) throw new Error(`Não foi possível carregar a visão geral: ${queryError.message}`);
    return {
      project,
      client: clientResult.data ?? undefined,
      stages: stagesResult.data ?? [],
      history: historyResult.data ?? [],
      criticalQa: qaResult.data ?? [],
      scores: scoresResult.data ?? [],
      filesCount: filesResult.count ?? 0,
      progressPercent,
    };
  }

  async updateStageData(stageId: string, update: StageDataUpdate): Promise<SiteProjectStageDetail> {
    const { data, error } = await this.client
      .from("site_project_stages")
      .update({ data: update.data })
      .eq("id", stageId)
      .eq("revision", update.expectedRevision)
      .select("project_id, stage_key")
      .maybeSingle();
    if (error) throw new Error(`Não foi possível salvar a etapa: ${error.message}`);
    if (!data) throw new Error(concurrentEditMessage);
    const refreshed = await this.getStage(data.project_id, data.stage_key as SiteProjectStageKey);
    if (!refreshed) throw new Error("Etapa não encontrada após salvar.");
    return refreshed;
  }

  async updateStageItem(itemId: string, update: StageItemUpdate): Promise<SiteProjectStageItem> {
    const payload: { value?: Json; status?: string } = {};
    if (update.value !== undefined) payload.value = update.value;
    if (update.status !== undefined) payload.status = update.status;
    const { data, error } = await this.client
      .from("site_project_stage_items")
      .update(payload)
      .eq("id", itemId)
      .eq("revision", update.expectedRevision)
      .select("*")
      .maybeSingle();
    if (error) throw new Error(`Não foi possível salvar o item: ${error.message}`);
    if (!data) throw new Error(concurrentEditMessage);
    return data;
  }

  async setStageStatus(projectId: string, stageKey: SiteProjectStageKey, status: SiteProjectStageStatus, overrideReason?: string) {
    const { error } = await this.client.rpc("set_site_project_stage_status", {
      p_project_id: projectId,
      p_stage_key: stageKey,
      p_status: status,
      p_override_reason: overrideReason,
    });
    if (error) throw new Error(`Não foi possível alterar a etapa: ${error.message}`);
  }

  async decideStage(projectId: string, stageKey: SiteProjectStageKey, decision: SiteProjectDecision, note?: string) {
    const { error } = await this.client.rpc("decide_site_project_stage", {
      p_project_id: projectId,
      p_stage_key: stageKey,
      p_decision: decision,
      p_note: note,
    });
    if (error) throw new Error(`Não foi possível registrar a decisão: ${error.message}`);
  }

  async getProgress(projectId: string): Promise<number> {
    const { data, error } = await this.client.rpc("site_project_progress", { p_project_id: projectId });
    if (error) throw new Error(`Não foi possível calcular o progresso: ${error.message}`);
    return Number(data ?? 0);
  }

  async softDelete(projectId: string) {
    const { error } = await this.client.rpc("soft_delete_site_project", { p_project_id: projectId });
    if (error) throw new Error(`Não foi possível excluir o projeto: ${error.message}`);
  }

  async permanentlyDelete(projectId: string, projectNameConfirmation: string) {
    const { error } = await this.client.rpc("permanently_delete_site_project", {
      p_project_id: projectId,
      p_confirmation: projectNameConfirmation,
    });
    if (error) throw new Error(`Não foi possível excluir definitivamente o projeto: ${error.message}`);
  }
}
