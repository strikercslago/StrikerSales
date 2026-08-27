import { CloseIcon } from "./icons";

export function ConfirmDialog({ open, title, message, confirmLabel, danger, busy, onClose, onConfirm }: { open: boolean; title: string; message: string; confirmLabel: string; danger?: boolean; busy?: boolean; onClose: () => void; onConfirm: () => Promise<unknown> | void }) {
  if (!open) return null;
  return <div className="modal-backdrop"><section className="modal confirm-modal"><header><h2>{title}</h2><button className="icon-button" onClick={onClose}><CloseIcon /></button></header><p>{message}</p><footer><button className="secondary-button" onClick={onClose}>Cancelar</button><button className={danger ? "danger-button" : "primary-button"} disabled={busy} onClick={() => void Promise.resolve(onConfirm()).then(onClose).catch(() => undefined)}>{busy ? "Processando..." : confirmLabel}</button></footer></section></div>;
}
