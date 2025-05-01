import { isErrorLike, SafeResult } from "../../types/result.js";
import { wrapWithTokenLimit } from "./wrapWithTokenLimit.js";
import { describe, it, expect } from '@jest/globals'; 

describe("wrapWithTokenLimit", () => {
  const baseData = {
    id: 1,
    name: "A ".repeat(1000), 
    tags: ["alpha", "beta"]
  };

  const successFn = async () => ({
    kind: "ok",
    data: baseData,
  }) satisfies SafeResult<typeof baseData>;

  it("limits token output according to maxTokens", async () => {
    const wrapped = wrapWithTokenLimit(successFn, 50);
    const result = await wrapped({});

    expect(result.kind).toBe("ok");
    if(!isErrorLike(result)) {
        expect(result.data.length).toBeLessThanOrEqual(200); 
        expect(result.data).toMatch(/output truncated|name/i);
    }
  });

  it("passes through error result without change", async () => {
    const errorFn = async () => ({
      kind: "error",
      message: "Something went wrong"
    }) satisfies SafeResult<unknown>;

    const wrapped = wrapWithTokenLimit(errorFn, 100);
    const result = await wrapped({});

    expect(result).toEqual({
      kind: "error",
      message: "Something went wrong"
    });
  });
  it("limits output for deeply nested objects", async () => {
    const nestedData = {
      id: 1,
      profile: {
        bio: "B ".repeat(800),
        social: {
          twitter: "@user123",
          github: "@dev456"
        }
      },
      status: "active"
    };
  
    const nestedFn = async () => ({
      kind: "ok",
      data: nestedData
    }) satisfies SafeResult<typeof nestedData>;
  
    const wrapped = wrapWithTokenLimit(nestedFn, 60);
    const result = await wrapped({});
  
    expect(result.kind).toBe("ok");
    if (!isErrorLike(result)) {
      expect(result.data.length).toBeLessThanOrEqual(300);
      expect(result.data).toMatch(/output truncated|bio|profile/i); 
    }
  });
  it("limits output when data includes arrays", async () => {
    const arrayData = {
      title: "Array Test",
      items: Array.from({ length: 50 }, (_, i) => ({
        id: i + 1,
        name: `Item ${i + 1}`,
        description: "こんにちは".repeat(100) 
      }))
    };
  
    const arrayFn = async () => ({
      kind: "ok",
      data: arrayData
    }) satisfies SafeResult<typeof arrayData>;
  
    const wrapped = wrapWithTokenLimit(arrayFn, 100); 
    const result = await wrapped({});
  
    expect(result.kind).toBe("ok");
    if (!isErrorLike(result)) {
      expect(typeof result.data).toBe("string");
      expect(result.data.length).toBeLessThanOrEqual(500); // Approximate string length
      expect(result.data).toMatch(/output truncated|items/); // Truncation message or partial content
      expect(result.data).not.toMatch(/Item 50/); // Ensure it was cut before the last item
    }
  });
});
