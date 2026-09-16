import { useState } from "react";
import { Voice } from "../types";
import { GEMINI_VOICES } from "../data/voices";
import { Mic, Check, Volume2, Sparkles, User, Zap } from "lucide-react";

interface VoiceSelectorProps {
  selectedVoice: Voice;
  onSelectVoice: (voice: Voice) => void;
  onQuickAudition: (voice: Voice) => void;
  auditioningVoiceId: string | null;
}

export function VoiceSelector({
  selectedVoice,
  onSelectVoice,
  onQuickAudition,
  auditioningVoiceId,
}: VoiceSelectorProps) {
  const [filter, setFilter] = useState<"all" | "male" | "female">("all");

  const filteredVoices = GEMINI_VOICES.filter((voice) => {
    if (filter === "male") return voice.gender === "Male";
    if (filter === "female") return voice.gender === "Female";
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Filter and title */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
            <span>Gemini 3.8 Voices</span>
            <span className="text-xs font-normal text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full">
              8 Available
            </span>
          </h2>
          <p className="text-xs text-slate-400">
            Select a voice to explore its distinctive timbre, tone, and character
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
          <button
            onClick={() => setFilter("all")}
            className={`px-3 py-1 rounded-lg font-medium transition-all ${
              filter === "all"
                ? "bg-slate-800 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            All (8)
          </button>
          <button
            onClick={() => setFilter("male")}
            className={`px-3 py-1 rounded-lg font-medium transition-all ${
              filter === "male"
                ? "bg-slate-800 text-cyan-300 shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Male (4)
          </button>
          <button
            onClick={() => setFilter("female")}
            className={`px-3 py-1 rounded-lg font-medium transition-all ${
              filter === "female"
                ? "bg-slate-800 text-pink-300 shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Female (4)
          </button>
        </div>
      </div>

      {/* Grid of 8 Voices */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {filteredVoices.map((voice) => {
          const isSelected = selectedVoice.id === voice.id;
          const isAuditioning = auditioningVoiceId === voice.id;

          return (
            <div
              key={voice.id}
              id={`card-voice-${voice.id}`}
              onClick={() => onSelectVoice(voice)}
              className={`group relative p-3.5 rounded-xl transition-all duration-200 cursor-pointer text-left border flex flex-col justify-between ${
                isSelected
                  ? "bg-slate-900 border-opacity-100 shadow-lg shadow-black/40 scale-[1.01]"
                  : "bg-slate-900/60 hover:bg-slate-900/90 border-slate-800/80 hover:border-slate-700"
              }`}
              style={{
                borderColor: isSelected ? voice.color : undefined,
              }}
            >
              {/* Top row: Avatar + Name + Badges */}
              <div>
                <div className="flex items-start justify-between gap-2 mb-2.5">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm shadow-sm transition-transform group-hover:scale-105"
                      style={{
                        backgroundColor: `${voice.color}25`,
                        color: voice.color,
                        border: `1.5px solid ${voice.color}50`,
                      }}
                    >
                      {voice.name[0]}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-sm text-white">{voice.name}</span>
                        {isSelected && (
                          <span
                            className="w-4 h-4 rounded-full flex items-center justify-center text-[10px] text-slate-950 font-bold"
                            style={{ backgroundColor: voice.color }}
                          >
                            <Check className="w-2.5 h-2.5 stroke-[3]" />
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-slate-400 font-medium block">
                        {voice.tone}
                      </span>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                      voice.gender === "Female"
                        ? "bg-pink-500/10 text-pink-300 border-pink-500/20"
                        : "bg-cyan-500/10 text-cyan-300 border-cyan-500/20"
                    }`}
                  >
                    {voice.gender}
                  </span>
                </div>

                {/* Character description */}
                <p className="text-xs text-slate-300/90 leading-relaxed mb-3 line-clamp-2">
                  {voice.character}
                </p>
              </div>

              {/* Bottom row: Best For tag + Audition Button */}
              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2">
                <span className="text-[10px] text-slate-400 truncate max-w-[120px]">
                  {voice.bestFor.split(",")[0]}
                </span>

                <button
                  id={`btn-audition-${voice.id}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onQuickAudition(voice);
                  }}
                  disabled={isAuditioning}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                    isAuditioning
                      ? "bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse"
                      : isSelected
                      ? "bg-slate-800 text-white hover:bg-slate-750 border border-slate-700"
                      : "bg-slate-850 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-800"
                  }`}
                  title={`Quick audition with ${voice.name}`}
                >
                  <Volume2 className="w-3 h-3" />
                  <span>{isAuditioning ? "Speaking..." : "Audition"}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
