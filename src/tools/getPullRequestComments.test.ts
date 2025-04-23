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

  it("returns pull request comments as formatted JSON text", async () => {
    const result = await tool.handler({
      projectIdOrKey: "TEST",
      repoIdOrName: "test-repo",
      number: 1
    });

    expect(result.content).toHaveLength(1);
    expect(result.content[0].type).toBe("text");
    expect(result.content[0].text).toContain("This looks good to me!");
    expect(result.content[0].text).toContain("I found a small issue in the code.");
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

  it("returns an error result when the API fails", async () => {
    const tool = getPullRequestCommentsTool({
      getPullRequestComments: () => Promise.reject(new Error("simulated error"))
    } as unknown as Backlog, mockTranslationHelper);

    const result = await tool.handler({} as any);
  
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain("simulated error");
  });
});
