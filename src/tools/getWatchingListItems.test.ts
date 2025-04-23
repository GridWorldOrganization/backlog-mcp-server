import { getWatchingListItemsTool } from "./getWatchingListItems.js";
import { jest, describe, it, expect } from '@jest/globals'; 
import type { Backlog } from "backlog-js";
import { createTranslationHelper } from "../createTranslationHelper.js";

describe("getWatchingListItemsTool", () => {
  const mockBacklog: Partial<Backlog> = {
    getWatchingListItems: jest.fn<() => Promise<any>>().mockResolvedValue([
      {
        id: 1,
        resourceAlreadyRead: false,
        note: "Important issue",
        type: "issue",
        issue: {
          id: 1000,
          projectId: 100,
          issueKey: "TEST-1",
          summary: "Test issue"
        },
        created: "2023-01-01T00:00:00Z",
        updated: "2023-01-01T00:00:00Z"
      },
      {
        id: 2,
        resourceAlreadyRead: true,
        note: "Important wiki",
        type: "wiki",
        wiki: {
          id: 2000,
          projectId: 100,
          name: "Test wiki",
          content: "Wiki content"
        },
        created: "2023-01-02T00:00:00Z",
        updated: "2023-01-02T00:00:00Z"
      }
    ])
  };

  const mockTranslationHelper = createTranslationHelper();
  const tool = getWatchingListItemsTool(mockBacklog as Backlog, mockTranslationHelper);

  it("returns watching list items as formatted JSON text", async () => {
    const result = await tool.handler({
      userId: 1
    });

    expect(result.content).toHaveLength(1);
    expect(result.content[0].type).toBe("text");
    expect(result.content[0].text).toContain("Important issue");
    expect(result.content[0].text).toContain("Important wiki");
  });

  it("calls backlog.getWatchingListItems with correct params", async () => {
    await tool.handler({
      userId: 1
    });
    
    expect(mockBacklog.getWatchingListItems).toHaveBeenCalledWith(1);
  });

  it("returns an error result when the API fails", async () => {
    const tool = getWatchingListItemsTool({
      getWatchingListItems: () => Promise.reject(new Error("simulated error"))
    } as unknown as Backlog, mockTranslationHelper);

    const result = await tool.handler({} as any);
  
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain("simulated error");
  });
});
