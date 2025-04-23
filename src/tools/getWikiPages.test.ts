import { getWikiPagesTool } from "./getWikiPages.js";
import { jest, describe, it, expect } from '@jest/globals'; 
import type { Backlog } from "backlog-js";
import { createTranslationHelper } from "../createTranslationHelper.js";

describe("getWikiPagesTool", () => {
  const mockBacklog: Partial<Backlog> = {
    getWikis: jest.fn<() => Promise<any>>().mockResolvedValue([
      {
        id: 1,
        projectId: 100,
        name: "Getting Started",
        tags: ["guide", "tutorial"],
        createdUser: {
          id: 1,
          userId: "admin",
          name: "Admin User",
          roleType: 1,
          lang: "en",
          mailAddress: "admin@example.com",
          lastLoginTime: "2023-01-01T00:00:00Z"
        },
        created: "2023-01-01T00:00:00Z",
        updatedUser: {
          id: 1,
          userId: "admin",
          name: "Admin User",
          roleType: 1,
          lang: "en",
          mailAddress: "admin@example.com",
          lastLoginTime: "2023-01-01T00:00:00Z"
        },
        updated: "2023-01-01T00:00:00Z"
      },
      {
        id: 2,
        projectId: 100,
        name: "API Documentation",
        tags: ["api", "reference"],
        createdUser: {
          id: 1,
          userId: "admin",
          name: "Admin User",
          roleType: 1,
          lang: "en",
          mailAddress: "admin@example.com",
          lastLoginTime: "2023-01-01T00:00:00Z"
        },
        created: "2023-01-01T00:00:00Z",
        updatedUser: {
          id: 1,
          userId: "admin",
          name: "Admin User",
          roleType: 1,
          lang: "en",
          mailAddress: "admin@example.com",
          lastLoginTime: "2023-01-01T00:00:00Z"
        },
        updated: "2023-01-01T00:00:00Z"
      }
    ])
  };

  const mockTranslationHelper = createTranslationHelper();
  const tool = getWikiPagesTool(mockBacklog as Backlog, mockTranslationHelper);

  it("returns wiki pages as formatted JSON text", async () => {
    const result = await tool.handler({
      projectIdOrKey: "TEST"
    });

    expect(result.content).toHaveLength(1);
    expect(result.content[0].type).toBe("text");
    expect(result.content[0].text).toContain("Getting Started");
    expect(result.content[0].text).toContain("API Documentation");
  });

  it("calls backlog.getWikis with correct params when using project key", async () => {
    await tool.handler({
      projectIdOrKey: "TEST"
    });
    
    expect(mockBacklog.getWikis).toHaveBeenCalledWith({
      projectIdOrKey: "TEST",
      keyword: undefined
    });
  });

  it("calls backlog.getWikis with correct params when using project ID and keyword", async () => {
    await tool.handler({
      projectIdOrKey: 100,
      keyword: "api"
    });
    
    expect(mockBacklog.getWikis).toHaveBeenCalledWith({
      projectIdOrKey: 100,
      keyword: "api"
    });
  });

  it("returns an error result when the API fails", async () => {
    const tool = getWikiPagesTool({
      getWikis: () => Promise.reject(new Error("simulated error"))
    } as unknown as Backlog, mockTranslationHelper);

    const result = await tool.handler({} as any);
  
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain("simulated error");
  });
});
