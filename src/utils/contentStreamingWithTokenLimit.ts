import { countTokens } from './tokenCounter.js'; 

type ContentStreamingOptions = {
    maxTokens: number;
    truncatedMessage?: string;
};

export async function* contentStreamingWithTokenLimit(
    source: AsyncIterable<string>,
    options: ContentStreamingOptions
): AsyncGenerator<string, void, unknown> {
    let tokenCount = 0;
    const maxTokens = options.maxTokens;
    const truncatedMessage = options.truncatedMessage ?? '...(output truncated due to token limit)';

    for await (const piece of source) {
        const tokens = countTokens(piece);

        if (tokenCount + tokens > maxTokens) {
            // When it's ver maxTokens, it returns just the messages for trancation
            yield truncatedMessage
            return;
        }

        tokenCount += tokens;

        yield piece
    }
}
