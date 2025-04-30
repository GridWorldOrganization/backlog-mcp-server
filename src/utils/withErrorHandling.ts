import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { handleBacklogError } from "./handleBacklogError.js";

/**
 * Wraps an async function with standard MCP-compatible error handling.
 */
export async function withErrorHandling<T>(
  fn: () => Promise<T>
): Promise<CallToolResult> {
  try {
    const result = await fn();
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
  } catch (err: unknown) {
    return handleBacklogError(err);
  }
}

export function withErrorHandlingT<I, O>(
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
