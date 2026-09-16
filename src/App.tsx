import { useState, useEffect, useRef, useCallback } from "react";
import { Voice, AudioEffectSettings, GeneratedAudioItem, CustomVoiceProfile } from "./types";
import { GEMINI_VOICES, SCRIPT_PRESETS } from "./data/voices";
import { VoiceAudioEngine } from "./audio/VoiceAudioEngine";
import { Header } from "./components/Header";
import { VoiceSelector } from "./components/VoiceSelector";
import { MasterPlayerDeck } from "./components/MasterPlayerDeck";
import { AudioControlsPanel } from "./components/AudioControlsPanel";
import { PromptStudio } from "./components/PromptStudio";
import { VoiceComparisonModal } from "./components/VoiceComparisonModal";
import { HistoryDrawer } from "./components/HistoryDrawer";
import { VoiceConfigsManagerModal } from "./components/VoiceConfigsManagerModal";
import { SaveVoiceConfigModal } from "./components/SaveVoiceConfigModal";
import { VoiceCloneStudioModal } from "./components/VoiceCloneStudioModal";
import {
  getSavedVoiceConfigs,
  persistVoiceConfig,
  deleteVoiceConfig,
  saveVoiceConfigsToStorage,
  compileClonePromptInstruction,
} from "./utils/configStorage";
import { AlertCircle, CheckCircle2, Sparkles, Volume2 } from "lucide-react";

const DEFAULT_SETTINGS: AudioEffectSettings = {
  pitchSemitones: 0,
  pitchCents: 0,
  speed: 1.0,
  preservePitch: true,
  eq: {
    bass: 0,
    mid: 0,
    treble: 0,
  },
  volume: 1.0,
  loop: false,
};

export default function App() {
  const audioEngineRef = useRef<VoiceAudioEngine | null>(null);

  if (!audioEngineRef.current) {
    audioEngineRef.current = new VoiceAudioEngine();
  }
  const engine = audioEngineRef.current;

  // State
  const [selectedVoice, setSelectedVoice] = useState<Voice>(GEMINI_VOICES[0]);
  const [promptText, setPromptText] = useState<string>(GEMINI_VOICES[0].samplePrompt);
  const [settings, setSettings] = useState<AudioEffectSettings>(DEFAULT_SETTINGS);

  // Playback state
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [hasAudioLoaded, setHasAudioLoaded] = useState<boolean>(false);
  const [currentSpokenText, setCurrentSpokenText] = useState<string>("");

  // Generation & Loading state
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [auditioningVoiceId, setAuditioningVoiceId] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error" | "info";
    text: string;
  } | null>(null);

  // Modals & Panels
  const [isCompareOpen, setIsCompareOpen] = useState<boolean>(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [history, setHistory] = useState<GeneratedAudioItem[]>([]);
  const [currentTakeId, setCurrentTakeId] = useState<string | null>(null);

  // Custom Voice Configurations & Clones State
  const [savedConfigs, setSavedConfigs] = useState<CustomVoiceProfile[]>(() =>
    getSavedVoiceConfigs()
  );
  const [activeProfile, setActiveProfile] = useState<CustomVoiceProfile | null>(null);
  const [isConfigsModalOpen, setIsConfigsModalOpen] = useState<boolean>(false);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState<boolean>(false);
  const [isCloneModalOpen, setIsCloneModalOpen] = useState<boolean>(false);
  const [activeCloneStyleInstruction, setActiveCloneStyleInstruction] = useState<string>("");

  // Audio Cache: voiceId + text -> base64 WAV
  const audioCache = useRef<Map<string, GeneratedAudioItem>>(new Map());

  // Setup engine callbacks
  useEffect(() => {
    engine.onTimeUpdate = (curr, dur) => {
      setCurrentTime(curr);
      setDuration(dur);
    };

    engine.onEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    return () => {
      engine.stop();
    };
  }, [engine]);

  // Keyboard shortcut listener (Space to play/pause)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in textarea or input
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        return;
      }

      if (e.code === "Space") {
        e.preventDefault();
        handleTogglePlay();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  });

  // Handle settings update in real-time
  const handleUpdateSettings = useCallback(
    (updated: Partial<AudioEffectSettings>) => {
      setSettings((prev) => {
        const next = { ...prev, ...updated };
        engine.updateLiveEffects(next);
        return next;
      });
    },
    [engine]
  );

  const handleResetSettings = useCallback(() => {
    setSettings(DEFAULT_SETTINGS);
    engine.updateLiveEffects(DEFAULT_SETTINGS);
    showStatus("info", "Audio FX and pitch controls reset to natural defaults.");
  }, [engine]);

  const showStatus = (type: "success" | "error" | "info", text: string) => {
    setStatusMessage({ type, text });
    setTimeout(() => {
      setStatusMessage((current) => (current?.text === text ? null : current));
    }, 4500);
  };

  // Generate audio via Gemini 3.8 Live API
  const handleGenerateAudio = async (
    voiceId: string,
    textToSpeak: string,
    style?: string
  ): Promise<GeneratedAudioItem | null> => {
    const targetVoice = GEMINI_VOICES.find((v) => v.id === voiceId) || selectedVoice;
    
    // Combine explicit style inspiration with any active clone voice persona instruction
    const effectiveStyle = [activeCloneStyleInstruction, style].filter(Boolean).join(" ");
    const cacheKey = `${voiceId}:::${textToSpeak.trim()}:::${effectiveStyle}`;

    // Check cache
    if (audioCache.current.has(cacheKey)) {
      const cached = audioCache.current.get(cacheKey)!;
      await engine.loadAudioFromBase64(cached.audioBase64);
      setHasAudioLoaded(true);
      setCurrentSpokenText(cached.text);
      setCurrentTakeId(cached.id);
      engine.play(settings);
      setIsPlaying(true);
      return cached;
    }

    setIsGenerating(true);
    setStatusMessage(null);

    try {
      const res = await fetch("/api/voice/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          voice: targetVoice.id,
          text: textToSpeak,
          styleInstruction: effectiveStyle,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Server responded with status ${res.status}`);
      }

      const data = await res.json();
      if (!data.audioBase64) {
        throw new Error("No audio payload received from Gemini.");
      }

      const newItem: GeneratedAudioItem = {
        id: `take-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        voiceId: targetVoice.id,
        voiceName: targetVoice.name,
        text: textToSpeak.trim(),
        audioBase64: data.audioBase64,
        duration: data.duration,
        sampleRate: data.sampleRate || 24000,
        createdAt: Date.now(),
        method: data.method || "gemini-3.8-live",
      };

      audioCache.current.set(cacheKey, newItem);
      setHistory((prev) => [newItem, ...prev.slice(0, 29)]);

      await engine.loadAudioFromBase64(data.audioBase64);
      setHasAudioLoaded(true);
      setCurrentSpokenText(textToSpeak.trim());
      setCurrentTakeId(newItem.id);

      // Start playback automatically
      engine.play(settings);
      setIsPlaying(true);

      showStatus(
        "success",
        `Rendered with ${targetVoice.name} via ${newItem.method} (24kHz)`
      );

      return newItem;
    } catch (err: any) {
      console.error("Audio generation failed:", err);
      showStatus(
        "error",
        err.message || "Failed to generate audio from Gemini Live."
      );
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  // Configuration Management Handlers
  const handleSelectConfig = (profile: CustomVoiceProfile) => {
    setActiveProfile(profile);

    // Find and switch base voice
    const matchedVoice = GEMINI_VOICES.find(
      (v) => v.id.toLowerCase() === profile.baseVoiceId.toLowerCase()
    );
    if (matchedVoice) {
      setSelectedVoice(matchedVoice);
    }

    // Apply audio settings
    setSettings(profile.settings);
    engine.updateLiveEffects(profile.settings);

    // Apply sample prompt if present
    if (profile.samplePrompt) {
      setPromptText(profile.samplePrompt);
    }

    // Handle custom clone persona instruction
    if (profile.customClone?.enabled) {
      const instruction =
        profile.customClone.promptInstruction ||
        compileClonePromptInstruction(profile.customClone);
      setActiveCloneStyleInstruction(instruction);
      showStatus(
        "success",
        `Loaded cloned voice profile: "${profile.name}" (${matchedVoice?.name || profile.baseVoiceName})`
      );
    } else {
      setActiveCloneStyleInstruction("");
      showStatus(
        "success",
        `Loaded voice configuration: "${profile.name}"`
      );
    }
  };

  const handleSaveConfig = (profile: CustomVoiceProfile) => {
    const updated = persistVoiceConfig(profile);
    setSavedConfigs(updated);
    setActiveProfile(profile);
    showStatus("success", `Saved voice configuration: "${profile.name}"`);
  };

  const handleDeleteConfig = (id: string) => {
    const updated = deleteVoiceConfig(id);
    setSavedConfigs(updated);
    if (activeProfile?.id === id) {
      setActiveProfile(null);
      setActiveCloneStyleInstruction("");
    }
    showStatus("info", "Configuration deleted from library.");
  };

  const handleImportConfigs = (imported: CustomVoiceProfile[]) => {
    const current = getSavedVoiceConfigs();
    const merged = [...imported, ...current];
    saveVoiceConfigsToStorage(merged);
    setSavedConfigs(merged);

    // Auto-select the first imported profile
    if (imported.length > 0) {
      handleSelectConfig(imported[0]);
    }
    showStatus("success", `Successfully imported ${imported.length} voice configuration(s)!`);
  };

  // Audition clone in real time directly from the clone modal
  const handleAuditionCloneProfile = async (profile: CustomVoiceProfile) => {
    const matchedVoice = GEMINI_VOICES.find(
      (v) => v.id.toLowerCase() === profile.baseVoiceId.toLowerCase()
    ) || selectedVoice;

    setSelectedVoice(matchedVoice);
    setSettings(profile.settings);
    engine.updateLiveEffects(profile.settings);

    const instruction =
      profile.customClone?.promptInstruction ||
      (profile.customClone ? compileClonePromptInstruction(profile.customClone) : "");

    const sentenceToAudition =
      profile.samplePrompt ||
      "This is a demonstration of my proprietary cloned vocal persona, configured with precision timbre and acoustic engineering.";

    await handleGenerateAudio(matchedVoice.id, sentenceToAudition, instruction);
  };


  // Quick Audition for voice cards
  const handleQuickAudition = async (voice: Voice) => {
    setSelectedVoice(voice);
    setAuditioningVoiceId(voice.id);
    const auditionText = voice.samplePrompt;
    setPromptText(auditionText);

    try {
      await handleGenerateAudio(voice.id, auditionText);
    } finally {
      setAuditioningVoiceId(null);
    }
  };

  // Select Voice
  const handleSelectVoice = (voice: Voice) => {
    setSelectedVoice(voice);
    if (!promptText || promptText.trim() === selectedVoice.samplePrompt) {
      setPromptText(voice.samplePrompt);
    }
  };

  // Play / Pause
  const handleTogglePlay = () => {
    if (!hasAudioLoaded) {
      // If no audio loaded yet, generate active prompt!
      handleGenerateAudio(selectedVoice.id, promptText);
      return;
    }

    if (isPlaying) {
      engine.pause();
      setIsPlaying(false);
    } else {
      engine.play(settings);
      setIsPlaying(true);
    }
  };

  const handleStop = () => {
    engine.stop();
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const handleSeek = (seconds: number) => {
    engine.seek(seconds, settings);
  };

  // Export processed WAV
  const handleExport = async () => {
    if (!hasAudioLoaded) return;
    setIsExporting(true);
    try {
      const { blob, filename } = await engine.exportProcessedWav(
        settings,
        selectedVoice.name
      );
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showStatus("success", `Exported customized audio as ${filename}`);
    } catch (err: any) {
      showStatus("error", err.message || "Export failed.");
    } finally {
      setIsExporting(false);
    }
  };

  // Load an existing take from History
  const handleSelectTake = async (take: GeneratedAudioItem) => {
    const voice = GEMINI_VOICES.find((v) => v.id === take.voiceId);
    if (voice) setSelectedVoice(voice);

    setCurrentSpokenText(take.text);
    setPromptText(take.text);
    setCurrentTakeId(take.id);

    await engine.loadAudioFromBase64(take.audioBase64);
    setHasAudioLoaded(true);
    engine.play(settings);
    setIsPlaying(true);
    setIsHistoryOpen(false);
  };

  // Download take from history
  const handleExportTake = (take: GeneratedAudioItem) => {
    const binary = atob(take.audioBase64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    const blob = new Blob([bytes], { type: "audio/wav" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `gemini-take-${take.voiceName.toLowerCase()}-${take.id}.wav`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-amber-500/30 selection:text-amber-200">
      {/* Header */}
      <Header
        currentVoice={selectedVoice}
        onResetSettings={handleResetSettings}
        onOpenCompare={() => setIsCompareOpen(true)}
        onOpenHistory={() => setIsHistoryOpen(true)}
        historyCount={history.length}
        onOpenConfigs={() => setIsConfigsModalOpen(true)}
        onOpenSaveConfig={() => setIsSaveModalOpen(true)}
        onOpenCloneStudio={() => setIsCloneModalOpen(true)}
        activeConfigName={activeProfile?.name}
        isCloneActive={Boolean(activeProfile?.customClone?.enabled)}
      />

      {/* Main Studio View */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Active Profile Info Banner (if a custom config or clone is active) */}
        {activeProfile && (
          <div className={`p-3.5 rounded-xl border flex flex-wrap items-center justify-between gap-3 text-xs shadow-sm ${
            activeProfile.customClone?.enabled
              ? "bg-purple-950/40 border-purple-600/30 text-purple-200"
              : "bg-amber-950/40 border-amber-600/30 text-amber-200"
          }`}>
            <div className="flex items-center gap-2.5">
              <div className={`w-2.5 h-2.5 rounded-full ${
                activeProfile.customClone?.enabled ? "bg-purple-400 animate-ping" : "bg-amber-400"
              }`} />
              <div>
                <span className="font-bold text-white tracking-wide">
                  Active Configuration: {activeProfile.name}
                </span>
                <span className="opacity-80 ml-2 text-[11px]">
                  ({activeProfile.baseVoiceName} base • Pitch {activeProfile.settings.pitchSemitones > 0 ? `+${activeProfile.settings.pitchSemitones}` : activeProfile.settings.pitchSemitones}st • Speed {activeProfile.settings.speed.toFixed(2)}x
                  {activeProfile.customClone?.personaTitle ? ` • 🎭 ${activeProfile.customClone.personaTitle}` : ""})
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsConfigsModalOpen(true)}
                className="px-2.5 py-1 rounded-lg bg-slate-900/80 hover:bg-slate-800 text-slate-200 border border-slate-700/60 font-medium transition-colors"
              >
                Change Preset
              </button>
              <button
                onClick={() => {
                  setActiveProfile(null);
                  setActiveCloneStyleInstruction("");
                  showStatus("info", "Returned to unassigned custom configuration.");
                }}
                className="px-2 py-1 text-slate-400 hover:text-white"
                title="Clear active preset reference"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* Notification / Toast Banner */}
        {statusMessage && (
          <div
            className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 text-xs font-medium animate-fade-in transition-all ${
              statusMessage.type === "success"
                ? "bg-emerald-950/60 border-emerald-500/30 text-emerald-200"
                : statusMessage.type === "error"
                ? "bg-red-950/60 border-red-500/30 text-red-200"
                : "bg-cyan-950/60 border-cyan-500/30 text-cyan-200"
            }`}
          >
            <div className="flex items-center gap-2">
              {statusMessage.type === "success" ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0" />
              )}
              <span>{statusMessage.text}</span>
            </div>
            <button
              onClick={() => setStatusMessage(null)}
              className="text-slate-400 hover:text-white"
            >
              ✕
            </button>
          </div>
        )}

        {/* Master Player Deck */}
        <MasterPlayerDeck
          currentVoice={selectedVoice}
          isPlaying={isPlaying}
          onTogglePlay={handleTogglePlay}
          onStop={handleStop}
          onSeek={handleSeek}
          currentTime={currentTime}
          duration={duration}
          settings={settings}
          onChangeSettings={handleUpdateSettings}
          audioEngine={engine}
          onExport={handleExport}
          isExporting={isExporting}
          hasAudioLoaded={hasAudioLoaded}
          spokenText={currentSpokenText}
        />

        {/* Studio Workspace: Left = Controls & Tuning, Right = Prompt Studio */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Audio FX & Tuning Panel */}
          <div className="lg:col-span-5 space-y-6">
            <AudioControlsPanel
              settings={settings}
              onChange={handleUpdateSettings}
              onReset={handleResetSettings}
              currentVoice={selectedVoice}
              onSaveConfig={() => setIsSaveModalOpen(true)}
              onOpenLibrary={() => setIsConfigsModalOpen(true)}
              onOpenCloneStudio={() => setIsCloneModalOpen(true)}
              activeConfigName={activeProfile?.name}
              isCloneActive={Boolean(activeProfile?.customClone?.enabled)}
            />
          </div>

          {/* Prompt & Script Studio */}
          <div className="lg:col-span-7 space-y-6">
            <PromptStudio
              currentVoice={selectedVoice}
              text={promptText}
              setText={setPromptText}
              onGenerate={async (v, t, s) => {
                await handleGenerateAudio(v, t, s);
              }}
              isGenerating={isGenerating}
            />
          </div>
        </div>

        {/* Voice Selector Grid (All 8 Gemini Voices) */}
        <div className="pt-2">
          <VoiceSelector
            selectedVoice={selectedVoice}
            onSelectVoice={handleSelectVoice}
            onQuickAudition={handleQuickAudition}
            auditioningVoiceId={auditioningVoiceId}
          />
        </div>
      </main>

      {/* Voice Timbre Comparison Lab Modal */}
      <VoiceComparisonModal
        isOpen={isCompareOpen}
        onClose={() => setIsCompareOpen(false)}
        textToCompare={promptText}
        settings={settings}
        onPlayVoiceSample={async (voice, text) => {
          setSelectedVoice(voice);
          await handleGenerateAudio(voice.id, text);
        }}
        currentlyPlayingVoiceId={selectedVoice.id}
        isPlaying={isPlaying}
        loadingVoiceId={auditioningVoiceId}
      />

      {/* History Drawer */}
      <HistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={history}
        onSelectTake={handleSelectTake}
        onClearHistory={() => setHistory([])}
        onExportItem={handleExportTake}
        currentTakeId={currentTakeId}
      />

      {/* Voice Configuration Library Modal (Save / Load / Import / Export) */}
      <VoiceConfigsManagerModal
        isOpen={isConfigsModalOpen}
        onClose={() => setIsConfigsModalOpen(false)}
        savedConfigs={savedConfigs}
        currentProfileId={activeProfile?.id}
        onSelectConfig={handleSelectConfig}
        onDeleteConfig={handleDeleteConfig}
        onImportConfigs={handleImportConfigs}
        onOpenCreateClone={() => setIsCloneModalOpen(true)}
        onOpenSaveCurrent={() => setIsSaveModalOpen(true)}
      />

      {/* Save Configuration Modal */}
      <SaveVoiceConfigModal
        isOpen={isSaveModalOpen}
        onClose={() => setIsSaveModalOpen(false)}
        currentVoice={selectedVoice}
        currentSettings={settings}
        currentPromptText={promptText}
        onSave={handleSaveConfig}
      />

      {/* Custom Voice Clone Studio Modal */}
      <VoiceCloneStudioModal
        isOpen={isCloneModalOpen}
        onClose={() => setIsCloneModalOpen(false)}
        currentVoice={selectedVoice}
        currentSettings={settings}
        onSaveCloneProfile={handleSaveConfig}
        onAuditionProfile={handleAuditionCloneProfile}
        isAuditioning={isGenerating}
      />

    </div>
  );
}
