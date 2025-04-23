import { getIssuesTool } from "./getIssues.js";
import { jest, describe, it, expect } from '@jest/globals'; 
import type { Backlog } from "backlog-js";
import { createTranslationHelper } from "../createTranslationHelper.js";

describe("getIssuesTool", () => {
  const mockBacklog: Partial<Backlog> = {
    getIssues: jest.fn<() => Promise<any>>().mockResolvedValue([
      {
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
        summary: "Test Issue 1",
        description: "This is test issue 1",
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
      },
      {
        id: 2,
        projectId: 100,
        issueKey: "TEST-2",
        keyId: 2,
        issueType: {
          id: 2,
          projectId: 100,
          name: "Bug",
          color: "#990000",
          displayOrder: 0
        },
        summary: "Test Issue 2",
        description: "This is test issue 2",
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
        created: "2023-01-02T00:00:00Z",
        updated: "2023-01-02T00:00:00Z"
      }
    ])
  };

  const mockTranslationHelper = createTranslationHelper();
  const tool = getIssuesTool(mockBacklog as Backlog, mockTranslationHelper);

  it("returns issues as formatted JSON text", async () => {
    const result = await tool.handler({
      projectId: [100]
    });

    expect(result.content).toHaveLength(1);
    expect(result.content[0].type).toBe("text");
    expect(result.content[0].text).toContain("Test Issue 1");
    expect(result.content[0].text).toContain("Test Issue 2");
  });

  it("calls backlog.getIssues with correct params", async () => {
    const params = {
      projectId: [100],
      statusId: [1],
      sort: "updated" as const,
      order: "desc" as const,
      count: 10
    };
    
    await tool.handler(params);
    
    expect(mockBacklog.getIssues).toHaveBeenCalledWith(params);
  });

  it("calls backlog.getIssues with keyword search", async () => {
    await tool.handler({
      keyword: "bug"
    });
    
    expect(mockBacklog.getIssues).toHaveBeenCalledWith({
      keyword: "bug"
    });
  });

  it("returns an error result when the API fails", async () => {
    const tool = getIssuesTool({
      getIssues: () => Promise.reject(new Error("simulated error"))
    } as unknown as Backlog, mockTranslationHelper);

    const result = await tool.handler({} as any);
  
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain("simulated error");
  });
});
