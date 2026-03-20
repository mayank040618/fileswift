/**
 * AIOrchestrator — The single entry point for ALL AI operations in FileSwiftAI.
 *
 * Pipeline:
 *   1. Rate limit check          → RateLimiter
 *   2. Plan enforcement           → types (PLAN_LIMITS)
 *   3. File extraction + OCR      → extractText
 *   4. Token budget enforcement   → TokenBudget
 *   5. Model routing + fallback   → ModelRouter (with CircuitBreaker)
 *   6. Response processing        → ResponseProcessor
 *   7. Execution logging          → Logger
 *   8. Return structured AIResponse
 *
 * NO API route should call model providers directly.
 * ALL AI MUST pass through this orchestrator.
 */

import type { AIRequest, AIResponse, ChatMessage, ExecutionLog } from './types';
import { PLAN_LIMITS } from './types';
import { AIError } from './errors';
import { acquireSlot, releaseSlot } from './RateLimiter';
import { enforceTokenBudget, validateInputSize } from './TokenBudget';
import { routeRequest } from './ModelRouter';
import { processResponse } from './ResponseProcessor';
import { logExecution, createTimer } from './Logger';
import { extractTextFromFiles, type ExtractedFile } from '../extractText';
import { runOCR } from '../files/runOCR';

// ── Default System Prompt ───────────────────────────────────────────

const DEFAULT_SYSTEM_PROMPT = `You are FileSwiftAI — a powerful AI assistant that processes files and user prompts.

Rules:
- If a file is attached, understand its content thoroughly before responding.
- Follow user instructions precisely.
- Output structured, clean results.
- Do NOT hallucinate data that is not present in the file.
- If no file is provided, respond as a helpful general AI assistant.
- Use markdown formatting for clarity when helpful.
- Be concise but thorough.`;

// ── Orchestrator ────────────────────────────────────────────────────

export async function executeAI(request: AIRequest): Promise<AIResponse> {
    const timer = createTimer();
    const limits = PLAN_LIMITS[request.plan];
    let ocrUsed = false;
    let fallbackTriggered = false;
    let modelUsed = '';
    let tokensIn = 0;
    let tokensOut = 0;

    // Validate mode against plan
    if (!limits.allowedModes.includes(request.mode)) {
        throw new AIError(
            'AI_PLAN_VIOLATION',
            `${request.mode} mode is not available on the ${request.plan} plan.`
        );
    }

    // Validate input exists
    if (!request.prompt?.trim() && (!request.files || request.files.length === 0)) {
        throw new AIError('AI_INVALID_INPUT');
    }

    // ── 1. Rate Limit ───────────────────────────────────────────────
    await acquireSlot(request.userId, limits);


    try {
        // ── 2. File Extraction + OCR Fallback ───────────────────────
        let fileContext = '';
        if (request.files && request.files.length > 0) {
            // Enforce file count limit
            if (request.files.length > limits.maxFiles) {
                throw new AIError(
                    'AI_PLAN_VIOLATION',
                    `Maximum ${limits.maxFiles} files allowed on the ${request.plan} plan.`
                );
            }

            const extracted = await extractTextFromFiles(request.files);

            // OCR fallback for files with little/no text
            for (let i = 0; i < request.files.length; i++) {
                const f = request.files[i];
                let text = extracted[i].extractedText;

                if (!text || text.trim().length <= 100 || text.includes('[PDF text extraction returned empty')) {
                    try {
                        const ocrText = await runOCR({ ...f, size: f.base64?.length });
                        if (ocrText && ocrText.trim()) {
                            text = ocrText;
                            extracted[i].extractedText = text;
                            ocrUsed = true;
                        }
                    } catch {
                        // Swallow OCR errors — never expose to user
                        console.warn(`[Orchestrator] OCR fallback failed for ${f.name}`);
                    }
                }
            }

            fileContext = extracted
                .map((f: ExtractedFile) => `--- File: ${f.fileName} (${f.type}) ---\n${f.extractedText}`)
                .join('\n\n');
        }

        // ── 3. Build Messages ───────────────────────────────────────
        const systemPrompt = request.systemPrompt || DEFAULT_SYSTEM_PROMPT;

        let userMessage = '';
        if (fileContext) {
            userMessage += `[ATTACHED FILES]\n${fileContext}\n\n[USER INSTRUCTION]\n`;
        }
        userMessage += request.prompt?.trim() || 'Please analyze the attached file(s) and provide a summary.';

        // ── 4. Token Budget Enforcement ─────────────────────────────
        validateInputSize(userMessage, limits);
        const budgetResult = enforceTokenBudget(userMessage, limits);
        userMessage = budgetResult.text;

        const messages: ChatMessage[] = [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userMessage },
        ];

        // ── 5. Route to Model ───────────────────────────────────────
        const routeResult = await routeRequest(
            messages,
            request.plan,
            request.mode,
            limits.maxOutputTokens
        );

        modelUsed = routeResult.modelKey;
        fallbackTriggered = routeResult.fallbackTriggered;
        tokensIn = routeResult.response.tokensInput;
        tokensOut = routeResult.response.tokensOutput;

        // ── 6. Process Response ─────────────────────────────────────
        const cleanOutput = processResponse(routeResult.response.content);

        // ── 7. Log Execution ────────────────────────────────────────
        const executionLog: ExecutionLog = {
            timestamp: new Date().toISOString(),
            userId: request.userId,
            plan: request.plan,
            mode: request.mode,
            toolType: 'ai-execute',
            modelUsed,
            tokensInput: tokensIn,
            tokensOutput: tokensOut,
            ocrUsed,
            latencyMs: timer.elapsed(),
            success: true,
            fallbackTriggered,
        };
        logExecution(executionLog);

        // ── 8. Return ───────────────────────────────────────────────
        return {
            success: true,
            output: cleanOutput,
            metadata: {
                modelUsed,
                tokensInput: tokensIn,
                tokensOutput: tokensOut,
                latencyMs: timer.elapsed(),
                ocrUsed,
                fallbackTriggered,
                trimmedInput: budgetResult.trimmed,
            },
        };
    } catch (err: any) {
        // Log failure
        const errorMsg = err.message || 'Unknown AI error';
        console.error(`[AIOrchestrator] Execution failed: ${errorMsg}`, err);

        const executionLog: ExecutionLog = {
            timestamp: new Date().toISOString(),
            userId: request.userId,
            plan: request.plan,
            mode: request.mode,
            toolType: 'ai-execute',
            modelUsed: modelUsed || 'none',
            tokensInput: tokensIn,
            tokensOutput: tokensOut,
            ocrUsed,
            latencyMs: timer.elapsed(),
            success: false,
            fallbackTriggered,
            errorCode: err instanceof AIError ? err.code : 'UNKNOWN',
        };
        logExecution(executionLog);

        // Re-throw AIError as-is, wrap unknown errors
        if (err instanceof AIError) {
            throw err;
        }

        throw new AIError('AI_PROVIDER_ERROR', errorMsg);
    } finally {
        // Always release the concurrency slot
        releaseSlot(request.userId);
    }
}
