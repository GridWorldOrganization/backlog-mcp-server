import { getWikiTool } from "./getWiki.js";
import { jest, describe, it, expect } from '@jest/globals'; 
import type { Backlog } from "backlog-js";
import { createTranslationHelper } from "../createTranslationHelper.js";

describe("getWikiTool", () => {
  const mockBacklog: Partial<Backlog> = {
    getWiki: jest.fn<() => Promise<any>>().mockResolvedValue({
      id: 1234,
      projectId: 100,
      name: "Sample Wiki",
      content: "# Sample Wiki Content\n\nThis is a sample wiki page.",
      tags: [
        { id: 1, name: "documentation" },
        { id: 2, name: "guide" }
      ],
      attachments: [],
      sharedFiles: [],
      stars: [],
      createdUser: {
        id: 1,
        userId: "user1",
        name: "User One"
      },
      created: "2023-01-01T00:00:00Z",
      updated: "2023-01-02T00:00:00Z"
    })
  };

  const mockTranslationHelper = createTranslationHelper();
  const tool = getWikiTool(mockBacklog as Backlog, mockTranslationHelper);

  it("returns wiki information as formatted JSON text", async () => {
    const result = await tool.handler({
      wikiId: 1234
    });

    expect(result.content).toHaveLength(1);
    expect(result.content[0].type).toBe("text");
    expect(result.content[0].text).toContain("Sample Wiki");
    expect(result.content[0].text).toContain("Sample Wiki Content");
  });

  it("calls backlog.getWiki with correct params when using number ID", async () => {
    await tool.handler({
      wikiId: 1234
    });
    
    expect(mockBacklog.getWiki).toHaveBeenCalledWith(1234);
  });

  it("calls backlog.getWiki with correct params when using string ID", async () => {
    await tool.handler({
      wikiId: "1234"
    });
    
    expect(mockBacklog.getWiki).toHaveBeenCalledWith(1234);
  });

  it("returns an error result when the API fails", async () => {
    const tool = getWikiTool({
      getWiki: () => Promise.reject(new Error("simulated error"))
    } as unknown as Backlog, mockTranslationHelper);

    const result = await tool.handler({} as any);
  
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain("simulated error");
  });
});
