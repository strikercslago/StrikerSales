"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ProjectNavigation } from "./project-navigation";
import { StageStepper } from "./stage-stepper";
import { SupabaseSiteProjectRepository } from "@/lib/projects/supabase-site-project-repository";
import type { SiteProjectOverview } from "@/types/site-project";

const approvalKeys = ["strategy", "architecture", "visual_direction", "high_fidelity"];

export function ProjectOverviewPage({ projectId }: { projectId: string }) {
  const repository = useMemo(() => new SupabaseSiteProjectRepository(), []);
  const [overview, setOverview] = useState<SiteProjectOverview>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();
  const load = useCallback(async () => {
    setLoading(true); setError(undefined);
    try {
      const result = await repository.getOverview(projectId);
      if (!result) setError("Projeto não encontrado ou você não possui permissão para acessá-lo.");
      else setOverview(result);
    } catch (loadError) { setError(loadError instanceof Error ? loadError.message : "Não foi possível carregar o projeto."); }
    finally { setLoading(false); }
  }, [projectId, repository]);
  useEffect(() => { void load(); }, [load]);

  if (loading) return <main className="project-detail-page"><div className="project-overview-loading"><span /><p>Carregando visão geral...</p></div></main>;
  if (error || !overview) return <main className="project-detail-page"><div className="project-state error"><strong>Projeto indisponível</strong><p>{error}</p><div><button type="button" onClick={() => void load()}>Tentar novamente</button><Link href="/projects">Voltar aos projetos</Link></div></div></main>;

  const { project, client, stages, history, criticalQa, filesCount, progressPercent } = overview;
  const currentStage = stages.find((stage) => stage.stage_key === project.current_stage_key) ?? stages[0];
  const overallScore = overview.scores.find((score) => score.dimension === "overall" && !score.is_pending)?.score;
  const nextAction = currentStage?.status === "pending" ? `Iniciar ${currentStage.title}.` : currentStage?.status === "in_progress" ? `Concluir os itens obrigatórios de ${currentStage.title}.` : "Revisar a próxima etapa do processo.";

  return <main className="project-detail-page">
    <div className="project-breadcrumb"><Link href="/projects">Projetos</Link><span>/</span><strong>{project.name}</strong></div>
    <header className="project-overview-header"><div><p className="project-eyebrow">VISÃO GERAL DO PROJETO</p><h1>{project.name}</h1><p>{client?.company || client?.name || "Cliente não informado"}{client?.segment ? ` · ${client.segment}` : ""}</p></div><div className="project-overview-meta"><span className={`project-status status-${project.status}`}>{project.status === "draft" ? "Planejamento" : project.status === "in_progress" ? "Em andamento" : project.status === "completed" ? "Concluído" : project.status === "archived" ? "Arquivado" : "Em pausa"}</span><div><small>Striker Score</small><strong>{overallScore == null ? "—" : overallScore}</strong></div></div></header>
    <ProjectNavigation projectId={project.id} />

    <div className="project-workspace">
      <StageStepper stages={stages} currentStageKey={project.current_stage_key} />
      <div className="project-overview-content">
        <section className="project-progress-panel"><div><span>PROGRESSO GERAL</span><strong>{Math.round(progressPercent)}% <small>concluído</small></strong></div><div className="project-large-progress"><i style={{ width: `${progressPercent}%` }} /></div><p>Baseado nos itens obrigatórios ponderados e aprovações da metodologia Striker 1.1.</p></section>

        <div className="project-overview-grid">
          <section className="project-focus-panel"><p className="project-panel-label">FASE ATUAL</p><h2>{currentStage?.title ?? "Descoberta"}</h2><span>{currentStage?.status === "in_progress" ? "Em andamento" : currentStage?.status === "approved" ? "Aprovada" : "Não iniciada"}</span><button type="button" disabled title="Formulário detalhado disponível na próxima fase">Continuar etapa</button></section>
          <section className="project-next-action"><p className="project-panel-label">PRÓXIMA AÇÃO RECOMENDADA</p><h3>{nextAction}</h3><p>Mantenha o foco no próximo avanço concreto antes de abrir uma nova frente.</p></section>
        </div>

        <div className="project-overview-grid secondary">
          <section className="project-plain-panel"><header><p className="project-panel-label">PENDÊNCIAS CRÍTICAS</p><strong>{criticalQa.length}</strong></header>{criticalQa.length ? <ul>{criticalQa.slice(0, 4).map((item) => <li key={item.id}>{item.description}</li>)}</ul> : <p className="project-clear-state">Nenhuma pendência crítica aberta.</p>}</section>
          <section className="project-plain-panel"><header><p className="project-panel-label">ASSETS FALTANTES</p><strong>{filesCount ? "Em análise" : "—"}</strong></header><p className="project-clear-state">{filesCount ? `${filesCount} arquivo(s) registrados. O Asset Manager será habilitado em fase posterior.` : "Nenhum asset registrado ainda. O componente está preparado para receber esta informação."}</p></section>
        </div>

        <section className="project-approvals-panel"><header><p className="project-panel-label">APROVAÇÕES</p><span>Gates do processo</span></header><div>{approvalKeys.map((key) => { const stage = stages.find((item) => item.stage_key === key); return <article key={key}><i className={stage?.status === "approved" ? "approved" : stage?.status === "blocked" ? "blocked" : ""}>{stage?.status === "approved" ? "✓" : "·"}</i><span><strong>{stage?.title}</strong><small>{stage?.status === "approved" ? "Aprovada" : stage?.status === "completed" ? "Aguardando aprovação" : stage?.status === "blocked" ? "Bloqueada" : "Pendente"}</small></span></article>; })}</div></section>

        <section className="project-activity-panel"><header><p className="project-panel-label">ATIVIDADE RECENTE</p><span>Últimas alterações</span></header>{history.length ? <div>{history.map((event) => <article key={event.id}><i /><span><strong>{event.event_type.replaceAll("_", " ")}</strong><small>{new Date(event.created_at).toLocaleString("pt-BR")}</small></span></article>)}</div> : <p className="project-clear-state">A atividade do projeto aparecerá aqui.</p>}</section>
      </div>
    </div>
  </main>;
}
