import type { Lead, LeadPriority } from "@/types/lead";

const priorityWeight: Record<LeadPriority, number> = { alta: 0, media: 1, baixa: 2 };
const statusWeight = (lead: Lead) => lead.status === "novo" ? 0 : lead.status === "abordado" ? 1 : 2;

export type LeadSort = (a: Lead, b: Lead) => number;

export const defaultLeadSort: LeadSort = (a, b) =>
  statusWeight(a) - statusWeight(b) ||
  priorityWeight[a.priority] - priorityWeight[b.priority] ||
  (b.score ?? 0) - (a.score ?? 0) ||
  (b.reviewCount ?? 0) - (a.reviewCount ?? 0) ||
  a.createdAt.localeCompare(b.createdAt);

export function orderLeads(leads: Lead[], sort: LeadSort = defaultLeadSort) {
  return [...leads].sort(sort);
}
