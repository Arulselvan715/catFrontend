class AudioAlerts {
  constructor() {
    this.context = null;
    this.activeLoops = new Map();
  }

  ensureContext() {
    if (!this.context) {
      this.context = new AudioContext();
    }
    if (this.context.state === 'suspended') {
      this.context.resume();
    }
    return this.context;
  }

  startLoop() {
    // Alarm siren audio disabled. Speech warnings remain enabled.
  }

  stopLoop(name) {
    const interval = this.activeLoops.get(name);
    if (interval) {
      clearInterval(interval);
      this.activeLoops.delete(name);
    }
  }

  stopAll() {
    for (const name of this.activeLoops.keys()) {
      this.stopLoop(name);
    }
  }

  beep() {
    // Intentionally silent.
  }

  speak(text) {
    if (!('speechSynthesis' in window)) return;
    const alreadySpeaking = window.speechSynthesis.speaking || window.speechSynthesis.pending;
    if (alreadySpeaking) return;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    utterance.pitch = 1;
    utterance.volume = 1;
    window.speechSynthesis.speak(utterance);
  }
}

export const audioAlerts = new AudioAlerts();
