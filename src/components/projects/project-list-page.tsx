"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { SupabaseSiteProjectRepository } from "@/lib/projects/supabase-site-project-repository";
import type { SiteProjectSummary } from "@/types/site-project";

type ProjectFilter = "all" | "in_progress" | "awaiting_approval" | "completed" | "archived";

const filters: Array<{ key: ProjectFilter; label: string }> = [
  { key: "all", label: "Todos" },
  { key: "in_progress", label: "Em andamento" },
  { key: "awaiting_approval", label: "Aguardando aprovação" },
  { key: "completed", label: "Concluídos" },
  { key: "archived", label: "Arquivados" },
];

const approvalStages = new Set(["strategy", "architecture", "visual_direction", "high_fidelity"]);

function matchesFilter(project: SiteProjectSummary, filter: ProjectFilter) {
  const archived = Boolean(project.deleted_at) || project.status === "archived";
  if (filter === "archived") return archived;
  if (archived) return false;
  if (filter === "all") return true;
  if (filter === "completed") return project.status === "completed";
  if (filter === "awaiting_approval") return approvalStages.has(project.current_stage_key) && project.currentStageStatus === "completed";
  return project.status === "in_progress" || project.currentStageStatus === "in_progress";
}

function statusLabel(project: SiteProjectSummary) {
  if (project.deleted_at || project.status === "archived") return "Arquivado";
  return { draft: "Planejamento", in_progress: "Em andamento", on_hold: "Em pausa", completed: "Concluído" }[project.status] ?? project.status;
}

function relativeTime(value: string) {
  const minutes = Math.max(0, Math.floor((Date.now() - new Date(value).getTime()) / 60_000));
  if (minutes < 1) return "agora";
  if (minutes < 60) return `há ${minutes}min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `há ${hours}h`;
  const days = Math.floor(hours / 24);
  return `há ${days}d`;
}

export function ProjectListPage() {
  const repository = useMemo(() => new SupabaseSiteProjectRepository(), []);
  const [projects, setProjects] = useState<SiteProjectSummary[]>([]);
  const [filter, setFilter] = useState<ProjectFilter>("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();
  const [archiveTarget, setArchiveTarget] = useState<SiteProjectSummary>();
  const [archiving, setArchiving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true); setError(undefined);
    try { setProjects(await repository.listProjects(true)); }
    catch (loadError) { setError(loadError instanceof Error ? loadError.message : "Não foi possível carregar os projetos."); }
    finally { setLoading(false); }
  }, [repository]);

  useEffect(() => { void load(); }, [load]);
  const visible = projects.filter((project) => matchesFilter(project, filter));
  const activeCount = projects.filter((project) => !project.deleted_at && project.status !== "archived" && project.status !== "completed").length;
  const completedCount = projects.filter((project) => !project.deleted_at && project.status === "completed").length;

  const archive = async () => {
    if (!archiveTarget) return;
    setArchiving(true);
    try { await repository.softDelete(archiveTarget.id); setArchiveTarget(undefined); await load(); }
    catch (archiveError) { setError(archiveError instanceof Error ? archiveError.message : "Não foi possível arquivar o projeto."); }
    finally { setArchiving(false); }
  };

  return <main className="projects-page">
    <section className="projects-hero">
      <div><p className="project-eyebrow">STRIKER PROJECT SYSTEM</p><h1>Projetos de Sites</h1><p>Uma visão clara do processo, das decisões e do que precisa avançar.</p></div>
      <Link className="project-primary-action" href="/projects/new">+ Novo Projeto</Link>
    </section>

    <section className="projects-summary" aria-label="Resumo de projetos">
      <div><span>Projetos ativos</span><strong>{activeCount}</strong></div>
      <div><span>Concluídos</span><strong>{completedCount}</strong></div>
      <div><span>Metodologia atual</span><strong>Striker 1.1</strong></div>
    </section>

    <div className="project-filter-row" role="tablist" aria-label="Filtros de projetos">
      {filters.map((item) => <button key={item.key} className={filter === item.key ? "active" : ""} type="button" onClick={() => setFilter(item.key)}>{item.label}</button>)}
    </div>

    {loading && <ProjectLoading />}
    {!loading && error && <ProjectError message={error} onRetry={() => void load()} />}
    {!loading && !error && visible.length === 0 && <ProjectEmpty filtered={projects.length > 0} />}
    {!loading && !error && visible.length > 0 && <section className="project-list" aria-label="Lista de projetos">
      {visible.map((project) => <article className={`project-row ${project.deleted_at ? "archived" : ""}`} key={project.id}>
        <Link className="project-row-main" href={`/projects/${project.id}/overview`}>
          <div className="project-identity"><span className="project-monogram">{project.name.slice(0, 2).toUpperCase()}</span><div><h2>{project.name}</h2><p>{project.clientCompany || project.clientName || "Cliente não informado"}{project.segment ? ` · ${project.segment}` : ""}</p></div></div>
          <div className="project-stage"><span>Fase atual</span><strong>{project.currentStageTitle}</strong><small>{project.currentStageStatus === "approved" ? "Aprovada" : project.currentStageStatus === "in_progress" ? "Em andamento" : "Não iniciada"}</small></div>
          <div className="project-progress"><span>Progresso</span><strong>{Math.round(project.progressPercent)}%</strong><div><i style={{ width: `${project.progressPercent}%` }} /></div></div>
          <div className="project-score"><span>Striker Score</span><strong>{project.strikerScore == null ? "—" : project.strikerScore}</strong></div>
          <div className="project-dates"><span className={`project-status status-${project.status}`}>{statusLabel(project)}</span><small>Criado em {new Date(project.created_at).toLocaleDateString("pt-BR")}</small><small>Atualizado {relativeTime(project.updated_at)}</small></div>
        </Link>
        {!project.deleted_at && <button className="project-row-menu" type="button" aria-label={`Arquivar ${project.name}`} onClick={() => setArchiveTarget(project)}>•••</button>}
      </article>)}
    </section>}

    <ConfirmDialog open={Boolean(archiveTarget)} title="Arquivar este projeto?" message="O projeto será removido da listagem ativa e continuará disponível no filtro Arquivados. Nenhum dado será apagado definitivamente." confirmLabel="Arquivar projeto" danger busy={archiving} onClose={() => setArchiveTarget(undefined)} onConfirm={archive} />
  </main>;
}

function ProjectLoading() {
  return <div className="project-loading" aria-label="Carregando projetos"><span /><span /><span /></div>;
}

function ProjectError({ message, onRetry }: { message: string; onRetry: () => void }) {
  return <div className="project-state error"><strong>Não foi possível carregar os projetos</strong><p>{message}</p><button type="button" onClick={onRetry}>Tentar novamente</button></div>;
}

function ProjectEmpty({ filtered }: { filtered: boolean }) {
  return <div className="project-state"><span className="project-empty-mark">S</span><h2>{filtered ? "Nenhum projeto neste filtro" : "Nenhum projeto criado"}</h2><p>{filtered ? "Escolha outro filtro para visualizar seus projetos." : "Crie o primeiro projeto para começar a utilizar o processo Striker."}</p>{!filtered && <Link href="/projects/new">Criar primeiro projeto</Link>}</div>;
}
