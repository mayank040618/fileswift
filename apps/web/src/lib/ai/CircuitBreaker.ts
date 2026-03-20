/**
 * Circuit Breaker pattern for AI model providers.
 * Prevents cascading failures by temporarily disabling failing providers.
 *
 * States:
 *   CLOSED  → Normal operation, requests pass through
 *   OPEN    → Provider disabled, requests are rejected immediately
 *   HALF    → After cooldown, allows one probe request to test recovery
 */

import type { ProviderName } from './types';

interface CircuitState {
    failures: number;
    lastFailureAt: number;
    state: 'CLOSED' | 'OPEN' | 'HALF_OPEN';
    openedAt: number;
}

const FAILURE_THRESHOLD = 5;
const FAILURE_WINDOW_MS = 60_000;   // 60 seconds
const COOLDOWN_MS = 120_000;        // 2 minutes before half-open

const circuits = new Map<ProviderName, CircuitState>();

function getCircuit(provider: ProviderName): CircuitState {
    if (!circuits.has(provider)) {
        circuits.set(provider, {
            failures: 0,
            lastFailureAt: 0,
            state: 'CLOSED',
            openedAt: 0,
        });
    }
    return circuits.get(provider)!;
}

/** Check if a provider is available for requests */
export function isProviderAvailable(provider: ProviderName): boolean {
    const circuit = getCircuit(provider);
    const now = Date.now();

    if (circuit.state === 'CLOSED') {
        return true;
    }

    if (circuit.state === 'OPEN') {
        // Check if cooldown has elapsed → transition to HALF_OPEN
        if (now - circuit.openedAt >= COOLDOWN_MS) {
            circuit.state = 'HALF_OPEN';
            console.log(`[CircuitBreaker] ${provider}: OPEN → HALF_OPEN (cooldown elapsed)`);
            return true; // Allow one probe request
        }
        return false;
    }

    // HALF_OPEN: allow the probe
    return true;
}

/** Record a successful call — resets the circuit */
export function recordSuccess(provider: ProviderName): void {
    const circuit = getCircuit(provider);
    if (circuit.state !== 'CLOSED') {
        console.log(`[CircuitBreaker] ${provider}: ${circuit.state} → CLOSED (success)`);
    }
    circuit.failures = 0;
    circuit.state = 'CLOSED';
    circuit.lastFailureAt = 0;
    circuit.openedAt = 0;
}

/** Record a failed call — may trip the circuit open */
export function recordFailure(provider: ProviderName): void {
    const circuit = getCircuit(provider);
    const now = Date.now();

    // If in HALF_OPEN and the probe failed, go straight back to OPEN
    if (circuit.state === 'HALF_OPEN') {
        circuit.state = 'OPEN';
        circuit.openedAt = now;
        console.log(`[CircuitBreaker] ${provider}: HALF_OPEN → OPEN (probe failed)`);
        return;
    }

    // Reset failure count if outside the window
    if (now - circuit.lastFailureAt > FAILURE_WINDOW_MS) {
        circuit.failures = 0;
    }

    circuit.failures++;
    circuit.lastFailureAt = now;

    if (circuit.failures >= FAILURE_THRESHOLD) {
        circuit.state = 'OPEN';
        circuit.openedAt = now;
        console.log(
            `[CircuitBreaker] ${provider}: CLOSED → OPEN (${circuit.failures} failures in ${FAILURE_WINDOW_MS / 1000}s)`
        );
    }
}

/** Get current circuit state (for logging/observability) */
export function getCircuitState(provider: ProviderName): string {
    return getCircuit(provider).state;
}
