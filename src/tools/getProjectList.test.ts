import { getProjectListTool } from "./getProjectList.js";
import { jest, describe, it, expect } from '@jest/globals'; 
import type { Backlog, Entity } from "backlog-js";
import { createTranslationHelper } from "../createTranslationHelper.js"; 

describe("getProjectListTool", () => {
  const mockBacklog: Partial<Backlog> = {
    getProjects: jest.fn<() => Promise<Entity.Project.Project[]>>().mockResolvedValue([
      {
          id: 1, name: "Project A",
          projectKey: "",
          chartEnabled: false,
          useResolvedForChart: false,
          subtaskingEnabled: false,
          projectLeaderCanEditProjectLeader: false,
          useWiki: false,
          useFileSharing: false,
          useWikiTreeView: false,
          useOriginalImageSizeAtWiki: false,
          useSubversion: false,
          useGit: false,
          textFormattingRule: "backlog",
          archived: false,
          displayOrder: 0,
          useDevAttributes: false
      },
      {
          id: 2, name: "Project B",
          projectKey: "",
          chartEnabled: false,
          useResolvedForChart: false,
          subtaskingEnabled: false,
          projectLeaderCanEditProjectLeader: false,
          useWiki: false,
          useFileSharing: false,
          useWikiTreeView: false,
          useOriginalImageSizeAtWiki: false,
          useSubversion: false,
          useGit: false,
          textFormattingRule: "backlog",
          archived: false,
          displayOrder: 0,
          useDevAttributes: false
      }
    ])
  };
  const {t, dump} = createTranslationHelper();

  const tool = getProjectListTool(mockBacklog as Backlog, {t, dump});

  it("returns project list as formatted JSON text", async () => {
    const result = await tool.handler({ archived: false, all: true });

    expect(result.content).toHaveLength(1);
    expect(result.content[0].type).toBe("text");
    expect(result.content[0].text).toContain("Project A");
    expect(result.content[0].text).toContain("Project B");
  });

  it("calls backlog.getProjects with correct params", async () => {
    await tool.handler({ archived: true, all: false });
    expect(mockBacklog.getProjects).toHaveBeenCalledWith({
      archived: true,
      all: false
    });
  });

  it("has correct key for translated description", () => {
    expect(tool.description).toBe(t("TOOL_GET_PROJECT_LIST_DESCRIPTION", ""));
  });

  it("has correct key for schema field descriptions", () => {
    const shape = tool.schema.shape;
    expect(shape.archived.description).toBe(t("TOOL_GET_PROJECT_LIST_ARCHIVED", ""));
    expect(shape.all.description).toBe(t("TOOL_GET_PROJECT_LIST_ALL", ""));
  });

  it("returns an error result when the API fails", async () => {
    const tool = getProjectListTool({
      getProjects: () => Promise.reject(new Error("simulated error"))
    } as Backlog, { t, dump });
  
    const result = await tool.handler({});
  
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain("simulated error");
  });
});