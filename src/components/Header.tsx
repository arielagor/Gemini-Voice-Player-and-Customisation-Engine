import { Sparkles, Radio, RefreshCw, Layers, History, Volume2 } from "lucide-react";
import { Voice } from "../types";

interface HeaderProps {
  currentVoice: Voice;
  onResetSettings: () => void;
  onOpenCompare: () => void;
  onOpenHistory: () => void;
  historyCount: number;
  onOpenConfigs: () => void;
  onOpenSaveConfig: () => void;
  onOpenCloneStudio: () => void;
  activeConfigName?: string;
  isCloneActive?: boolean;
}

export function Header({
  currentVoice,
  onResetSettings,
  onOpenCompare,
  onOpenHistory,
  historyCount,
  onOpenConfigs,
  onOpenSaveConfig,
  onOpenCloneStudio,
  activeConfigName,
  isCloneActive,
}: HeaderProps) {
  return (
    <header className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md sticky top-0 z-30 px-4 sm:px-6 py-3.5">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Left branding */}
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg transition-colors duration-300"
            style={{
              backgroundColor: `${currentVoice.color}20`,
              border: `1.5px solid ${currentVoice.color}60`,
            }}
          >
            <Volume2 className="w-5 h-5 transition-colors duration-300" style={{ color: currentVoice.color }} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white flex items-center gap-2">
                Gemini Voice Player
              </h1>
              <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <Radio className="w-3 h-3 animate-pulse" /> Live 3.8 Audio API
              </span>
              {activeConfigName && (
                <span className={`hidden md:inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${
                  isCloneActive
                    ? "bg-purple-500/15 text-purple-300 border-purple-500/30"
                    : "bg-amber-500/15 text-amber-300 border-amber-500/30"
                }`}>
                  <Sparkles className="w-3 h-3" />
                  Preset: {activeConfigName}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              Experience all 8 native Gemini voices with studio pitch, speed & vocal acoustic controls
            </p>
          </div>
        </div>

        {/* Right utility buttons */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Custom Voice Library (Save & Load) */}
          <button
            id="btn-open-configs"
            onClick={onOpenConfigs}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 transition-all shadow-sm"
            title="Saved Voice Configurations & Presets"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Voice Library</span>
          </button>

          {/* Quick Clone Studio */}
          <button
            id="btn-open-clone"
            onClick={onOpenCloneStudio}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30 transition-all shadow-sm"
            title="Design a custom voice clone & persona"
          >
            <Radio className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
            <span>Voice Clone Studio</span>
          </button>

          {/* Comparison tool */}
          <button
            id="btn-open-compare"
            onClick={onOpenCompare}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-750 hover:border-slate-600 transition-all shadow-sm"
            title="Compare voices side-by-side"
          >
            <Layers className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden xs:inline">A/B Compare</span>
          </button>

          {/* History drawer */}
          <button
            id="btn-open-history"
            onClick={onOpenHistory}
            className="relative flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-750 hover:border-slate-600 transition-all shadow-sm"
            title="Generated takes history"
          >
            <History className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden xs:inline">Takes</span>
            {historyCount > 0 && (
              <span className="ml-0.5 px-1.5 py-0.2 text-[10px] font-bold rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                {historyCount}
              </span>
            )}
          </button>

          {/* Reset FX */}
          <button
            id="btn-reset-settings"
            onClick={onResetSettings}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent hover:border-slate-800 transition-all"
            title="Reset Pitch & Speed controls to default"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Reset FX</span>
          </button>
        </div>
      </div>
    </header>
  );
}

