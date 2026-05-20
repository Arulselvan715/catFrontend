export function MetricCard({ label, value, tone = 'default' }) {
  const toneClass = tone === 'danger' ? 'text-red-600 dark:text-red-300' : tone === 'warn' ? 'text-amber-500 dark:text-amber-300' : 'text-cyan-600 dark:text-cyan-200';
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950/70 shadow-sm dark:shadow-none">
      <div className="text-xs uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">{label}</div>
      <div className={`mt-2 text-2xl font-bold ${toneClass}`}>{value}</div>
    </div>
  );
}
