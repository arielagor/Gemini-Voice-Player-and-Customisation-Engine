import React, { useState } from "react";
import { CustomVoiceProfile, AudioEffectSettings, Voice } from "../types";
import {
  Bookmark,
  Share2,
  Download,
  Upload,
  Copy,
  Check,
  Trash2,
  Sparkles,
  Play,
  RotateCcw,
  Sliders,
  ExternalLink,
  ChevronRight,
  Plus,
  Cpu,
} from "lucide-react";
import {
  exportConfigToShareableString,
  downloadConfigAsJsonFile,
  parseShareableConfigString,
  resetVoiceConfigsToDefault,
} from "../utils/configStorage";

interface VoiceConfigsManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  savedConfigs: CustomVoiceProfile[];
  currentProfileId?: string;
  onSelectConfig: (config: CustomVoiceProfile) => void;
  onDeleteConfig: (id: string) => void;
  onImportConfigs: (imported: CustomVoiceProfile[]) => void;
  onOpenCreateClone: () => void;
  onOpenSaveCurrent: () => void;
}

export function VoiceConfigsManagerModal({
  isOpen,
  onClose,
  savedConfigs,
  currentProfileId,
  onSelectConfig,
  onDeleteConfig,
  onImportConfigs,
  onOpenCreateClone,
  onOpenSaveCurrent,
}: VoiceConfigsManagerModalProps) {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<"library" | "import" | "export">("library");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [importString, setImportString] = useState<string>("");
  const [importStatus, setImportStatus] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedForExport, setSelectedForExport] = useState<CustomVoiceProfile | null>(
    savedConfigs[0] || null
  );

  const handleCopyShareable = (profile: CustomVoiceProfile) => {
    const str = exportConfigToShareableString(profile);
    navigator.clipboard.writeText(str);
    setCopiedId(profile.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleCopyAllShareable = () => {
    const str = exportConfigToShareableString(savedConfigs);
    navigator.clipboard.writeText(str);
    setCopiedId("ALL_CONFIGS");
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleImportSubmit = () => {
    setImportStatus(null);
    if (!importString.trim()) {
      setImportStatus({ type: "error", message: "Please paste a shareable string or JSON." });
      return;
    }

    const result = parseShareableConfigString(importString);
    if (result.success && result.data) {
      onImportConfigs(result.data);
      setImportStatus({
        type: "success",
        message: `Successfully imported ${result.data.length} voice configuration(s)!`,
      });
      setImportString("");
      setTimeout(() => {
        setActiveTab("library");
        setImportStatus(null);
      }, 1200);
    } else {
      setImportStatus({
        type: "error",
        message: result.error || "Failed to parse imported string.",
      });
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const result = parseShareableConfigString(content);
        if (result.success && result.data) {
          onImportConfigs(result.data);
          setImportStatus({
            type: "success",
            message: `Successfully loaded ${result.data.length} configuration(s) from file!`,
          });
          setTimeout(() => {
            setActiveTab("library");
            setImportStatus(null);
          }, 1200);
        } else {
          setImportStatus({
            type: "error",
            message: result.error || "File did not contain valid voice profile data.",
          });
        }
      }
    };
    reader.readAsText(file);
    // Reset file input
    e.target.value = "";
  };

  const filteredConfigs = savedConfigs.filter((c) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      (c.description && c.description.toLowerCase().includes(q)) ||
      c.baseVoiceName.toLowerCase().includes(q) ||
      (c.customClone?.personaTitle && c.customClone.personaTitle.toLowerCase().includes(q)) ||
      (c.tags && c.tags.some((t) => t.toLowerCase().includes(q)))
    );
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-750 rounded-2xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Bookmark className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  Voice Configuration Library
                </h3>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                  {savedConfigs.length} saved
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Save, recall, export, and clone custom vocal configurations with full pitch, speed & persona states.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onOpenSaveCurrent();
                onClose();
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-sm transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              Save Current
            </button>
            <button
              onClick={onClose}
              className="px-3 py-1.5 text-xs text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              Close
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center justify-between border-b border-slate-800 bg-slate-950/40 px-6 py-2.5">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab("library")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
                activeTab === "library"
                  ? "bg-slate-800 text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Bookmark className="w-3.5 h-3.5 text-amber-400" />
              Saved Presets ({savedConfigs.length})
            </button>

            <button
              onClick={() => setActiveTab("import")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
                activeTab === "import"
                  ? "bg-slate-800 text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Upload className="w-3.5 h-3.5 text-blue-400" />
              Import Configuration
            </button>

            <button
              onClick={() => setActiveTab("export")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
                activeTab === "export"
                  ? "bg-slate-800 text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Share2 className="w-3.5 h-3.5 text-purple-400" />
              Export & Share
            </button>
          </div>

          <button
            onClick={() => {
              onOpenCreateClone();
              onClose();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-950/60 hover:bg-purple-900/70 border border-purple-600/40 text-purple-300 text-xs font-semibold transition-all"
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
            Clone Voice Studio
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* TAB 1: LIBRARY */}
          {activeTab === "library" && (
            <div className="space-y-4">
              {/* Search Bar & Stats */}
              <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search saved profiles by name, tone, persona, or tags..."
                  className="w-full sm:w-80 px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />

                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <button
                    onClick={handleCopyAllShareable}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-800 text-slate-300 text-xs border border-slate-700/60 transition-colors"
                    title="Export entire library as shareable code"
                  >
                    {copiedId === "ALL_CONFIGS" ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Share2 className="w-3.5 h-3.5 text-purple-400" />
                    )}
                    <span>{copiedId === "ALL_CONFIGS" ? "Copied All!" : "Share All"}</span>
                  </button>

                  <button
                    onClick={() => downloadConfigAsJsonFile(savedConfigs)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-800 text-slate-300 text-xs border border-slate-700/60 transition-colors"
                    title="Download entire library as JSON backup"
                  >
                    <Download className="w-3.5 h-3.5 text-blue-400" />
                    <span>Download JSON</span>
                  </button>
                </div>
              </div>

              {/* Config Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {filteredConfigs.map((config) => {
                  const isActive = currentProfileId === config.id;
                  const isClone = Boolean(config.customClone?.enabled);

                  return (
                    <div
                      key={config.id}
                      className={`p-4 rounded-xl border transition-all text-left relative flex flex-col justify-between ${
                        isActive
                          ? "bg-slate-850/90 border-amber-500/50 shadow-md shadow-amber-500/5 ring-1 ring-amber-500/30"
                          : "bg-slate-950/60 border-slate-800/90 hover:border-slate-700"
                      }`}
                    >
                      <div>
                        {/* Title and Badges */}
                        <div className="flex items-start justify-between gap-2 mb-1.5">
                          <div>
                            <div className="flex items-center gap-1.5">
                              <h4 className="font-bold text-sm text-white group-hover:text-amber-400">
                                {config.name}
                              </h4>
                              {isActive && (
                                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                  ACTIVE
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">
                              {config.description || "Custom configured voice profile"}
                            </p>
                          </div>

                          <span
                            className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border whitespace-nowrap ${
                              isClone
                                ? "bg-purple-500/10 text-purple-300 border-purple-500/30"
                                : "bg-blue-500/10 text-blue-300 border-blue-500/30"
                            }`}
                          >
                            {isClone ? "Custom Clone" : `Base: ${config.baseVoiceName}`}
                          </span>
                        </div>

                        {/* Specs Pill Summary */}
                        <div className="flex flex-wrap gap-1.5 my-2.5">
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300">
                            Pitch: {config.settings.pitchSemitones > 0 ? `+${config.settings.pitchSemitones}` : config.settings.pitchSemitones} st
                          </span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300">
                            Speed: {config.settings.speed.toFixed(2)}x
                          </span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300">
                            EQ: {config.settings.eq.bass > 0 ? `+${config.settings.eq.bass}` : config.settings.eq.bass} / {config.settings.eq.mid > 0 ? `+${config.settings.eq.mid}` : config.settings.eq.mid} / {config.settings.eq.treble > 0 ? `+${config.settings.eq.treble}` : config.settings.eq.treble}dB
                          </span>
                          {config.customClone?.personaTitle && (
                            <span className="text-[10px] px-2 py-0.5 rounded bg-purple-950/60 border border-purple-800/40 text-purple-300">
                              🎭 {config.customClone.personaTitle}
                            </span>
                          )}
                        </div>

                        {/* Tags */}
                        {config.tags && config.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-3">
                            {config.tags.map((tag) => (
                              <span
                                key={tag}
                                className="text-[9px] text-slate-400 bg-slate-900/60 px-1.5 py-0.5 rounded border border-slate-850"
                              >
                                #{tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Card Action Buttons */}
                      <div className="flex items-center justify-between border-t border-slate-850 pt-2.5 mt-2">
                        <button
                          onClick={() => {
                            onSelectConfig(config);
                            onClose();
                          }}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                            isActive
                              ? "bg-amber-500 text-slate-950 font-bold"
                              : "bg-slate-800 hover:bg-slate-700 text-white"
                          }`}
                        >
                          <Play className="w-3 h-3 fill-current" />
                          {isActive ? "Active in Studio" : "Load Configuration"}
                        </button>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleCopyShareable(config)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                            title="Copy shareable string"
                          >
                            {copiedId === config.id ? (
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>

                          <button
                            onClick={() => downloadConfigAsJsonFile(config)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                            title="Download JSON file"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => onDeleteConfig(config.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 transition-colors"
                            title="Delete this configuration"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {filteredConfigs.length === 0 && (
                <div className="text-center py-12 border border-dashed border-slate-800 rounded-2xl bg-slate-950/40">
                  <Bookmark className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-slate-300">No matching configurations found</p>
                  <p className="text-xs text-slate-500 mt-1">
                    Try searching for another keyword or save your current audio settings.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: IMPORT */}
          {activeTab === "import" && (
            <div className="space-y-6 max-w-2xl mx-auto py-2">
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-4">
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <Upload className="w-4 h-4 text-blue-400" />
                    Import from Shareable String or JSON
                  </h4>
                  <p className="text-xs text-slate-400 mt-1">
                    Paste an encoded share string (starting with <code>GVP1:</code>) or raw configuration JSON below to recall the profile.
                  </p>
                </div>

                <textarea
                  rows={5}
                  value={importString}
                  onChange={(e) => setImportString(e.target.value)}
                  placeholder="Paste GVP1:... share string or { ... } JSON here"
                  className="w-full px-3.5 py-2.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-600 font-mono focus:outline-none focus:border-blue-500"
                />

                {importStatus && (
                  <div
                    className={`p-3 rounded-lg text-xs font-medium ${
                      importStatus.type === "success"
                        ? "bg-emerald-950/60 border border-emerald-500/40 text-emerald-300"
                        : "bg-rose-950/60 border border-rose-500/40 text-rose-300"
                    }`}
                  >
                    {importStatus.message}
                  </div>
                )}

                <div className="flex items-center justify-between pt-2">
                  <label className="cursor-pointer flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-900 hover:bg-slate-800 text-xs font-semibold text-slate-300 transition-colors">
                    <Download className="w-3.5 h-3.5 text-blue-400" />
                    <span>Upload JSON File</span>
                    <input
                      type="file"
                      accept=".json,application/json"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>

                  <button
                    onClick={handleImportSubmit}
                    className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md transition-all"
                  >
                    Import Configuration
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: EXPORT & SHARE */}
          {activeTab === "export" && (
            <div className="space-y-6 max-w-2xl mx-auto py-2">
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-4">
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <Share2 className="w-4 h-4 text-purple-400" />
                    Export Configuration for Sharing
                  </h4>
                  <p className="text-xs text-slate-400 mt-1">
                    Select a configuration to export as a portable share string or downloadable JSON preset file.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Select Profile to Export:
                  </label>
                  <select
                    value={selectedForExport?.id || ""}
                    onChange={(e) => {
                      const found = savedConfigs.find((c) => c.id === e.target.value);
                      if (found) setSelectedForExport(found);
                    }}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-purple-500 font-medium"
                  >
                    {savedConfigs.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.baseVoiceName} • Pitch {c.settings.pitchSemitones > 0 ? `+${c.settings.pitchSemitones}` : c.settings.pitchSemitones}st)
                      </option>
                    ))}
                  </select>
                </div>

                {selectedForExport && (
                  <>
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-xs font-semibold text-slate-400">
                          Encoded Shareable String (GVP1 format):
                        </label>
                        <button
                          onClick={() => handleCopyShareable(selectedForExport)}
                          className="flex items-center gap-1 text-[11px] text-purple-400 hover:text-purple-300"
                        >
                          {copiedId === selectedForExport.id ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-400" />
                              <span className="text-emerald-400">Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Copy String</span>
                            </>
                          )}
                        </button>
                      </div>
                      <textarea
                        readOnly
                        rows={3}
                        value={exportConfigToShareableString(selectedForExport)}
                        className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-[11px] text-slate-300 font-mono select-all focus:outline-none"
                      />
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-850">
                      <span className="text-xs text-slate-400">
                        Export as standalone JSON file for sharing with teammates or importing into other sessions.
                      </span>
                      <button
                        onClick={() => downloadConfigAsJsonFile(selectedForExport)}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold transition-all shadow-md"
                      >
                        <Download className="w-3.5 h-3.5" />
                        Download .JSON File
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
