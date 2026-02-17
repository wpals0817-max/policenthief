"use client";

import { useState, useEffect, useCallback } from "react";

interface TimerProps {
  initialSeconds: number;
  isRunning: boolean;
  onTimeUp?: () => void;
  onTick?: (seconds: number) => void;
  variant?: "default" | "large" | "compact";
  showProgress?: boolean;
}

export default function Timer({
  initialSeconds,
  isRunning,
  onTimeUp,
  onTick,
  variant = "default",
  showProgress = false,
}: TimerProps) {
  const [seconds, setSeconds] = useState(initialSeconds);

  useEffect(() => {
    setSeconds(initialSeconds);
  }, [initialSeconds]);

  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      setSeconds((prev) => {
        const newSeconds = prev - 1;
        if (onTick) onTick(newSeconds);

        if (newSeconds <= 0) {
          clearInterval(interval);
          if (onTimeUp) onTimeUp();
          return 0;
        }
        return newSeconds;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, onTimeUp, onTick]);

  const formatTime = useCallback((totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }, []);

  const progress = (seconds / initialSeconds) * 100;
  const isWarning = seconds <= 60;
  const isCritical = seconds <= 10;

  const variants = {
    default: "text-4xl",
    large: "text-6xl md:text-8xl",
    compact: "text-2xl",
  };

  return (
    <div className="flex flex-col items-center gap-3">
      {showProgress && (
        <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-1000 ${
              isCritical
                ? "bg-red-500 animate-pulse"
                : isWarning
                  ? "bg-yellow-500"
                  : "bg-green-500"
            }`}
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      <div
        className={`
          font-mono font-bold tabular-nums
          ${variants[variant]}
          ${isCritical ? "text-red-500 animate-pulse" : isWarning ? "text-yellow-500" : "text-white"}
        `}
      >
        {formatTime(seconds)}
      </div>

      {isCritical && (
        <p className="text-red-400 text-sm animate-pulse">시간이 얼마 남지 않았습니다!</p>
      )}
    </div>
  );
}
