"use client";

import { useCallback, useEffect, useState } from "react";

const leadFromHash = () => new URLSearchParams(window.location.hash.slice(1)).get("lead") || undefined;

/** A lead is a separate screen on compact layouts; browser Back returns to the queue. */
export function useLeadNavigation(selectLead: (id: string | undefined) => void) {
  const [detailOpen, setDetailOpen] = useState(false);
  useEffect(() => {
    const sync = () => {
      const id = leadFromHash();
      setDetailOpen(Boolean(id));
      if (id) selectLead(id);
    };
    sync();
    window.addEventListener("popstate", sync);
    window.addEventListener("hashchange", sync);
    return () => {
      window.removeEventListener("popstate", sync);
      window.removeEventListener("hashchange", sync);
    };
  }, [selectLead]);

  const openLead = useCallback((id: string) => {
    selectLead(id);
    if (window.matchMedia("(max-width: 900px)").matches || leadFromHash()) {
      const url = new URL(window.location.href);
      const replacing = Boolean(leadFromHash());
      url.hash = new URLSearchParams({ lead: id }).toString();
      // Keep one entry for the entire lead session, including "next lead".
      const state = { ...window.history.state, strikerLeadEntry: replacing ? window.history.state?.strikerLeadEntry : true };
      if (replacing) window.history.replaceState(state, "", url);
      else window.history.pushState(state, "", url);
      setDetailOpen(true);
    }
  }, [selectLead]);

  const closeLead = useCallback(() => {
    setDetailOpen(false);
    if (leadFromHash()) {
      if (window.history.state?.strikerLeadEntry) window.history.back();
      else {
        const url = new URL(window.location.href);
        url.hash = "";
        window.history.replaceState(window.history.state, "", url);
      }
    } else selectLead(undefined);
  }, [selectLead]);
  return { detailOpen, openLead, closeLead };
}
