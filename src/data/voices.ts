import { Voice, ScriptPreset } from "../types";

export const GEMINI_VOICES: Voice[] = [
  {
    id: "Puck",
    name: "Puck",
    gender: "Male",
    tone: "Upbeat & Lively",
    character: "Curious, animated, and friendly. Radiates enthusiasm and high engagement.",
    energy: "High Energy",
    bestFor: "Explainer Videos, Gaming, Casual Dialogue",
    color: "#f59e0b", // Amber
    samplePrompt: "Hello! Welcome to the Gemini 3.8 Live audio experience. Ready to explore what I can do?",
  },
  {
    id: "Charon",
    name: "Charon",
    gender: "Male",
    tone: "Calm & Resonant",
    character: "Deep, smooth, and authoritative with a calming gravitas. Inspires trust and contemplation.",
    energy: "Grounded / Low",
    bestFor: "Audiobooks, Documentaries, Long-form Narration",
    color: "#3b82f6", // Blue
    samplePrompt: "The cosmos is vast and silent. In this quiet moment, let us observe the mysteries that lie beyond the stars.",
  },
  {
    id: "Kore",
    name: "Kore",
    gender: "Female",
    tone: "Firm & Soothing",
    character: "Authoritative, confident, and calming. Perfect balance of poise and gentle warmth.",
    energy: "Balanced",
    bestFor: "Corporate Insights, Meditation, News Analysis",
    color: "#10b981", // Emerald
    samplePrompt: "Take a deep breath and center yourself. Clarity and precision will guide our next steps forward.",
  },
  {
    id: "Fenrir",
    name: "Fenrir",
    gender: "Male",
    tone: "Bold & Dynamic",
    character: "Commanding, articulate, and driving with powerful vocal projection.",
    energy: "Very High",
    bestFor: "Motivation, Sports, Dramatic Trailers",
    color: "#ef4444", // Red
    samplePrompt: "Now is the moment to push past our boundaries and overcome the impossible. Let's make it happen!",
  },
  {
    id: "Zephyr",
    name: "Zephyr",
    gender: "Female",
    tone: "Warm & Bright",
    character: "Crisp, friendly, and naturally conversational. Highly welcoming and relatable.",
    energy: "Medium-High",
    bestFor: "Virtual Companions, Podcasts, Customer Support",
    color: "#8b5cf6", // Purple
    samplePrompt: "Good morning! It's fantastic to connect with you today. What exciting projects are on your mind?",
  },
  {
    id: "Aoede",
    name: "Aoede",
    gender: "Female",
    tone: "Breezy & Reflective",
    character: "Poetic, nuanced, and evocative. Adds an authentic literary intimacy.",
    energy: "Gentle",
    bestFor: "Creative Writing, Poetry, Emotional Storytelling",
    color: "#ec4899", // Pink
    samplePrompt: "A gentle breeze whispers through the autumn trees, carrying with it the quiet reminiscence of forgotten melodies.",
  },
  {
    id: "Leda",
    name: "Leda",
    gender: "Female",
    tone: "Youthful & Expressive",
    character: "Vibrant, empathetic, and communicative. Full of modern freshness and optimism.",
    energy: "High",
    bestFor: "Lifestyle Vlogs, Product Reviews, Friendly Chats",
    color: "#06b6d4", // Cyan
    samplePrompt: "Hey there! I just discovered something completely fascinating, and I couldn't wait to share it with you!",
  },
  {
    id: "Orus",
    name: "Orus",
    gender: "Male",
    tone: "Steady & Grounding",
    character: "Composed, clear, and measured. Outstanding for articulate explanations and academic precision.",
    energy: "Focused",
    bestFor: "Technical Tutorials, Science, Educational Guides",
    color: "#6366f1", // Indigo
    samplePrompt: "Analyzing the architecture systematically ensures robust resilience across all distributed components.",
  },
];

export const SCRIPT_PRESETS: ScriptPreset[] = [
  {
    id: "intro-greeting",
    title: "Voice Showcase",
    category: "introduction",
    text: "Hello! You are listening to the Gemini 3.8 Live audio API. Adjust my pitch and playback speed to hear how my character transforms.",
  },
  {
    id: "story-space",
    title: "The Silent Starlight",
    category: "story",
    recommendedVoice: "Charon",
    text: "Deep within the Orion Nebula, stars are born from ancient dust. Ships glide silently across the celestial horizon, charting course through infinite darkness.",
  },
  {
    id: "meditation-breath",
    title: "Mindful Breath",
    category: "meditation",
    recommendedVoice: "Kore",
    text: "Close your eyes. Inhale slowly through your nose for four counts. Hold the stillness, and release tension as you exhale completely.",
  },
  {
    id: "tech-quantum",
    title: "Quantum Computation",
    category: "tech",
    recommendedVoice: "Orus",
    text: "Quantum superposition allows qubits to evaluate exponential combinatorial paths simultaneously, fundamentally reshaping classical cryptography.",
  },
  {
    id: "dramatic-battle",
    title: "Call to Action",
    category: "dramatic",
    recommendedVoice: "Fenrir",
    text: "The gates are opening. We stood through the longest night, and at dawn we reclaim our destiny. Stand firm and let your voice be heard!",
  },
  {
    id: "casual-discovery",
    title: "Coffee Shop Discovery",
    category: "dialogue",
    recommendedVoice: "Zephyr",
    text: "You won't believe what happened this morning. I stepped into this little corner café and heard the most incredible acoustic set. Let me tell you all about it!",
  },
];

export const PITCH_PRESETS = [
  { label: "Titan Deep", semitones: -8, cents: 0, description: "Deep cinematic bass" },
  { label: "Warm Low", semitones: -4, cents: 0, description: "Grounded & authoritative" },
  { label: "Natural Voice", semitones: 0, cents: 0, description: "Default Gemini 3.8 pitch" },
  { label: "Bright Alto", semitones: +3, cents: 0, description: "Crisp & uplifted" },
  { label: "Sprite / High", semitones: +7, cents: 0, description: "Playful animated pitch" },
];

export const SPEED_PRESETS = [0.75, 1.0, 1.25, 1.5, 1.75, 2.0];
