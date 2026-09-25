"use client";

import { useState } from "react";
import type { SiteProjectStage } from "@/types/site-project";

const statusLabels: Record<string, string> = {
  pending: "Não iniciado", in_progress: "Em andamento", completed: "Concluído", approved: "Aprovado", blocked: "Bloqueado",
};

export function StageStepper({ stages, currentStageKey }: { stages: SiteProjectStage[]; currentStageKey: string }) {
  const [expanded, setExpanded] = useState(false);
  const current = stages.find((stage) => stage.stage_key === currentStageKey);
  return <aside className={`stage-stepper${expanded ? " expanded" : ""}`}><header><span>PROCESSO STRIKER 1.1</span><strong>{stages.length} etapas</strong></header><button className="stage-stepper-toggle" aria-expanded={expanded} aria-controls="project-stages" onClick={() => setExpanded(!expanded)}><span>Etapas do projeto<small>{current?.title ?? "Ver processo completo"}</small></span><span aria-hidden="true">{expanded ? "−" : "+"}</span></button><ol id="project-stages">{stages.map((stage) => <li className={`${stage.status} ${stage.stage_key === currentStageKey ? "current" : ""}`} key={stage.id}><span>{String(stage.position).padStart(2, "0")}</span><div><strong>{stage.title}</strong><small>{statusLabels[stage.status] ?? stage.status}</small></div><i /></li>)}</ol></aside>;
}
