// src/components/AudioVisualizer.jsx
import React, { useEffect, useRef } from "react";
import { usePlayer } from "../hooks/usePlayer";

export const AudioVisualizer = ({ isFullScreen = false }) => {
  const { isPlaying, analyser } = usePlayer();
  const canvasRef = useRef(null);
  const animationRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas dimensions
    const resizeCanvas = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Visualizer configuration
    const bufferLength = analyser ? analyser.frequencyBinCount : 64;
    const dataArray = new Uint8Array(bufferLength);

    // Fallback animation simulation properties
    const simulatedBars = Array.from({ length: 48 }, () => ({
      currentHeight: 10,
      targetHeight: 10,
      speed: 0.1 + Math.random() * 0.15
    }));

    const render = () => {
      animationRef.current = requestAnimationFrame(render);

      const rect = canvas.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;
      
      // Clear canvas with deep dark background and slight fade trails
      ctx.fillStyle = "rgba(10, 10, 12, 0.25)";
      ctx.fillRect(0, 0, width, height);

      // Determine bar width
      const barCount = analyser ? Math.min(bufferLength, 80) : simulatedBars.length;
      const spacing = 4;
      const totalSpacing = spacing * (barCount - 1);
      const barWidth = Math.max(2, (width - totalSpacing) / barCount);

      if (analyser && isPlaying) {
        // Read actual frequency data
        analyser.getByteFrequencyData(dataArray);

        for (let i = 0; i < barCount; i++) {
          // Normalize value
          const value = dataArray[i] || 0;
          const percent = value / 255;
          const barHeight = Math.max(4, percent * height * 0.85);

          const x = i * (barWidth + spacing);
          const y = height - barHeight;

          // Paint double gradients for premium look (neon emerald to violet)
          const grad = ctx.createLinearGradient(x, y, x, height);
          if (isFullScreen) {
            grad.addColorStop(0, "#a855f7"); // purple-500
            grad.addColorStop(0.5, "#ec4899"); // pink-500
            grad.addColorStop(1, "#10b981"); // emerald-500
          } else {
            grad.addColorStop(0, "#10b981"); // emerald-500
            grad.addColorStop(1, "#3b82f6"); // blue-500
          }

          ctx.fillStyle = grad;
          drawRoundedRect(ctx, x, y, barWidth, barHeight, 3);
        }
      } else {
        // Simulation fallback (CORS / Mock Mode)
        for (let i = 0; i < barCount; i++) {
          const bar = simulatedBars[i];

          if (isPlaying) {
            // Generate dynamic target height using multiple sine waves combined with random offsets
            const time = Date.now() * 0.003;
            const sineVal = Math.sin(time + i * 0.15) * Math.cos(time * 0.5 + i * 0.08);
            const normalizedSine = (sineVal + 1) / 2; // 0 to 1
            const baseMultiplier = 0.25 + 0.65 * normalizedSine;
            
            bar.targetHeight = baseMultiplier * height * (0.45 + Math.random() * 0.45);
          } else {
            // Decay to flat line when paused
            bar.targetHeight = 4;
          }

          // Smooth height interpolation
          bar.currentHeight += (bar.targetHeight - bar.currentHeight) * bar.speed;

          const x = i * (barWidth + spacing);
          const y = height - bar.currentHeight;

          // Color palette selection
          const grad = ctx.createLinearGradient(x, y, x, height);
          if (isFullScreen) {
            grad.addColorStop(0, "#c084fc"); // purple-400
            grad.addColorStop(0.5, "#f472b6"); // pink-400
            grad.addColorStop(1, "#34d399"); // emerald-400
          } else {
            grad.addColorStop(0, "#10b981"); // emerald-500
            grad.addColorStop(1, "#1d4ed8"); // dark blue
          }

          ctx.fillStyle = grad;
          drawRoundedRect(ctx, x, y, barWidth, bar.currentHeight, 3);
        }
      }
    };

    render();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, analyser, isFullScreen]);

  // Utility to draw rounded bars on Canvas
  const drawRoundedRect = (ctx, x, y, width, height, radius) => {
    if (height < radius * 2) radius = height / 2;
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height);
    ctx.lineTo(x, y + height);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
    ctx.fill();
  };

  return (
    <div className={`w-full h-full relative overflow-hidden ${isFullScreen ? "opacity-90" : "opacity-60"}`}>
      <canvas ref={canvasRef} className="w-full h-full block" />
    </div>
  );
};

export default AudioVisualizer;
