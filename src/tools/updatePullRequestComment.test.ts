import { updatePullRequestCommentTool } from "./updatePullRequestComment.js";
import { jest, describe, it, expect } from '@jest/globals'; 
import type { Backlog } from "backlog-js";
import { createTranslationHelper } from "../createTranslationHelper.js";

describe("updatePullRequestCommentTool", () => {
  const mockBacklog: Partial<Backlog> = {
    patchPullRequestComments: jest.fn<() => Promise<any>>().mockResolvedValue({
      id: 1,
      content: "Updated comment content",
      changeLog: [],
      createdUser: {
        id: 1,
        userId: "user1",
        name: "User One"
      },
      created: "2023-01-01T00:00:00Z",
      updated: "2023-01-02T00:00:00Z",
      stars: [],
      notifications: []
    })
  };

  const mockTranslationHelper = createTranslationHelper();
  const tool = updatePullRequestCommentTool(mockBacklog as Backlog, mockTranslationHelper);

  it("returns updated comment", async () => {
    const result = await tool.handler({
      projectIdOrKey: "TEST",
      repoIdOrName: "test-repo",
      number: 1,
      commentId: 1,
      content: "Updated comment content"
    });

    expect(result).toHaveProperty("content", "Updated comment content");
    expect(result).toHaveProperty("id", 1);
  });

  it("calls backlog.patchPullRequestComments with correct params", async () => {
    const params = {
      projectIdOrKey: "TEST",
      repoIdOrName: "test-repo",
      number: 1,
      commentId: 1,
      content: "Updated comment content"
    };
    
    await tool.handler(params);
    
    expect(mockBacklog.patchPullRequestComments).toHaveBeenCalledWith("TEST", "test-repo", 1, 1, {
      content: "Updated comment content"
    });
  });
});
