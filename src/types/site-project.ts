import type { Json, Tables, TablesInsert, TablesUpdate } from "@/types/database.generated";

export const SITE_PROJECT_STAGE_KEYS = [
  "discovery",
  "research",
  "strategy",
  "architecture",
  "visual_direction",
  "design_system",
  "wireframe",
  "high_fidelity",
  "assets",
  "development",
  "motion",
  "responsive",
  "accessibility",
  "performance",
  "seo",
  "qa_visual",
  "qa_functional",
  "publication",
  "delivery",
] as const;

export type SiteProjectStageKey = (typeof SITE_PROJECT_STAGE_KEYS)[number];
export type SiteProjectRole = "owner" | "editor" | "approver" | "admin";
export type SiteProjectStatus = "draft" | "in_progress" | "on_hold" | "completed" | "archived";
export type SiteProjectStageStatus = "pending" | "in_progress" | "completed" | "approved" | "blocked";
export type SiteProjectDecision = "approved" | "rejected" | "reopened";
export type SiteProjectSaveState = "idle" | "saving" | "saved" | "error";

export type Client = Tables<"clients">;
export type ClientInsert = TablesInsert<"clients">;
export type SiteProject = Tables<"site_projects">;
export type SiteProjectInsert = TablesInsert<"site_projects">;
export type SiteProjectUpdate = TablesUpdate<"site_projects">;
export type SiteProjectStage = Tables<"site_project_stages">;
export type SiteProjectStageItem = Tables<"site_project_stage_items">;
export type SiteProjectFile = Tables<"site_project_files">;
export type SiteProjectHistoryEvent = Tables<"site_project_history">;
export type SiteProjectScore = Tables<"site_project_scores">;
export type SiteProjectQaItem = Tables<"site_project_qa_items">;

export type CreateSiteProjectInput = Pick<SiteProjectInsert, "name"> &
  Partial<Pick<SiteProjectInsert, "id" | "owner_id">> &
  Partial<Pick<SiteProjectInsert, "client_id" | "responsible_user_id" | "start_date" | "estimated_deadline" | "platform">>;

export type SiteProjectSummary = SiteProject & {
  progressPercent: number;
  clientName?: string;
  clientCompany?: string;
  segment?: string;
  currentStageTitle: string;
  currentStageStatus: SiteProjectStageStatus;
  strikerScore?: number;
};

export type SiteProjectStageDetail = SiteProjectStage & {
  items: SiteProjectStageItem[];
};

export type SiteProjectOverview = {
  project: SiteProject;
  client?: Client;
  stages: SiteProjectStage[];
  history: SiteProjectHistoryEvent[];
  criticalQa: SiteProjectQaItem[];
  scores: SiteProjectScore[];
  filesCount: number;
  progressPercent: number;
};

export type CreateSiteProjectBundleInput = {
  client: Pick<ClientInsert, "name"> & Partial<Pick<ClientInsert,
    "company" | "segment" | "city_region" | "site_url" | "instagram" | "whatsapp" | "email"
  >>;
  project: CreateSiteProjectInput & Partial<Pick<SiteProjectInsert,
    "business_description" | "main_offer" | "priority_audience" | "primary_goal" |
    "primary_cta" | "platform_other"
  >>;
};

export type StageDataUpdate = {
  data: Json;
  expectedRevision: number;
};

export type StageItemUpdate = {
  value?: Json;
  status?: SiteProjectStageItem["status"];
  expectedRevision: number;
};

export type UploadSiteProjectFileInput = {
  ownerId: string;
  projectId: string;
  category: string;
  file: File;
};

export type UploadedSiteProjectFile = {
  metadata: SiteProjectFile;
  signedUrl: string;
};
