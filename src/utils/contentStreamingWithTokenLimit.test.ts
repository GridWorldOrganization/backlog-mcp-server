import { contentStreamingWithTokenLimit } from "./contentStreamingWithTokenLimit.js";
import { jest, describe, it, expect } from '@jest/globals';

async function collect(generator: AsyncGenerator<string>): Promise<string[]> {
  const result: string[] = [];
  for await (const chunk of generator) {
    result.push(chunk);
  }
  return result;
}

describe("contentStreamingWithTokenLimit", () => {
  it("yields all strings under token limit", async () => {
    const source = async function* () {
      yield "Hello";
      yield "World";
    };

    const result = await collect(
      contentStreamingWithTokenLimit(source(), { maxTokens: 15 })
    );

    expect(result).toEqual(["Hello", "World"]);
  });

  it("truncates when token limit is exceeded", async () => {
    const source = async function* () {
      yield "Hello"; 
      yield "World";  
      yield "This is too long"; 
    };

    const result = await collect(
      contentStreamingWithTokenLimit(source(), { maxTokens: 2 })
    );

    expect(result).toEqual(["Hello", "World", "...(output truncated due to token limit)"]);
  });

  it("respects custom truncated message", async () => {
    const source = async function* () {
      yield "12345";
      yield "67890";
      yield "extra";
    };

    const result = await collect(
      contentStreamingWithTokenLimit(source(), {
        maxTokens: 2,
        truncatedMessage: "[truncated]",
      })
    );

    expect(result).toEqual(["12345", "67890", "[truncated]"]);
  });

  it("truncates exactly at limit", async () => {
    const source = async function* () {
      yield "12345"; // 5
      yield "67890"; // 5
    };

    const result = await collect(
      contentStreamingWithTokenLimit(source(), {
        maxTokens: 10,
      })
    );

    expect(result).toEqual(["12345", "67890"]);
  });

  it("skips yield if first chunk already exceeds", async () => {
    const source = async function* () {
      yield "This message is very very long"; 
    };

    const result = await collect(
      contentStreamingWithTokenLimit(source(), {
        maxTokens: 5,
      })
    );

    expect(result).toEqual(["...(output truncated due to token limit)"]);
  });
});
