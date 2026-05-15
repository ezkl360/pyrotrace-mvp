export function statusBadge(status: string) {
  const common = 'rounded-full px-3 py-1 text-xs font-semibold';
  const map: Record<string, string> = {
    ACTIVE: 'bg-emerald-100 text-emerald-800',
    PLANNED: 'bg-slate-200 text-slate-800',
    DUE_SOON: 'bg-amber-100 text-amber-800',
    IN_PROGRESS: 'bg-blue-100 text-blue-800',
    COMPLETED: 'bg-emerald-100 text-emerald-800',
    OVERDUE: 'bg-red-100 text-red-800',
    CANCELLED: 'bg-slate-100 text-slate-500',
    DRAFT: 'bg-slate-100 text-slate-700',
    SUBMITTED: 'bg-blue-100 text-blue-800',
    APPROVED: 'bg-emerald-100 text-emerald-800',
    REJECTED: 'bg-red-100 text-red-800',
    VOIDED: 'bg-zinc-100 text-zinc-600',
  };
  return `${common} ${map[status] ?? 'bg-slate-100 text-slate-700'}`;
}
