import Link from "next/link";

const futureTabs = ["Etapas", "Assets", "Prompts", "Score", "Configurações"];

export function ProjectNavigation({ projectId }: { projectId: string }) {
  return <nav className="project-subnav" aria-label="Navegação do projeto"><Link className="active" href={`/projects/${projectId}/overview`}>Visão Geral</Link>{futureTabs.map((tab) => <button key={tab} type="button" disabled title="Disponível nas próximas fases">{tab}<small>Em breve</small></button>)}</nav>;
}
