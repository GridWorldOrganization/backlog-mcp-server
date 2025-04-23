import { withErrorHandling } from "./withErrorHandling.js";
import { handleBacklogError } from "./handleBacklogError.js";
import { beforeEach, jest, describe, it, expect } from '@jest/globals'; 

// jest.mock("../handleBacklogError.js");

describe("withErrorHandling", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns formatted JSON when fn resolves with an object", async () => {
    const result = await withErrorHandling(() => Promise.resolve({ message: "Hello" }));

    expect(result.content).toHaveLength(1);
    expect(result.content[0].type).toBe("text");
    expect(result.content[0].text).toContain('"message": "Hello"');
    expect(result.isError).toBeUndefined();
  });

  it("returns plain string when fn resolves with a string", async () => {
    const result = await withErrorHandling(() => Promise.resolve("plain text"));

    expect(result.content).toHaveLength(1);
    expect(result.content[0].type).toBe("text");
    expect(result.content[0].text).toBe("plain text");
    expect(result.isError).toBeUndefined();
  });

  it("delegates error to handleBacklogError when fn rejects", async () => {
    const fakeError = new Error("Boom");
    const mockedResponse = {
      isError: true,
      content: [{ type: "text", text: "Unknown error: Boom" }]
    };

    const result = await withErrorHandling(() => Promise.reject(fakeError));

    expect(result).toEqual(mockedResponse);
  });
});
