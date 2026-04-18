"use client";

import { useMemo } from "react";
import type { MartyState, ActiveEmotion } from "@/lib/types";
import { CopyableId } from "@/components/copyable-id";
import { ScrollArea } from "@/components/ui/scroll-area";

interface EmotionsTabProps {
  state: MartyState;
}

const EMOTION_COLORS: Record<string, string> = {
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
  boredom: "#71717a",
  loneliness: "#7dd3fc",
  nostalgia: "#fca5a5",
};

function emotionColor(type: string): string {
  return EMOTION_COLORS[type.toLowerCase()] ?? "#94a3b8";
}

function VADBar({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  // value range: typically -1 to 1 for valence, 0 to 1 for arousal/dominance
  const isSymmetric = label === "Valence" || label === "Dominance";
  const pct = isSymmetric
    ? ((value + 1) / 2) * 100
    : Math.max(0, Math.min(value, 1)) * 100;

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-baseline">
        <span className="text-sm text-[oklch(0.62_0_0)]">{label}</span>
        <span className="mono text-sm" style={{ color }}>
          {(value >= 0 ? "+" : "") + value.toFixed(3)}
        </span>
      </div>
      <div className="relative h-2.5 rounded-full bg-[oklch(1_0_0/8%)]">
        {isSymmetric && (
          <div className="absolute top-0 left-1/2 w-px h-full bg-[oklch(1_0_0/20%)]" />
        )}
        <div
          className="drive-fill absolute top-0 h-full rounded-full opacity-80"
          style={{
            left: isSymmetric ? (value >= 0 ? "50%" : `${pct}%`) : "0",
            width: isSymmetric ? `${Math.abs(value) * 50}%` : `${pct}%`,
            backgroundColor: color,
          }}
        />
      </div>
    </div>
  );
}

function moodDescriptor(
  valence: number,
  arousal: number,
  dominance: number,
): string {
  const v =
    valence > 0.4 ? "positive" : valence < -0.3 ? "negative" : "neutral";
  const a = arousal > 0.6 ? "alert" : arousal < 0.3 ? "calm" : "moderate";
  const d =
    dominance > 0.4 ? "confident" : dominance < -0.2 ? "submissive" : "stable";

  if (v === "positive" && a === "alert")
    return "positive and alert, feeling " + d;
  if (v === "positive" && a === "calm")
    return "positive and calm, feeling " + d;
  if (v === "negative" && a === "alert")
    return "negative and activated, feeling " + d;
  if (v === "negative" && a === "calm")
    return "withdrawn and quiet, feeling " + d;
  return `${v} tone, ${a} energy, feeling ${d}`;
}

function formatTimestamp(ts: number): string {
  return new Date(ts).toLocaleTimeString("en-IN", {
    timeZone: "Asia/Kolkata",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
}

export function EmotionsTab({ state }: EmotionsTabProps) {
  const { emotionalState, soul, events } = state;

  const emotionHistory = useMemo(() => {
    return events
      .filter((e) => e.type === "emotion:changed")
      .slice(-30)
      .reverse();
  }, [events]);

  if (!emotionalState) {
    return (
      <div className="flex items-center justify-center h-full text-[oklch(0.45_0_0)]">
        <div className="text-center">
          <div className="text-4xl mb-3 opacity-15">❧</div>
          <p className="mono text-base">
            {state.connected
              ? "waiting for emotional data…"
              : "agent is offline"}
          </p>
        </div>
      </div>
    );
  }

  const { mood, activeEmotions } = emotionalState;
  const descriptor = moodDescriptor(mood.valence, mood.arousal, mood.dominance);

  return (
    <div className="flex h-full overflow-hidden">
      {/* Left column: VAD + Active emotions */}
      <div className="w-80 shrink-0 border-r border-[oklch(1_0_0/10%)] flex flex-col overflow-hidden">
        {/* VAD section */}
        <div className="p-6 border-b border-[oklch(1_0_0/8%)]">
          <h3 className="text-sm text-[oklch(0.50_0_0)] uppercase tracking-widest font-semibold mb-4">
            Mood — VAD
          </h3>
          <div className="space-y-5 mb-4">
            <VADBar label="Valence" value={mood.valence} color="#86efac" />
            <VADBar label="Arousal" value={mood.arousal} color="#93c5fd" />
            <VADBar label="Dominance" value={mood.dominance} color="#c4b5fd" />
          </div>
          <p className="text-sm text-[oklch(0.55_0_0)] italic leading-relaxed">
            {descriptor}
          </p>
        </div>

        {/* Resting state reference */}
        {soul?.restingState && (
          <div className="p-6 border-b border-[oklch(1_0_0/10%)]">
            <h3 className="text-sm text-[oklch(0.50_0_0)] uppercase tracking-widest font-semibold mb-3">
              Resting baseline
            </h3>
            <div className="space-y-1.5 mono text-sm text-[oklch(0.50_0_0)]">
              <div className="flex justify-between">
                <span>valence</span>
                <span>{soul.restingState.valence.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>arousal</span>
                <span>{soul.restingState.arousal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>dominance</span>
                <span>{soul.restingState.dominance.toFixed(2)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Active emotions */}
        <ScrollArea className="flex-1 min-h-0">
          <div className="p-6">
            <h3 className="text-sm text-[oklch(0.50_0_0)] uppercase tracking-widest font-semibold mb-4">
              Active emotions
            </h3>
            {activeEmotions.length === 0 ? (
              <p className="mono text-sm text-[oklch(0.42_0_0)]">
                no active emotions
              </p>
            ) : (
              <div className="space-y-3">
                {[...activeEmotions]
                  .sort((a, b) => b.intensity - a.intensity)
                  .map((emotion, i) => (
                    <EmotionCard key={i} emotion={emotion} />
                  ))}
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Right column: emotion history */}
      <ScrollArea className="flex-1 min-h-0">
        <div className="p-6">
          <h3 className="text-sm text-[oklch(0.50_0_0)] uppercase tracking-widest font-semibold mb-4">
            Emotion history
          </h3>
          {emotionHistory.length === 0 ? (
            <p className="mono text-sm text-[oklch(0.42_0_0)]">
              no history this session
            </p>
          ) : (
            <div className="space-y-2">
              {emotionHistory.map((event) => {
                const es = event.payload as typeof emotionalState;
                const topEmotion = es?.activeEmotions
                  ? [...es.activeEmotions].sort(
                      (a, b) => b.intensity - a.intensity,
                    )[0]
                  : null;

                return (
                  <div
                    key={event.id}
                    className="flex items-start gap-3 py-2 border-b border-[oklch(1_0_0/4%)]"
                  >
                    <span className="mono text-sm text-[oklch(0.45_0_0)] shrink-0 pt-0.5">
                      {formatTimestamp(event.timestamp)}
                    </span>
                    <div className="flex-1 min-w-0">
                      {topEmotion && (
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className="text-sm capitalize font-medium"
                            style={{ color: emotionColor(topEmotion.type) }}
                          >
                            {topEmotion.type}
                          </span>
                          <span className="mono text-sm text-[oklch(0.52_0_0)]">
                            {(topEmotion.intensity * 100).toFixed(0)}%
                          </span>
                          {topEmotion.cause && (
                            <span className="text-sm text-[oklch(0.50_0_0)] italic truncate">
                              — {topEmotion.cause}
                            </span>
                          )}
                        </div>
                      )}
                      <div className="flex gap-2 mt-1">
                        <span className="mono text-sm text-[oklch(0.45_0_0)]">
                          V{(es?.mood?.valence ?? 0).toFixed(2)} A
                          {(es?.mood?.arousal ?? 0).toFixed(2)}
                        </span>
                      </div>
                    </div>
                    <CopyableId id={event.id} />
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

function EmotionCard({ emotion }: { emotion: ActiveEmotion }) {
  const color = emotionColor(emotion.type);
  const fillPct = Math.min(emotion.intensity * 100, 100);
  const isIntense = emotion.intensity > 0.7;

  return (
    <div
      className={`relative rounded-lg p-4 border overflow-hidden${isIntense ? " emotion-intense" : ""}`}
      style={{
        borderColor: color + (isIntense ? "60" : "30"),
        backgroundColor: color + "08",
        color,
      }}
    >
      {/* Intensity fill background */}
      <div
        className="absolute inset-0 rounded-lg opacity-10"
        style={{
          background: `linear-gradient(90deg, ${color} ${fillPct}%, transparent ${fillPct}%)`,
        }}
      />
      <div className="relative">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-base capitalize font-medium" style={{ color }}>
            {emotion.type}
          </span>
          <span className="mono text-sm" style={{ color }}>
            {fillPct.toFixed(0)}%
          </span>
        </div>
        {emotion.cause && (
          <p className="text-sm text-[oklch(0.55_0_0)] leading-relaxed">
            {emotion.cause}
          </p>
        )}
        <div className="flex items-center justify-between mt-2.5">
          <span className="mono text-sm text-[oklch(0.45_0_0)]">
            decay ×{emotion.decayRate.toFixed(2)}
          </span>
          <span className="mono text-sm text-[oklch(0.45_0_0)]">
            {formatTimestamp(emotion.timestamp)}
          </span>
        </div>
      </div>
    </div>
  );
}
