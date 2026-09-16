import React, { useState } from "react";
import { Voice, AudioEffectSettings, CustomVoiceProfile } from "../types";
import { Bookmark, Check, X, Sliders, Tag } from "lucide-react";

interface SaveVoiceConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentVoice: Voice;
  currentSettings: AudioEffectSettings;
  currentPromptText: string;
  onSave: (config: CustomVoiceProfile) => void;
}

export function SaveVoiceConfigModal({
  isOpen,
  onClose,
  currentVoice,
  currentSettings,
  currentPromptText,
  onSave,
}: SaveVoiceConfigModalProps) {
  if (!isOpen) return null;

  const [name, setName] = useState<string>("My preferred narration voice");
  const [description, setDescription] = useState<string>(
    `Custom ${currentVoice.name} configuration with pitch ${currentSettings.pitchSemitones > 0 ? `+${currentSettings.pitchSemitones}` : currentSettings.pitchSemitones}st and ${currentSettings.speed.toFixed(2)}x speed.`
  );
  const [category, setCategory] = useState<CustomVoiceProfile["category"]>("narration");
  const [tagInput, setTagInput] = useState<string>("Narration, Preferred, Studio");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const tags = tagInput
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    const newProfile: CustomVoiceProfile = {
      id: `config-${Date.now()}`,
      name: name.trim(),
      description: description.trim(),
      baseVoiceId: currentVoice.id,
      baseVoiceName: currentVoice.name,
      settings: { ...currentSettings },
      samplePrompt: currentPromptText.trim() || undefined,
      category,
      tags,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    onSave(newProfile);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-750 rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/70">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Bookmark className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                Save Voice Configuration
              </h3>
              <p className="text-xs text-slate-400">
                Store current base voice, pitch, speed, EQ & sample text for instant recall.
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Configuration Name <span className="text-amber-400">*</span>
            </label>
            <input
              type="text"
              required
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. My preferred narration voice"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Description (Optional)
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Notes on the intended tone, use-case, or acoustics..."
              className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-500 font-medium"
              >
                <option value="narration">Narration & Story</option>
                <option value="assistant">Virtual Assistant</option>
                <option value="gaming">Gaming & Character</option>
                <option value="meditation">Meditation & Calm</option>
                <option value="commercial">Commercial & Trailer</option>
                <option value="custom">General / Custom</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Tags (Comma-separated)
              </label>
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                placeholder="Story, Warm, Audiobook"
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Current Acoustic Snapshot */}
          <div className="bg-slate-950/80 border border-slate-850 rounded-xl p-3.5 space-y-1.5 text-xs">
            <div className="flex items-center gap-1.5 text-slate-400 font-medium border-b border-slate-850 pb-1.5">
              <Sliders className="w-3.5 h-3.5 text-amber-400" />
              <span>Settings to be saved:</span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-[11px] pt-1 text-slate-300 font-mono">
              <div>
                <span className="text-slate-500 block">Base Voice:</span>
                <span className="font-semibold text-white">{currentVoice.name}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Pitch:</span>
                <span className="font-semibold text-white">
                  {currentSettings.pitchSemitones > 0
                    ? `+${currentSettings.pitchSemitones}`
                    : currentSettings.pitchSemitones}{" "}
                  st
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">Speed:</span>
                <span className="font-semibold text-white">{currentSettings.speed.toFixed(2)}x</span>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 shadow-md shadow-amber-400/20 transition-all"
            >
              <Check className="w-4 h-4" />
              Save Configuration
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
