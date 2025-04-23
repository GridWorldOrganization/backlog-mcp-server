import { getIssueTypesTool } from "./getIssueTypes.js";
import { jest, describe, it, expect } from '@jest/globals'; 
import type { Backlog } from "backlog-js";
import { createTranslationHelper } from "../createTranslationHelper.js";

describe("getIssueTypesTool", () => {
  const mockBacklog: Partial<Backlog> = {
    getIssueTypes: jest.fn<() => Promise<any>>().mockResolvedValue([
      {
        id: 1,
        projectId: 100,
        name: "Bug",
        color: "#990000"
      },
      {
        id: 2,
        projectId: 100,
        name: "Task",
        color: "#7ea800"
      },
      {
        id: 3,
        projectId: 100,
        name: "Request",
        color: "#ff9200"
      }
    ])
  };

  const mockTranslationHelper = createTranslationHelper();
  const tool = getIssueTypesTool(mockBacklog as Backlog, mockTranslationHelper);

  it("returns issue types list as formatted JSON text", async () => {
    const result = await tool.handler({
      projectIdOrKey: "TEST"
    });

    expect(result.content).toHaveLength(1);
    expect(result.content[0].type).toBe("text");
    expect(result.content[0].text).toContain("Bug");
    expect(result.content[0].text).toContain("Task");
    expect(result.content[0].text).toContain("Request");
  });

  it("calls backlog.getIssueTypes with correct params when using project key", async () => {
    await tool.handler({
      projectIdOrKey: "TEST"
    });
    
    expect(mockBacklog.getIssueTypes).toHaveBeenCalledWith("TEST");
  });

  it("calls backlog.getIssueTypes with correct params when using project ID", async () => {
    await tool.handler({
      projectIdOrKey: 100
    });
    
    expect(mockBacklog.getIssueTypes).toHaveBeenCalledWith(100);
  });

  it("returns an error result when the API fails", async () => {
    const tool = getIssueTypesTool({
      getIssueTypes: () => Promise.reject(new Error("simulated error"))
    } as unknown as Backlog, mockTranslationHelper);

    const result = await tool.handler({} as any);
  
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain("simulated error");
  });
});
