import { useState } from "react";
import { Voice, ScriptPreset } from "../types";
import { SCRIPT_PRESETS } from "../data/voices";
import {
  Sparkles,
  Send,
  BookOpen,
  Shuffle,
  Smile,
  Flame,
  VolumeX,
  Volume2,
} from "lucide-react";

interface PromptStudioProps {
  currentVoice: Voice;
  text: string;
  setText: (t: string) => void;
  onGenerate: (voiceId: string, textToSpeak: string, style?: string) => Promise<void>;
  isGenerating: boolean;
}

const STYLE_INSPIRATIONS = [
  { label: "Natural", instruction: "" },
  { label: "Storyteller", instruction: "Speak with evocative dramatic cadence and narrative immersion." },
  { label: "Whisper/Calm", instruction: "Speak in a soft, gentle, calming tone with warm breathiness." },
  { label: "Energetic", instruction: "Deliver with high enthusiasm, punchy rhythm, and bright smiles." },
  { label: "Authoritative", instruction: "Speak with measured poise, deep resonance, and executive clarity." },
];

export function PromptStudio({
  currentVoice,
  text,
  setText,
  onGenerate,
  isGenerating,
}: PromptStudioProps) {
  const [selectedStyle, setSelectedStyle] = useState<string>("");
  const [activeCategory, setActiveCategory] = useState<string>("all");

  const handleSelectScript = (preset: ScriptPreset) => {
    setText(preset.text);
  };

  const handleRandomize = () => {
    const random = SCRIPT_PRESETS[Math.floor(Math.random() * SCRIPT_PRESETS.length)];
    setText(random.text);
  };

  const categories = [
    { id: "all", label: "All Scripts" },
    { id: "introduction", label: "Showcase" },
    { id: "story", label: "Story" },
    { id: "meditation", label: "Mindfulness" },
    { id: "tech", label: "Tech" },
    { id: "dramatic", label: "Action" },
  ];

  const filteredPresets =
    activeCategory === "all"
      ? SCRIPT_PRESETS
      : SCRIPT_PRESETS.filter((p) => p.category === activeCategory);

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
      {/* Header and Inspiration */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-amber-400" />
          <h2 className="text-sm font-bold text-white tracking-wide uppercase">
            Prompt & Script Studio
          </h2>
        </div>

        <button
          id="btn-inspire-me"
          onClick={handleRandomize}
          className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-750 px-2.5 py-1 rounded-lg border border-slate-700/80 transition-all"
          title="Pick a random script prompt"
        >
          <Shuffle className="w-3.5 h-3.5 text-amber-400" />
          <span>Inspire Me</span>
        </button>
      </div>

      {/* Script Category Chips */}
      <div className="flex flex-wrap items-center gap-1.5 text-xs">
        {categories.map((c) => (
          <button
            key={c.id}
            onClick={() => setActiveCategory(c.id)}
            className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
              activeCategory === c.id
                ? "bg-slate-800 text-amber-400 border border-amber-500/30"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-850"
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Preset Snippets */}
      <div className="flex gap-2 overflow-x-auto pb-1.5 scrollbar-thin scrollbar-thumb-slate-800">
        {filteredPresets.map((preset) => (
          <button
            key={preset.id}
            onClick={() => handleSelectScript(preset)}
            className="flex-shrink-0 text-left px-3 py-1.5 rounded-xl bg-slate-950/80 hover:bg-slate-800/80 border border-slate-800/90 hover:border-slate-700 transition-all max-w-[200px]"
          >
            <span className="font-semibold text-xs text-slate-200 block truncate">
              {preset.title}
            </span>
            <span className="text-[11px] text-slate-400 line-clamp-1">
              {preset.text}
            </span>
          </button>
        ))}
      </div>

      {/* Textarea Input */}
      <div className="relative">
        <textarea
          id="textarea-prompt"
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={3}
          placeholder="Type or paste any phrase here to experience it spoken by Gemini 3.8 Live..."
          className="w-full rounded-xl bg-slate-950 border border-slate-800 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 p-3.5 text-sm text-slate-100 placeholder-slate-500 resize-none transition-all outline-none"
        />
        <div className="absolute bottom-2.5 right-3 text-[11px] font-mono text-slate-400">
          {text.length} characters
        </div>
      </div>

      {/* Delivery Style Presets */}
      <div className="space-y-1.5">
        <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold block">
          Delivery Persona / Style (Optional)
        </span>
        <div className="flex flex-wrap gap-1.5">
          {STYLE_INSPIRATIONS.map((style) => {
            const isSelected = selectedStyle === style.instruction;
            return (
              <button
                key={style.label}
                onClick={() => setSelectedStyle(style.instruction)}
                className={`px-2.5 py-1 text-xs rounded-lg transition-all ${
                  isSelected
                    ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 font-semibold"
                    : "bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800"
                }`}
              >
                {style.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Primary Action Button */}
      <div className="pt-2">
        <button
          id="btn-generate-audio"
          onClick={() => onGenerate(currentVoice.id, text, selectedStyle)}
          disabled={isGenerating || text.trim().length === 0}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold text-slate-950 shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer hover:brightness-110 active:scale-[0.99]"
          style={{
            backgroundColor: currentVoice.color,
            boxShadow: `0 8px 24px ${currentVoice.color}35`,
          }}
        >
          {isGenerating ? (
            <>
              <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
              <span>Rendering via Gemini 3.8 Live API...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 fill-slate-950" />
              <span>Experience with {currentVoice.name}</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
