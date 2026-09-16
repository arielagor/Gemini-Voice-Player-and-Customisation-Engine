import { useState } from "react";
import { Voice, AudioEffectSettings } from "../types";
import { GEMINI_VOICES } from "../data/voices";
import { X, Play, Pause, Layers, Sparkles, Volume2 } from "lucide-react";

interface VoiceComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  textToCompare: string;
  settings: AudioEffectSettings;
  onPlayVoiceSample: (voice: Voice, text: string) => Promise<void>;
  currentlyPlayingVoiceId: string | null;
  isPlaying: boolean;
  loadingVoiceId: string | null;
}

export function VoiceComparisonModal({
  isOpen,
  onClose,
  textToCompare,
  settings,
  onPlayVoiceSample,
  currentlyPlayingVoiceId,
  isPlaying,
  loadingVoiceId,
}: VoiceComparisonModalProps) {
  const [testText, setTestText] = useState(
    textToCompare ||
      "The Gemini 3.8 Live audio experience brings natural voice interaction to life."
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                Voice Timbre Comparison Lab
              </h2>
              <p className="text-xs text-slate-400">
                A/B test the same phrase across all 8 Gemini 3.8 voices under your active pitch & speed
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Phrase Input */}
        <div className="px-5 py-3 bg-slate-950/60 border-b border-slate-800 flex items-center gap-2">
          <input
            type="text"
            value={testText}
            onChange={(e) => setTestText(e.target.value)}
            placeholder="Enter a comparison sentence..."
            className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />
          <span className="text-[11px] font-mono text-slate-400 whitespace-nowrap">
            {settings.speed.toFixed(2)}x @ {settings.pitchSemitones >= 0 ? `+${settings.pitchSemitones}` : settings.pitchSemitones}st
          </span>
        </div>

        {/* Voices List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-2.5 scrollbar-thin scrollbar-thumb-slate-800">
          {GEMINI_VOICES.map((voice) => {
            const isThisVoicePlaying = currentlyPlayingVoiceId === voice.id && isPlaying;
            const isLoadingThis = loadingVoiceId === voice.id;

            return (
              <div
                key={voice.id}
                className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/90 hover:border-slate-700 flex items-center justify-between gap-3 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm"
                    style={{
                      backgroundColor: `${voice.color}25`,
                      color: voice.color,
                      border: `1px solid ${voice.color}50`,
                    }}
                  >
                    {voice.name[0]}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-white">
                        {voice.name}
                      </span>
                      <span
                        className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                        style={{
                          backgroundColor: `${voice.color}15`,
                          color: voice.color,
                        }}
                      >
                        {voice.gender} • {voice.tone}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 line-clamp-1 max-w-sm">
                      {voice.character}
                    </p>
                  </div>
                </div>

                {/* Audition button */}
                <button
                  onClick={() => onPlayVoiceSample(voice, testText)}
                  disabled={isLoadingThis}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    isThisVoicePlaying
                      ? "bg-amber-400 text-slate-950 shadow-md shadow-amber-500/20"
                      : "bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700"
                  }`}
                >
                  {isLoadingThis ? (
                    <div className="w-3.5 h-3.5 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
                  ) : isThisVoicePlaying ? (
                    <Pause className="w-3.5 h-3.5 fill-slate-950" />
                  ) : (
                    <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                  )}
                  <span>{isThisVoicePlaying ? "Playing" : "Listen"}</span>
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
