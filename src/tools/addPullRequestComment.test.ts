import { addPullRequestCommentTool } from "./addPullRequestComment.js";
import { jest, describe, it, expect } from '@jest/globals'; 
import type { Backlog } from "backlog-js";
import { createTranslationHelper } from "../createTranslationHelper.js";

describe("addPullRequestCommentTool", () => {
  const mockBacklog: Partial<Backlog> = {
    postPullRequestComments: jest.fn<() => Promise<any>>().mockResolvedValue({
      id: 1,
      content: "This looks good to me!",
      changeLog: [],
      createdUser: {
        id: 1,
        userId: "user1",
        name: "User One"
      },
      created: "2023-01-01T00:00:00Z",
      updated: "2023-01-01T00:00:00Z",
      stars: [],
      notifications: []
    })
  };

  const mockTranslationHelper = createTranslationHelper();
  const tool = addPullRequestCommentTool(mockBacklog as Backlog, mockTranslationHelper);

  it("returns created comment as formatted JSON text", async () => {
    const result = await tool.handler({
      projectKey: "TEST",
      repoIdOrName: "test-repo",
      number: 1,
      content: "This looks good to me!"
    });

    if (Array.isArray(result)) {
      throw new Error("Unexpected array result");
    }
    expect(result.content).toContain("This looks good to me!");
  });

  it("calls backlog.postPullRequestComments with correct params", async () => {
    const params = {
      projectKey: "TEST",
      repoIdOrName: "test-repo",
      number: 1,
      content: "This looks good to me!",
      notifiedUserId: [2, 3]
    };
    
    await tool.handler(params);
    
    expect(mockBacklog.postPullRequestComments).toHaveBeenCalledWith("TEST", "test-repo", 1, {
      content: "This looks good to me!",
      notifiedUserId: [2, 3]
    });
  });

  it("calls backlog.postPullRequestComments with correct params when using projectId", async () => {
    const params = {
      projectId: 100, // Use projectId
      repoIdOrName: "test-repo",
      number: 1,
      content: "Comment via projectId"
    };
    
    await tool.handler(params);
    
    expect(mockBacklog.postPullRequestComments).toHaveBeenCalledWith(100, "test-repo", 1, { // Expect numeric ID
      content: "Comment via projectId",
      notifiedUserId: undefined 
    });
  });

  it("throws an error if neither projectId nor projectKey is provided", async () => {
    const params = {
      // projectId and projectKey are missing
      repoIdOrName: "test-repo",
      number: 1,
      content: "Test content"
    };
    
    await expect(tool.handler(params as any)).rejects.toThrow(Error);
  });
});
