import { AudioEffectSettings, Voice } from "../types";
import { PITCH_PRESETS, SPEED_PRESETS } from "../data/voices";
import {
  Gauge,
  Music2,
  SlidersHorizontal,
  RotateCcw,
  Sparkles,
  Info,
  Bookmark,
  Radio,
  Share2,
} from "lucide-react";

interface AudioControlsPanelProps {
  settings: AudioEffectSettings;
  onChange: (updated: Partial<AudioEffectSettings>) => void;
  onReset: () => void;
  currentVoice: Voice;
  onSaveConfig?: () => void;
  onOpenLibrary?: () => void;
  onOpenCloneStudio?: () => void;
  activeConfigName?: string;
  isCloneActive?: boolean;
}

// Convert semitone offset into a friendly musical / vocal description
function getPitchDescription(semitones: number, cents: number): string {
  const total = semitones + cents / 100;
  if (total === 0) return "Natural Gemini Voice (0 st)";
  if (total <= -11) return "Full Octave Sub-Bass (-12 st)";
  if (total <= -7) return "Deep Dramatic Resonance (-8 st)";
  if (total <= -3) return "Warm Baritone Depth (-4 st)";
  if (total < 0) return `Subtle Lowering (${total > 0 ? "+" : ""}${total.toFixed(1)} st)`;
  if (total >= 11) return "Full Octave Soprano (+12 st)";
  if (total >= 7) return "Playful High Animation (+8 st)";
  if (total >= 3) return "Bright Lifted Clarity (+3 st)";
  return `Subtle Brightening (+${total.toFixed(1)} st)`;
}

export function AudioControlsPanel({
  settings,
  onChange,
  onReset,
  currentVoice,
  onSaveConfig,
  onOpenLibrary,
  onOpenCloneStudio,
  activeConfigName,
  isCloneActive,
}: AudioControlsPanelProps) {
  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between border-b border-slate-800 pb-3 gap-2">
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{
              backgroundColor: `${currentVoice.color}20`,
              color: currentVoice.color,
            }}
          >
            <SlidersHorizontal className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-white tracking-wide uppercase">
                Personalized Audio Controls
              </h2>
              {activeConfigName && (
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                  isCloneActive
                    ? "bg-purple-500/15 text-purple-300 border-purple-500/30"
                    : "bg-amber-500/15 text-amber-300 border-amber-500/30"
                }`}>
                  {activeConfigName}
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-400">
              Fine-tune vocal pitch, tempo, and acoustic frequency response
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {onSaveConfig && (
            <button
              onClick={onSaveConfig}
              className="flex items-center gap-1 text-xs text-amber-300 hover:text-amber-200 px-2.5 py-1 rounded-md bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 transition-colors shadow-sm"
              title="Save current pitch, speed and EQ configuration"
            >
              <Bookmark className="w-3 h-3 text-amber-400" />
              <span>Save Preset</span>
            </button>
          )}

          {onOpenLibrary && (
            <button
              onClick={onOpenLibrary}
              className="flex items-center gap-1 text-xs text-slate-300 hover:text-white px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-750 border border-slate-700/60 transition-colors"
              title="Open Voice Preset Library"
            >
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span className="hidden sm:inline">Library</span>
            </button>
          )}

          <button
            onClick={onReset}
            className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-200 px-2 py-1 rounded-md bg-slate-800/80 hover:bg-slate-750 transition-colors"
            title="Reset all pitch and speed to defaults"
          >
            <RotateCcw className="w-3 h-3" />
            <span className="hidden xs:inline">Reset</span>
          </button>
        </div>
      </div>


      {/* 1. PITCH CONTROL */}
      <div className="space-y-3.5">
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 text-xs font-semibold text-slate-200 uppercase tracking-wider">
            <Music2 className="w-3.5 h-3.5 text-amber-400" />
            <span>Vocal Pitch Shifting</span>
          </label>
          <div className="flex items-center gap-2 font-mono text-xs">
            <span
              className="px-2 py-0.5 rounded font-bold"
              style={{
                backgroundColor: `${currentVoice.color}25`,
                color: currentVoice.color,
              }}
            >
              {settings.pitchSemitones >= 0
                ? `+${settings.pitchSemitones}`
                : settings.pitchSemitones}{" "}
              semitones
            </span>
            {settings.pitchCents !== 0 && (
              <span className="text-slate-400 text-[11px]">
                ({settings.pitchCents > 0 ? "+" : ""}
                {settings.pitchCents} cents)
              </span>
            )}
          </div>
        </div>

        {/* Pitch Semitones Slider */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-[11px] text-slate-400 font-mono">
            <span>-12 st (Octave Down)</span>
            <span className="text-slate-300 font-medium">
              {getPitchDescription(settings.pitchSemitones, settings.pitchCents)}
            </span>
            <span>+12 st (Octave Up)</span>
          </div>
          <input
            id="slider-pitch-semitones"
            type="range"
            min="-12"
            max="12"
            step="1"
            value={settings.pitchSemitones}
            onChange={(e) => onChange({ pitchSemitones: parseInt(e.target.value, 10) })}
            className="w-full h-2 rounded-lg bg-slate-800 appearance-none cursor-pointer accent-amber-500 transition-all focus:outline-none focus:ring-1 focus:ring-amber-400"
          />
        </div>

        {/* Pitch Presets */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          {PITCH_PRESETS.map((preset) => {
            const isSelected =
              settings.pitchSemitones === preset.semitones &&
              settings.pitchCents === preset.cents;
            return (
              <button
                key={preset.label}
                id={`btn-pitch-preset-${preset.semitones}`}
                onClick={() =>
                  onChange({
                    pitchSemitones: preset.semitones,
                    pitchCents: preset.cents,
                  })
                }
                className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-all ${
                  isSelected
                    ? "bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20"
                    : "bg-slate-800/90 text-slate-300 hover:bg-slate-750 hover:text-white border border-slate-750"
                }`}
                title={preset.description}
              >
                {preset.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. SPEED CONTROL */}
      <div className="space-y-3.5 border-t border-slate-800 pt-4">
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 text-xs font-semibold text-slate-200 uppercase tracking-wider">
            <Gauge className="w-3.5 h-3.5 text-cyan-400" />
            <span>Playback Speed</span>
          </label>
          <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-cyan-500/15 text-cyan-300 border border-cyan-500/20">
            {settings.speed.toFixed(2)}x
          </span>
        </div>

        {/* Speed Slider */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-[11px] text-slate-400 font-mono">
            <span>0.50x (Slow)</span>
            <span className="text-slate-300">
              {settings.speed === 1.0 ? "Standard 1.0x" : `${settings.speed.toFixed(2)}x Tempo`}
            </span>
            <span>2.50x (Fast)</span>
          </div>
          <input
            id="slider-speed"
            type="range"
            min="0.5"
            max="2.5"
            step="0.05"
            value={settings.speed}
            onChange={(e) => onChange({ speed: parseFloat(e.target.value) })}
            className="w-full h-2 rounded-lg bg-slate-800 appearance-none cursor-pointer accent-cyan-400 transition-all focus:outline-none focus:ring-1 focus:ring-cyan-400"
          />
        </div>

        {/* Quick Speed Chips */}
        <div className="flex flex-wrap items-center gap-1.5">
          {SPEED_PRESETS.map((spd) => {
            const isSelected = Math.abs(settings.speed - spd) < 0.02;
            return (
              <button
                key={spd}
                id={`btn-speed-preset-${spd}`}
                onClick={() => onChange({ speed: spd })}
                className={`px-2.5 py-1 text-xs rounded-lg font-mono font-medium transition-all ${
                  isSelected
                    ? "bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20"
                    : "bg-slate-800/90 text-slate-300 hover:bg-slate-750 hover:text-white border border-slate-750"
                }`}
              >
                {spd.toFixed(2)}x
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. VOCAL TONE EQUALIZER */}
      <div className="space-y-3.5 border-t border-slate-800 pt-4">
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 text-xs font-semibold text-slate-200 uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>Vocal Acoustic EQ</span>
          </label>
          <span className="text-[11px] text-slate-400">3-Band Voice Shaper</span>
        </div>

        <div className="grid grid-cols-3 gap-2.5">
          {/* Low / Warmth */}
          <div className="bg-slate-950/70 p-2.5 rounded-xl border border-slate-800/80 space-y-1.5 text-center">
            <div className="flex justify-between text-[11px]">
              <span className="text-slate-400">Warmth</span>
              <span className="font-mono text-emerald-400 font-semibold">
                {settings.eq.bass > 0 ? `+${settings.eq.bass}` : settings.eq.bass}dB
              </span>
            </div>
            <input
              id="slider-eq-bass"
              type="range"
              min="-10"
              max="10"
              step="1"
              value={settings.eq.bass}
              onChange={(e) =>
                onChange({
                  eq: { ...settings.eq, bass: parseInt(e.target.value, 10) },
                })
              }
              className="w-full h-1.5 rounded bg-slate-800 accent-emerald-400 appearance-none cursor-pointer"
            />
            <span className="text-[10px] text-slate-400 block">Low Shelf</span>
          </div>

          {/* Mid / Clarity */}
          <div className="bg-slate-950/70 p-2.5 rounded-xl border border-slate-800/80 space-y-1.5 text-center">
            <div className="flex justify-between text-[11px]">
              <span className="text-slate-400">Clarity</span>
              <span className="font-mono text-emerald-400 font-semibold">
                {settings.eq.mid > 0 ? `+${settings.eq.mid}` : settings.eq.mid}dB
              </span>
            </div>
            <input
              id="slider-eq-mid"
              type="range"
              min="-10"
              max="10"
              step="1"
              value={settings.eq.mid}
              onChange={(e) =>
                onChange({
                  eq: { ...settings.eq, mid: parseInt(e.target.value, 10) },
                })
              }
              className="w-full h-1.5 rounded bg-slate-800 accent-emerald-400 appearance-none cursor-pointer"
            />
            <span className="text-[10px] text-slate-400 block">Mid Peak (2.8k)</span>
          </div>

          {/* High / Air */}
          <div className="bg-slate-950/70 p-2.5 rounded-xl border border-slate-800/80 space-y-1.5 text-center">
            <div className="flex justify-between text-[11px]">
              <span className="text-slate-400">Air</span>
              <span className="font-mono text-emerald-400 font-semibold">
                {settings.eq.treble > 0 ? `+${settings.eq.treble}` : settings.eq.treble}dB
              </span>
            </div>
            <input
              id="slider-eq-treble"
              type="range"
              min="-10"
              max="10"
              step="1"
              value={settings.eq.treble}
              onChange={(e) =>
                onChange({
                  eq: { ...settings.eq, treble: parseInt(e.target.value, 10) },
                })
              }
              className="w-full h-1.5 rounded bg-slate-800 accent-emerald-400 appearance-none cursor-pointer"
            />
            <span className="text-[10px] text-slate-400 block">High Shelf</span>
          </div>
        </div>
      </div>
    </div>
  );
}
