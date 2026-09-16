import React from "react";
import {
  Play,
  Pause,
  RotateCcw,
  Repeat,
  Download,
  Volume2,
  VolumeX,
  Radio,
  Sliders,
} from "lucide-react";
import { Voice, AudioEffectSettings } from "../types";
import { VoiceAudioEngine } from "../audio/VoiceAudioEngine";
import { AudioVisualizer } from "./AudioVisualizer";

interface MasterPlayerDeckProps {
  currentVoice: Voice;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onStop: () => void;
  onSeek: (seconds: number) => void;
  currentTime: number;
  duration: number;
  settings: AudioEffectSettings;
  onChangeSettings: (updated: Partial<AudioEffectSettings>) => void;
  audioEngine: VoiceAudioEngine;
  onExport: () => void;
  isExporting: boolean;
  hasAudioLoaded: boolean;
  spokenText?: string;
}

function formatTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
}

export function MasterPlayerDeck({
  currentVoice,
  isPlaying,
  onTogglePlay,
  onStop,
  onSeek,
  currentTime,
  duration,
  settings,
  onChangeSettings,
  audioEngine,
  onExport,
  isExporting,
  hasAudioLoaded,
  spokenText,
}: MasterPlayerDeckProps) {
  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  const handleScrubberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    const targetTime = (val / 100) * duration;
    onSeek(targetTime);
  };

  return (
    <div className="bg-slate-900/95 border border-slate-800 rounded-2xl p-5 shadow-2xl space-y-5">
      {/* Top row: Voice badge + Spoken text preview + API specs */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center font-extrabold text-sm shadow-md"
            style={{
              backgroundColor: `${currentVoice.color}25`,
              color: currentVoice.color,
              border: `1.5px solid ${currentVoice.color}60`,
            }}
          >
            {currentVoice.name[0]}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-white text-sm sm:text-base">
                {currentVoice.name}
              </span>
              <span
                className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                style={{
                  backgroundColor: `${currentVoice.color}20`,
                  color: currentVoice.color,
                }}
              >
                {currentVoice.gender} • {currentVoice.tone}
              </span>
            </div>
            <p className="text-xs text-slate-400 truncate max-w-[280px] sm:max-w-md">
              {spokenText || currentVoice.samplePrompt}
            </p>
          </div>
        </div>

        {/* Audio Engine Specs Pill */}
        <div className="hidden sm:flex items-center gap-3 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 text-xs font-mono text-slate-400">
          <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
            <Radio className="w-3.5 h-3.5" /> 24,000 Hz
          </span>
          <span className="text-slate-600">|</span>
          <span>16-bit PCM</span>
          <span className="text-slate-600">|</span>
          <span className="text-slate-300">
            {settings.speed.toFixed(2)}x @{" "}
            {settings.pitchSemitones >= 0
              ? `+${settings.pitchSemitones}`
              : settings.pitchSemitones}
            st
          </span>
        </div>
      </div>

      {/* Real-time Visualizer Canvas */}
      <AudioVisualizer
        audioEngine={audioEngine}
        isPlaying={isPlaying}
        accentColor={currentVoice.color}
      />

      {/* Timeline Scrubber */}
      <div className="space-y-1.5">
        <div className="relative group">
          <input
            id="audio-timeline-scrubber"
            type="range"
            min="0"
            max="100"
            step="0.1"
            value={progressPercent || 0}
            onChange={handleScrubberChange}
            disabled={!hasAudioLoaded}
            className="w-full h-2 rounded-lg bg-slate-800 appearance-none cursor-pointer accent-white transition-all disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none"
            style={{
              accentColor: currentVoice.color,
            }}
          />
        </div>
        <div className="flex justify-between items-center text-xs font-mono text-slate-400">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Playback Controls & Utility Deck */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
        {/* Left: Play / Pause / Replay */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Main Play / Pause button */}
          <button
            id="btn-main-play-pause"
            onClick={onTogglePlay}
            disabled={!hasAudioLoaded}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all shadow-lg cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 ${
              isPlaying
                ? "bg-amber-400 text-slate-950 shadow-amber-500/30"
                : "text-slate-950 hover:brightness-110"
            }`}
            style={{
              backgroundColor: isPlaying ? undefined : currentVoice.color,
              boxShadow: `0 4px 18px ${currentVoice.color}40`,
            }}
            title={isPlaying ? "Pause (Space)" : "Play (Space)"}
          >
            {isPlaying ? (
              <Pause className="w-5 h-5 fill-slate-950" />
            ) : (
              <Play className="w-5 h-5 fill-slate-950 ml-0.5" />
            )}
          </button>

          {/* Replay */}
          <button
            id="btn-replay"
            onClick={() => onSeek(0)}
            disabled={!hasAudioLoaded}
            className="w-9 h-9 rounded-xl flex items-center justify-center bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white border border-slate-700 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            title="Restart playback from beginning"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Loop toggle */}
          <button
            id="btn-loop"
            onClick={() => onChangeSettings({ loop: !settings.loop })}
            className={`w-9 h-9 rounded-xl flex items-center justify-center border transition-all ${
              settings.loop
                ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                : "bg-slate-800 hover:bg-slate-750 text-slate-400 hover:text-slate-200 border-slate-700"
            }`}
            title={settings.loop ? "Looping enabled" : "Enable loop"}
          >
            <Repeat className="w-4 h-4" />
          </button>
        </div>

        {/* Right: Volume & Export */}
        <div className="flex items-center gap-3">
          {/* Volume control */}
          <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
            <button
              onClick={() =>
                onChangeSettings({
                  volume: settings.volume === 0 ? 1.0 : 0,
                })
              }
              className="text-slate-400 hover:text-slate-200 transition-colors"
            >
              {settings.volume === 0 ? (
                <VolumeX className="w-4 h-4 text-red-400" />
              ) : (
                <Volume2 className="w-4 h-4" />
              )}
            </button>
            <input
              type="range"
              min="0"
              max="1.5"
              step="0.05"
              value={settings.volume}
              onChange={(e) =>
                onChangeSettings({ volume: parseFloat(e.target.value) })
              }
              className="w-16 sm:w-20 h-1.5 rounded bg-slate-800 accent-amber-400 appearance-none cursor-pointer"
              title={`Volume: ${Math.round(settings.volume * 100)}%`}
            />
          </div>

          {/* Download Customized WAV */}
          <button
            id="btn-export-audio"
            onClick={onExport}
            disabled={!hasAudioLoaded || isExporting}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-750 text-slate-100 hover:text-white border border-slate-700 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
            title="Download high-fidelity WAV with current pitch and speed settings"
          >
            <Download className="w-4 h-4 text-cyan-400" />
            <span className="hidden sm:inline">
              {isExporting ? "Exporting..." : "Download WAV"}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
