import { AIProvider, ChatMessage, ModelConfig, ProviderResponse } from '../types';

export class AzureOpenAIProvider implements AIProvider {
    async call(
        messages: ChatMessage[],
        config: ModelConfig,
        maxTokens: number,
        signal?: AbortSignal
    ): Promise<ProviderResponse> {
        const endpoint = process.env.AZURE_OPENAI_ENDPOINT;
        const apiKey = process.env.AZURE_AI_KEY;

        if (!endpoint || !apiKey) {
            throw new Error('Azure OpenAI credentials missing');
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
                max_completion_tokens: maxTokens,
                temperature: 0.7,
            }),
            signal,
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(`Azure OpenAI error: ${response.status} - ${error.error?.message || response.statusText}`);
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
