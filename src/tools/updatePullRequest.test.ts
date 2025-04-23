import { updatePullRequestTool } from "./updatePullRequest.js";
import { jest, describe, it, expect } from '@jest/globals'; 
import type { Backlog } from "backlog-js";
import { createTranslationHelper } from "../createTranslationHelper.js";

describe("updatePullRequestTool", () => {
  const mockBacklog: Partial<Backlog> = {
    patchPullRequest: jest.fn<() => Promise<any>>().mockResolvedValue({
      id: 1,
      projectId: 100,
      repositoryId: 200,
      number: 1,
      summary: "Updated PR title",
      description: "Updated PR description",
      base: "main",
      branch: "fix/login-bug",
      status: {
        id: 2,
        name: "Closed"
      },
      assignee: {
        id: 2,
        userId: "user2",
        name: "User Two"
      },
      issue: {
        id: 1001,
        issueKey: "TEST-2",
        summary: "Another issue"
      },
      baseCommit: "abc123",
      branchCommit: "def456",
      closeAt: "2023-01-02T00:00:00Z",
      mergeAt: "2023-01-02T00:00:00Z",
      createdUser: {
        id: 1,
        userId: "user1",
        name: "User One"
      },
      created: "2023-01-01T00:00:00Z",
      updatedUser: {
        id: 2,
        userId: "user2",
        name: "User Two"
      },
      updated: "2023-01-02T00:00:00Z"
    })
  };

  const mockTranslationHelper = createTranslationHelper();
  const tool = updatePullRequestTool(mockBacklog as Backlog, mockTranslationHelper);

  it("returns updated pull request as formatted JSON text", async () => {
    const result = await tool.handler({
      projectIdOrKey: "TEST",
      repoIdOrName: "test-repo",
      number: 1,
      summary: "Updated PR title",
      description: "Updated PR description",
      statusId: 2
    });

    expect(result.content).toHaveLength(1);
    expect(result.content[0].type).toBe("text");
    expect(result.content[0].text).toContain("Updated PR title");
    expect(result.content[0].text).toContain("Updated PR description");
    expect(result.content[0].text).toContain("Closed");
  });

  it("calls backlog.patchPullRequest with correct params", async () => {
    const params = {
      projectIdOrKey: "TEST",
      repoIdOrName: "test-repo",
      number: 1,
      summary: "Updated PR title",
      description: "Updated PR description",
      issueId: 1001,
      assigneeId: 2,
      statusId: 2
    };
    
    await tool.handler(params);
    
    expect(mockBacklog.patchPullRequest).toHaveBeenCalledWith("TEST", "test-repo", 1, {
      summary: "Updated PR title",
      description: "Updated PR description",
      issueId: 1001,
      assigneeId: 2,
      statusId: 2
    });
  });

  it("returns an error result when the API fails", async () => {
    const tool = updatePullRequestTool({
      patchPullRequest: () => Promise.reject(new Error("simulated error"))
    } as unknown as Backlog, mockTranslationHelper);

    const result = await tool.handler({} as any);
  
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain("simulated error");
  });
});
