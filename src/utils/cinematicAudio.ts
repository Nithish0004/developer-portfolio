/**
 * Procedural Cinematic Audio Engine for Loading Sequence
 * Uses lightweight Web Audio API with zero external dependencies.
 * Respects browser autoplay policies and handles mute state gracefully.
 */

class CinematicAudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private ambientGain: GainNode | null = null;
  private ambientOscs: OscillatorNode[] = [];
  private isMuted: boolean = false;
  private isInitialized: boolean = false;

  constructor() {
    // Lazy init on first user interaction or trigger
  }

  private initContext() {
    if (this.ctx) return;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 0.16, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
      this.isInitialized = true;
    } catch {
      // AudioContext unavailable or restricted
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(muted ? 0 : 0.16, this.ctx.currentTime, 0.05);
    }
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  public resume() {
    this.initContext();
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  /**
   * Deep, soft low-frequency ambient tone at start (0.0s)
   */
  public startAmbient() {
    this.initContext();
    if (!this.ctx || !this.masterGain) return;
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }

    try {
      const t = this.ctx.currentTime;
      this.ambientGain = this.ctx.createGain();
      this.ambientGain.gain.setValueAtTime(0.001, t);
      this.ambientGain.gain.exponentialRampToValueAtTime(0.12, t + 1.2);

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(110, t);

      // Warm twin sub-oscillators (48Hz and 52Hz for gentle binaural beat)
      const osc1 = this.ctx.createOscillator();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(48, t);

      const osc2 = this.ctx.createOscillator();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(52, t);

      osc1.connect(filter);
      osc2.connect(filter);
      filter.connect(this.ambientGain);
      this.ambientGain.connect(this.masterGain);

      osc1.start(t);
      osc2.start(t);
      this.ambientOscs = [osc1, osc2];
    } catch {
      // Ignore if autoplay blocked
    }
  }

  /**
   * Energy ignite when stroke begins
   */
  public playStrokeStart(strokeNum: number) {
    this.initContext();
    if (!this.ctx || !this.masterGain || this.isMuted) return;

    try {
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      const baseFreq = 220 + strokeNum * 80;
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(baseFreq, t);
      osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.5, t + 0.12);

      gain.gain.setValueAtTime(0.001, t);
      gain.gain.linearRampToValueAtTime(0.08, t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.18);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(t);
      osc.stop(t + 0.2);
    } catch {
      // Ignore
    }
  }

  /**
   * Subtle rising energy resonance while stroke is being drawn
   */
  public playStrokeRise(duration: number, startFreq: number, endFreq: number) {
    this.initContext();
    if (!this.ctx || !this.masterGain || this.isMuted) return;

    try {
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(startFreq * 1.2, t);
      filter.frequency.exponentialRampToValueAtTime(endFreq * 1.2, t + duration);
      filter.Q.setValueAtTime(3, t);

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(startFreq, t);
      osc.frequency.exponentialRampToValueAtTime(endFreq, t + duration);

      gain.gain.setValueAtTime(0.001, t);
      gain.gain.linearRampToValueAtTime(0.035, t + 0.1);
      gain.gain.setValueAtTime(0.035, t + duration - 0.1);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + duration);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);

      osc.start(t);
      osc.stop(t + duration + 0.05);
    } catch {
      // Ignore
    }
  }

  /**
   * Crisp, soft metallic/digital tick when stroke finishes
   */
  public playStrokeComplete(strokeNum: number) {
    this.initContext();
    if (!this.ctx || !this.masterGain || this.isMuted) return;

    try {
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      const freqs = [1200, 1500, 1900];
      const freq = freqs[strokeNum - 1] || 1500;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.5, t + 0.08);

      gain.gain.setValueAtTime(0.001, t);
      gain.gain.linearRampToValueAtTime(0.09, t + 0.008);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.1);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(t);
      osc.stop(t + 0.12);
    } catch {
      // Ignore
    }
  }

  /**
   * Deep warm cinematic tone when full N is completed (3.8s - 4.8s)
   */
  public playLogoResolved() {
    this.initContext();
    if (!this.ctx || !this.masterGain || this.isMuted) return;

    try {
      const t = this.ctx.currentTime;
      const chord = [130.81, 164.81, 196.0, 261.63]; // C minor / cinematic warm chord

      chord.forEach((freq, i) => {
        if (!this.ctx || !this.masterGain) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();

        osc.type = i % 2 === 0 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(freq, t);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(250, t);
        filter.frequency.exponentialRampToValueAtTime(600, t + 0.6);
        filter.frequency.exponentialRampToValueAtTime(150, t + 1.8);

        gain.gain.setValueAtTime(0.001, t);
        gain.gain.linearRampToValueAtTime(0.05 / (i + 1), t + 0.3);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + 1.8);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain);

        osc.start(t);
        osc.stop(t + 1.85);
      });
    } catch {
      // Ignore
    }
  }

  /**
   * Realistic atmospheric thunder & electrical discharge (50-60% event)
   * Subtle multi-stage rumble + high-frequency ionisation fizz
   */
  public playAtmosphericThunder() {
    this.initContext();
    if (!this.ctx || !this.masterGain || this.isMuted) return;

    try {
      const t = this.ctx.currentTime;

      // 1. Initial low-frequency air displacement / sub rumble
      const subOsc = this.ctx.createOscillator();
      const subGain = this.ctx.createGain();
      const subFilter = this.ctx.createBiquadFilter();

      subOsc.type = 'sine';
      subOsc.frequency.setValueAtTime(42, t);
      subOsc.frequency.exponentialRampToValueAtTime(32, t + 0.85);

      subFilter.type = 'lowpass';
      subFilter.frequency.setValueAtTime(80, t);
      subFilter.frequency.linearRampToValueAtTime(140, t + 0.2);
      subFilter.frequency.exponentialRampToValueAtTime(40, t + 0.9);

      subGain.gain.setValueAtTime(0.001, t);
      subGain.gain.linearRampToValueAtTime(0.12, t + 0.08);
      subGain.gain.setValueAtTime(0.11, t + 0.25);
      subGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.9);

      subOsc.connect(subFilter);
      subFilter.connect(subGain);
      subGain.connect(this.masterGain);

      subOsc.start(t);
      subOsc.stop(t + 0.95);

      // 2. Procedural electrical sizzle / air crackle via filtered noise
      const bufferSize = Math.floor(this.ctx.sampleRate * 0.7);
      const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        // Pink-weighted random noise
        output[i] = (Math.random() * 2 - 1) * 0.5;
      }

      const whiteNoise = this.ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;

      const noiseFilter = this.ctx.createBiquadFilter();
      noiseFilter.type = 'bandpass';
      noiseFilter.frequency.setValueAtTime(1800, t);
      noiseFilter.frequency.exponentialRampToValueAtTime(650, t + 0.5);
      noiseFilter.Q.setValueAtTime(2.2, t);

      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(0.001, t);
      noiseGain.gain.linearRampToValueAtTime(0.045, t + 0.04);
      noiseGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.55);

      whiteNoise.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(this.masterGain);

      whiteNoise.start(t);
      whiteNoise.stop(t + 0.6);
    } catch {
      // Ignore
    }
  }

  /**
   * Very subtle final resolving sound when loading reaches 100% (5.5s)
   */
  public playFinalResolve() {
    this.initContext();
    if (!this.ctx || !this.masterGain || this.isMuted) return;

    try {
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, t);
      osc.frequency.exponentialRampToValueAtTime(440, t + 0.45);

      gain.gain.setValueAtTime(0.001, t);
      gain.gain.linearRampToValueAtTime(0.06, t + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.6);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(t);
      osc.stop(t + 0.65);
    } catch {
      // Ignore
    }
  }

  /**
   * Fade out and cleanup
   */
  public cleanup() {
    try {
      if (this.ambientGain && this.ctx) {
        this.ambientGain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.3);
      }
      setTimeout(() => {
        this.ambientOscs.forEach((osc) => {
          try {
            osc.stop();
            osc.disconnect();
          } catch {}
        });
        this.ambientOscs = [];
        if (this.ctx && this.ctx.state !== 'closed') {
          this.ctx.close().catch(() => {});
        }
      }, 350);
    } catch {}
  }
}

export const cinematicAudio = new CinematicAudioEngine();
