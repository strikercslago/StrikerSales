import { SITE_PROJECT_STAGE_KEYS, type SiteProjectStageKey } from "@/types/site-project";

export const STRIKER_METHODOLOGY_VERSION = "1.1" as const;

export const DEVELOPMENT_GATE_PREREQUISITES = [
  "strategy",
  "architecture",
  "visual_direction",
  "design_system",
  "high_fidelity",
] as const satisfies readonly SiteProjectStageKey[];

export function isSiteProjectStageKey(value: string): value is SiteProjectStageKey {
  return SITE_PROJECT_STAGE_KEYS.some((stageKey) => stageKey === value);
}
