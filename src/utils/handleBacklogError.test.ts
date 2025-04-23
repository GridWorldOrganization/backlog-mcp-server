import { handleBacklogError } from "./handleBacklogError.js";
import { describe, it, expect } from '@jest/globals'; 

describe("handleBacklogError", () => {
  it("returns correct message for BacklogAuthError", () => {
    const error = {
      _name: "BacklogAuthError",
      _status: 401,
      _url: "https://example.backlog.com/api/v2/projects",
      _body: {
        errors: [{ message: "Authentication failed" }]
      }
    };

    const result = handleBacklogError(error);

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain("Authentication failed");
    expect(result.content[0].text).toContain("401");
  });

  it("returns correct message for BacklogApiError", () => {
    const error = {
      _name: "BacklogApiError",
      _status: 400,
      _url: "https://example.backlog.com/api/v2/projects",
      _body: {
        errors: [{ message: "Invalid parameters", code: 7 }]
      }
    };

    const result = handleBacklogError(error);

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain("Backlog API error");
    expect(result.content[0].text).toContain("code: 7");
    expect(result.content[0].text).toContain("Invalid parameters");
  });

  it("returns correct message for UnexpectedError", () => {
    const error = {
      _name: "UnexpectedError",
      _status: 500,
      _url: "https://example.backlog.com/api/v2/projects",
      _body: {}
    };

    const result = handleBacklogError(error);

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain("Unexpected error");
    expect(result.content[0].text).toContain("500");
  });

  it("falls back to generic message when error object is unrecognized", () => {
    const error = { foo: "bar" };

    const result = handleBacklogError(error);

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain("Unknown error");
  });

  it("falls back to error.message when available", () => {
    const error = new Error("This is a standard error");

    const result = handleBacklogError(error);

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain("This is a standard error");
  });
});
