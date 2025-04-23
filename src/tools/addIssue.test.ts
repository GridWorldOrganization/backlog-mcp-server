import { addIssueTool } from "./addIssue.js";
import { jest, describe, it, expect } from '@jest/globals'; 
import type { Backlog } from "backlog-js";
import { createTranslationHelper } from "../createTranslationHelper.js";

describe("addIssueTool", () => {
  const mockBacklog: Partial<Backlog> = {
    postIssue: jest.fn<() => Promise<any>>().mockResolvedValue({
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
      summary: "Test Issue",
      description: "This is a test issue",
      priority: {
        id: 3,
        name: "Normal"
      },
      status: {
        id: 1,
        name: "Open",
        projectId: 100,
        color: "#ff0000",
        displayOrder: 0
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
      estimatedHours: 10,
      actualHours: 5,
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
      updated: "2023-01-01T00:00:00Z"
    })
  };

  const mockTranslationHelper = createTranslationHelper();
  const tool = addIssueTool(mockBacklog as Backlog, mockTranslationHelper);

  it("returns created issue as formatted JSON text", async () => {
    const result = await tool.handler({
      projectId: 100,
      summary: "Test Issue",
      issueTypeId: 2,
      priorityId: 3,
      description: "This is a test issue",
      startDate: "2023-01-01",
      dueDate: "2023-01-31",
      estimatedHours: 10,
      actualHours: 5
    });

    expect(result.content).toHaveLength(1);
    expect(result.content[0].type).toBe("text");
    expect(result.content[0].text).toContain("Test Issue");
    expect(result.content[0].text).toContain("This is a test issue");
  });

  it("calls backlog.postIssue with correct params", async () => {
    await tool.handler({
      projectId: 100,
      summary: "Test Issue",
      issueTypeId: 2,
      priorityId: 3,
      description: "This is a test issue",
      startDate: "2023-01-01",
      dueDate: "2023-01-31",
      estimatedHours: 10,
      actualHours: 5
    });
    
    expect(mockBacklog.postIssue).toHaveBeenCalledWith({
      projectId: 100,
      summary: "Test Issue",
      issueTypeId: 2,
      priorityId: 3,
      description: "This is a test issue",
      startDate: "2023-01-01",
      dueDate: "2023-01-31",
      estimatedHours: 10,
      actualHours: 5
    });
  });

  it("returns an error result when the API fails", async () => {
    const tool = addIssueTool({
      postIssue: () => Promise.reject(new Error("simulated error"))
    } as unknown as Backlog, mockTranslationHelper);

    const result = await tool.handler({} as any);
  
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain("simulated error");
  });
});
