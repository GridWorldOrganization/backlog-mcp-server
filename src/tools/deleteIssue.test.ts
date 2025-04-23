import { deleteIssueTool } from "./deleteIssue.js";
import { jest, describe, it, expect } from '@jest/globals'; 
import type { Backlog } from "backlog-js";
import { createTranslationHelper } from "../createTranslationHelper.js";

describe("deleteIssueTool", () => {
  const mockBacklog: Partial<Backlog> = {
    deleteIssue: jest.fn<() => Promise<any>>().mockResolvedValue({
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
      status: {
        id: 1,
        name: "Open",
        projectId: 100,
        color: "#ff0000",
        displayOrder: 0
      },
      priority: {
        id: 3,
        name: "Normal"
      },
      created: "2023-01-01T00:00:00Z",
      updated: "2023-01-01T00:00:00Z"
    })
  };

  const mockTranslationHelper = createTranslationHelper();
  const tool = deleteIssueTool(mockBacklog as Backlog, mockTranslationHelper);

  it("returns deleted issue information as formatted JSON text", async () => {
    const result = await tool.handler({
      issueIdOrKey: "TEST-1"
    });

    expect(result.content).toHaveLength(1);
    expect(result.content[0].type).toBe("text");
    expect(result.content[0].text).toContain("Test Issue");
    expect(result.content[0].text).toContain("TEST-1");
  });

  it("calls backlog.deleteIssue with correct params when using issue key", async () => {
    await tool.handler({
      issueIdOrKey: "TEST-1"
    });
    
    expect(mockBacklog.deleteIssue).toHaveBeenCalledWith("TEST-1");
  });

  it("calls backlog.deleteIssue with correct params when using issue ID", async () => {
    await tool.handler({
      issueIdOrKey: 1
    });
    
    expect(mockBacklog.deleteIssue).toHaveBeenCalledWith(1);
  });

  it("returns an error result when the API fails", async () => {
    const tool = deleteIssueTool({
      deleteIssue: () => Promise.reject(new Error("simulated error"))
    } as unknown as Backlog, mockTranslationHelper);

    const result = await tool.handler({} as any);
  
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain("simulated error");
  });
});
