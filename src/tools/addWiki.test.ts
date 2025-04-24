import { addWikiTool } from "./addWiki.js";
import { jest, describe, it, expect } from '@jest/globals'; 
import type { Backlog } from "backlog-js";
import { createTranslationHelper } from "../createTranslationHelper.js";

describe("addWikiTool", () => {
  const mockBacklog: Partial<Backlog> = {
    postWiki: jest.fn<() => Promise<any>>().mockResolvedValue({
      id: 1,
      projectId: 100,
      name: "Getting Started",
      content: "# Welcome to the project\n\nThis is a wiki page.",
      createdUser: {
        id: 1,
        userId: "admin",
        name: "Admin User",
        roleType: 1,
        lang: "en",
        mailAddress: "admin@example.com"
      },
      created: "2023-01-01T00:00:00Z",
      updatedUser: {
        id: 1,
        userId: "admin",
        name: "Admin User",
        roleType: 1,
        lang: "en",
        mailAddress: "admin@example.com"
      },
      updated: "2023-01-01T00:00:00Z"
    })
  };

  const mockTranslationHelper = createTranslationHelper();
  const tool = addWikiTool(mockBacklog as Backlog, mockTranslationHelper);

  it("returns created wiki as formatted JSON text", async () => {
    const result = await tool.handler({
      projectId: 100,
      name: "Getting Started",
      content: "# Welcome to the project\n\nThis is a wiki page.",
      mailNotify: false
    });

    expect(result.content).toHaveLength(1);
    expect(result.content[0].type).toBe("text");
    expect(result.content[0].text).toContain("Getting Started");
    expect(result.content[0].text).toContain("Welcome to the project");
  });

  it("calls backlog.postWiki with correct params", async () => {
    const params = {
      projectId: 100,
      name: "Getting Started",
      content: "# Welcome to the project\n\nThis is a wiki page.",
      mailNotify: false
    };
    
    await tool.handler(params);
    
    expect(mockBacklog.postWiki).toHaveBeenCalledWith({
      projectId: 100,
      name: "Getting Started",
      content: "# Welcome to the project\n\nThis is a wiki page.",
      mailNotify: false
    });
  });

  it("returns an error result when the API fails", async () => {
    const tool = addWikiTool({
      postWiki: () => Promise.reject(new Error("simulated error"))
    } as unknown as Backlog, mockTranslationHelper);

    const result = await tool.handler({} as any);
  
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain("simulated error");
  });
});
