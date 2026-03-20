/**
 * Model Router — selects the correct model and provider based on plan/mode.
 * Implements automatic fallback with circuit breaker integration.
 */

import type { AIMode, AIProvider, ChatMessage, ModelConfig, ProviderResponse, UserPlan } from './types';
import { AIError } from './errors';
import { isProviderAvailable, recordSuccess, recordFailure } from './CircuitBreaker';
import { AzureOpenAIProvider } from './providers/AzureOpenAIProvider';
import { AzureFoundryProvider } from './providers/AzureFoundryProvider';

// ── Model Registry ──────────────────────────────────────────────────

const MODELS: Record<string, ModelConfig> = {
    'o4-mini': {
        provider: 'azure-openai',
        deploymentId: 'o4-mini',
        displayName: 'o4-mini (Reasoning)',
        contextWindow: 128_000,
        maxOutputTokens: 65_536,
        supportsVision: false,
        supportsJSON: true,
        timeoutMs: 60_000, // Increased for long summaries
        apiVersion: '2024-12-01-preview',
    },
    'phi-4-mini': {
        provider: 'azure-foundry',
        deploymentId: 'Phi-4-mini-instruct',
        displayName: 'Phi-4-mini-instruct',
        contextWindow: 128_000,
        maxOutputTokens: 4_096,
        supportsVision: false,
        supportsJSON: true,
        timeoutMs: 45_000, // Increased for long summaries
        apiVersion: '2024-05-01-preview',
    },
};

// ── Routing Table ───────────────────────────────────────────────────

interface RouteEntry {
    primary: string;
    fallback: string;
}

const ROUTE_TABLE: Record<AIMode, RouteEntry> = {
    standard: { primary: 'phi-4-mini', fallback: 'o4-mini' },
    deep: { primary: 'o4-mini', fallback: 'phi-4-mini' },
};

// ── Provider Instances ──────────────────────────────────────────────

const providers: Record<string, AIProvider> = {
    'azure-openai': new AzureOpenAIProvider(),
    'azure-foundry': new AzureFoundryProvider(),
};

// ── Router ──────────────────────────────────────────────────────────

export interface RouteResult {
    response: ProviderResponse;
    modelKey: string;
    fallbackTriggered: boolean;
}

/**
 * Route a request to the correct model with automatic fallback.
 */
export async function routeRequest(
    messages: ChatMessage[],
    _plan: UserPlan,
    mode: AIMode,
    maxOutputTokens: number
): Promise<RouteResult> {
    const route = ROUTE_TABLE[mode];
    if (!route) {
        throw new AIError('AI_PLAN_VIOLATION', `Unknown AI mode: ${mode}`);
    }

    // Try primary model
    const primaryResult = await tryModel(route.primary, messages, maxOutputTokens);
    if (primaryResult) {
        return { response: primaryResult, modelKey: route.primary, fallbackTriggered: false };
    }

    // Primary failed → try fallback
    console.log(`[ModelRouter] Primary model "${route.primary}" failed. Trying fallback "${route.fallback}"...`);
    const fallbackResult = await tryModel(route.fallback, messages, maxOutputTokens);
    if (fallbackResult) {
        return { response: fallbackResult, modelKey: route.fallback, fallbackTriggered: true };
    }

    // Both failed
    throw new AIError('AI_PROVIDER_ERROR', 'All AI models are currently unavailable. Please try again later.');
}

/**
 * Attempt to call a model with timeout and circuit breaker checks.
 * Returns null on failure (for fallback), throws only on unrecoverable errors.
 */
async function tryModel(
    modelKey: string,
    messages: ChatMessage[],
    maxOutputTokens: number
): Promise<ProviderResponse | null> {
    const config = MODELS[modelKey];
    if (!config) {
        console.error(`[ModelRouter] Unknown model key: ${modelKey}`);
        return null;
    }

    // Circuit breaker check
    if (!isProviderAvailable(config.provider)) {
        console.log(`[ModelRouter] Circuit OPEN for "${config.provider}", skipping "${modelKey}".`);
        return null;
    }

    const provider = providers[config.provider];
    if (!provider) {
        console.error(`[ModelRouter] No provider instance for "${config.provider}"`);
        return null;
    }

    // Timeout via AbortController
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), config.timeoutMs);

    try {
        // Cap output tokens to model's maximum
        const cappedOutput = Math.min(maxOutputTokens, config.maxOutputTokens);
        const response = await provider.call(messages, config, cappedOutput, controller.signal);
        recordSuccess(config.provider);
        return response;
    } catch (err: unknown) {
        clearTimeout(timeout);

        if (err instanceof DOMException && err.name === 'AbortError') {
            console.error(`[ModelRouter] "${modelKey}" timed out after ${config.timeoutMs}ms.`);
            recordFailure(config.provider);
            return null;
        }

        if (err instanceof AIError) {
            console.error(`[ModelRouter] "${modelKey}" AIError:`, err.code, err.message);
            recordFailure(config.provider);
            return null;
        }

        console.error(`[ModelRouter] "${modelKey}" unexpected error:`, err);
        recordFailure(config.provider);
        return null;
    } finally {
        clearTimeout(timeout);
    }
}

/** Get model config for display/logging */
export function getModelConfig(modelKey: string): ModelConfig | undefined {
    return MODELS[modelKey];
}
