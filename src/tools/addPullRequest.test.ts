import { addPullRequestTool } from "./addPullRequest.js";
import { jest, describe, it, expect } from '@jest/globals'; 
import type { Backlog } from "backlog-js";
import { createTranslationHelper } from "../createTranslationHelper.js";

describe("addPullRequestTool", () => {
  const mockBacklog: Partial<Backlog> = {
    postPullRequest: jest.fn<() => Promise<any>>().mockResolvedValue({
      id: 1,
      projectId: 100,
      repositoryId: 200,
      number: 1,
      summary: "Fix bug in login",
      description: "This PR fixes a bug in the login process",
      base: "main",
      branch: "fix/login-bug",
      status: {
        id: 1,
        name: "Open"
      },
      assignee: {
        id: 1,
        userId: "user1",
        name: "User One"
      },
      issue: {
        id: 1000,
        issueKey: "TEST-1",
        summary: "Login bug"
      },
      baseCommit: "abc123",
      branchCommit: "def456",
      closeAt: null,
      mergeAt: null,
      createdUser: {
        id: 1,
        userId: "user1",
        name: "User One"
      },
      created: "2023-01-01T00:00:00Z",
      updatedUser: {
        id: 1,
        userId: "user1",
        name: "User One"
      },
      updated: "2023-01-01T00:00:00Z"
    })
  };

  const mockTranslationHelper = createTranslationHelper();
  const tool = addPullRequestTool(mockBacklog as Backlog, mockTranslationHelper);

  it("returns created pull request as formatted JSON text", async () => {
    const result = await tool.handler({
      projectIdOrKey: "TEST",
      repoIdOrName: "test-repo",
      summary: "Fix bug in login",
      description: "This PR fixes a bug in the login process",
      base: "main",
      branch: "fix/login-bug",
      issueId: 1000,
      assigneeId: 1
    });

    if (Array.isArray(result)) {
      throw new Error("Unexpected array result");
    }
    expect(result.summary).toEqual("Fix bug in login");
    expect(result.description).toEqual("This PR fixes a bug in the login process");
  });

  it("calls backlog.postPullRequest with correct params", async () => {
    const params = {
      projectIdOrKey: "TEST",
      repoIdOrName: "test-repo",
      summary: "Fix bug in login",
      description: "This PR fixes a bug in the login process",
      base: "main",
      branch: "fix/login-bug",
      issueId: 1000,
      assigneeId: 1,
      notifiedUserId: [2, 3]
    };
    
    await tool.handler(params);
    
    expect(mockBacklog.postPullRequest).toHaveBeenCalledWith("TEST", "test-repo", {
      summary: "Fix bug in login",
      description: "This PR fixes a bug in the login process",
      base: "main",
      branch: "fix/login-bug",
      issueId: 1000,
      assigneeId: 1,
      notifiedUserId: [2, 3]
    });
  });
});
