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

export interface SiteProjectRepository {
  listClients(): Promise<Client[]>;
  createClient(input: ClientInsert): Promise<Client>;
  deleteClient(clientId: string): Promise<void>;
  listProjects(includeDeleted?: boolean): Promise<SiteProjectSummary[]>;
  getProject(projectId: string): Promise<SiteProject | undefined>;
  createProject(input: CreateSiteProjectInput): Promise<SiteProject>;
  getStage(projectId: string, stageKey: SiteProjectStageKey): Promise<SiteProjectStageDetail | undefined>;
  getOverview(projectId: string): Promise<SiteProjectOverview | undefined>;
  updateStageData(stageId: string, update: StageDataUpdate): Promise<SiteProjectStageDetail>;
  updateStageItem(itemId: string, update: StageItemUpdate): Promise<SiteProjectStageItem>;
  setStageStatus(projectId: string, stageKey: SiteProjectStageKey, status: SiteProjectStageStatus, overrideReason?: string): Promise<void>;
  decideStage(projectId: string, stageKey: SiteProjectStageKey, decision: SiteProjectDecision, note?: string): Promise<void>;
  getProgress(projectId: string): Promise<number>;
  softDelete(projectId: string): Promise<void>;
  permanentlyDelete(projectId: string, projectNameConfirmation: string): Promise<void>;
}
