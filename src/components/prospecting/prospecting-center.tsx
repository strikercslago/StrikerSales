"use client";

import { useEffect, useMemo, useState } from "react";
import { ImportDialog } from "@/components/import/import-dialog";
import { SupabaseLeadRepository } from "@/lib/persistence/supabase-lead-repository";
import { ProspectingRepository } from "@/lib/prospecting/prospecting-repository";
import { buildExclusionFile, buildKnownCompanies, buildProspectingPrompt, emptyProspectingState, newCampaign, prepareSearch } from "@/lib/prospecting/prospecting";
import type { Lead } from "@/types/lead";
import type { LeadImportResult } from "@/types/lead-import";
import type { ProspectingCampaign, ProspectingSearch, ProspectingState, ProspectingSearchStatus } from "@/types/prospecting";

const prospectingRepo = new ProspectingRepository();
const leadRepo = new SupabaseLeadRepository();

const statusLabel: Record<ProspectingSearchStatus, string> = {
  prepared: "Preparada", awaiting_result: "Aguardando resultado", reviewing: "Em revisão", completed: "Concluída", cancelled: "Cancelada",
};

function downloadJson(name: string, value: unknown) {
  const url = URL.createObjectURL(new Blob([JSON.stringify(value, null, 2)], { type: "application/json" }));
  const anchor = document.createElement("a"); anchor.href = url; anchor.download = name; document.body.appendChild(anchor); anchor.click(); anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function ProspectingCenter() {
  const [state, setState] = useState<ProspectingState>(emptyProspectingState());
  const [leads, setLeads] = useState<Lead[]>([]);
  const [campaign, setCampaign] = useState<ProspectingCampaign>(newCampaign());
  const [focus, setFocus] = useState("");
  const [targetCount, setTargetCount] = useState(20);
  const [selectedSearchId, setSelectedSearchId] = useState<string>();
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string }>();

  useEffect(() => {
    void Promise.all([prospectingRepo.load(), leadRepo.getLeads("all")]).then(([saved, allLeads]) => {
      setState(saved); setLeads(allLeads);
      const first = saved.campaigns[0]; if (first) { setCampaign(first); setTargetCount(first.targetCount); }
      setSelectedSearchId(saved.searches[0]?.id);
    }).catch((error) => setFeedback({ type: "error", message: error instanceof Error ? error.message : "Não foi possível carregar a central." })).finally(() => setReady(true));
  }, []);

  const selectedSearch = state.searches.find((search) => search.id === selectedSearchId);
  const knownCompanies = useMemo(() => buildKnownCompanies(leads, state.searches), [leads, state.searches]);
  const prompt = selectedSearch && selectedSearch.campaignId === campaign.id ? buildProspectingPrompt(campaign, selectedSearch) : "";

  const persist = async (next: ProspectingState, success?: string) => {
    setBusy(true); setFeedback(undefined);
    try { await prospectingRepo.save(next); setState(next); if (success) setFeedback({ type: "success", message: success }); }
    catch (error) { setFeedback({ type: "error", message: error instanceof Error ? error.message : "Não foi possível salvar." }); throw error; }
    finally { setBusy(false); }
  };

  const saveCampaign = async () => {
    if (!campaign.name.trim() || !campaign.service.trim() || !campaign.regions.trim() || !campaign.segments.trim()) throw new Error("Preencha nome, serviço, região e segmentos.");
    const saved = { ...campaign, targetCount: Math.max(1, targetCount), updatedAt: new Date().toISOString() };
    const campaigns = state.campaigns.some((item) => item.id === saved.id) ? state.campaigns.map((item) => item.id === saved.id ? saved : item) : [saved, ...state.campaigns];
    await persist({ ...state, campaigns }, "Campanha salva."); setCampaign(saved); return { saved, campaigns };
  };

  const createPackage = async () => {
    try {
      const { saved, campaigns } = await saveCampaign();
      const search = prepareSearch(saved, Math.max(1, targetCount), focus);
      const next = { ...state, campaigns, searches: [search, ...state.searches] };
      await persist(next, "Pedido preparado. Copie o prompt e baixe a lista de exclusão."); setSelectedSearchId(search.id);
    } catch (error) { if (error instanceof Error && !feedback) setFeedback({ type: "error", message: error.message }); }
  };

  const copyPrompt = async () => {
    try { await navigator.clipboard.writeText(prompt); setFeedback({ type: "success", message: "Pedido copiado. Envie-o ao Astra junto com a lista de exclusão." }); }
    catch { setFeedback({ type: "error", message: "Não foi possível copiar. Selecione o texto manualmente." }); }
  };

  const updateSearch = async (id: string, changes: Partial<ProspectingSearch>) => {
    const searches = state.searches.map((search) => search.id === id ? { ...search, ...changes, updatedAt: new Date().toISOString() } : search);
    await persist({ ...state, searches });
  };

  const importResult = async (result: LeadImportResult) => {
    if (!selectedSearch) throw new Error("Selecione a busca correspondente.");
    const enriched: LeadImportResult = { ...result, batch: { ...(result.batch ?? {}), prospecting_search_id: selectedSearch.id, campaign_id: selectedSearch.campaignId, name: selectedSearch.campaignName } };
    const reviewMemory = [...result.rejectedCandidates, ...result.possibleDuplicates.map((lead) => ({ name: lead.businessName || lead.name, city: lead.city, state: lead.state, phone: lead.phone, website: lead.website, instagram: lead.instagram, externalId: lead.externalId, source: lead.source, reason: "Possível duplicata pendente de revisão" }))];
    await updateSearch(selectedSearch.id, { status: "reviewing", rejectedCandidates: reviewMemory });
    const imported = await leadRepo.importBatch(enriched);
    const refreshed = await leadRepo.getLeads("all"); setLeads(refreshed);
    await updateSearch(selectedSearch.id, { status: "completed", approvedCount: imported.length, duplicateCount: result.duplicates.length + Math.max(0, result.newLeads.length - imported.length), possibleDuplicateCount: result.possibleDuplicates.length, rejectedCandidates: reviewMemory });
    setFeedback({ type: "success", message: `${imported.length} leads adicionados à fila.` });
  };

  if (!ready) return <main className="prospecting-page"><p className="modal-loading">Carregando central de prospecção...</p></main>;

  return <main className="prospecting-page">
    <header className="prospecting-hero"><div><p className="eyebrow">CENTRAL DE PROSPECÇÃO</p><h1>Novos leads, sem repetir trabalho</h1><p>Prepare a pesquisa, leve o pacote ao Astra e revise o retorno antes de adicionar à fila.</p></div><div className="known-counter"><strong>{knownCompanies.length}</strong><span>empresas na memória</span></div></header>
    <ol className="prospecting-flow" aria-label="Fluxo da prospecção"><li className="active">1. Preparar</li><li>2. Pesquisar no Astra</li><li>3. Importar</li><li>4. Revisar</li><li>5. Adicionar à fila</li></ol>
    {feedback && <p role="status" className={`prospecting-feedback ${feedback.type}`}>{feedback.message}</p>}
    <div className="prospecting-grid">
      <section className="prospecting-panel campaign-panel"><header><div><p className="eyebrow">CAMPANHA REUTILIZÁVEL</p><h2>Critérios da busca</h2></div><button type="button" className="secondary-button" onClick={() => { const fresh = newCampaign(); setCampaign(fresh); setTargetCount(fresh.targetCount); }}>Nova campanha</button></header>
        <div className="prospecting-form">
          <label><span>Nome da campanha *</span><input value={campaign.name} onChange={(e) => setCampaign({ ...campaign, name: e.target.value })} /></label>
          <label><span>Serviço oferecido *</span><input value={campaign.service} onChange={(e) => setCampaign({ ...campaign, service: e.target.value })} placeholder="Ex.: criação de sites comerciais" /></label>
          <div className="two-fields"><label><span>Regiões *</span><input value={campaign.regions} onChange={(e) => setCampaign({ ...campaign, regions: e.target.value })} placeholder="Serra Gaúcha, RS" /></label><label><span>Segmentos *</span><input value={campaign.segments} onChange={(e) => setCampaign({ ...campaign, segments: e.target.value })} placeholder="Clínicas, indústrias..." /></label></div>
          <label><span>Perfil ideal</span><textarea value={campaign.idealProfile} onChange={(e) => setCampaign({ ...campaign, idealProfile: e.target.value })} /></label>
          <div className="two-fields"><label><span>Critérios de qualificação</span><textarea value={campaign.qualificationCriteria} onChange={(e) => setCampaign({ ...campaign, qualificationCriteria: e.target.value })} /></label><label><span>Critérios de exclusão</span><textarea value={campaign.exclusionCriteria} onChange={(e) => setCampaign({ ...campaign, exclusionCriteria: e.target.value })} /></label></div>
          <label><span>Tom e orientação da abordagem</span><textarea value={campaign.approachGuidance} onChange={(e) => setCampaign({ ...campaign, approachGuidance: e.target.value })} /></label>
          <div className="two-fields"><label><span>Quantidade</span><input type="number" min="1" max="200" value={targetCount} onChange={(e) => setTargetCount(Number(e.target.value))} /></label><label><span>Foco desta busca</span><input value={focus} onChange={(e) => setFocus(e.target.value)} placeholder="Opcional: empresas com site desatualizado" /></label></div>
        </div>
        <footer><button className="secondary-button" disabled={busy} onClick={() => void saveCampaign().catch((error) => setFeedback({ type: "error", message: error.message }))}>Salvar campanha</button><button className="primary-button" disabled={busy} onClick={() => void createPackage()}>{busy ? "Salvando..." : "Preparar pedido"}</button></footer>
      </section>
      <aside className="prospecting-side">
        <section className="prospecting-panel package-panel"><p className="eyebrow">PACOTE PARA O ASTRA</p><h2>{selectedSearch ? selectedSearch.campaignName : "Prepare sua primeira busca"}</h2>
          {selectedSearch ? <><p className="package-note">Esta versão não inicia uma pesquisa automática. Envie o pedido e o arquivo de exclusão ao Astra.</p><textarea readOnly value={prompt} aria-label="Pedido gerado para o Astra" /><div className="package-actions"><button className="primary-button" onClick={() => void copyPrompt()}>Copiar pedido</button><button className="secondary-button" onClick={() => downloadJson(`striker-empresas-conhecidas-${selectedSearch.id}.json`, buildExclusionFile(selectedSearch, knownCompanies))}>Baixar exclusões</button><button className="secondary-button" onClick={() => setImportOpen(true)}>Importar resultado</button></div></> : <p className="empty-copy">Preencha os critérios e selecione “Preparar pedido”.</p>}
        </section>
        <section className="prospecting-panel history-panel"><div className="section-heading"><div><p className="eyebrow">HISTÓRICO</p><h2>Buscas preparadas</h2></div><span>{state.searches.length}</span></div>
          {state.searches.length ? <div className="search-history">{state.searches.map((search) => <article className={search.id === selectedSearchId ? "selected" : ""} key={search.id}><button onClick={() => { setSelectedSearchId(search.id); const saved = state.campaigns.find((item) => item.id === search.campaignId); if (saved) { setCampaign(saved); setTargetCount(search.targetCount); } }}><strong>{search.campaignName}</strong><span>{new Date(search.createdAt).toLocaleDateString("pt-BR")} · {statusLabel[search.status]}</span><small>{search.targetCount} solicitados · {search.approvedCount} aprovados · {search.duplicateCount} duplicados · {search.rejectedCandidates.length} rejeitados</small></button>{search.status !== "completed" && search.status !== "cancelled" && <button className="cancel-search" onClick={() => void updateSearch(search.id, { status: "cancelled" })}>Cancelar</button>}</article>)}</div> : <p className="empty-copy">As buscas aparecerão aqui e poderão ser retomadas.</p>}
        </section>
      </aside>
    </div>
    {importOpen && <ImportDialog open existing={leads} importing={busy} onClose={() => setImportOpen(false)} onImport={async (result) => { setBusy(true); try { await importResult(result); setImportOpen(false); } finally { setBusy(false); } }} />}
  </main>;
}
