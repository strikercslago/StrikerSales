import { describe, expect, it } from "vitest";
import { SITE_PROJECT_ALLOWED_MIME_TYPES, SITE_PROJECT_BUCKET, SITE_PROJECT_MAX_FILE_SIZE } from "./site-project-storage";
import { DEVELOPMENT_GATE_PREREQUISITES, STRIKER_METHODOLOGY_VERSION, isSiteProjectStageKey } from "./methodology";
import { SITE_PROJECT_STAGE_KEYS } from "@/types/site-project";

describe("Arquivo Striker v1.1", () => {
  it("mantém as 19 etapas oficiais ordenadas e sem duplicação", () => {
    expect(STRIKER_METHODOLOGY_VERSION).toBe("1.1");
    expect(SITE_PROJECT_STAGE_KEYS).toEqual([
      "discovery", "research", "strategy", "architecture", "visual_direction",
      "design_system", "wireframe", "high_fidelity", "assets", "development",
      "motion", "responsive", "accessibility", "performance", "seo", "qa_visual",
      "qa_functional", "publication", "delivery",
    ]);
    expect(new Set(SITE_PROJECT_STAGE_KEYS).size).toBe(19);
    expect(SITE_PROJECT_STAGE_KEYS[0]).toBe("discovery");
    expect(SITE_PROJECT_STAGE_KEYS.at(-1)).toBe("delivery");
  });

  it("define somente etapas válidas como pré-requisitos do desenvolvimento", () => {
    expect(DEVELOPMENT_GATE_PREREQUISITES).toEqual([
      "strategy", "architecture", "visual_direction", "design_system", "high_fidelity",
    ]);
    expect(DEVELOPMENT_GATE_PREREQUISITES.every(isSiteProjectStageKey)).toBe(true);
    expect(isSiteProjectStageKey("unknown")).toBe(false);
  });

  it("mantém o contrato privado e restrito de arquivos", () => {
    expect(SITE_PROJECT_BUCKET).toBe("site-projects");
    expect(SITE_PROJECT_MAX_FILE_SIZE).toBe(52_428_800);
    expect(SITE_PROJECT_ALLOWED_MIME_TYPES.has("image/webp")).toBe(true);
    expect(SITE_PROJECT_ALLOWED_MIME_TYPES.has("application/x-msdownload")).toBe(false);
  });
});
