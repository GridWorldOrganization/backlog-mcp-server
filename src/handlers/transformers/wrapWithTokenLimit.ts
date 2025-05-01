import { SafeResult } from "../../types/result.js";
import { contentStreamingWithTokenLimit } from "../../utils/contentStreamingWithTokenLimit.js";

export function wrapWithTokenLimit<I, O>(
  fn: (input: I) => Promise<SafeResult<O>>,
  maxTokens: number
): (input: I) => Promise<SafeResult<string>> {
  return async (input: I) => {
    const result = await fn(input);
    if ( result == null || typeof result !== 'object' || result.kind == "error") {
      return result
    }

    // Determines an appropriate chunk size based on the max token limit.
    // Ensures the stream isn't broken into too many tiny chunks (performance cost),
    // while keeping each chunk small enough to respect the token cap.
    // - Minimum chunk size: 32 tokens (to avoid excessive fragmentation)
    // - Maximum chunk size: 512 tokens (to avoid large memory spikes)
    const chunk = Math.max(32, Math.min(512, Math.floor(maxTokens / 4)));
    const generator = streamJsonProperties(result.data as object, chunk);

    const limitedStream = contentStreamingWithTokenLimit(generator, {
      maxTokens: maxTokens
    });

    const contentChunks = [];
    for await (const chunk of limitedStream) {
      contentChunks.push(chunk);
    }

    return {
      kind: "ok",
      data: contentChunks.join("")
    }
  }
}

export async function* streamJsonProperties<T extends object>(obj: T, chunkSize: number = 500): AsyncGenerator<string> {
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string' && value.length > chunkSize) {
      // Split long strings into smaller chunks
      yield `"${key}": "`;
      for (let i = 0; i < value.length; i += chunkSize) {
        yield value.slice(i, i + chunkSize);
      }
      yield `",`;
    } else if (Array.isArray(value)) {
      yield `"${key}": [`;
      for (const item of value) {
        yield `  ${JSON.stringify(item)},`;
      }
      yield `]`;
    } else if (typeof value === 'object' && value !== null) {
      yield `"${key}": {`;
      for await (const nested of streamJsonProperties(value, chunkSize)) {
        yield `  ${nested}`;
      }
      yield `}`;
    } else {
      // Primitive values
      yield `"${key}": ${JSON.stringify(value)},`;
    }
  }
}

