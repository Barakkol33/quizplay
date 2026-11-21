import * as store from './store';

let ctx: AudioContext | null = null;

function tone(freq: number, start: number, dur: number, type: OscillatorType = 'sine', gain = 0.12): void {
  if (!ctx) return;
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = type;
  o.frequency.value = freq;
  g.gain.setValueAtTime(gain, ctx.currentTime + start);
  g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + start + dur);
  o.connect(g).connect(ctx.destination);
  o.start(ctx.currentTime + start);
  o.stop(ctx.currentTime + start + dur);
}

export function sound(kind: 'right' | 'wrong' | 'win' | 'lose'): void {
  if (store.muted()) return;
  try {
    ctx ??= new AudioContext();
    if (kind === 'right') {
      tone(660, 0, 0.12);
      tone(990, 0.08, 0.18);
    } else if (kind === 'wrong') {
      tone(220, 0, 0.25, 'square', 0.05);
    } else if (kind === 'win') {
      [523, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.11, 0.25));
    } else {
      [392, 330, 262].forEach((f, i) => tone(f, i * 0.15, 0.3, 'triangle'));
    }
  } catch {
    /* no audio available */
  }
}

export function confetti(): void {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const layer = document.createElement('div');
  layer.className = 'confetti';
  const colors = ['#f59e0b', '#10b981', '#3b82f6', '#ef4444', '#a855f7', '#ec4899'];
  for (let i = 0; i < 80; i++) {
    const p = document.createElement('i');
    p.style.left = Math.random() * 100 + 'vw';
    p.style.background = colors[i % colors.length];
    p.style.animationDelay = Math.random() * 0.6 + 's';
    p.style.animationDuration = 1.6 + Math.random() * 1.4 + 's';
    p.style.setProperty('--drift', (Math.random() - 0.5) * 200 + 'px');
    layer.append(p);
  }
  document.body.append(layer);
  setTimeout(() => layer.remove(), 3500);
}
