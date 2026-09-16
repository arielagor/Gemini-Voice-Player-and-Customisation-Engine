import { GeneratedAudioItem, Voice } from "../types";
import { X, Play, Download, Trash2, Clock, Volume2 } from "lucide-react";

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  history: GeneratedAudioItem[];
  onSelectTake: (item: GeneratedAudioItem) => void;
  onClearHistory: () => void;
  onExportItem: (item: GeneratedAudioItem) => void;
  currentTakeId: string | null;
}

export function HistoryDrawer({
  isOpen,
  onClose,
  history,
  onSelectTake,
  onClearHistory,
  onExportItem,
  currentTakeId,
}: HistoryDrawerProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border-l border-slate-800 w-full max-w-md h-full flex flex-col shadow-2xl">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-cyan-400" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              Session Takes ({history.length})
            </h2>
          </div>

          <div className="flex items-center gap-1.5">
            {history.length > 0 && (
              <button
                onClick={onClearHistory}
                className="text-xs text-slate-400 hover:text-red-400 px-2 py-1 rounded transition-colors"
                title="Clear all generated takes"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5 scrollbar-thin scrollbar-thumb-slate-800">
          {history.length === 0 ? (
            <div className="text-center py-16 text-slate-500 space-y-2">
              <Volume2 className="w-8 h-8 mx-auto stroke-[1.5] text-slate-600" />
              <p className="text-xs">No takes generated yet.</p>
              <p className="text-[11px] text-slate-600">
                Click any voice or hit "Experience" to generate audio!
              </p>
            </div>
          ) : (
            history.map((take) => {
              const isCurrent = currentTakeId === take.id;
              return (
                <div
                  key={take.id}
                  onClick={() => onSelectTake(take)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer text-left space-y-2 ${
                    isCurrent
                      ? "bg-slate-850 border-cyan-500/50 shadow-md shadow-cyan-500/10"
                      : "bg-slate-950/70 hover:bg-slate-850/80 border-slate-800/80 hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-white">
                        {take.voiceName}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">
                        {take.duration.toFixed(1)}s
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onExportItem(take);
                        }}
                        className="p-1 text-slate-400 hover:text-cyan-300 rounded transition-colors"
                        title="Download WAV"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectTake(take);
                        }}
                        className="p-1 text-slate-400 hover:text-white rounded transition-colors"
                        title="Load and play"
                      >
                        <Play className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 line-clamp-2">
                    {take.text}
                  </p>

                  <div className="text-[10px] font-mono text-slate-500 flex justify-between">
                    <span>{new Date(take.createdAt).toLocaleTimeString()}</span>
                    <span>{take.method}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
