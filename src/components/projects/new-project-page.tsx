"use client";

import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/auth-provider";
import { SiteProjectService } from "@/lib/projects/site-project-service";
import type { CreateSiteProjectBundleInput } from "@/types/site-project";

const platforms = ["Next.js", "React", "WordPress", "Elementor", "Gutenberg", "Framer", "Webflow", "Outro"];

export function NewProjectPage() {
  const router = useRouter();
  const { user } = useAuth();
  const service = useMemo(() => new SiteProjectService(), []);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string>();
  const [platform, setPlatform] = useState("Next.js");

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user) return;
    const form = new FormData(event.currentTarget);
    const value = (name: string) => String(form.get(name) ?? "").trim() || undefined;
    const projectName = value("projectName");
    const clientName = value("clientName");
    if (!projectName || !clientName) { setError("Informe o nome do projeto e o cliente."); return; }
    const input: CreateSiteProjectBundleInput = {
      client: {
        name: clientName,
        company: value("company"), segment: value("segment"), city_region: value("cityRegion"),
        site_url: value("siteUrl"), instagram: value("instagram"), whatsapp: value("whatsapp"), email: value("email"),
      },
      project: {
        name: projectName,
        start_date: value("startDate"), estimated_deadline: value("deadline"), platform,
        platform_other: platform === "Outro" ? value("platformOther") : undefined,
        business_description: value("businessDescription"), main_offer: value("mainOffer"),
        priority_audience: value("priorityAudience"), primary_goal: value("primaryGoal"), primary_cta: value("primaryCta"),
      },
    };
    setSaving(true); setError(undefined);
    try {
      const project = await service.createProject(input, user.id);
      router.push(`/projects/${project.id}/overview`);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Não foi possível criar o projeto.");
      setSaving(false);
    }
  };

  return <main className="project-form-page">
    <div className="project-breadcrumb"><Link href="/projects">Projetos</Link><span>/</span><strong>Novo projeto</strong></div>
    <header className="project-form-header"><p className="project-eyebrow">INÍCIO RÁPIDO</p><h1>Novo Projeto</h1><p>Registre o essencial agora. O briefing detalhado será construído na etapa Descoberta.</p></header>
    <form className="project-create-form" onSubmit={(event) => void submit(event)}>
      <FormSection index="01" title="Projeto" description="Identificação e planejamento inicial.">
        <div className="project-form-grid">
          <Field label="Nome do projeto" name="projectName" required placeholder="Ex.: Site Dra. Priscila Scariot" />
          <Field label="Cliente" name="clientName" required placeholder="Nome do contato principal" />
          <Field label="Empresa" name="company" placeholder="Nome da empresa ou marca" />
          <Field label="Segmento" name="segment" placeholder="Ex.: Nutrição" />
          <Field label="Cidade / região" name="cityRegion" placeholder="Ex.: Passo Fundo, RS" />
          <Field label="Responsável" name="responsible" value={user?.email ?? ""} readOnly />
          <Field label="Data de início" name="startDate" type="date" />
          <Field label="Prazo estimado" name="deadline" type="date" />
        </div>
      </FormSection>
      <FormSection index="02" title="Contato" description="Canais atuais do cliente.">
        <div className="project-form-grid">
          <Field label="Site atual" name="siteUrl" type="url" placeholder="https://" />
          <Field label="Instagram" name="instagram" placeholder="@perfil" />
          <Field label="WhatsApp" name="whatsapp" placeholder="(54) 99999-9999" />
          <Field label="E-mail" name="email" type="email" placeholder="cliente@empresa.com" />
        </div>
      </FormSection>
      <FormSection index="03" title="Objetivo" description="Direção inicial para orientar o processo.">
        <div className="project-form-grid">
          <Field label="Descrição do negócio" name="businessDescription" textarea placeholder="O que a empresa faz e para quem?" />
          <Field label="Oferta principal" name="mainOffer" textarea placeholder="Principal serviço ou produto" />
          <Field label="Público prioritário" name="priorityAudience" placeholder="Quem precisa ser alcançado primeiro?" />
          <Field label="Objetivo principal do site" name="primaryGoal" placeholder="Ex.: gerar agendamentos" />
          <Field label="CTA principal" name="primaryCta" placeholder="Ex.: Agendar consulta" />
          <label><span>Plataforma final</span><select value={platform} onChange={(event) => setPlatform(event.target.value)}>{platforms.map((item) => <option key={item}>{item}</option>)}</select></label>
          {platform === "Outro" && <Field label="Qual plataforma?" name="platformOther" placeholder="Informe a plataforma" />}
        </div>
      </FormSection>
      {error && <div className="project-form-error" role="alert">{error}</div>}
      <footer className="project-form-actions"><Link href="/projects">Cancelar</Link><button type="submit" disabled={saving}>{saving ? "Criando projeto..." : "Criar projeto"}</button></footer>
    </form>
  </main>;
}

function FormSection({ index, title, description, children }: { index: string; title: string; description: string; children: React.ReactNode }) {
  return <section className="project-form-section"><header><span>{index}</span><div><h2>{title}</h2><p>{description}</p></div></header><div>{children}</div></section>;
}

function Field({ label, textarea, ...props }: { label: string; textarea?: boolean } & React.InputHTMLAttributes<HTMLInputElement>) {
  return <label className={textarea ? "wide" : ""}><span>{label}{props.required ? " *" : ""}</span>{textarea ? <textarea name={props.name} placeholder={props.placeholder} rows={3} /> : <input {...props} />}</label>;
}
