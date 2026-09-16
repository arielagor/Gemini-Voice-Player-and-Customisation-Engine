import express from "express";
import http from "http";
import path from "path";
import dotenv from "dotenv";
import { WebSocketServer, WebSocket } from "ws";
import { GoogleGenAI, Modality } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

const PORT = 3000;
const app = express();
const server = http.createServer(app);

// Initialize Gemini Client
function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY environment variable is missing.");
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

// 8 Official Gemini Voices
export const GEMINI_VOICES = [
  {
    id: "Puck",
    name: "Puck",
    gender: "Male",
    tone: "Upbeat & Lively",
    character: "Curious, animated, and friendly. Great for tutorials, games, and dynamic storytelling.",
    energy: "High",
    bestFor: "Explainer Videos, Gaming, Casual Dialogue",
    color: "#f59e0b", // Amber
    samplePrompt: "Hello! Welcome to the Gemini 3.8 Live audio experience. Ready to explore what I can do?",
  },
  {
    id: "Charon",
    name: "Charon",
    gender: "Male",
    tone: "Calm & Resonant",
    character: "Deep, soothing, and authoritative with a gentle presence. Excellent for documentaries and serious topics.",
    energy: "Low / Grounded",
    bestFor: "Audiobooks, Documentaries, Long-form Narration",
    color: "#3b82f6", // Blue
    samplePrompt: "The cosmos is vast and silent. In this quiet moment, let us observe the mysteries that lie beyond the stars.",
  },
  {
    id: "Kore",
    name: "Kore",
    gender: "Female",
    tone: "Firm & Soothing",
    character: "Authoritative, confident, and calming. Perfect for leadership, business summaries, and guided meditation.",
    energy: "Balanced",
    bestFor: "Corporate, Meditation, News & Insights",
    color: "#10b981", // Emerald
    samplePrompt: "Take a deep breath and center yourself. Clarity and precision will guide our next steps forward.",
  },
  {
    id: "Fenrir",
    name: "Fenrir",
    gender: "Male",
    tone: "Bold & Dynamic",
    character: "Commanding, energetic, and articulate. Designed for sports, motivation, and engaging presentations.",
    energy: "Very High",
    bestFor: "Motivation, Sports, Dramatic Readings",
    color: "#ef4444", // Red
    samplePrompt: "Now is the moment to push boundaries and overcome the impossible. Let's make it happen!",
  },
  {
    id: "Zephyr",
    name: "Zephyr",
    gender: "Female",
    tone: "Warm & Bright",
    character: "Crisp, friendly, and naturally conversational. Ideal for customer assistance, podcasts, and daily companions.",
    energy: "Medium-High",
    bestFor: "Virtual Assistant, Podcasts, Friendly Advice",
    color: "#8b5cf6", // Purple
    samplePrompt: "Good morning! It's fantastic to connect with you today. What exciting projects are on your mind?",
  },
  {
    id: "Aoede",
    name: "Aoede",
    gender: "Female",
    tone: "Breezy & Reflective",
    character: "Artistic, poetic, and nuanced. Brings an evocative and emotional depth to stories and reflections.",
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
    character: "Vibrant, empathetic, and enthusiastic. Great for young adult content, lifestyle vlogs, and chatty dialogues.",
    energy: "High",
    bestFor: "Lifestyle, Tech Reviews, Conversational Chats",
    color: "#06b6d4", // Cyan
    samplePrompt: "Hey there! I just discovered something completely fascinating, and I couldn't wait to share it with you!",
  },
  {
    id: "Orus",
    name: "Orus",
    gender: "Male",
    tone: "Steady & Grounding",
    character: "Composed, clear, and measured. Outstanding for technical explanations, science, and step-by-step guidance.",
    energy: "Focused",
    bestFor: "Technical Tutorials, Science, Product Demos",
    color: "#6366f1", // Indigo
    samplePrompt: "Analyzing the architecture systematically ensures robust resilience across all distributed components.",
  },
];

// Helper to wrap raw 24kHz 16-bit Mono PCM buffer in a standard RIFF/WAV header
function createWavHeader(dataLength: number, sampleRate = 24000, numChannels = 1, bitsPerSample = 16): Buffer {
  const byteRate = (sampleRate * numChannels * bitsPerSample) / 8;
  const blockAlign = (numChannels * bitsPerSample) / 8;
  const buffer = Buffer.alloc(44);

  // RIFF chunk descriptor
  buffer.write("RIFF", 0);
  buffer.writeUInt32LE(36 + dataLength, 4);
  buffer.write("WAVE", 8);

  // "fmt " sub-chunk
  buffer.write("fmt ", 12);
  buffer.writeUInt32LE(16, 16); // Subchunk1Size for PCM
  buffer.writeUInt16LE(1, 20); // AudioFormat 1 = PCM
  buffer.writeUInt16LE(numChannels, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(byteRate, 28);
  buffer.writeUInt16LE(blockAlign, 32);
  buffer.writeUInt16LE(bitsPerSample, 34);

  // "data" sub-chunk
  buffer.write("data", 36);
  buffer.writeUInt32LE(dataLength, 40);

  return buffer;
}

app.use(express.json({ limit: "10mb" }));

// List voices endpoint
app.get("/api/voices", (req, res) => {
  res.json({
    model: "gemini-3.8-live",
    sampleRate: 24000,
    voices: GEMINI_VOICES,
  });
});

// Generate speech via Gemini 3.8 Live (or TTS fallback for robustness)
app.post("/api/voice/generate", async (req, res) => {
  const { voice = "Puck", text, styleInstruction = "" } = req.body;

  if (!text || typeof text !== "string" || text.trim().length === 0) {
    return res.status(400).json({ error: "Text is required for voice generation." });
  }

  const validVoice = GEMINI_VOICES.some((v) => v.id.toLowerCase() === voice.toLowerCase())
    ? voice
    : "Puck";

  try {
    const ai = getGeminiClient();
    let audioPcmBuffer: Buffer | null = null;
    let methodUsed = "gemini-3.8-live";

    // Attempt 1: Gemini 3.8 Live API connect
    try {
      const pcmChunks: Buffer[] = [];
      let isResolved = false;

      await new Promise<void>(async (resolve, reject) => {
        const timeout = setTimeout(() => {
          if (!isResolved) {
            isResolved = true;
            if (pcmChunks.length > 0) resolve();
            else reject(new Error("Live API timeout waiting for audio chunks"));
          }
        }, 12000);

        try {
          const session = await ai.live.connect({
            model: "gemini-3.8-live",
            callbacks: {
              onmessage: (msg: any) => {
                const base64Audio = msg.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
                if (base64Audio) {
                  pcmChunks.push(Buffer.from(base64Audio, "base64"));
                }
                if (msg.serverContent?.turnComplete) {
                  if (!isResolved) {
                    isResolved = true;
                    clearTimeout(timeout);
                    session.close();
                    resolve();
                  }
                }
              },
              onerror: (err: any) => {
                if (!isResolved) {
                  isResolved = true;
                  clearTimeout(timeout);
                  reject(err);
                }
              },
            },
            config: {
              responseModalities: [Modality.AUDIO],
              speechConfig: {
                voiceConfig: { prebuiltVoiceConfig: { voiceName: validVoice } },
              },
              systemInstruction: styleInstruction
                ? `You are an audio voice talent. Speak the following text clearly and expressively. ${styleInstruction}`
                : "You are an audio voice talent. Read the requested text naturally and clearly.",
            },
          });

          session.sendClientContent({
            turns: [
              {
                role: "user",
                parts: [
                  {
                    text: `Please speak the following text aloud with high clarity and expressiveness. Do not add any conversational banter, only read the text:\n\n"${text.trim()}"`,
                  },
                ],
              },
            ],
            turnComplete: true,
          });
        } catch (liveErr) {
          clearTimeout(timeout);
          reject(liveErr);
        }
      });

      if (pcmChunks.length > 0) {
        audioPcmBuffer = Buffer.concat(pcmChunks);
      }
    } catch (liveErr: any) {
      console.warn("Live API generation attempt failed, falling back to TTS:", liveErr?.message || liveErr);
      methodUsed = "gemini-3.1-flash-tts-preview";

      // Attempt 2: Direct speech synthesis with identical voice name
      const ttsResp = await ai.models.generateContent({
        model: "gemini-3.1-flash-tts-preview",
        contents: [
          {
            parts: [
              {
                text: styleInstruction
                  ? `${styleInstruction}: ${text.trim()}`
                  : `Read aloud: ${text.trim()}`,
              },
            ],
          },
        ],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: validVoice },
            },
          },
        },
      });

      const b64 = ttsResp.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (b64) {
        audioPcmBuffer = Buffer.from(b64, "base64");
      }
    }

    if (!audioPcmBuffer || audioPcmBuffer.length === 0) {
      throw new Error("No audio data was generated by the model.");
    }

    const wavHeader = createWavHeader(audioPcmBuffer.length, 24000, 1, 16);
    const fullWavBuffer = Buffer.concat([wavHeader, audioPcmBuffer]);

    const durationSeconds = audioPcmBuffer.length / (24000 * 2);

    res.json({
      success: true,
      voice: validVoice,
      text: text.trim(),
      method: methodUsed,
      sampleRate: 24000,
      duration: durationSeconds,
      audioBase64: fullWavBuffer.toString("base64"),
      pcmBase64: audioPcmBuffer.toString("base64"),
      mimeType: "audio/wav",
    });
  } catch (error: any) {
    console.error("Error generating voice audio:", error);
    res.status(500).json({
      error: error?.message || "Failed to generate voice audio from Gemini.",
    });
  }
});

// WebSocket Server for Interactive Real-Time Live Audio Streaming
const wss = new WebSocketServer({ noServer: true });

server.on("upgrade", (request, socket, head) => {
  const pathname = request.url ? new URL(request.url, "http://localhost").pathname : "";
  if (pathname === "/ws/live") {
    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit("connection", ws, request);
    });
  }
});

wss.on("connection", (clientWs: WebSocket) => {
  let activeLiveSession: any = null;

  clientWs.on("message", async (rawMsg: any) => {
    try {
      const data = JSON.parse(rawMsg.toString());

      if (data.type === "start_session") {
        const { voice = "Puck", systemInstruction = "You are a helpful and articulate voice assistant." } = data;
        const validVoice = GEMINI_VOICES.some((v) => v.id.toLowerCase() === voice.toLowerCase())
          ? voice
          : "Puck";

        if (activeLiveSession) {
          try {
            activeLiveSession.close();
          } catch (_) {}
        }

        const ai = getGeminiClient();
        activeLiveSession = await ai.live.connect({
          model: "gemini-3.8-live",
          callbacks: {
            onmessage: (msg: any) => {
              const base64Audio = msg.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
              if (base64Audio) {
                clientWs.send(
                  JSON.stringify({
                    type: "audio_chunk",
                    data: base64Audio,
                    sampleRate: 24000,
                  })
                );
              }
              const text = msg.serverContent?.modelTurn?.parts?.[0]?.text;
              if (text) {
                clientWs.send(JSON.stringify({ type: "text_chunk", text }));
              }
              if (msg.serverContent?.turnComplete) {
                clientWs.send(JSON.stringify({ type: "turn_complete" }));
              }
              if (msg.serverContent?.interrupted) {
                clientWs.send(JSON.stringify({ type: "interrupted" }));
              }
            },
            onerror: (err: any) => {
              clientWs.send(JSON.stringify({ type: "error", error: err?.message || "Live session error" }));
            },
          },
          config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: {
              voiceConfig: { prebuiltVoiceConfig: { voiceName: validVoice } },
            },
            systemInstruction,
          },
        });

        clientWs.send(JSON.stringify({ type: "session_ready", voice: validVoice }));
      } else if (data.type === "send_text") {
        if (activeLiveSession && data.text) {
          activeLiveSession.sendClientContent({
            turns: [
              {
                role: "user",
                parts: [{ text: data.text }],
              },
            ],
            turnComplete: true,
          });
        }
      } else if (data.type === "send_pcm_audio") {
        if (activeLiveSession && data.pcmBase64) {
          activeLiveSession.sendRealtimeInput({
            audio: {
              data: data.pcmBase64,
              mimeType: "audio/pcm;rate=16000",
            },
          });
        }
      } else if (data.type === "close_session") {
        if (activeLiveSession) {
          try {
            activeLiveSession.close();
          } catch (_) {}
          activeLiveSession = null;
        }
        clientWs.send(JSON.stringify({ type: "session_closed" }));
      }
    } catch (err: any) {
      console.error("WS error:", err);
      clientWs.send(JSON.stringify({ type: "error", error: err?.message || "Internal WS error" }));
    }
  });

  clientWs.on("close", () => {
    if (activeLiveSession) {
      try {
        activeLiveSession.close();
      } catch (_) {}
      activeLiveSession = null;
    }
  });
});

// Vite Integration
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  server.listen(PORT, "0.0.0.0", () => {
    console.log(`Gemini Voice Player Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
