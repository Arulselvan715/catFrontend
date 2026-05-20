import { Siren } from 'lucide-react';

export function EmergencyOverlay({ active, message }) {
  if (!active) return null;
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-red-700 p-6 text-center text-white animate-blink">
      <Siren className="mb-5 h-20 w-20" />
      <div className="text-4xl font-black sm:text-6xl">EMERGENCY ALERT</div>
      <div className="mt-5 max-w-3xl text-xl font-bold sm:text-2xl">{message}</div>
    </div>
  );
}
