import { resolveIdOrKey } from "./resolveIdOrKey";
import { describe, it, expect } from '@jest/globals'; 

const t = (_key: string, fallback: string) => fallback;

describe("resolveIdOrKey", () => {
  it("resolves ID when provided", () => {
    const result = resolveIdOrKey("issue", { id: 123 }, t);
    expect(result).toEqual({ ok: true, value: 123 }); // Expect number
  });

  it("resolves key when ID is not provided", () => {
    const result = resolveIdOrKey("project", { key: "PRJ-001" }, t);
    expect(result).toEqual({ ok: true, value: "PRJ-001" });
  });

  it("returns error when neither ID nor key is provided", () => {
    const result = resolveIdOrKey("issueComment", {}, t);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.message).toBe("IssueComment ID or key is required");
    }
  });
});
