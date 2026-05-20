import { Camera, RefreshCw, ShieldAlert } from 'lucide-react';

function formatSeconds(ms) {
  return `${(ms / 1000).toFixed(1)}s`;
}

export function CameraPanel({ videoRef, status, modelReady, restartCamera }) {
  const cameraBlocked = status.camera !== 'active';
  return (
    <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950 dark:shadow-none">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-4 py-3 dark:border-slate-800">
        <div className="flex items-center gap-2 text-slate-900 dark:text-white">
          <Camera className="h-5 w-5 text-cyan-500 dark:text-cyan-300" />
          <span className="font-semibold">Live Driver Camera</span>
        </div>
        <button
          onClick={restartCamera}
          className="inline-flex items-center gap-2 rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-600 hover:border-cyan-500 hover:text-cyan-600 dark:border-slate-700 dark:text-slate-200 dark:hover:border-cyan-400 dark:hover:text-white"
        >
          <RefreshCw className="h-4 w-4" />
          Retry
        </button>
      </div>

      <div className="relative aspect-video bg-black">
        <video ref={videoRef} className="video-mirror h-full w-full object-cover" playsInline muted />
        {cameraBlocked && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-950/95 p-6 text-center">
            <ShieldAlert className="mb-4 h-14 w-14 text-red-200" />
            <div className="animate-blink text-2xl font-black text-white">CAMERA IS REQUIRED FOR DRIVER SAFETY</div>
            <p className="mt-3 max-w-xl text-sm text-red-100">Enable camera permission and keep the webcam active for continuous monitoring.</p>
          </div>
        )}
      </div>

      <div className="grid gap-3 border-t border-slate-200 p-4 dark:border-slate-800 sm:grid-cols-3">
        <div>
          <div className="text-xs text-slate-500 dark:text-slate-400">AI Model</div>
          <div className="font-semibold text-slate-900 dark:text-white">{modelReady ? 'Ready' : 'Loading'}</div>
        </div>
        <div>
          <div className="text-xs text-slate-500 dark:text-slate-400">Eye Closure Timer</div>
          <div className="font-semibold text-slate-900 dark:text-white">{formatSeconds(status.eyeClosedDurationMs)}</div>
        </div>
        <div>
          <div className="text-xs text-slate-500 dark:text-slate-400">Face Missing Timer</div>
          <div className="font-semibold text-slate-900 dark:text-white">{formatSeconds(status.faceMissingDurationMs)}</div>
        </div>
      </div>
    </section>
  );
}
