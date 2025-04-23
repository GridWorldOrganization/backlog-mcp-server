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

  it("returns updated comment as formatted JSON text", async () => {
    const result = await tool.handler({
      projectIdOrKey: "TEST",
      repoIdOrName: "test-repo",
      number: 1,
      commentId: 1,
      content: "Updated comment content"
    });

    expect(result.content).toHaveLength(1);
    expect(result.content[0].type).toBe("text");
    expect(result.content[0].text).toContain("Updated comment content");
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

  it("returns an error result when the API fails", async () => {
    const tool = updatePullRequestCommentTool({
      patchPullRequestComments: () => Promise.reject(new Error("simulated error"))
    } as unknown as Backlog, mockTranslationHelper);

    const result = await tool.handler({} as any);
  
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain("simulated error");
  });
});
