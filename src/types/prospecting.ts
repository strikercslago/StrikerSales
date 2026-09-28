export interface ProspectingCampaign {
  id: string;
  name: string;
  service: string;
  regions: string;
  segments: string;
  idealProfile: string;
  qualificationCriteria: string;
  exclusionCriteria: string;
  targetCount: number;
  approachGuidance: string;
  createdAt: string;
  updatedAt: string;
}

export type ProspectingSearchStatus = "prepared" | "awaiting_result" | "reviewing" | "completed" | "cancelled";

export interface RejectedCandidate {
  name: string;
  city?: string;
  state?: string;
  phone?: string;
  website?: string;
  instagram?: string;
  externalId?: string;
  source?: string;
  reason: string;
}

export interface ProspectingSearch {
  id: string;
  campaignId: string;
  campaignName: string;
  focus?: string;
  targetCount: number;
  status: ProspectingSearchStatus;
  createdAt: string;
  updatedAt: string;
  approvedCount: number;
  duplicateCount: number;
  possibleDuplicateCount: number;
  rejectedCandidates: RejectedCandidate[];
}

export interface ProspectingState {
  version: 1;
  campaigns: ProspectingCampaign[];
  searches: ProspectingSearch[];
}

export interface KnownCompany {
  name: string;
  city?: string;
  state?: string;
  phone?: string;
  website?: string;
  instagram?: string;
  external_id?: string;
  source?: string;
  cnpj?: string;
  reason: "lead" | "deleted_lead" | "rejected_candidate" | "in_review";
}
