import { getWatchingListCountTool } from "./getWatchingListCount.js";
import { jest, describe, it, expect } from '@jest/globals'; 
import type { Backlog } from "backlog-js";
import { createTranslationHelper } from "../createTranslationHelper.js";

describe("getWatchingListCountTool", () => {
  const mockBacklog: Partial<Backlog> = {
    getWatchingListCount: jest.fn<() => Promise<any>>().mockResolvedValue({
      count: 42
    })
  };

  const mockTranslationHelper = createTranslationHelper();
  const tool = getWatchingListCountTool(mockBacklog as Backlog, mockTranslationHelper);

  it("returns watching list count as formatted JSON text", async () => {
    const result = await tool.handler({
      userId: 1
    });

    expect(result.content).toHaveLength(1);
    expect(result.content[0].type).toBe("text");
    expect(result.content[0].text).toContain("42");
  });

  it("calls backlog.getWatchingListCount with correct params", async () => {
    await tool.handler({
      userId: 1
    });
    
    expect(mockBacklog.getWatchingListCount).toHaveBeenCalledWith(1);
  });

  it("returns an error result when the API fails", async () => {
    const tool = getWatchingListCountTool({
      getWatchingListCount: () => Promise.reject(new Error("simulated error"))
    } as unknown as Backlog, mockTranslationHelper);

    const result = await tool.handler({} as any);
  
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain("simulated error");
  });
});
