/**
 * Structured error system for FileSwiftAI.
 * Every AI error is typed, user-safe, and includes a retryable flag.
 */

export type AIErrorCode =
    | 'AI_TIMEOUT'
    | 'AI_RATE_LIMITED'
    | 'AI_TOKEN_OVERFLOW'
    | 'AI_PROVIDER_ERROR'
    | 'AI_OCR_FAILED'
    | 'AI_CIRCUIT_OPEN'
    | 'AI_INVALID_INPUT'
    | 'AI_RESPONSE_INVALID'
    | 'AI_PLAN_VIOLATION'
    | 'AI_CONCURRENCY_LIMIT';

const ERROR_MESSAGES: Record<AIErrorCode, { message: string; retryable: boolean }> = {
    AI_TIMEOUT: {
        message: 'Processing took longer than expected. Please try again.',
        retryable: true,
    },
    AI_RATE_LIMITED: {
        message: 'You have reached your daily request limit. Please try again later.',
        retryable: false,
    },
    AI_TOKEN_OVERFLOW: {
        message: 'The document is too large to process. Please upload a shorter document.',
        retryable: false,
    },
    AI_PROVIDER_ERROR: {
        message: 'AI service is temporarily unavailable. Please try again in a moment.',
        retryable: true,
    },
    AI_OCR_FAILED: {
        message: 'Unable to extract text from this document. Please try a different file.',
        retryable: false,
    },
    AI_CIRCUIT_OPEN: {
        message: 'AI service is experiencing issues. Switching to backup. Please retry.',
        retryable: true,
    },
    AI_INVALID_INPUT: {
        message: 'Please provide a prompt or upload a file.',
        retryable: false,
    },
    AI_RESPONSE_INVALID: {
        message: 'AI generated an unexpected response. Please try again.',
        retryable: true,
    },
    AI_PLAN_VIOLATION: {
        message: 'This feature is not available on your current plan.',
        retryable: false,
    },
    AI_CONCURRENCY_LIMIT: {
        message: 'You have too many requests in progress. Please wait for them to complete.',
        retryable: true,
    },
};

export class AIError extends Error {
    public readonly code: AIErrorCode;
    public readonly retryable: boolean;
    public readonly statusCode: number;

    constructor(code: AIErrorCode, overrideMessage?: string) {
        const defaults = ERROR_MESSAGES[code];
        super(overrideMessage || defaults.message);
        this.name = 'AIError';
        this.code = code;
        this.retryable = defaults.retryable;
        this.statusCode = AIError.codeToStatus(code);
    }

    private static codeToStatus(code: AIErrorCode): number {
        switch (code) {
            case 'AI_RATE_LIMITED':
            case 'AI_CONCURRENCY_LIMIT':
                return 429;
            case 'AI_INVALID_INPUT':
            case 'AI_TOKEN_OVERFLOW':
            case 'AI_PLAN_VIOLATION':
                return 400;
            case 'AI_TIMEOUT':
            case 'AI_PROVIDER_ERROR':
            case 'AI_CIRCUIT_OPEN':
                return 502;
            case 'AI_OCR_FAILED':
            case 'AI_RESPONSE_INVALID':
                return 500;
            default:
                return 500;
        }
    }

    /** Safe JSON for frontend consumption — never leaks internals */
    toJSON() {
        return {
            code: this.code,
            message: this.message,
            retryable: this.retryable,
        };
    }
}
