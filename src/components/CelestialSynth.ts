/**
 * A client-side Web Audio synthesizer of celestial and cosmic soundscapes.
 * Provides interactive sonic feedback that heightens the psychological immersion.
 */
class CelestialSoundscape {
  private ctx: AudioContext | null = null;

  private initCtx() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (this.ctx.state === "suspended") {
      this.ctx.resume();
    }
  }

  // Soft high-frequency bell sound for clicking or activating stars
  public playStarBell(frequency = 880, duration = 1.2) {
    try {
      this.initCtx();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;

      // Add elegant organic variability by adding a tiny random detune (up to ±15 cents) or scaling to a pentatonic scale element
      const detuneRange = (Math.random() - 0.5) * 20; // -10 to +10 Hz random drift
      const targetFrequency = Math.max(220, frequency + detuneRange);

      // Primary tone
      const osc = this.ctx.createOscillator();
      const gainNode = this.ctx.createGain();

      // Soften timbre by occasionally mixing sine and a very low gain triangle
      osc.type = Math.random() > 0.5 ? "sine" : "triangle";
      osc.frequency.setValueAtTime(targetFrequency, t);
      osc.frequency.exponentialRampToValueAtTime(targetFrequency * 0.75, t + duration);

      // MUCH lower volume - from 0.25 to 0.06 (delightfully soft, not strident at all)
      gainNode.gain.setValueAtTime(0.06, t);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, t + duration);

      // Add a secondary harmonic tone to create an automatic micro-chord (variability)
      const harmonyOsc = this.ctx.createOscillator();
      const harmonyGain = this.ctx.createGain();
      
      // Select a random harmonic relationship (Perfect 5th, Major 3rd, Octave, or Major 10th)
      const harmonies = [1.5, 1.25, 2.0, 2.5];
      const selectedHarmony = harmonies[Math.floor(Math.random() * harmonies.length)];
      
      harmonyOsc.type = "sine";
      harmonyOsc.frequency.setValueAtTime(targetFrequency * selectedHarmony, t);
      harmonyOsc.frequency.exponentialRampToValueAtTime(targetFrequency * selectedHarmony * 0.75, t + duration * 0.8);
      
      // Extremely soft ambient background harmony
      harmonyGain.gain.setValueAtTime(0.02, t);
      harmonyGain.gain.exponentialRampToValueAtTime(0.0001, t + duration * 0.8);

      // Reverb / Echo simulation delay
      const delay = this.ctx.createDelay();
      const delayGain = this.ctx.createGain();
      
      // Randomize delay time slightly to vary "room" feel
      const randomDelay = 0.15 + Math.random() * 0.08;
      delay.delayTime.setValueAtTime(randomDelay, t);
      // Soft echo feedback
      delayGain.gain.setValueAtTime(0.15, t);

      // Connections
      osc.connect(gainNode);
      harmonyOsc.connect(harmonyGain);

      gainNode.connect(this.ctx.destination);
      harmonyGain.connect(this.ctx.destination);

      // Echo loop
      gainNode.connect(delay);
      delay.connect(delayGain);
      delayGain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + duration);

      harmonyOsc.start(t);
      harmonyOsc.stop(t + duration * 0.8);
    } catch (e) {
      console.warn("AudioContext block or error ignored:", e);
    }
  }

  // Low cosmic frequency pulse when mapping or loading completes
  public playCosmicPulse() {
    try {
      this.initCtx();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;

      // Variability: Random low root notes (Low A: 55Hz, Low C: 65Hz, Low G: 49Hz, Low F: 43.6Hz)
      const roots = [55.0, 65.4, 49.0, 43.6];
      const randomRoot = roots[Math.floor(Math.random() * roots.length)];

      const osc = this.ctx.createOscillator();
      const bandpass = this.ctx.createBiquadFilter();
      const gainNode = this.ctx.createGain();

      // Soft triangle/sawtooth mix instead of raw sawtooth to eliminate sharp/harsh clipping peaks
      osc.type = Math.random() > 0.5 ? "triangle" : "sawtooth";
      osc.frequency.setValueAtTime(randomRoot, t);
      osc.frequency.exponentialRampToValueAtTime(randomRoot * 2.0, t + 2.0);

      bandpass.type = "bandpass";
      // Lower filter frequency to make it warmer, less bass-screechy
      bandpass.frequency.setValueAtTime(160, t);
      bandpass.Q.setValueAtTime(8, t);
      bandpass.frequency.exponentialRampToValueAtTime(600, t + 1.8);

      // Reduced volume from 0.35 to 0.08 for extremely warm, professional low haptic-like rumble
      gainNode.gain.setValueAtTime(0.08, t);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, t + 2.2);

      osc.connect(bandpass);
      bandpass.connect(gainNode);
      gainNode.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 2.2);

      // Play an automatic soft echo star chime after a short period with nice high frequency
      const randChimeFreq = 900 + Math.random() * 400;
      setTimeout(() => this.playStarBell(randChimeFreq, 1.8), 250);
    } catch (e) {
      console.warn(e);
    }
  }

  // Soft sweeping wind pad when scanning
  public playScanningSweep(duration = 2.5) {
    try {
      this.initCtx();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;

      const osc = this.ctx.createOscillator();
      const lfo = this.ctx.createOscillator();
      const lfoGain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();
      const gainNode = this.ctx.createGain();

      // Vary starting sweep values for organic feel
      const startFreq = 220 + Math.random() * 110;
      const midFreq =  380 + Math.random() * 100;
      const endFreq = 180 + Math.random() * 60;

      osc.type = "sine";
      osc.frequency.setValueAtTime(startFreq, t);
      osc.frequency.linearRampToValueAtTime(midFreq, t + duration * 0.45);
      osc.frequency.linearRampToValueAtTime(endFreq, t + duration);

      // Modulating LFO
      lfo.type = "sine";
      const lfoRate = 3 + Math.random() * 4; // Vary modulator rate (3Hz to 7Hz)
      lfo.frequency.setValueAtTime(lfoRate, t);
      lfoGain.gain.setValueAtTime(8, t);

      // Filter sweep to make it a soft celestial wind gust
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(400, t);
      filter.frequency.exponentialRampToValueAtTime(1100, t + duration * 0.5);
      filter.frequency.exponentialRampToValueAtTime(200, t + duration);

      // Reduced sweep volume: from 0.12 to 0.03 max gain for a background atmospheric texture
      gainNode.gain.setValueAtTime(0.001, t);
      gainNode.gain.linearRampToValueAtTime(0.025, t + 0.4);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, t + duration);

      lfo.connect(lfoGain);
      lfoGain.connect(osc.frequency);
      osc.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(this.ctx.destination);

      osc.start(t);
      lfo.start(t);
      osc.stop(t + duration);
      lfo.stop(t + duration);
    } catch (e) {
      console.warn(e);
    }
  }
}

export const synth = new CelestialSoundscape();
