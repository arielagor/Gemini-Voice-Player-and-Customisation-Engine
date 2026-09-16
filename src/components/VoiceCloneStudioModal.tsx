import { useState } from "react";
import { CustomVoiceProfile, Voice, AudioEffectSettings } from "../types";
import { GEMINI_VOICES } from "../data/voices";
import { compileClonePromptInstruction } from "../utils/configStorage";
import {
  Sparkles,
  Wand2,
  X,
  Volume2,
  Check,
  Cpu,
  Mic2,
  Layers,
  HelpCircle,
  Flame,
  Radio,
  Sliders,
} from "lucide-react";

interface VoiceCloneStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentVoice: Voice;
  currentSettings: AudioEffectSettings;
  onSaveCloneProfile: (profile: CustomVoiceProfile) => void;
  onAuditionProfile: (profile: CustomVoiceProfile) => Promise<void>;
  isAuditioning: boolean;
}

// Preset archetypes for quick proprietary cloning inspiration
const CLONE_ARCHETYPES = [
  {
    title: "Documentary Historian",
    baseVoice: "Charon",
    accent: "Cultured British RP",
    timbre: "Warm, textured baritone with gentle chest resonance",
    delivery: "Thoughtful pauses, reverent curiosity, cinematic pacing",
    environment: "Damped broadcast studio with vintage ribbon microphone",
    prompt: "Speak as a world-renowned documentary presenter narrating an ancient archaeological breakthrough.",
    pitchOffset: -2,
    speed: 0.95,
  },
  {
    title: "AI Co-Pilot / Jarvis",
    baseVoice: "Zephyr",
    accent: "Transatlantic Analytical",
    timbre: "Ultra-crisp, pristine high frequency fidelity, zero vocal fry",
    delivery: "Effortlessly intelligent, immediate, reassuringly capable",
    environment: "Pure digital space, near-field hypercardioid clarity",
    prompt: "Speak as an advanced, calm, hyper-intelligent onboard spaceflight AI co-pilot.",
    pitchOffset: 1,
    speed: 1.05,
  },
  {
    title: "Cyberpunk Fixer / Rogue",
    baseVoice: "Fenrir",
    accent: "Gritty Neo-Tokyo Noir English",
    timbre: "Low-end smoky grit with subtle metallic rasp",
    delivery: "Streetwise, unhurried, dangerous confidence",
    environment: "Rain-slicked alleyway, worn dynamic vocal mic",
    prompt: "Deliver dialogue as a gritty underground broker negotiating a high-stakes corporate heist.",
    pitchOffset: -5,
    speed: 0.92,
  },
  {
    title: "Mindfulness Zen Monk",
    baseVoice: "Kore",
    accent: "Gentle Universal Calm",
    timbre: "Soft, warm breathiness, zero edge or tension",
    delivery: "Deep grounding cadence, extended relaxing exhalations",
    environment: "Open cedar meditation hall with gentle acoustic decay",
    prompt: "Guide with profound tranquility, soothing whisper-tone warmth, and peaceful stillness.",
    pitchOffset: -2,
    speed: 0.82,
  },
  {
    title: "Silicon Tech Visionary",
    baseVoice: "Puck",
    accent: "Modern California Tech",
    timbre: "Brisk, bright clarity with punchy mid-range presence",
    delivery: "High conviction, optimistic inflections, infectious drive",
    environment: "Auditorium stage headset mic",
    prompt: "Deliver as an inspired technology pioneer unveiling a revolutionary breakthrough to the world.",
    pitchOffset: 1,
    speed: 1.12,
  },
];

export function VoiceCloneStudioModal({
  isOpen,
  onClose,
  currentVoice,
  currentSettings,
  onSaveCloneProfile,
  onAuditionProfile,
  isAuditioning,
}: VoiceCloneStudioModalProps) {
  if (!isOpen) return null;

  // Form State
  const [profileName, setProfileName] = useState<string>(
    `${currentVoice.name} Custom Clone`
  );
  const [description, setDescription] = useState<string>(
    "Proprietary custom cloned vocal profile with custom acoustic persona & timbre tuning."
  );
  const [baseVoiceId, setBaseVoiceId] = useState<string>(currentVoice.id);
  const [personaTitle, setPersonaTitle] = useState<string>("Narrative Specialist");
  const [accentDialect, setAccentDialect] = useState<string>("Warm Transatlantic");
  const [deliveryMannerism, setDeliveryMannerism] = useState<string>(
    "Measured cadence, thoughtful pauses, and expressive nuance"
  );
  const [timbreCharacter, setTimbreCharacter] = useState<string>(
    "Rich baritone resonance with crisp articulate consonants"
  );
  const [acousticEnvironment, setAcousticEnvironment] = useState<string>(
    "Acoustically treated studio booth, large-diaphragm condenser"
  );
  const [customPrompt, setCustomPrompt] = useState<string>(
    "Speak with distinct proprietary character, exceptional depth, and natural conversational cadence."
  );
  const [sampleSentence, setSampleSentence] = useState<string>(
    "Welcome. This is a demonstration of my proprietary cloned vocal persona, configured with precision timbre and acoustic engineering."
  );

  // Pitch & Speed adjustments specific to the clone
  const [cloneSemitones, setCloneSemitones] = useState<number>(
    currentSettings.pitchSemitones
  );
  const [cloneSpeed, setCloneSpeed] = useState<number>(currentSettings.speed);
  const [cloneBass, setCloneBass] = useState<number>(currentSettings.eq.bass);
  const [cloneMid, setCloneMid] = useState<number>(currentSettings.eq.mid);
  const [cloneTreble, setCloneTreble] = useState<number>(currentSettings.eq.treble);

  // Apply archetype
  const handleApplyArchetype = (arch: (typeof CLONE_ARCHETYPES)[0]) => {
    setProfileName(arch.title);
    setDescription(`Cloned ${arch.title} voice persona engineered from ${arch.baseVoice}.`);
    setBaseVoiceId(arch.baseVoice);
    setPersonaTitle(arch.title);
    setAccentDialect(arch.accent);
    setTimbreCharacter(arch.timbre);
    setDeliveryMannerism(arch.delivery);
    setAcousticEnvironment(arch.environment);
    setCustomPrompt(arch.prompt);
    setCloneSemitones(arch.pitchOffset);
    setCloneSpeed(arch.speed);
  };

  // Compile active object
  const buildCurrentProfile = (): CustomVoiceProfile => {
    const matchedVoice = GEMINI_VOICES.find((v) => v.id === baseVoiceId) || currentVoice;
    const compiledInstruction = compileClonePromptInstruction({
      personaTitle,
      accentDialect,
      deliveryMannerism,
      timbreCharacter,
      acousticEnvironment,
      promptInstruction: customPrompt,
    });

    return {
      id: `clone-${Date.now()}`,
      name: profileName.trim() || "Untitled Clone Voice",
      description: description.trim(),
      baseVoiceId: matchedVoice.id,
      baseVoiceName: matchedVoice.name,
      settings: {
        ...currentSettings,
        pitchSemitones: cloneSemitones,
        speed: cloneSpeed,
        eq: {
          bass: cloneBass,
          mid: cloneMid,
          treble: cloneTreble,
        },
      },
      customClone: {
        enabled: true,
        personaTitle,
        accentDialect,
        deliveryMannerism,
        timbreCharacter,
        acousticEnvironment,
        promptInstruction: compiledInstruction,
      },
      samplePrompt: sampleSentence,
      category: "custom",
      tags: ["Clone", personaTitle, matchedVoice.name],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
  };

  const handleAudition = async () => {
    const profile = buildCurrentProfile();
    await onAuditionProfile(profile);
  };

  const handleSave = () => {
    const profile = buildCurrentProfile();
    onSaveCloneProfile(profile);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-750 rounded-2xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-500/20 to-indigo-500/20 border border-purple-500/40 flex items-center justify-center text-purple-400 shadow-inner">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  Custom Voice Clone & Persona Studio
                </h3>
                <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20">
                  Proprietary Voice Engine
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Design custom synthetic voice personas combining Gemini 3.8 base timbres, dialect styling, and acoustic DSP.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body - Scrollable */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-sm text-slate-300">
          {/* Quick Archetype Selector */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 mb-2.5">
              <Wand2 className="w-3.5 h-3.5 text-purple-400" />
              Quick Clone Archetypes (1-Click Presets)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
              {CLONE_ARCHETYPES.map((arch) => (
                <button
                  key={arch.title}
                  type="button"
                  onClick={() => handleApplyArchetype(arch)}
                  className="p-2.5 rounded-xl border border-slate-800 bg-slate-950/60 hover:border-purple-500/50 hover:bg-purple-950/20 text-left transition-all group"
                >
                  <p className="font-semibold text-xs text-white group-hover:text-purple-300 truncate">
                    {arch.title}
                  </p>
                  <p className="text-[10px] text-slate-400 truncate mt-0.5">
                    Base: {arch.baseVoice} • {arch.accent}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Core Clone Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Clone Configuration Name <span className="text-purple-400">*</span>
              </label>
              <input
                type="text"
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
                placeholder="e.g. My Custom Narrator Clone"
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 text-xs font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Base Acoustic Voice (Gemini 3.8 Live) <span className="text-purple-400">*</span>
              </label>
              <select
                value={baseVoiceId}
                onChange={(e) => setBaseVoiceId(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-purple-500 text-xs font-medium"
              >
                {GEMINI_VOICES.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name} ({v.gender} • {v.tone})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Persona Engineering Attributes */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-850 pb-2">
              <Cpu className="w-4 h-4 text-purple-400" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-white">
                Vocal Persona & Timbre Conditioning
              </h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">
                  Persona Title & Archetype
                </label>
                <input
                  type="text"
                  value={personaTitle}
                  onChange={(e) => setPersonaTitle(e.target.value)}
                  placeholder="e.g. Corporate Executive, Detective, Mystic Guide"
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">
                  Accent & Dialect Inflection
                </label>
                <input
                  type="text"
                  value={accentDialect}
                  onChange={(e) => setAccentDialect(e.target.value)}
                  placeholder="e.g. British RP, Scottish Brogue, New York Urban"
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">
                  Timbre & Vocal Texture
                </label>
                <input
                  type="text"
                  value={timbreCharacter}
                  onChange={(e) => setTimbreCharacter(e.target.value)}
                  placeholder="e.g. Deep chest resonance, smoky rasp, breathy warmth"
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">
                  Delivery Mannerism & Pacing
                </label>
                <input
                  type="text"
                  value={deliveryMannerism}
                  onChange={(e) => setDeliveryMannerism(e.target.value)}
                  placeholder="e.g. Thoughtful pauses, rapid articulation, calm whispers"
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-400 mb-1">
                Acoustic Studio Environment Simulation
              </label>
              <input
                type="text"
                value={acousticEnvironment}
                onChange={(e) => setAcousticEnvironment(e.target.value)}
                placeholder="e.g. Anechoic broadcast isolation chamber, large cathedral hall"
                className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-400 mb-1">
                Direct Gemini 3.8 Style Conditioning Prompt
              </label>
              <textarea
                rows={2}
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                placeholder="Specific instructions given to the voice generation model..."
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-purple-500 font-mono"
              />
            </div>
          </div>

          {/* Real-time DSP Acoustics (Pitch, Speed, EQ) */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-850 pb-2">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-purple-400" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-white">
                  Signature DSP Tuning (Pitch, Tempo & EQ)
                </h4>
              </div>
              <span className="text-[11px] text-slate-400 font-mono">
                {cloneSemitones > 0 ? `+${cloneSemitones}` : cloneSemitones} st | {cloneSpeed.toFixed(2)}x
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div className="flex justify-between text-xs text-slate-300 mb-1 font-medium">
                  <span>Pitch Shift</span>
                  <span className="text-purple-400 font-mono">
                    {cloneSemitones > 0 ? `+${cloneSemitones}` : cloneSemitones} semitones
                  </span>
                </div>
                <input
                  type="range"
                  min={-12}
                  max={12}
                  step={1}
                  value={cloneSemitones}
                  onChange={(e) => setCloneSemitones(Number(e.target.value))}
                  className="w-full accent-purple-500"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs text-slate-300 mb-1 font-medium">
                  <span>Pacing / Speed</span>
                  <span className="text-purple-400 font-mono">{cloneSpeed.toFixed(2)}x</span>
                </div>
                <input
                  type="range"
                  min={0.6}
                  max={2.0}
                  step={0.05}
                  value={cloneSpeed}
                  onChange={(e) => setCloneSpeed(Number(e.target.value))}
                  className="w-full accent-purple-500"
                />
              </div>
            </div>

            {/* EQ Tonal Balance */}
            <div className="grid grid-cols-3 gap-3 pt-2">
              <div>
                <label className="block text-[10px] text-slate-400 uppercase font-semibold mb-1">
                  Bass (Chest) {cloneBass > 0 ? `+${cloneBass}` : cloneBass}dB
                </label>
                <input
                  type="range"
                  min={-10}
                  max={10}
                  step={0.5}
                  value={cloneBass}
                  onChange={(e) => setCloneBass(Number(e.target.value))}
                  className="w-full accent-purple-500"
                />
              </div>
              <div>
                <label className="block text-[10px] text-slate-400 uppercase font-semibold mb-1">
                  Mids (Presence) {cloneMid > 0 ? `+${cloneMid}` : cloneMid}dB
                </label>
                <input
                  type="range"
                  min={-10}
                  max={10}
                  step={0.5}
                  value={cloneMid}
                  onChange={(e) => setCloneMid(Number(e.target.value))}
                  className="w-full accent-purple-500"
                />
              </div>
              <div>
                <label className="block text-[10px] text-slate-400 uppercase font-semibold mb-1">
                  Treble (Air) {cloneTreble > 0 ? `+${cloneTreble}` : cloneTreble}dB
                </label>
                <input
                  type="range"
                  min={-10}
                  max={10}
                  step={0.5}
                  value={cloneTreble}
                  onChange={(e) => setCloneTreble(Number(e.target.value))}
                  className="w-full accent-purple-500"
                />
              </div>
            </div>
          </div>

          {/* Test Sentence */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Audition Sentence
            </label>
            <input
              type="text"
              value={sampleSentence}
              onChange={(e) => setSampleSentence(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-purple-500"
            />
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800 bg-slate-950/80">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white transition-colors"
          >
            Cancel
          </button>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleAudition}
              disabled={isAuditioning}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-purple-300 bg-purple-950/50 hover:bg-purple-900/60 border border-purple-700/50 transition-all disabled:opacity-50"
            >
              <Volume2 className={`w-4 h-4 ${isAuditioning ? "animate-spin" : ""}`} />
              {isAuditioning ? "Auditioning Clone..." : "Audition Clone Audio"}
            </button>

            <button
              type="button"
              onClick={handleSave}
              className="flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-lg shadow-purple-900/30 transition-all"
            >
              <Check className="w-4 h-4" />
              Save Cloned Voice Profile
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
