import type { Json, Tables, TablesInsert, TablesUpdate } from "@/types/database.generated";

export const SITE_PROJECT_STAGE_KEYS = [
  "discovery",
  "strategy",
  "content",
  "architecture",
  "visual_direction",
  "design_system",
  "wireframes",
  "high_fidelity",
  "prototype",
  "development",
  "integrations",
  "responsive",
  "accessibility",
  "performance",
  "seo",
  "qa",
  "approval",
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

export type CreateSiteProjectInput = Pick<SiteProjectInsert, "name"> &
  Partial<Pick<SiteProjectInsert, "client_id" | "responsible_user_id" | "start_date" | "estimated_deadline" | "platform">>;

export type SiteProjectSummary = SiteProject & {
  progressPercent: number;
};

export type SiteProjectStageDetail = SiteProjectStage & {
  items: SiteProjectStageItem[];
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
