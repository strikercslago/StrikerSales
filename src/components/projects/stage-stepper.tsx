import type { SiteProjectStage } from "@/types/site-project";

const statusLabels: Record<string, string> = {
  pending: "Não iniciado", in_progress: "Em andamento", completed: "Concluído", approved: "Aprovado", blocked: "Bloqueado",
};

export function StageStepper({ stages, currentStageKey }: { stages: SiteProjectStage[]; currentStageKey: string }) {
  return <aside className="stage-stepper"><header><span>PROCESSO STRIKER 1.1</span><strong>19 etapas</strong></header><ol>{stages.map((stage) => <li className={`${stage.status} ${stage.stage_key === currentStageKey ? "current" : ""}`} key={stage.id}><span>{String(stage.position).padStart(2, "0")}</span><div><strong>{stage.title}</strong><small>{statusLabels[stage.status] ?? stage.status}</small></div><i /></li>)}</ol></aside>;
}
