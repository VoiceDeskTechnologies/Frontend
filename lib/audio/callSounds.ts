let audioContext: AudioContext | undefined;
let ringTimer: number | undefined;

function getAudioContext() {
  if (typeof window === "undefined") return undefined;
  audioContext ??= new AudioContext();
  if (audioContext.state === "suspended") void audioContext.resume();
  return audioContext;
}

function tone(frequencies: number[], duration: number, volume = 0.045) {
  const context = getAudioContext();
  if (!context) return;
  const now = context.currentTime;
  const gain = context.createGain();
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(volume, now + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
  gain.connect(context.destination);
  frequencies.forEach((frequency) => {
    const oscillator = context.createOscillator();
    oscillator.type = "sine";
    oscillator.frequency.value = frequency;
    oscillator.connect(gain);
    oscillator.start(now);
    oscillator.stop(now + duration + 0.02);
  });
}

export function playDialTone() { tone([350, 440], 0.11); }
export function playCallEndTone() { tone([480, 620], 0.18, 0.055); window.setTimeout(() => tone([350, 440], 0.25, 0.04), 190); }
export function startRingingTone() {
  stopRingingTone();
  const ring = () => { tone([440, 480], 0.42, 0.035); window.setTimeout(() => tone([440, 480], 0.42, 0.035), 520); };
  ring();
  ringTimer = window.setInterval(ring, 3000);
}
export function stopRingingTone() { if (ringTimer) { window.clearInterval(ringTimer); ringTimer = undefined; } }
export function stopAllCallSounds() { stopRingingTone(); }
