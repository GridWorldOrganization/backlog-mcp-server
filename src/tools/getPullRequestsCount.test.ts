import { getPullRequestsCountTool } from "./getPullRequestsCount.js";
import { jest, describe, it, expect } from '@jest/globals'; 
import type { Backlog } from "backlog-js";
import { createTranslationHelper } from "../createTranslationHelper.js";

describe("getPullRequestsCountTool", () => {
  const mockBacklog: Partial<Backlog> = {
    getPullRequestsCount: jest.fn<() => Promise<any>>().mockResolvedValue({
      count: 42
    })
  };

  const mockTranslationHelper = createTranslationHelper();
  const tool = getPullRequestsCountTool(mockBacklog as Backlog, mockTranslationHelper);

  it("returns pull requests count as formatted JSON text", async () => {
    const result = await tool.handler({
      projectIdOrKey: "TEST",
      repoIdOrName: "test-repo"
    });

    expect(result.content).toHaveLength(1);
    expect(result.content[0].type).toBe("text");
    expect(result.content[0].text).toContain("42");
  });

  it("calls backlog.getPullRequestsCount with correct params", async () => {
    const params = {
      projectIdOrKey: "TEST",
      repoIdOrName: "test-repo",
      statusId: [1, 2],
      assigneeId: [1]
    };
    
    await tool.handler(params);
    
    expect(mockBacklog.getPullRequestsCount).toHaveBeenCalledWith("TEST", "test-repo", {
      statusId: [1, 2],
      assigneeId: [1]
    });
  });

  it("returns an error result when the API fails", async () => {
    const tool = getPullRequestsCountTool({
      getPullRequestsCount: () => Promise.reject(new Error("simulated error"))
    } as unknown as Backlog, mockTranslationHelper);

    const result = await tool.handler({} as any);
  
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain("simulated error");
  });
});
