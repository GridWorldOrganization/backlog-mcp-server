import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { handleBacklogError } from "./handleBacklogError.js";
import { contentStreamingWithTokenLimit } from "./contentStreamingWithTokenLimit.js";

/**
 * Wraps an async function with standard MCP-compatible error handling.
 */
// export async function withErrorHandling<T>(
//   fn: () => Promise<T>
// ): Promise<CallToolResult> {
//   try {
//     const result = await fn();
//     if (typeof result !== 'object' || result === null) {
//       throw new Error("Invalid result: expected an object.");
//     }
    
//     const generator = streamJsonProperties(result);

//     const limitedStream = contentStreamingWithTokenLimit(generator, {
//       maxTokens: 100
//     });

//     const contentChunks = [];
//     for await (const chunk of limitedStream) {
//       contentChunks.push(chunk);
//     }

//     return {
//       content: [
//         {
//           type: "text",
//           text: contentChunks.join(""),
//         }
//       ]
//     };
//   } catch (err: unknown) {
//     return handleBacklogError(err);
//   }
// }

// // <<<<<<< HEAD
export function withErrorHandling<I, O>(
  fn: (input: I) => Promise<O>
): (input: I) => Promise<CallToolResult> {
  return async (input: I) => {
    try {
      const result = await fn(input);
      return {
        content: [
          {
            type: "text",
            text: typeof result === "string"
              ? result
              : JSON.stringify(result, null, 2)
          }
        ]
      };
    } catch (err) {
      return handleBacklogError(err);
    }
  };
}
// =======
/**
 * Streams a JSON object's properties, splitting large string values into chunks.
 */
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

// >>>>>>> 652ef60 (chore(tools): Add limit response for the client that cannot use)
