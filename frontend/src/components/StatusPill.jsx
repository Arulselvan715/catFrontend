export function StatusPill({ active, label, value }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-950/70 shadow-sm dark:shadow-none">
      <div className="flex items-center gap-3">
        <span className={`h-2.5 w-2.5 rounded-full ${active ? 'bg-emerald-400 shadow-[0_0_14px_rgba(52,211,153,.8)]' : 'bg-red-500 shadow-[0_0_14px_rgba(239,68,68,.8)]'}`} />
        <span className="text-sm text-slate-600 dark:text-slate-300">{label}</span>
      </div>
      <span className="text-sm font-semibold text-slate-900 dark:text-white">{value}</span>
    </div>
  );
}
