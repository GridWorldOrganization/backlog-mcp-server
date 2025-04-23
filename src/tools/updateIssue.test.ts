import { updateIssueTool } from "./updateIssue.js";
import { jest, describe, it, expect } from '@jest/globals'; 
import type { Backlog } from "backlog-js";
import { createTranslationHelper } from "../createTranslationHelper.js";

describe("updateIssueTool", () => {
  const mockBacklog: Partial<Backlog> = {
    patchIssue: jest.fn<() => Promise<any>>().mockResolvedValue({
      id: 1,
      projectId: 100,
      issueKey: "TEST-1",
      keyId: 1,
      issueType: {
        id: 2,
        projectId: 100,
        name: "Bug",
        color: "#990000",
        displayOrder: 0
      },
      summary: "Updated Issue",
      description: "This is an updated issue",
      priority: {
        id: 2,
        name: "High"
      },
      status: {
        id: 2,
        name: "In Progress",
        projectId: 100,
        color: "#ff9900",
        displayOrder: 1
      },
      assignee: {
        id: 5,
        userId: "user",
        name: "Test User",
        roleType: 1,
        lang: "en",
        mailAddress: "test@example.com",
        lastLoginTime: "2023-01-01T00:00:00Z"
      },
      startDate: "2023-01-01",
      dueDate: "2023-01-31",
      estimatedHours: 15,
      actualHours: 8,
      createdUser: {
        id: 1,
        userId: "admin",
        name: "Admin User",
        roleType: 1,
        lang: "en",
        mailAddress: "admin@example.com",
        lastLoginTime: "2023-01-01T00:00:00Z"
      },
      created: "2023-01-01T00:00:00Z",
      updatedUser: {
        id: 1,
        userId: "admin",
        name: "Admin User",
        roleType: 1,
        lang: "en",
        mailAddress: "admin@example.com",
        lastLoginTime: "2023-01-01T00:00:00Z"
      },
      updated: "2023-01-02T00:00:00Z"
    })
  };

  const mockTranslationHelper = createTranslationHelper();
  const tool = updateIssueTool(mockBacklog as Backlog, mockTranslationHelper);

  it("returns updated issue as formatted JSON text", async () => {
    const result = await tool.handler({
      issueIdOrKey: "TEST-1",
      summary: "Updated Issue",
      description: "This is an updated issue"
    });

    expect(result.content).toHaveLength(1);
    expect(result.content[0].type).toBe("text");
    expect(result.content[0].text).toContain("Updated Issue");
    expect(result.content[0].text).toContain("This is an updated issue");
  });

  it("calls backlog.patchIssue with correct params when using issue key", async () => {
    await tool.handler({
      issueIdOrKey: "TEST-1",
      summary: "Updated Issue",
      priorityId: 2,
      statusId: 2
    });
    
    expect(mockBacklog.patchIssue).toHaveBeenCalledWith("TEST-1", {
      summary: "Updated Issue",
      priorityId: 2,
      statusId: 2
    });
  });

  it("calls backlog.patchIssue with correct params when using issue ID", async () => {
    await tool.handler({
      issueIdOrKey: 1,
      estimatedHours: 15,
      actualHours: 8,
      comment: "Updated the estimated and actual hours"
    });
    
    expect(mockBacklog.patchIssue).toHaveBeenCalledWith(1, {
      estimatedHours: 15,
      actualHours: 8,
      comment: "Updated the estimated and actual hours"
    });
  });

  it("returns an error result when the API fails", async () => {
    const tool = updateIssueTool({
      patchIssue: () => Promise.reject(new Error("simulated error"))
    } as unknown as Backlog, mockTranslationHelper);

    const result = await tool.handler({} as any);
  
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain("simulated error");
  });
});
