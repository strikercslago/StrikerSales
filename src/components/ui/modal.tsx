"use client";

import { useEffect, useRef, type ReactNode } from "react";

let openModals = 0;
let previousOverflow = "";

/** Native dialogs provide focus trapping, Escape and focus restoration. */
export function Modal({ open, onClose, label, busy = false, fullScreen = false, children }: {
  open: boolean; onClose: () => void; label: string; busy?: boolean; fullScreen?: boolean; children: ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    if (!open) return;
    const dialog = ref.current;
    if (!dialog) return;
    if (openModals++ === 0) {
      previousOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
    }
    dialog.showModal();
    return () => {
      dialog.close();
      if (--openModals === 0) document.body.style.overflow = previousOverflow;
    };
  }, [open]);
  if (!open) return null;
  return <dialog ref={ref} className={`modal-backdrop native-modal${fullScreen ? " mobile-lead-dialog" : ""}`} aria-label={label}
    onCancel={(event) => { event.preventDefault(); if (!busy) onClose(); }}
    onClick={(event) => { if (!fullScreen && !busy && event.target === event.currentTarget) onClose(); }}>
    {children}
  </dialog>;
}
