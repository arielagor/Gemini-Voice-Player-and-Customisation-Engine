export interface Voice {
  id: string;
  name: string;
  gender: "Male" | "Female";
  tone: string;
  character: string;
  energy: string;
  bestFor: string;
  color: string;
  samplePrompt: string;
}

export interface AudioEffectSettings {
  pitchSemitones: number; // -12 to +12 semitones
  pitchCents: number; // -100 to +100 cents
  speed: number; // 0.50 to 2.50x
  preservePitch: boolean; // if true, time-stretching keeps pitch independent of speed
  eq: {
    bass: number; // -12 to +12 dB
    mid: number; // -12 to +12 dB
    treble: number; // -12 to +12 dB
  };
  volume: number; // 0 to 2.0
  loop: boolean;
}

export interface ScriptPreset {
  id: string;
  title: string;
  category: "introduction" | "story" | "meditation" | "tech" | "dramatic" | "dialogue";
  text: string;
  recommendedVoice?: string;
}

export interface GeneratedAudioItem {
  id: string;
  voiceId: string;
  voiceName: string;
  text: string;
  audioBase64: string; // WAV base64
  duration: number;
  sampleRate: number;
  createdAt: number;
  method: string;
}

export type PlaybackStatus = "idle" | "loading" | "playing" | "paused";

export interface CustomVoiceProfile {
  id: string;
  name: string;
  description?: string;
  baseVoiceId: string; // Puck, Charon, Kore, Fenrir, Zephyr, Aoede, Leda, Orus
  baseVoiceName: string;
  settings: AudioEffectSettings;
  customClone?: {
    enabled: boolean;
    personaTitle: string; // e.g., "British Tech Founder", "Noir Detective", "Ethereal Oracle"
    accentDialect: string; // e.g. "Warm British RP", "Midwestern American", "Irish Lilt", "Transatlantic"
    deliveryMannerism: string; // e.g., "Rapid-fire thoughtful pauses", "Gravelly whispered confidence"
    timbreCharacter: string; // e.g., "Husky rasp with crisp dental consonants", "Warm baritone chest resonance"
    acousticEnvironment?: string; // e.g., "Treated recording booth", "Intimate podcast mic close-proximity"
    promptInstruction: string; // Master compiled style instruction injected into Gemini 3.8 Live API
  };
  samplePrompt?: string;
  category?: "narration" | "assistant" | "gaming" | "meditation" | "commercial" | "tech" | "custom";
  tags?: string[];
  createdAt: number;
  updatedAt: number;
}
