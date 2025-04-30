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

    if (!Array.isArray(result)) {
      throw new Error("Unexpected non array result");
    }
    expect(result).toHaveLength(2);
    expect(result[0].name).toContain("Getting Started");
    expect(result[1].name).toContain("API Documentation");
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
});
