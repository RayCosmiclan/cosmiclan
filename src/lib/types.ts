// Types mirroring fleet-runtime for dashboard consumption

export interface AgentConfig {
  id: string;
  name: string;
  port: number;
  color: string; // oklch color string for theme
  colorHex: string; // hex fallback for elements that need it
  colorHue: number; // oklch hue value for mood-bg blending
  image: string; // path relative to /public e.g. "/images/agents/marty.png"
}

export interface VADVector {
  valence: number;
  arousal: number;
  dominance: number;
}

export interface ActiveEmotion {
  type: string;
  intensity: number;
  cause: string;
  timestamp: number;
  decayRate: number;
}

export interface EmotionalState {
  mood: VADVector;
  activeEmotions: ActiveEmotion[];
  lastUpdated: number;
}

export interface Drive {
  type: string;
  value: number;
  threshold: number;
  growthRate: number;
  lastReset: number;
}

export interface DriveState {
  social: Drive;
  achievement: Drive;
  curiosity: Drive;
  care: Drive;
  selfExpression: Drive;
  lastUpdated: number;
}

export interface GoalMilestone {
  id: string;
  description: string;
  completed: boolean;
  completedAt?: number;
}

export interface Goal {
  id: string;
  scope: "short-term" | "long-term";
  status: "proposed" | "active" | "completed" | "abandoned" | "blocked";
  title: string;
  description: string;
  motivation: string;
  createdAt: number;
  updatedAt: number;
  completedAt?: number;
  progress: number;
  milestones: GoalMilestone[];
  reflections: string[];
}

export interface GoalState {
  goals: Goal[];
  lastReviewedAt: number;
}

export interface EpisodicMemory {
  id: string;
  content: string;
  timestamp: number;
  type: string;
  channel?: string;
  moodAtEncoding: VADVector;
  activeEmotionsAtEncoding: string[];
  emotionalIntensity: number;
  importance: number;
  retrievalCount: number;
  lastRetrieved?: number;
  tags: string[];
}

export interface MonologueOutput {
  reasoning: string;
  emotionalReaction?: { type: string; intensity: number; cause: string };
  conclusion: string;
  action: OutgoingAction | null;
  memoryOperations: Array<{
    op: string;
    content: string;
    type?: string;
    importance?: number;
    tags?: string[];
  }>;
  goalOperations?: Array<{
    op: string;
    goalId?: string;
    scope?: string;
    title?: string;
    description?: string;
    motivation?: string;
    progress?: number;
    reflection?: string;
  }>;
  model?: "sonnet" | "opus" | "haiku";
}

export interface OutgoingAction {
  type: string;
  channel?: string;
  content: string;
  replyToId?: string;
  goalId?: string;
}

export interface AbilityRequest {
  id: string;
  description: string;
  reason: string;
  capability: string;
  status: "open" | "addressed" | "dismissed";
  createdAt: number;
  addressedAt?: number;
}

export interface SoulSummary {
  name: string;
  description: string;
  personality: {
    openness: number;
    conscientiousness: number;
    extraversion: number;
    agreeableness: number;
    neuroticism: number;
  };
  voiceAnchors: Array<{ state: string; phrase: string }>;
  values: string[];
  emotionalTendencies: {
    excitedBy: string[];
    annoyedBy: string[];
    quietWhen: string[];
    confidentWhen: string[];
    reflectiveWhen: string[];
  };
  restingState: VADVector;
  hardBoundaries: string[];
}

export interface WsEvent {
  id: string;
  timestamp: number;
  type: string;
  payload: unknown;
}

export interface StateSnapshot {
  type: "state:snapshot";
  timestamp: number;
  data: {
    emotionalState: EmotionalState | null;
    driveState: DriveState | null;
    goalState: GoalState | null;
    workingMemory: Array<{
      timestamp: number;
      type: string;
      content: string;
    }>;
    recentEpisodes: EpisodicMemory[];
    soul: SoulSummary;
    abilityRequests: AbilityRequest[];
  };
  history: WsEvent[];
}

export interface Draft {
  id: string;
  agentId: string;
  type:
    | "post_twitter"
    | "post_linkedin"
    | "post_instagram"
    | "image"
    | "video"
    | "blog";
  platform: "twitter" | "linkedin" | "instagram" | "blog";
  title: string | null;
  content: string;
  metadata: {
    hashtags?: string[];
    mentions?: string[];
    imageUrl?: string;
  };
  preview: string;
  createdAt: number;
  requestedAt: number | null;
  status: "pending" | "approved" | "rejected" | "posted";
  approvedAt?: number;
  rejectionReason?: string;
}

export interface MartyState {
  connected: boolean;
  emotionalState: EmotionalState | null;
  driveState: DriveState | null;
  goalState: GoalState | null;
  workingMemory: Array<{ timestamp: number; type: string; content: string }>;
  recentEpisodes: EpisodicMemory[];
  soul: SoulSummary | null;
  abilityRequests: AbilityRequest[];
  events: WsEvent[];
  thoughts: Array<WsEvent & { payload: MonologueOutput }>;
  actions: Array<
    WsEvent & {
      payload: OutgoingAction & { success?: boolean; blockedReason?: string };
    }
  >;
}
