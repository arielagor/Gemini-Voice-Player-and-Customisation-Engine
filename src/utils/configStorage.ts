import { CustomVoiceProfile, AudioEffectSettings, Voice } from "../types";
import { GEMINI_VOICES } from "../data/voices";

const STORAGE_KEY = "gemini_voice_custom_configs_v1";

// Default starter configurations demonstrating rich custom profiles and clone personas
export const STARTER_CONFIGS: CustomVoiceProfile[] = [
  {
    id: "preset-cinematic-trailer",
    name: "Titan Cinema Trailer Voice",
    description: "Deep, thunderous cinematic voice with sub-bass acoustic saturation and deliberate pacing.",
    baseVoiceId: "Fenrir",
    baseVoiceName: "Fenrir",
    settings: {
      pitchSemitones: -4,
      pitchCents: -15,
      speed: 0.9,
      preservePitch: true,
      eq: {
        bass: 7.5,
        mid: 2.0,
        treble: 3.5,
      },
      volume: 1.0,
      loop: false,
    },
    customClone: {
      enabled: true,
      personaTitle: "Hollywood Trailer Voice Artist",
      accentDialect: "Deep American Neutral",
      deliveryMannerism: "Low, measured, suspenseful with heavy gravitas and dramatic pauses",
      timbreCharacter: "Thick baritone sub-rumble with crisp cinematic articulation",
      acousticEnvironment: "Treated sound isolation booth, Neumann U87 close-mic",
      promptInstruction:
        "Speak with deep cinematic movie trailer authority, low gravelly resonance, suspenseful pauses, and epic dramatic weight.",
    },
    samplePrompt:
      "In a world where intelligence redefined reality, one journey would test the limits of human imagination.",
    category: "commercial",
    tags: ["Trailer", "Deep Bass", "Epic", "Narrator"],
    createdAt: 1710000000000,
    updatedAt: 1710000000000,
  },
  {
    id: "preset-preferred-narration",
    name: "My Preferred Narration Voice",
    description: "Silky, warm audiobook storyteller voice tuned for hours of comfortable listening.",
    baseVoiceId: "Charon",
    baseVoiceName: "Charon",
    settings: {
      pitchSemitones: -1,
      pitchCents: -5,
      speed: 0.95,
      preservePitch: true,
      eq: {
        bass: 3.0,
        mid: 1.5,
        treble: 2.0,
      },
      volume: 1.0,
      loop: false,
    },
    customClone: {
      enabled: true,
      personaTitle: "Warm Master Audiobook Storyteller",
      accentDialect: "Refined Transatlantic RP",
      deliveryMannerism: "Gentle conversational cadence, expressive character differentiation, rhythmic warmth",
      timbreCharacter: "Rich cello-like resonance, velvet warmth, gentle breath control",
      acousticEnvironment: "Acoustically damped home library studio",
      promptInstruction:
        "Read as an intimate, world-class audiobook narrator. Express subtle warmth, delicate character inflections, and clear, soothing pacing.",
    },
    samplePrompt:
      "The ancient clock in the hallway struck midnight, and outside the rain settled into a steady, comforting rhythm across the cedar roof.",
    category: "narration",
    tags: ["Narration", "Audiobook", "Warm", "Storyteller"],
    createdAt: 1710000001000,
    updatedAt: 1710000001000,
  },
  {
    id: "preset-calm-meditation",
    name: "Sanctuary Mindfulness Guide",
    description: "Hypnotic, breath-focused meditation guide with extended frequency smoothing and slow tempo.",
    baseVoiceId: "Kore",
    baseVoiceName: "Kore",
    settings: {
      pitchSemitones: -2,
      pitchCents: 0,
      speed: 0.85,
      preservePitch: true,
      eq: {
        bass: 2.0,
        mid: -1.0,
        treble: -2.0,
      },
      volume: 0.95,
      loop: false,
    },
    customClone: {
      enabled: true,
      personaTitle: "Zen Mindfulness Instructor",
      accentDialect: "Soft Universal English",
      deliveryMannerism: "Slow rhythmic inhalation cues, soothing whispery undertones, grounding stillness",
      timbreCharacter: "Soft, tranquil, gentle presence without sharp transients",
      acousticEnvironment: "Spacious meditation sanctuary with soft natural reverberation",
      promptInstruction:
        "Speak in an exceptionally calm, gentle, and grounding mindfulness tone. Softly paced with warm breathiness and peaceful tranquility.",
    },
    samplePrompt:
      "Gently close your eyes. Allow the breath to flow naturally in, and slowly out. Notice the quiet space between each thought.",
    category: "meditation",
    tags: ["Meditation", "Relaxation", "Calm", "Sleep"],
    createdAt: 1710000002000,
    updatedAt: 1710000002000,
  },
  {
    id: "preset-hyper-tech-founder",
    name: "Silicon Valley Tech Keynote",
    description: "Brisk, visionary presenter voice tuned with high clarity and energetic presence.",
    baseVoiceId: "Puck",
    baseVoiceName: "Puck",
    settings: {
      pitchSemitones: 1,
      pitchCents: 10,
      speed: 1.15,
      preservePitch: true,
      eq: {
        bass: -1.0,
        mid: 4.0,
        treble: 5.0,
      },
      volume: 1.0,
      loop: false,
    },
    customClone: {
      enabled: true,
      personaTitle: "Keynote Tech Evangelist",
      accentDialect: "Modern West Coast Tech",
      deliveryMannerism: "Punchy, quick emphasis on transformative words, inspiring optimism",
      timbreCharacter: "Crisp, bright vocal fry transition, energetic forward projection",
      acousticEnvironment: "Stage lavalier mic with broad audience dispersion",
      promptInstruction:
        "Speak with high-energy tech keynote enthusiasm, crisp articulation, upbeat tempo, and visionary excitement.",
    },
    samplePrompt:
      "Today, we are thrilled to unveil something truly monumental that will completely change how engineers interact with generative sound.",
    category: "tech",
    tags: ["Keynote", "Crisp", "Upbeat", "High-Energy"],
    createdAt: 1710000003000,
    updatedAt: 1710000003000,
  },
];

/**
 * Load all custom configurations from localStorage (or fallback to starters)
 */
export function getSavedVoiceConfigs(): CustomVoiceProfile[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      // Seed initial starter configs
      localStorage.setItem(STORAGE_KEY, JSON.stringify(STARTER_CONFIGS));
      return STARTER_CONFIGS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return STARTER_CONFIGS;
  } catch (err) {
    console.error("Failed to load saved voice configurations from localStorage:", err);
    return STARTER_CONFIGS;
  }
}

/**
 * Save updated list to localStorage
 */
export function saveVoiceConfigsToStorage(configs: CustomVoiceProfile[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(configs));
  } catch (err) {
    console.error("Failed to save voice configurations to localStorage:", err);
  }
}

/**
 * Save a single new or edited configuration
 */
export function persistVoiceConfig(profile: CustomVoiceProfile): CustomVoiceProfile[] {
  const all = getSavedVoiceConfigs();
  const existingIdx = all.findIndex((c) => c.id === profile.id);
  let updatedList: CustomVoiceProfile[];

  if (existingIdx >= 0) {
    updatedList = [...all];
    updatedList[existingIdx] = { ...profile, updatedAt: Date.now() };
  } else {
    updatedList = [{ ...profile, createdAt: Date.now(), updatedAt: Date.now() }, ...all];
  }

  saveVoiceConfigsToStorage(updatedList);
  return updatedList;
}

/**
 * Delete a configuration by ID
 */
export function deleteVoiceConfig(id: string): CustomVoiceProfile[] {
  const all = getSavedVoiceConfigs();
  const filtered = all.filter((c) => c.id !== id);
  saveVoiceConfigsToStorage(filtered);
  return filtered;
}

/**
 * Reset all configurations back to starter templates
 */
export function resetVoiceConfigsToDefault(): CustomVoiceProfile[] {
  saveVoiceConfigsToStorage(STARTER_CONFIGS);
  return STARTER_CONFIGS;
}

/**
 * Export configuration(s) to a shareable encoded string
 * Format: "GVP1:<base64-json>"
 */
export function exportConfigToShareableString(
  configOrConfigs: CustomVoiceProfile | CustomVoiceProfile[]
): string {
  const payload = {
    app: "GeminiVoicePlayer",
    version: "1.0",
    exportedAt: Date.now(),
    data: configOrConfigs,
  };
  const jsonStr = JSON.stringify(payload);
  const base64 = btoa(encodeURIComponent(jsonStr));
  return `GVP1:${base64}`;
}

/**
 * Import and decode configuration(s) from a shareable string or raw JSON string
 */
export function parseShareableConfigString(
  input: string
): { success: boolean; data?: CustomVoiceProfile[]; error?: string } {
  try {
    const trimmed = input.trim();
    let jsonString = trimmed;

    if (trimmed.startsWith("GVP1:")) {
      const base64 = trimmed.substring(5);
      jsonString = decodeURIComponent(atob(base64));
    }

    const parsed = JSON.parse(jsonString);

    let items: any[] = [];
    if (parsed.app === "GeminiVoicePlayer" && parsed.data) {
      items = Array.isArray(parsed.data) ? parsed.data : [parsed.data];
    } else if (Array.isArray(parsed)) {
      items = parsed;
    } else if (typeof parsed === "object" && parsed !== null) {
      items = [parsed];
    }

    if (items.length === 0) {
      return { success: false, error: "No valid voice configuration payload found." };
    }

    // Validate structure
    const validConfigs: CustomVoiceProfile[] = [];
    for (const item of items) {
      if (!item.name || !item.baseVoiceId) {
        continue;
      }

      // Ensure baseVoice exists or falls back to Puck
      const matchedBase = GEMINI_VOICES.find(
        (v) => v.id.toLowerCase() === (item.baseVoiceId || "").toLowerCase()
      );
      const baseVoiceId = matchedBase ? matchedBase.id : "Puck";
      const baseVoiceName = matchedBase ? matchedBase.name : "Puck";

      const validConfig: CustomVoiceProfile = {
        id: `imported-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        name: String(item.name || "Imported Voice Preset"),
        description: item.description ? String(item.description) : undefined,
        baseVoiceId,
        baseVoiceName,
        settings: {
          pitchSemitones: Number(item.settings?.pitchSemitones ?? 0),
          pitchCents: Number(item.settings?.pitchCents ?? 0),
          speed: Math.max(0.5, Math.min(2.5, Number(item.settings?.speed ?? 1.0))),
          preservePitch: item.settings?.preservePitch ?? true,
          eq: {
            bass: Number(item.settings?.eq?.bass ?? 0),
            mid: Number(item.settings?.eq?.mid ?? 0),
            treble: Number(item.settings?.eq?.treble ?? 0),
          },
          volume: Number(item.settings?.volume ?? 1.0),
          loop: Boolean(item.settings?.loop ?? false),
        },
        customClone: item.customClone
          ? {
              enabled: Boolean(item.customClone.enabled),
              personaTitle: String(item.customClone.personaTitle || ""),
              accentDialect: String(item.customClone.accentDialect || ""),
              deliveryMannerism: String(item.customClone.deliveryMannerism || ""),
              timbreCharacter: String(item.customClone.timbreCharacter || ""),
              acousticEnvironment: item.customClone.acousticEnvironment
                ? String(item.customClone.acousticEnvironment)
                : undefined,
              promptInstruction: String(item.customClone.promptInstruction || ""),
            }
          : undefined,
        samplePrompt: item.samplePrompt ? String(item.samplePrompt) : undefined,
        category: item.category || "custom",
        tags: Array.isArray(item.tags) ? item.tags.map(String) : [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      validConfigs.push(validConfig);
    }

    if (validConfigs.length === 0) {
      return { success: false, error: "The provided string did not contain valid voice profile data." };
    }

    return { success: true, data: validConfigs };
  } catch (err: any) {
    return { success: false, error: `Invalid configuration string: ${err.message}` };
  }
}

/**
 * Export configuration as a downloadable JSON file
 */
export function downloadConfigAsJsonFile(
  profileOrProfiles: CustomVoiceProfile | CustomVoiceProfile[],
  filename?: string
): void {
  const isArray = Array.isArray(profileOrProfiles);
  const name = isArray
    ? `gemini-voice-configurations-${profileOrProfiles.length}-presets.json`
    : `${(profileOrProfiles.name || "voice-config").toLowerCase().replace(/[^a-z0-9]+/g, "-")}.json`;

  const payload = {
    app: "GeminiVoicePlayer",
    version: "1.0",
    exportedAt: new Date().toISOString(),
    data: profileOrProfiles,
  };

  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename || name;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Compile a custom voice clone profile into a high-fidelity prompt instruction for Gemini
 */
export function compileClonePromptInstruction(clone: {
  personaTitle: string;
  accentDialect: string;
  deliveryMannerism: string;
  timbreCharacter: string;
  acousticEnvironment?: string;
  promptInstruction?: string;
}): string {
  const parts: string[] = [];

  if (clone.personaTitle) {
    parts.push(`Adopt the distinct vocal persona of a ${clone.personaTitle}.`);
  }
  if (clone.accentDialect) {
    parts.push(`Vocal Accent & Dialect: ${clone.accentDialect}.`);
  }
  if (clone.timbreCharacter) {
    parts.push(`Timbre and Vocal Quality: ${clone.timbreCharacter}.`);
  }
  if (clone.deliveryMannerism) {
    parts.push(`Delivery Mannerisms & Pacing: ${clone.deliveryMannerism}.`);
  }
  if (clone.acousticEnvironment) {
    parts.push(`Acoustic Environment: ${clone.acousticEnvironment}.`);
  }
  if (clone.promptInstruction) {
    parts.push(`Specific Direction: ${clone.promptInstruction}`);
  }

  return parts.join(" ");
}
