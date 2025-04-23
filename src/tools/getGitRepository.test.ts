import { getGitRepositoryTool } from "./getGitRepository.js";
import { jest, describe, it, expect } from '@jest/globals'; 
import type { Backlog } from "backlog-js";
import { createTranslationHelper } from "../createTranslationHelper.js";

describe("getGitRepositoryTool", () => {
  const mockBacklog: Partial<Backlog> = {
    getGitRepository: jest.fn<() => Promise<any>>().mockResolvedValue({
      id: 1,
      projectId: 100,
      name: "test-repo",
      description: "Test repository",
      hookUrl: "https://example.com/hooks/test-repo",
      httpUrl: "https://example.com/git/test-repo.git",
      sshUrl: "git@example.com:test-repo.git",
      displayOrder: 0,
      pushedAt: "2023-01-01T00:00:00Z",
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
  const tool = getGitRepositoryTool(mockBacklog as Backlog, mockTranslationHelper);

  it("returns git repository information as formatted JSON text", async () => {
    const result = await tool.handler({
      projectIdOrKey: "TEST",
      repoIdOrName: "test-repo"
    });

    expect(result.content).toHaveLength(1);
    expect(result.content[0].type).toBe("text");
    expect(result.content[0].text).toContain("test-repo");
    expect(result.content[0].text).toContain("Test repository");
  });

  it("calls backlog.getGitRepository with correct params when using project key", async () => {
    await tool.handler({
      projectIdOrKey: "TEST",
      repoIdOrName: "test-repo"
    });
    
    expect(mockBacklog.getGitRepository).toHaveBeenCalledWith("TEST", "test-repo");
  });

  it("calls backlog.getGitRepository with correct params when using project ID", async () => {
    await tool.handler({
      projectIdOrKey: 100,
      repoIdOrName: "test-repo"
    });
    
    expect(mockBacklog.getGitRepository).toHaveBeenCalledWith(100, "test-repo");
  });

  it("returns an error result when the API fails", async () => {
    const tool = getGitRepositoryTool({
      getGitRepository: () => Promise.reject(new Error("simulated error"))
    } as unknown as Backlog, mockTranslationHelper);

    const result = await tool.handler({} as any);
  
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain("simulated error");
  });
});
