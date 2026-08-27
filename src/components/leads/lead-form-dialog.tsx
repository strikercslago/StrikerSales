"use client";

import { useEffect, useState } from "react";
import type { Lead, LeadDraft, LeadPriority } from "@/types/lead";
import { CloseIcon } from "@/components/ui/icons";

const blank: LeadDraft = { name: "", businessName: "", priority: "media", message: "" };

export function LeadFormDialog({ open, lead, saving, onClose, onSave }: { open: boolean; lead?: Lead; saving: boolean; onClose: () => void; onSave: (draft: LeadDraft) => Promise<unknown> }) {
  const [form, setForm] = useState<LeadDraft>(blank); const [error, setError] = useState<string>();
  useEffect(() => { if (open) setForm(lead ? { ...lead } : blank); setError(undefined); }, [lead, open]);
  if (!open) return null;
  const field = (key: keyof LeadDraft) => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setForm((current) => ({ ...current, [key]: event.target.value }));
  const save = async (event: React.FormEvent) => { event.preventDefault(); setError(undefined); if (!(form.name || form.businessName) || !(form.phone || form.city || form.website || form.instagram)) { setError("Informe nome ou empresa e pelo menos telefone, cidade, website ou Instagram."); return; } try { await onSave({ ...form, score: form.score === undefined || String(form.score).trim() === "" ? undefined : Number(form.score) }); onClose(); } catch (cause) { setError(cause instanceof Error ? cause.message : "Não foi possível salvar."); } };
  return <div className="modal-backdrop"><form className="modal lead-form-modal" onSubmit={save}><header><div><p className="eyebrow">{lead ? "ATUALIZAR REGISTRO" : "CADASTRO MANUAL"}</p><h2>{lead ? "Editar lead" : "Novo lead"}</h2></div><button type="button" className="icon-button" onClick={onClose}><CloseIcon /></button></header>
    <div className="form-scroll"><div className="form-grid"><label>Nome<input value={form.name ?? ""} onChange={field("name")} /></label><label>Empresa<input value={form.businessName ?? ""} onChange={field("businessName")} /></label><label>Segmento<input value={form.segment ?? ""} onChange={field("segment")} /></label><label>Cidade<input value={form.city ?? ""} onChange={field("city")} /></label><label>Estado<input value={form.state ?? ""} onChange={field("state")} maxLength={2} /></label><label>Telefone<input value={form.phone ?? ""} onChange={field("phone")} /></label><label>Instagram<input value={form.instagram ?? ""} onChange={field("instagram")} /></label><label>Website<input value={form.website ?? ""} onChange={field("website")} /></label><label>Score<input type="number" value={form.score ?? ""} onChange={field("score")} /></label><label>Prioridade<select value={form.priority ?? "media"} onChange={(event) => setForm((current) => ({ ...current, priority: event.target.value as LeadPriority }))}><option value="alta">Alta</option><option value="media">Média</option><option value="baixa">Baixa</option></select></label></div>
      <label>Dor identificada<textarea rows={3} value={form.pain ?? ""} onChange={field("pain")} /></label><label>Oportunidade<textarea rows={3} value={form.opportunity ?? ""} onChange={field("opportunity")} /></label><label>Mensagem<textarea rows={4} value={form.message ?? ""} onChange={field("message")} /></label><label>Follow-up<textarea rows={3} value={form.followupMessage ?? ""} onChange={field("followupMessage")} /></label><label>Observações<textarea rows={3} value={form.notes ?? ""} onChange={field("notes")} /></label>{error && <p className="error-box">{error}</p>}</div>
    <footer><button type="button" className="secondary-button" onClick={onClose}>Cancelar</button><button className="primary-button" disabled={saving}>{saving ? "Salvando..." : lead ? "Salvar alterações" : "Criar lead"}</button></footer></form></div>;
}
