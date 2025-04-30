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

  it("returns pull requests count", async () => {
    const result = await tool.handler({
      projectIdOrKey: "TEST",
      repoIdOrName: "test-repo"
    });

    expect(result).toHaveProperty("count", 42);
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
});
