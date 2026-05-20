const labels = {
  CAMERA_OFF: 'Camera off',
  DROWSINESS_WARNING: 'Drowsiness warning',
  EYES_CLOSED_EMERGENCY: 'Eyes closed emergency',
  FACE_MISSING_EMERGENCY: 'Face missing emergency'
};

export function AlertLogList({ alerts }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-950/70">
      <div className="border-b border-slate-200 px-4 py-3 font-semibold text-slate-900 dark:border-slate-800 dark:text-white">Recent Alert Logs</div>
      <div className="max-h-80 overflow-auto divide-y divide-slate-200 dark:divide-slate-800">
        {alerts.length === 0 ? (
          <div className="px-4 py-6 text-sm text-slate-500 dark:text-slate-400">No alert logs yet.</div>
        ) : alerts.map((alert) => (
          <div key={alert.id} className="px-4 py-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="font-medium text-slate-900 dark:text-white">{labels[alert.type] || alert.type}</div>
                <div className="mt-1 text-sm text-slate-500 dark:text-slate-400">{alert.message}</div>
              </div>
              <span className={`rounded px-2 py-1 text-xs font-bold ${alert.severity === 'critical' ? 'bg-red-500 text-white' : 'bg-amber-400 text-black'}`}>
                {alert.severity}
              </span>
            </div>
            <div className="mt-2 text-xs text-slate-500">
              {new Date(alert.created_at).toLocaleString()} ? Pushover {alert.notification?.sent || alert.sms?.sent ? 'sent' : alert.notification?.skipped_reason || alert.sms?.skipped_reason || 'not required'}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
