import { useEffect, useRef, useState } from "react";
import { VoiceAudioEngine } from "../audio/VoiceAudioEngine";
import { Activity, BarChart3 } from "lucide-react";

interface AudioVisualizerProps {
  audioEngine: VoiceAudioEngine;
  isPlaying: boolean;
  accentColor: string;
}

export function AudioVisualizer({
  audioEngine,
  isPlaying,
  accentColor,
}: AudioVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [visualizerMode, setVisualizerMode] = useState<"wave" | "bars">("wave");

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let phase = 0;

    const render = () => {
      // Handle high-DPI crisp rendering
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }

      ctx.clearRect(0, 0, width, height);

      // Subtle background grid lines
      ctx.strokeStyle = "rgba(51, 65, 85, 0.25)";
      ctx.lineWidth = 1;
      const midY = height / 2;
      ctx.beginPath();
      ctx.moveTo(0, midY);
      ctx.lineTo(width, midY);
      ctx.stroke();

      if (isPlaying && audioEngine.analyserNode) {
        if (visualizerMode === "wave") {
          // Time domain waveform
          const waveData = audioEngine.getWaveformData();
          const sliceWidth = width / waveData.length;

          // Background glow
          const grad = ctx.createLinearGradient(0, 0, width, 0);
          grad.addColorStop(0, `${accentColor}88`);
          grad.addColorStop(0.5, accentColor);
          grad.addColorStop(1, `${accentColor}88`);

          ctx.lineWidth = 2.5;
          ctx.strokeStyle = grad;
          ctx.shadowBlur = 12;
          ctx.shadowColor = accentColor;
          ctx.beginPath();

          let x = 0;
          for (let i = 0; i < waveData.length; i++) {
            const v = waveData[i] / 128.0; // 0 to 2
            const y = (v * height) / 2;

            if (i === 0) {
              ctx.moveTo(x, y);
            } else {
              ctx.lineTo(x, y);
            }
            x += sliceWidth;
          }
          ctx.stroke();
          ctx.shadowBlur = 0;

          // Fill under curve subtly
          ctx.lineTo(width, height);
          ctx.lineTo(0, height);
          const fillGrad = ctx.createLinearGradient(0, midY, 0, height);
          fillGrad.addColorStop(0, `${accentColor}25`);
          fillGrad.addColorStop(1, "transparent");
          ctx.fillStyle = fillGrad;
          ctx.fill();
        } else {
          // Frequency bars
          const freqData = audioEngine.getAnalyserData();
          const barCount = Math.min(48, freqData.length);
          const barWidth = (width / barCount) - 3;

          for (let i = 0; i < barCount; i++) {
            const val = freqData[i] / 255;
            const barHeight = Math.max(4, val * (height * 0.85));
            const x = i * (barWidth + 3) + 2;
            const y = height - barHeight;

            const barGrad = ctx.createLinearGradient(0, y, 0, height);
            barGrad.addColorStop(0, accentColor);
            barGrad.addColorStop(1, `${accentColor}40`);

            ctx.fillStyle = barGrad;
            ctx.shadowBlur = val > 0.4 ? 10 : 0;
            ctx.shadowColor = accentColor;

            // Rounded bar top
            const r = Math.min(3, barWidth / 2);
            ctx.beginPath();
            ctx.roundRect(x, y, barWidth, barHeight, [r, r, 0, 0]);
            ctx.fill();
            ctx.shadowBlur = 0;
          }
        }
      } else {
        // Idle ambient gentle wave
        phase += 0.03;
        ctx.lineWidth = 1.8;
        ctx.strokeStyle = "rgba(100, 116, 139, 0.4)";
        ctx.beginPath();

        for (let x = 0; x < width; x += 4) {
          const y = midY + Math.sin(x * 0.02 + phase) * 6 * Math.cos(x * 0.005);
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [isPlaying, visualizerMode, accentColor, audioEngine]);

  return (
    <div className="relative w-full h-24 sm:h-28 rounded-xl bg-slate-900/90 border border-slate-800 overflow-hidden shadow-inner">
      <canvas ref={canvasRef} className="w-full h-full block" />

      {/* Visualizer mode toggle */}
      <div className="absolute top-2 right-2.5 flex items-center gap-1 bg-slate-950/70 backdrop-blur-sm p-1 rounded-lg border border-slate-800">
        <button
          onClick={() => setVisualizerMode("wave")}
          className={`p-1 rounded transition-colors ${
            visualizerMode === "wave"
              ? "bg-slate-800 text-white shadow-sm"
              : "text-slate-400 hover:text-slate-200"
          }`}
          title="Waveform visualizer"
        >
          <Activity className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => setVisualizerMode("bars")}
          className={`p-1 rounded transition-colors ${
            visualizerMode === "bars"
              ? "bg-slate-800 text-white shadow-sm"
              : "text-slate-400 hover:text-slate-200"
          }`}
          title="Spectrum analyzer"
        >
          <BarChart3 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Live Audio indicator */}
      <div className="absolute bottom-2 left-3 flex items-center gap-2 pointer-events-none">
        <span
          className="w-2 h-2 rounded-full transition-colors duration-300"
          style={{
            backgroundColor: isPlaying ? accentColor : "#64748b",
            boxShadow: isPlaying ? `0 0 8px ${accentColor}` : "none",
          }}
        />
        <span className="text-[11px] font-mono text-slate-400 tracking-wider uppercase">
          {isPlaying ? "24kHz Audio Rendering" : "Awaiting Playback"}
        </span>
      </div>
    </div>
  );
}
