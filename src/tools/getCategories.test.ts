import { getCategoriesTool } from "./getCategories.js";
import { jest, describe, it, expect } from '@jest/globals'; 
import type { Backlog } from "backlog-js";
import { createTranslationHelper } from "../createTranslationHelper.js";

describe("getCategoriesTool", () => {
  const mockBacklog: Partial<Backlog> = {
    getCategories: jest.fn<() => Promise<any>>().mockResolvedValue([
      {
        id: 1,
        name: "Bug",
        displayOrder: 0
      },
      {
        id: 2,
        name: "Feature",
        displayOrder: 1
      },
      {
        id: 3,
        name: "Support",
        displayOrder: 2
      }
    ])
  };

  const mockTranslationHelper = createTranslationHelper();
  const tool = getCategoriesTool(mockBacklog as Backlog, mockTranslationHelper);

  it("returns categories list as formatted JSON text", async () => {
    const result = await tool.handler({
      projectIdOrKey: "TEST"
    });

    expect(result.content).toHaveLength(1);
    expect(result.content[0].type).toBe("text");
    expect(result.content[0].text).toContain("Bug");
    expect(result.content[0].text).toContain("Feature");
    expect(result.content[0].text).toContain("Support");
  });

  it("calls backlog.getCategories with correct params when using project key", async () => {
    await tool.handler({
      projectIdOrKey: "TEST"
    });
    
    expect(mockBacklog.getCategories).toHaveBeenCalledWith("TEST");
  });

  it("calls backlog.getCategories with correct params when using project ID", async () => {
    await tool.handler({
      projectIdOrKey: 100
    });
    
    expect(mockBacklog.getCategories).toHaveBeenCalledWith(100);
  });

  it("returns an error result when the API fails", async () => {
    const tool = getCategoriesTool({
      getCategories: () => Promise.reject(new Error("simulated error"))
    } as unknown as Backlog, mockTranslationHelper);

    const result = await tool.handler({} as any);
  
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain("simulated error");
  });
});
