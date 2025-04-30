import { deleteProjectTool } from "./deleteProject.js";
import { jest, describe, it, expect } from '@jest/globals'; 
import type { Backlog } from "backlog-js";
import { createTranslationHelper } from "../createTranslationHelper.js";

describe("deleteProjectTool", () => {
  const mockBacklog: Partial<Backlog> = {
    deleteProject: jest.fn<() => Promise<any>>().mockResolvedValue({
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
  const tool = deleteProjectTool(mockBacklog as Backlog, mockTranslationHelper);

  it("returns deleted project information", async () => {
    const result = await tool.handler({
      projectIdOrKey: "TEST"
    });

    expect(result).toHaveProperty("projectKey", "TEST");
    expect(result).toHaveProperty("name", "Test Project");
  });

  it("calls backlog.deleteProject with correct params when using project key", async () => {
    await tool.handler({
      projectIdOrKey: "TEST"
    });
    
    expect(mockBacklog.deleteProject).toHaveBeenCalledWith("TEST");
  });

  it("calls backlog.deleteProject with correct params when using project ID", async () => {
    await tool.handler({
      projectIdOrKey: 1
    });
    
    expect(mockBacklog.deleteProject).toHaveBeenCalledWith(1);
  });
});
