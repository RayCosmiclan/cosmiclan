"use client";

import { useMemo, useState, useEffect } from "react";
import Image from "next/image";
import type { MartyState } from "@/lib/types";

interface StatusBarProps {
  state: MartyState;
  /** Override connection display — use live state's connected, not displayState's */
  connected?: boolean;
  agentName?: string;
  agentColor?: string;
  agentImage?: string;
}

function getEmotionColor(type: string): string {
  const colorMap: Record<string, string> = {
    joy: "#86efac",
    curiosity: "#93c5fd",
    excitement: "#fde68a",
    love: "#f9a8d4",
    pride: "#c4b5fd",
    amusement: "#6ee7b7",
    satisfaction: "#a3e635",
    awe: "#67e8f9",
    serenity: "#94a3b8",
    hope: "#fbbf24",
    frustration: "#fb923c",
    sadness: "#60a5fa",
    anxiety: "#e879f9",
    anger: "#f87171",
    disgust: "#84cc16",
    fear: "#a78bfa",
    shame: "#f472b6",
    guilt: "#facc15",
    boredom: "#94a3b8",
    loneliness: "#7dd3fc",
    nostalgia: "#fca5a5",
  };
  return colorMap[type.toLowerCase()] ?? "#94a3b8";
}

function getMoodColor(valence: number): string {
  if (valence > 0.6) return "#86efac"; // positive — green
  if (valence > 0.3) return "#6ee7b7"; // mild positive
  if (valence > -0.1) return "#94a3b8"; // neutral — slate
  if (valence > -0.4) return "#93c5fd"; // mild negative — blue
  return "#f87171"; // negative — red
}

function formatIST(): string {
  return new Date().toLocaleTimeString("en-IN", {
    timeZone: "Asia/Kolkata",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
}

function ISTPill() {
  const [time, setTime] = useState<string | null>(null);

  useEffect(() => {
    setTime(formatIST());
    const interval = setInterval(() => setTime(formatIST()), 1000);
    return () => clearInterval(interval);
  }, []);

  if (!time)
    return (
      <span className="mono text-sm text-[oklch(0.55_0_0)]">--:-- IST</span>
    );
  return (
    <span className="mono text-sm text-[oklch(0.55_0_0)]">{time} IST</span>
  );
}

export function StatusBar({
  state,
  connected: connectedProp,
  agentName,
  agentColor,
  agentImage,
}: StatusBarProps) {
  const { connected: stateConnected, emotionalState, driveState } = state;
  const connected = connectedProp ?? stateConnected;

  const dominantEmotion = useMemo(() => {
    if (!emotionalState?.activeEmotions?.length) return null;
    return [...emotionalState.activeEmotions].sort(
      (a, b) => b.intensity - a.intensity,
    )[0];
  }, [emotionalState]);

  const highestDrive = useMemo(() => {
    if (!driveState) return null;
    const drives = [
      driveState.social,
      driveState.achievement,
      driveState.curiosity,
      driveState.care,
      driveState.selfExpression,
    ];
    return drives.reduce((best, d) => (d.value > best.value ? d : best));
  }, [driveState]);

  const valence = emotionalState?.mood?.valence ?? 0;
  const arousal = emotionalState?.mood?.arousal ?? 0.5;
  const moodColor = getMoodColor(valence);

  // Heartbeat speed scales with arousal
  const heartbeatSpeed = `${Math.max(2, 8 - arousal * 6).toFixed(1)}s`;

  return (
    <div
      className="flex items-center gap-5 px-6 py-2.5 border-b border-[oklch(1_0_0/12%)] bg-[oklch(0.10_0.005_260/95%)] backdrop-blur-sm shrink-0"
      style={{ "--arousal-speed": heartbeatSpeed } as React.CSSProperties}
    >
      {/* Agent identity */}
      {agentName && (
        <div className="flex items-center gap-2.5 shrink-0">
          {agentImage && (
            <div
              className="relative w-7 h-7 rounded-full overflow-hidden border"
              style={{
                borderColor: `oklch(from ${agentColor ?? "#94a3b8"} l c h / 40%)`,
                boxShadow: `0 0 12px oklch(from ${agentColor ?? "#94a3b8"} l c h / 25%)`,
              }}
            >
              <Image
                src={agentImage}
                alt={agentName}
                fill
                sizes="28px"
                className="object-cover"
                unoptimized={agentImage.startsWith("http")}
              />
            </div>
          )}
          <span
            className="text-sm font-semibold tracking-wide"
            style={{ color: agentColor ?? "oklch(0.7 0 0)" }}
          >
            {agentName}
          </span>
        </div>
      )}

      {/* Mood dot */}
      <div className="flex items-center gap-2.5">
        <div
          className="heartbeat-dot w-2.5 h-2.5 rounded-full shrink-0"
          style={{
            backgroundColor: moodColor,
            boxShadow: `0 0 6px ${moodColor}`,
          }}
        />
        {emotionalState && (
          <span className="mono text-sm" style={{ color: moodColor }}>
            V{(valence >= 0 ? "+" : "") + valence.toFixed(2)} A
            {arousal.toFixed(2)} D
            {(emotionalState.mood.dominance >= 0 ? "+" : "") +
              emotionalState.mood.dominance.toFixed(2)}
          </span>
        )}
      </div>

      {/* Dominant emotion pill */}
      {dominantEmotion && (
        <div
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-sm border"
          style={{
            borderColor: getEmotionColor(dominantEmotion.type) + "60",
            color: getEmotionColor(dominantEmotion.type),
            backgroundColor: getEmotionColor(dominantEmotion.type) + "15",
          }}
        >
          <span className="capitalize">{dominantEmotion.type}</span>
          <span className="opacity-60">
            {(dominantEmotion.intensity * 100).toFixed(0)}%
          </span>
        </div>
      )}

      {/* Separator */}
      <div className="w-px h-5 bg-[oklch(1_0_0/12%)]" />

      {/* Highest drive mini-bar */}
      {highestDrive && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-[oklch(0.60_0_0)] capitalize">
            {highestDrive.type}
          </span>
          <div className="relative w-16 h-1.5 rounded-full bg-[oklch(1_0_0/12%)]">
            <div
              className="drive-fill absolute left-0 top-0 h-full rounded-full bg-[oklch(0.7_0.12_250)]"
              style={{
                width: `${Math.min(highestDrive.value * 100, 100)}%`,
              }}
            />
            {/* Threshold marker */}
            <div
              className="absolute top-0 w-px h-full bg-[oklch(1_0_0/30%)]"
              style={{
                left: `${highestDrive.threshold * 100}%`,
              }}
            />
          </div>
          <span className="mono text-sm text-[oklch(0.55_0_0)]">
            {(highestDrive.value * 100).toFixed(0)}%
          </span>
        </div>
      )}

      {/* Spacer */}
      <div className="flex-1" />

      {/* IST time */}
      <ISTPill />

      {/* Connection status */}
      <div className="flex items-center gap-1.5">
        <div
          className={`w-1.5 h-1.5 rounded-full ${connected ? "bg-emerald-400" : "bg-red-400"}`}
          style={
            connected
              ? { boxShadow: "0 0 4px #34d399" }
              : { boxShadow: "0 0 4px #f87171" }
          }
        />
        <span className="mono text-sm text-[oklch(0.55_0_0)]">
          {connected ? "live" : "offline"}
        </span>
      </div>
    </div>
  );
}
