export interface ApproachReviewExportLead {
  lead_id: string;
  expected_updated_at: string;
  name: string;
  business_name?: string;
  segment?: string;
  city?: string;
  state?: string;
  opportunity?: string;
  verified_observation?: string;
  source_urls?: string[];
  current_message: string;
  current_followup_message?: string;
}

export interface ApproachReviewPackage {
  schema: "striker-approach-review";
  schema_version: "1.0";
  export_id: string;
  exported_at: string;
  instructions: string;
  required_output: {
    schema: "striker-approach-review-result";
    schema_version: "1.0";
    export_id: string;
    reviews: Array<{
      lead_id: string;
      expected_updated_at: string;
      message: string;
      followup_message: string;
      rationale: string;
    }>;
  };
  leads: ApproachReviewExportLead[];
}

export interface ApproachReviewItem {
  leadId: string;
  expectedUpdatedAt: string;
  message: string;
  followupMessage?: string;
  rationale?: string;
}

export interface ApproachReviewError { index: number; message: string; }

export interface ApproachReviewResult {
  exportId: string;
  reviews: ApproachReviewItem[];
  errors: ApproachReviewError[];
}

export interface ApproachReviewPreviewItem extends ApproachReviewItem {
  leadName: string;
  currentMessage: string;
  currentFollowupMessage?: string;
  state: "applicable" | "unchanged" | "stale" | "ineligible" | "missing";
  reason?: string;
}

export interface ApproachReviewApplyReport {
  updated: number;
  skipped: number;
  updatedLeadIds: string[];
}
