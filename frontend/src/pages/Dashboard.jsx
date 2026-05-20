import { AlertTriangle, Eye, Gauge, Phone, ShieldCheck } from 'lucide-react';
import { useRef } from 'react';
import { AlertLogList } from '../components/AlertLogList';
import { CameraPanel } from '../components/CameraPanel';
import { EmergencyOverlay } from '../components/EmergencyOverlay';
import { MetricCard } from '../components/MetricCard';
import { StatusPill } from '../components/StatusPill';
import { useDriverMonitor } from '../hooks/useDriverMonitor';

function seconds(ms) {
  return `${(ms / 1000).toFixed(1)}s`;
}

export function Dashboard({ contactsCount }) {
  const videoRef = useRef(null);
  const { status, modelReady, alertsCount, recentAlerts, restartCamera } = useDriverMonitor(videoRef);

  return (
    <>
      <EmergencyOverlay active={status.emergencyActive || status.faceMissingDurationMs >= 60_000} message={status.message} />
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.45fr)_minmax(360px,.55fr)]">
        <div className="space-y-5">
          <CameraPanel videoRef={videoRef} status={status} modelReady={modelReady} restartCamera={restartCamera} />
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <MetricCard label="Alerts Triggered" value={alertsCount} tone={alertsCount > 0 ? 'warn' : 'default'} />
            <MetricCard label="Confidence" value={`${Math.round(status.confidence * 100)}%`} />
            <MetricCard label="Eye Closed" value={seconds(status.eyeClosedDurationMs)} tone={status.warningActive ? 'danger' : 'default'} />
            <MetricCard label="Average EAR" value={status.averageEAR.toFixed(3)} />
          </div>
        </div>

        <aside className="space-y-5">
          <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900/80 shadow-sm dark:shadow-none">
            <div className="mb-4 flex items-center gap-2 font-semibold text-slate-900 dark:text-white">
              <Gauge className="h-5 w-5 text-cyan-500 dark:text-cyan-300" />
              Live Status
            </div>
            <div className="space-y-3">
              <StatusPill active={status.camera === 'active'} label="Camera Status" value={status.camera.toUpperCase()} />
              <StatusPill active={status.faceDetected} label="Face Detection" value={status.faceDetected ? 'DETECTED' : 'NOT DETECTED'} />
              <StatusPill active={!status.eyesClosed} label="Eye Status" value={status.eyesClosed ? 'CLOSED' : 'OPEN'} />
              <StatusPill active={contactsCount > 0} label="Emergency Contact" value={contactsCount > 0 ? `${contactsCount} SAVED` : 'MISSING'} />
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900/80 shadow-sm dark:shadow-none">
            <div className="mb-3 flex items-center gap-2 font-semibold text-slate-900 dark:text-white">
              {status.emergencyActive ? <AlertTriangle className="h-5 w-5 text-amber-500 dark:text-amber-300" /> : <ShieldCheck className="h-5 w-5 text-emerald-500 dark:text-emerald-300" />}
              Safety Message
            </div>
            <div className={`rounded-lg px-4 py-4 text-sm font-semibold ${status.emergencyActive ? 'bg-red-500 text-white' : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-200'}`}>
              {status.message}
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-950">
                <Eye className="mb-2 h-4 w-4 text-cyan-500 dark:text-cyan-300" />
                <div className="text-slate-500">Left / Right EAR</div>
                <div className="font-semibold text-slate-900 dark:text-white">{status.leftEAR.toFixed(3)} / {status.rightEAR.toFixed(3)}</div>
              </div>
              <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-950">
                <Phone className="mb-2 h-4 w-4 text-cyan-500 dark:text-cyan-300" />
                <div className="text-slate-500">SMS Cooldown</div>
                <div className="font-semibold text-slate-900 dark:text-white">Backend protected</div>
              </div>
            </div>
          </div>

          <AlertLogList alerts={recentAlerts} />
        </aside>
      </div>
    </>
  );
}
