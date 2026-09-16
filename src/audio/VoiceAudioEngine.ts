import { AudioEffectSettings } from "../types";

export class VoiceAudioEngine {
  private audioCtx: AudioContext | null = null;
  private currentBuffer: AudioBuffer | null = null;
  private currentSource: AudioBufferSourceNode | null = null;

  // Nodes
  private lowShelfFilter: BiquadFilterNode | null = null;
  private midPeakFilter: BiquadFilterNode | null = null;
  private highShelfFilter: BiquadFilterNode | null = null;
  private gainNode: GainNode | null = null;
  private compressorNode: DynamicsCompressorNode | null = null;
  public analyserNode: AnalyserNode | null = null;

  // Playback state
  private isPlaying = false;
  private startTime = 0;
  private pauseOffset = 0;
  private playbackRate = 1.0;
  private detuneCents = 0;

  // Listeners
  public onTimeUpdate?: (currentTime: number, duration: number) => void;
  public onEnded?: () => void;
  private animFrameId: number | null = null;

  constructor() {
    // Lazy AudioContext initialization on user gesture
  }

  private initContext(): AudioContext {
    if (!this.audioCtx) {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      this.audioCtx = new AudioCtxClass();
      this.setupAudioGraph();
    }
    if (this.audioCtx.state === "suspended") {
      this.audioCtx.resume();
    }
    return this.audioCtx;
  }

  private setupAudioGraph() {
    if (!this.audioCtx) return;

    // Filters for voice EQ
    this.lowShelfFilter = this.audioCtx.createBiquadFilter();
    this.lowShelfFilter.type = "lowshelf";
    this.lowShelfFilter.frequency.value = 220; // Vocal chest/warmth

    this.midPeakFilter = this.audioCtx.createBiquadFilter();
    this.midPeakFilter.type = "peaking";
    this.midPeakFilter.frequency.value = 2800; // Vocal intelligibility & presence
    this.midPeakFilter.Q.value = 1.0;

    this.highShelfFilter = this.audioCtx.createBiquadFilter();
    this.highShelfFilter.type = "highshelf";
    this.highShelfFilter.frequency.value = 7500; // Vocal breath & air

    // Volume gain
    this.gainNode = this.audioCtx.createGain();
    this.gainNode.gain.value = 1.0;

    // Soft limiter compressor
    this.compressorNode = this.audioCtx.createDynamicsCompressor();
    this.compressorNode.threshold.value = -3.0;
    this.compressorNode.knee.value = 6.0;
    this.compressorNode.ratio.value = 8.0;
    this.compressorNode.attack.value = 0.003;
    this.compressorNode.release.value = 0.15;

    // Visualizer Analyser
    this.analyserNode = this.audioCtx.createAnalyser();
    this.analyserNode.fftSize = 256;
    this.analyserNode.smoothingTimeConstant = 0.8;

    // Connect graph: LowShelf -> MidPeak -> HighShelf -> Gain -> Compressor -> Analyser -> Destination
    this.lowShelfFilter.connect(this.midPeakFilter);
    this.midPeakFilter.connect(this.highShelfFilter);
    this.highShelfFilter.connect(this.gainNode);
    this.gainNode.connect(this.compressorNode);
    this.compressorNode.connect(this.analyserNode);
    this.analyserNode.connect(this.audioCtx.destination);
  }

  public async loadAudioFromBase64(base64Data: string): Promise<AudioBuffer> {
    const ctx = this.initContext();
    this.stop();

    // Decode base64 to ArrayBuffer
    const binary = atob(base64Data);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }

    const audioBuffer = await ctx.decodeAudioData(bytes.buffer.slice(0));
    this.currentBuffer = audioBuffer;
    this.pauseOffset = 0;
    return audioBuffer;
  }

  public setBuffer(buffer: AudioBuffer) {
    this.stop();
    this.currentBuffer = buffer;
    this.pauseOffset = 0;
  }

  public getDuration(): number {
    return this.currentBuffer ? this.currentBuffer.duration : 0;
  }

  public getCurrentTime(): number {
    if (!this.isPlaying || !this.audioCtx) {
      return this.pauseOffset;
    }
    const elapsed = (this.audioCtx.currentTime - this.startTime) * this.playbackRate;
    const duration = this.getDuration();
    if (duration > 0 && elapsed >= duration) {
      return duration;
    }
    return Math.min(elapsed, duration);
  }

  public play(settings: AudioEffectSettings) {
    const ctx = this.initContext();
    if (!this.currentBuffer) return;

    if (this.isPlaying) {
      this.stopCurrentSourceOnly();
    }

    this.applySettings(settings);

    const source = ctx.createBufferSource();
    source.buffer = this.currentBuffer;
    source.loop = settings.loop;

    // Apply speed and pitch
    this.playbackRate = settings.speed;
    source.playbackRate.value = settings.speed;

    this.detuneCents = settings.pitchSemitones * 100 + settings.pitchCents;
    source.detune.value = this.detuneCents;

    if (this.lowShelfFilter) {
      source.connect(this.lowShelfFilter);
    }

    const offset = Math.max(0, Math.min(this.pauseOffset, this.currentBuffer.duration));
    this.startTime = ctx.currentTime - offset / this.playbackRate;

    source.onended = () => {
      if (this.isPlaying && !settings.loop) {
        this.isPlaying = false;
        this.pauseOffset = 0;
        this.stopTracking();
        if (this.onEnded) this.onEnded();
      }
    };

    source.start(0, offset);
    this.currentSource = source;
    this.isPlaying = true;

    this.startTracking();
  }

  public pause() {
    if (!this.isPlaying) return;
    this.pauseOffset = this.getCurrentTime();
    this.stopCurrentSourceOnly();
    this.isPlaying = false;
    this.stopTracking();
  }

  public stop() {
    this.stopCurrentSourceOnly();
    this.pauseOffset = 0;
    this.isPlaying = false;
    this.stopTracking();
    if (this.onTimeUpdate && this.currentBuffer) {
      this.onTimeUpdate(0, this.currentBuffer.duration);
    }
  }

  public seek(timeInSeconds: number, settings: AudioEffectSettings) {
    const duration = this.getDuration();
    const clamped = Math.max(0, Math.min(timeInSeconds, duration));
    this.pauseOffset = clamped;

    if (this.isPlaying) {
      this.play(settings);
    } else if (this.onTimeUpdate && this.currentBuffer) {
      this.onTimeUpdate(clamped, duration);
    }
  }

  public updateLiveEffects(settings: AudioEffectSettings) {
    this.applySettings(settings);

    if (this.currentSource && this.audioCtx) {
      const now = this.audioCtx.currentTime;
      this.currentSource.playbackRate.setValueAtTime(settings.speed, now);
      this.playbackRate = settings.speed;

      const totalCents = settings.pitchSemitones * 100 + settings.pitchCents;
      this.currentSource.detune.setValueAtTime(totalCents, now);
      this.detuneCents = totalCents;

      this.currentSource.loop = settings.loop;
    }
  }

  private applySettings(settings: AudioEffectSettings) {
    if (!this.audioCtx) return;
    const now = this.audioCtx.currentTime;

    if (this.lowShelfFilter) {
      this.lowShelfFilter.gain.setValueAtTime(settings.eq.bass, now);
    }
    if (this.midPeakFilter) {
      this.midPeakFilter.gain.setValueAtTime(settings.eq.mid, now);
    }
    if (this.highShelfFilter) {
      this.highShelfFilter.gain.setValueAtTime(settings.eq.treble, now);
    }
    if (this.gainNode) {
      this.gainNode.gain.setValueAtTime(settings.volume, now);
    }
  }

  private stopCurrentSourceOnly() {
    if (this.currentSource) {
      try {
        this.currentSource.onended = null;
        this.currentSource.stop();
        this.currentSource.disconnect();
      } catch (_) {}
      this.currentSource = null;
    }
  }

  private startTracking() {
    this.stopTracking();
    const tick = () => {
      if (this.isPlaying && this.onTimeUpdate && this.currentBuffer) {
        this.onTimeUpdate(this.getCurrentTime(), this.currentBuffer.duration);
      }
      this.animFrameId = requestAnimationFrame(tick);
    };
    this.animFrameId = requestAnimationFrame(tick);
  }

  private stopTracking() {
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
  }

  public getAnalyserData(): Uint8Array {
    if (!this.analyserNode) {
      return new Uint8Array(64);
    }
    const data = new Uint8Array(this.analyserNode.frequencyBinCount);
    this.analyserNode.getByteFrequencyData(data);
    return data;
  }

  public getWaveformData(): Uint8Array {
    if (!this.analyserNode) {
      return new Uint8Array(128);
    }
    const data = new Uint8Array(this.analyserNode.frequencyBinCount);
    this.analyserNode.getByteTimeDomainData(data);
    return data;
  }

  public getPlaybackState(): boolean {
    return this.isPlaying;
  }

  // Export processed audio as downloadable WAV Blob using OfflineAudioContext
  public async exportProcessedWav(
    settings: AudioEffectSettings,
    voiceName: string
  ): Promise<{ blob: Blob; filename: string }> {
    if (!this.currentBuffer) {
      throw new Error("No audio buffer available to export.");
    }

    const sampleRate = this.currentBuffer.sampleRate;
    const duration = (this.currentBuffer.duration / settings.speed) + 0.5; // slight tail
    const length = Math.ceil(duration * sampleRate);

    const offlineCtx = new OfflineAudioContext(1, length, sampleRate);

    const source = offlineCtx.createBufferSource();
    source.buffer = this.currentBuffer;
    source.playbackRate.value = settings.speed;
    source.detune.value = settings.pitchSemitones * 100 + settings.pitchCents;

    // Filters
    const low = offlineCtx.createBiquadFilter();
    low.type = "lowshelf";
    low.frequency.value = 220;
    low.gain.value = settings.eq.bass;

    const mid = offlineCtx.createBiquadFilter();
    mid.type = "peaking";
    mid.frequency.value = 2800;
    mid.Q.value = 1.0;
    mid.gain.value = settings.eq.mid;

    const high = offlineCtx.createBiquadFilter();
    high.type = "highshelf";
    high.frequency.value = 7500;
    high.gain.value = settings.eq.treble;

    const gain = offlineCtx.createGain();
    gain.gain.value = settings.volume;

    source.connect(low);
    low.connect(mid);
    mid.connect(high);
    high.connect(gain);
    gain.connect(offlineCtx.destination);

    source.start(0);

    const renderedBuffer = await offlineCtx.startRendering();
    const wavBlob = audioBufferToWavBlob(renderedBuffer);

    const pitchStr =
      settings.pitchSemitones >= 0
        ? `+${settings.pitchSemitones}st`
        : `${settings.pitchSemitones}st`;
    const speedStr = `${settings.speed.toFixed(2)}x`;
    const filename = `gemini-voice-${voiceName.toLowerCase()}-${pitchStr}-${speedStr}.wav`;

    return { blob: wavBlob, filename };
  }
}

// Convert AudioBuffer to standard 16-bit PCM WAV Blob
function audioBufferToWavBlob(buffer: AudioBuffer): Blob {
  const numChannels = 1;
  const sampleRate = buffer.sampleRate;
  const channelData = buffer.getChannelData(0);
  const dataLength = channelData.length * 2; // 16-bit = 2 bytes per sample

  const arrayBuffer = new ArrayBuffer(44 + dataLength);
  const view = new DataView(arrayBuffer);

  // RIFF identifier
  writeString(view, 0, "RIFF");
  view.setUint32(4, 36 + dataLength, true);
  writeString(view, 8, "WAVE");

  // Format chunk
  writeString(view, 12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true); // PCM
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * numChannels * 2, true);
  view.setUint16(32, numChannels * 2, true);
  view.setUint16(34, 16, true); // 16 bits

  // Data chunk
  writeString(view, 36, "data");
  view.setUint32(40, dataLength, true);

  // Write PCM samples with soft clipping protection
  let offset = 44;
  for (let i = 0; i < channelData.length; i++) {
    const s = Math.max(-1, Math.min(1, channelData[i]));
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
    offset += 2;
  }

  return new Blob([view], { type: "audio/wav" });
}

function writeString(view: DataView, offset: number, string: string) {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}
