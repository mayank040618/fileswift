/**
 * Shared TypeScript interfaces for the AI reliability layer.
 */

// ── User Plans ──────────────────────────────────────────────────────
export type UserPlan = 'free' | 'student' | 'pro_active';

export type AIMode = 'standard' | 'deep';

// ── Plan Limits ─────────────────────────────────────────────────────
export interface PlanLimits {
    maxInputTokens: number;
    maxOutputTokens: number;
    maxFileSizeMB: number;
    maxFiles: number;
    dailyRequestLimit: number; // -1 = unlimited
    maxConcurrent: number;
    allowedModes: AIMode[];
}

export const PLAN_LIMITS: Record<UserPlan, PlanLimits> = {
    free: {
        maxInputTokens: 10_000,
        maxOutputTokens: 1_000,
        maxFileSizeMB: 2,
        maxFiles: 1,
        dailyRequestLimit: 5,
        maxConcurrent: 1,
        allowedModes: ['standard'],
    },
    student: {
        maxInputTokens: 40_000,
        maxOutputTokens: 3_000,
        maxFileSizeMB: 10,
        maxFiles: 3,
        dailyRequestLimit: 50,
        maxConcurrent: 2,
        allowedModes: ['standard'],
    },
    pro_active: {
        maxInputTokens: 100_000,
        maxOutputTokens: 15_000,
        maxFileSizeMB: 50,
        maxFiles: 10,
        dailyRequestLimit: 500,
        maxConcurrent: 5,
        allowedModes: ['standard', 'deep'],
    },
};


// ── Model Configuration ─────────────────────────────────────────────
export type ProviderName = 'azure-openai' | 'azure-foundry';

export interface ModelConfig {
    provider: ProviderName;
    deploymentId: string;
    displayName: string;
    contextWindow: number;
    maxOutputTokens: number;
    supportsVision: boolean;
    supportsJSON: boolean;
    timeoutMs: number;
    apiVersion: string;
}

// ── AI Request / Response ───────────────────────────────────────────
export interface AIRequest {
    userId: string;
    plan: UserPlan;
    mode: AIMode;
    prompt: string;
    systemPrompt?: string;
    files?: FileInput[];
}

export interface FileInput {
    name: string;
    type: string;
    base64: string;
    size?: number;
}

export interface AIResponse {
    success: boolean;
    output: string;
    metadata: ExecutionMetadata;
}

export interface ExecutionMetadata {
    modelUsed: string;
    tokensInput: number;
    tokensOutput: number;
    latencyMs: number;
    ocrUsed: boolean;
    fallbackTriggered: boolean;
    trimmedInput: boolean;
}

// ── Provider Interface ──────────────────────────────────────────────
export interface ProviderResponse {
    content: string;
    tokensInput: number;
    tokensOutput: number;
    model: string;
}

export interface AIProvider {
    readonly name: ProviderName;
    call(
        messages: ChatMessage[],
        config: ModelConfig,
        maxOutputTokens: number,
        signal?: AbortSignal
    ): Promise<ProviderResponse>;
}

export interface ChatMessage {
    role: 'system' | 'user' | 'assistant';
    content: string | MessageContent[];
}

export type MessageContent =
    | { type: 'text'; text: string }
    | { type: 'image_url'; image_url: { url: string; detail: 'high' | 'low' } };

// ── Execution Log ───────────────────────────────────────────────────
export interface ExecutionLog {
    timestamp: string;
    userId: string;
    plan: UserPlan;
    mode: AIMode;
    toolType: string;
    modelUsed: string;
    tokensInput: number;
    tokensOutput: number;
    ocrUsed: boolean;
    latencyMs: number;
    success: boolean;
    fallbackTriggered: boolean;
    errorCode?: string;
}
