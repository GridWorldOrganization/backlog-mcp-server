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

    if (Array.isArray(result)) {
      throw new Error("Unexpected array result");
    }
    expect(result.name).toContain("Test Project");
    expect(result.projectKey).toContain("TEST");
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
});
