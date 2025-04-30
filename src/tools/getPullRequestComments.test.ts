import { getPullRequestCommentsTool } from "./getPullRequestComments.js";
import { jest, describe, it, expect } from '@jest/globals'; 
import type { Backlog } from "backlog-js";
import { createTranslationHelper } from "../createTranslationHelper.js";

describe("getPullRequestCommentsTool", () => {
  const mockBacklog: Partial<Backlog> = {
    getPullRequestComments: jest.fn<() => Promise<any>>().mockResolvedValue([
      {
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
      },
      {
        id: 2,
        content: "I found a small issue in the code.",
        changeLog: [],
        createdUser: {
          id: 2,
          userId: "user2",
          name: "User Two"
        },
        created: "2023-01-02T00:00:00Z",
        updated: "2023-01-02T00:00:00Z",
        stars: [],
        notifications: []
      }
    ])
  };

  const mockTranslationHelper = createTranslationHelper();
  const tool = getPullRequestCommentsTool(mockBacklog as Backlog, mockTranslationHelper);

  it("returns pull request comments", async () => {
    const result = await tool.handler({
      projectIdOrKey: "TEST",
      repoIdOrName: "test-repo",
      number: 1
    });

    if (!Array.isArray(result)) {
      throw new Error("Unexpected non array result");
    }
    expect(result).toHaveLength(2);
    expect(result[0]).toHaveProperty("content", "This looks good to me!");
    expect(result[1]).toHaveProperty("content", "I found a small issue in the code.");
  });

  it("calls backlog.getPullRequestComments with correct params", async () => {
    const params = {
      projectIdOrKey: "TEST",
      repoIdOrName: "test-repo",
      number: 1,
      minId: 100,
      maxId: 200,
      count: 20,
      order: "desc" as const
    };
    
    await tool.handler(params);
    
    expect(mockBacklog.getPullRequestComments).toHaveBeenCalledWith("TEST", "test-repo", 1, {
      minId: 100,
      maxId: 200,
      count: 20,
      order: "desc"
    });
  });
});
