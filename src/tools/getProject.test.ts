import { getProjectTool } from "./getProject.js";
import { jest, describe, it, expect } from '@jest/globals'; 
import type { Backlog } from "backlog-js";
import { createTranslationHelper } from "../createTranslationHelper.js";

describe("getProjectTool", () => {
  const mockBacklog: Partial<Backlog> = {
    getProject: jest.fn<() => Promise<any>>().mockResolvedValue({
      id: 1,
      projectKey: "TEST",
      name: "Test Project",
      chartEnabled: true,
      subtaskingEnabled: true,
      projectLeaderCanEditProjectLeader: false,
      textFormattingRule: "backlog",
      archived: false,
      displayOrder: 0
    })
  };

  const mockTranslationHelper = createTranslationHelper();
  const tool = getProjectTool(mockBacklog as Backlog, mockTranslationHelper);

  it("returns project information as formatted JSON text", async () => {
    const result = await tool.handler({
      projectIdOrKey: "TEST"
    });

    expect(result.content).toHaveLength(1);
    expect(result.content[0].type).toBe("text");
    expect(result.content[0].text).toContain("Test Project");
    expect(result.content[0].text).toContain("TEST");
  });

  it("calls backlog.getProject with correct params when using project key", async () => {
    await tool.handler({
      projectIdOrKey: "TEST"
    });
    
    expect(mockBacklog.getProject).toHaveBeenCalledWith("TEST");
  });

  it("calls backlog.getProject with correct params when using project ID", async () => {
    await tool.handler({
      projectIdOrKey: 1
    });
    
    expect(mockBacklog.getProject).toHaveBeenCalledWith(1);
  });

  it("returns an error result when the API fails", async () => {
    const tool = getProjectTool({
      getProject: () => Promise.reject(new Error("simulated error"))
    } as unknown as Backlog, mockTranslationHelper);

    const result = await tool.handler({} as any);
  
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain("simulated error");
  });
});
