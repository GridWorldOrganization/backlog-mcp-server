import { addProjectTool } from "./addProject.js";
import { jest, describe, it, expect } from '@jest/globals'; 
import type { Backlog } from "backlog-js";
import { createTranslationHelper } from "../createTranslationHelper.js";

describe("addProjectTool", () => {
  const mockBacklog: Partial<Backlog> = {
    postProject: jest.fn<() => Promise<any>>().mockResolvedValue({
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
  const tool = addProjectTool(mockBacklog as Backlog, mockTranslationHelper);

  it("returns created project as formatted JSON text", async () => {
    const result = await tool.handler({
      name: "Test Project",
      key: "TEST",
      chartEnabled: true,
      subtaskingEnabled: true
    });

    expect(result.content).toHaveLength(1);
    expect(result.content[0].type).toBe("text");
    expect(result.content[0].text).toContain("Test Project");
    expect(result.content[0].text).toContain("TEST");
  });

  it("calls backlog.postProject with correct params", async () => {
    await tool.handler({
      name: "Test Project",
      key: "TEST",
      chartEnabled: true,
      subtaskingEnabled: true
    });
    
    expect(mockBacklog.postProject).toHaveBeenCalledWith({
      name: "Test Project",
      key: "TEST",
      chartEnabled: true,
      subtaskingEnabled: true,
      projectLeaderCanEditProjectLeader: false,
      textFormattingRule: "backlog"
    });
  });

  it("uses default values for optional parameters", async () => {
    await tool.handler({
      name: "Test Project",
      key: "TEST"
    });
    
    expect(mockBacklog.postProject).toHaveBeenCalledWith({
      name: "Test Project",
      key: "TEST",
      chartEnabled: false,
      subtaskingEnabled: false,
      projectLeaderCanEditProjectLeader: false,
      textFormattingRule: "backlog"
    });
  });

  it("returns an error result when the API fails", async () => {
    const tool = addProjectTool({
      postProject: () => Promise.reject(new Error("simulated error"))
    } as unknown as Backlog, mockTranslationHelper);

    const result = await tool.handler({} as any);
  
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain("simulated error");
  });
});
