import type { SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseClient } from "@/lib/supabase/client";
import type { Database, Json } from "@/types/database.generated";
import type {
  CreateSiteProjectInput,
  SiteProject,
  SiteProjectDecision,
  SiteProjectStageDetail,
  SiteProjectStageItem,
  SiteProjectStageKey,
  SiteProjectStageStatus,
  SiteProjectSummary,
  StageDataUpdate,
  StageItemUpdate,
} from "@/types/site-project";
import type { SiteProjectRepository } from "./project-repository";

const concurrentEditMessage = "Este conteúdo foi alterado em outra sessão. Atualize a etapa antes de tentar novamente.";

export class SupabaseSiteProjectRepository implements SiteProjectRepository {
  constructor(private readonly client: SupabaseClient<Database> = getSupabaseClient()) {}

  async listProjects(includeDeleted = false): Promise<SiteProjectSummary[]> {
    let query = this.client.from("site_projects").select("*").order("updated_at", { ascending: false });
    if (!includeDeleted) query = query.is("deleted_at", null);
    const { data, error } = await query;
    if (error) throw new Error(`Não foi possível carregar os projetos: ${error.message}`);

    return Promise.all(data.map(async (project) => ({
      ...project,
      progressPercent: await this.getProgress(project.id),
    })));
  }

  async getProject(projectId: string): Promise<SiteProject | undefined> {
    const { data, error } = await this.client.from("site_projects").select("*").eq("id", projectId).maybeSingle();
    if (error) throw new Error(`Não foi possível carregar o projeto: ${error.message}`);
    return data ?? undefined;
  }

  async createProject(input: CreateSiteProjectInput): Promise<SiteProject> {
    const { data, error } = await this.client.from("site_projects").insert(input).select("*").single();
    if (error) throw new Error(`Não foi possível criar o projeto: ${error.message}`);
    return data;
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
