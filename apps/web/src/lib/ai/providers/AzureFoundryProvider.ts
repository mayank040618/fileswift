import { AIProvider, ChatMessage, ModelConfig, ProviderResponse } from '../types';

export class AzureFoundryProvider implements AIProvider {
    async call(
        messages: ChatMessage[],
        config: ModelConfig,
        maxTokens: number,
        signal?: AbortSignal
    ): Promise<ProviderResponse> {
        // Azure Foundry usually has a different endpoint pattern or uses the same OpenAI-compatible one
        // For this project, we'll assume it follows the standard Header-based API Key approach
        const endpoint = process.env.AZURE_OPENAI_ENDPOINT; // Reusing endpoint or should have specific if different
        const apiKey = process.env.AZURE_AI_KEY;

        if (!endpoint || !apiKey) {
            throw new Error('Azure credentials missing');
        }

        const url = `${endpoint}/openai/deployments/${config.deploymentId}/chat/completions?api-version=${config.apiVersion}`;

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'api-key': apiKey,
            },
            body: JSON.stringify({
                messages,
                max_tokens: maxTokens,
                temperature: 0.1, // Lower temp for Foundry models (Phi-4) usually better for extraction
            }),
            signal,
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(`Azure Foundry error: ${response.status} - ${error.error?.message || response.statusText}`);
        }

        const data = await response.json();
        const content = data.choices[0]?.message?.content || '';
        const usage = data.usage || { prompt_tokens: 0, completion_tokens: 0 };

        return {
            content,
            tokensInput: usage.prompt_tokens,
            tokensOutput: usage.completion_tokens,
            model: data.model || config.deploymentId,
        };
    }
}
