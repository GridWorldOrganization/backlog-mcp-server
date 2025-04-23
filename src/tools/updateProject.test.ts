import { updateProjectTool } from "./updateProject.js";
import { jest, describe, it, expect } from '@jest/globals'; 
import type { Backlog } from "backlog-js";
import { createTranslationHelper } from "../createTranslationHelper.js";

describe("updateProjectTool", () => {
  const mockBacklog: Partial<Backlog> = {
    patchProject: jest.fn<() => Promise<any>>().mockResolvedValue({
      id: 1,
      projectKey: "UPDATED",
      name: "Updated Project",
      chartEnabled: true,
      subtaskingEnabled: true,
      projectLeaderCanEditProjectLeader: false,
      textFormattingRule: "markdown",
      archived: true,
      displayOrder: 0
    })
  };

  const mockTranslationHelper = createTranslationHelper();
  const tool = updateProjectTool(mockBacklog as Backlog, mockTranslationHelper);

  it("returns updated project as formatted JSON text", async () => {
    const result = await tool.handler({
      projectIdOrKey: "TEST",
      name: "Updated Project",
      key: "UPDATED",
      archived: true
    });

    expect(result.content).toHaveLength(1);
    expect(result.content[0].type).toBe("text");
    expect(result.content[0].text).toContain("Updated Project");
    expect(result.content[0].text).toContain("UPDATED");
    expect(result.content[0].text).toContain("true");
  });

  it("calls backlog.patchProject with correct params when using project key", async () => {
    await tool.handler({
      projectIdOrKey: "TEST",
      name: "Updated Project",
      key: "UPDATED",
      textFormattingRule: "markdown",
      archived: true
    });
    
    expect(mockBacklog.patchProject).toHaveBeenCalledWith("TEST", {
      name: "Updated Project",
      key: "UPDATED",
      chartEnabled: undefined,
      subtaskingEnabled: undefined,
      projectLeaderCanEditProjectLeader: undefined,
      textFormattingRule: "markdown",
      archived: true
    });
  });

  it("calls backlog.patchProject with correct params when using project ID", async () => {
    await tool.handler({
      projectIdOrKey: 1,
      chartEnabled: true,
      subtaskingEnabled: true
    });
    
    expect(mockBacklog.patchProject).toHaveBeenCalledWith(1, {
      name: undefined,
      key: undefined,
      chartEnabled: true,
      subtaskingEnabled: true,
      projectLeaderCanEditProjectLeader: undefined,
      textFormattingRule: undefined,
      archived: undefined
    });
  });

  it("returns an error result when the API fails", async () => {
    const tool = updateProjectTool({
      patchProject: () => Promise.reject(new Error("simulated error"))
    } as unknown as Backlog, mockTranslationHelper);

    const result = await tool.handler({} as any);
  
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain("simulated error");
  });
});
