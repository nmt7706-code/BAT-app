import { NotificationRingtone } from '../types';

class SoundService {
  private ctx: AudioContext | null = null;

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return null;
    if (!this.ctx || this.ctx.state === 'closed') {
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  playRingtone(type: NotificationRingtone = 'whistle'): void {
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      const now = ctx.currentTime;

      switch (type) {
        case 'whistle': {
          // Referee whistle sound: dual oscillating frequencies around 2500Hz and 2800Hz with vibrato
          const osc1 = ctx.createOscillator();
          const osc2 = ctx.createOscillator();
          const gain = ctx.createGain();

          osc1.type = 'triangle';
          osc2.type = 'sine';

          osc1.frequency.setValueAtTime(2600, now);
          osc2.frequency.setValueAtTime(2850, now);

          // Trill / modulation
          const lfo = ctx.createOscillator();
          const lfoGain = ctx.createGain();
          lfo.frequency.setValueAtTime(25, now);
          lfoGain.gain.setValueAtTime(80, now);
          lfo.connect(osc1.frequency);
          lfo.connect(osc2.frequency);
          lfo.start(now);
          lfo.stop(now + 0.45);

          gain.gain.setValueAtTime(0.01, now);
          gain.gain.linearRampToValueAtTime(0.3, now + 0.05);
          gain.gain.setValueAtTime(0.3, now + 0.35);
          gain.gain.linearRampToValueAtTime(0.01, now + 0.45);

          osc1.connect(gain);
          osc2.connect(gain);
          gain.connect(ctx.destination);

          osc1.start(now);
          osc2.start(now);
          osc1.stop(now + 0.45);
          osc2.stop(now + 0.45);
          break;
        }

        case 'stadium': {
          // Stadium chime: rich rising fanfare chords (C5, E5, G5, C6)
          const freqs = [523.25, 659.25, 783.99, 1046.5];
          freqs.forEach((f, idx) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            const start = now + idx * 0.09;

            osc.type = 'sine';
            osc.frequency.setValueAtTime(f, start);

            gain.gain.setValueAtTime(0.001, start);
            gain.gain.exponentialRampToValueAtTime(0.25, start + 0.03);
            gain.gain.exponentialRampToValueAtTime(0.001, start + 0.45);

            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.start(start);
            osc.stop(start + 0.45);
          });
          break;
        }

        case 'bell': {
          // Academy bell: clean resonant metal chime
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();

          osc.type = 'sine';
          osc.frequency.setValueAtTime(880, now); // A5

          gain.gain.setValueAtTime(0.35, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.7);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(now);
          osc.stop(now + 0.7);
          break;
        }

        case 'pop': {
          // Quick subtle tactical pop
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();

          osc.type = 'sine';
          osc.frequency.setValueAtTime(800, now);
          osc.frequency.exponentialRampToValueAtTime(200, now + 0.12);

          gain.gain.setValueAtTime(0.3, now);
          gain.gain.linearRampToValueAtTime(0.01, now + 0.12);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(now);
          osc.stop(now + 0.12);
          break;
        }

        case 'arena': {
          // Arena Pulse: low to high punch
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();

          osc.type = 'triangle';
          osc.frequency.setValueAtTime(320, now);
          osc.frequency.exponentialRampToValueAtTime(640, now + 0.15);
          osc.frequency.exponentialRampToValueAtTime(960, now + 0.35);

          gain.gain.setValueAtTime(0.05, now);
          gain.gain.linearRampToValueAtTime(0.3, now + 0.08);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(now);
          osc.stop(now + 0.5);
          break;
        }

        default:
          break;
      }
    } catch {
      // AudioContext might fail if user hasn't interacted yet
    }
  }
}

export const soundService = new SoundService();
