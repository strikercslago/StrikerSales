"use client";

import { Modal } from "@/components/ui/modal";
import { CloseIcon } from "./icons";

export function ConfirmDialog({ open, title, message, confirmLabel, danger, busy, onClose, onConfirm }: { open: boolean; title: string; message: string; confirmLabel: string; danger?: boolean; busy?: boolean; onClose: () => void; onConfirm: () => Promise<unknown> | void }) {
  if (!open) return null;
  return <Modal open={open} label="Confirmação" onClose={onClose} busy={busy}><section className="modal confirm-modal"><header><h2>{title}</h2><button className="icon-button" aria-label="Fechar" disabled={busy} onClick={onClose}><CloseIcon /></button></header><p>{message}</p><footer><button className="secondary-button" disabled={busy} onClick={onClose}>Cancelar</button><button className={danger ? "danger-button" : "primary-button"} disabled={busy} onClick={() => void Promise.resolve(onConfirm()).then(onClose).catch(() => undefined)}>{busy ? "Processando..." : confirmLabel}</button></footer></section></Modal>;
}
