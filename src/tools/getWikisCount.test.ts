import { getWikisCountTool } from "./getWikisCount.js";
import { jest, describe, it, expect } from '@jest/globals'; 
import type { Backlog } from "backlog-js";
import { createTranslationHelper } from "../createTranslationHelper.js";

describe("getWikisCountTool", () => {
  const mockBacklog: Partial<Backlog> = {
    getWikisCount: jest.fn<() => Promise<any>>().mockResolvedValue({
      count: 42
    })
  };

  const mockTranslationHelper = createTranslationHelper();
  const tool = getWikisCountTool(mockBacklog as Backlog, mockTranslationHelper);

  it("returns wiki count as formatted JSON text", async () => {
    const result = await tool.handler({
      projectIdOrKey: "TEST"
    });

    expect(result.content).toHaveLength(1);
    expect(result.content[0].type).toBe("text");
    expect(result.content[0].text).toContain("42");
  });

  it("calls backlog.getWikisCount with correct params when using project key", async () => {
    await tool.handler({
      projectIdOrKey: "TEST"
    });
    
    expect(mockBacklog.getWikisCount).toHaveBeenCalledWith("TEST");
  });

  it("calls backlog.getWikisCount with correct params when using project ID", async () => {
    await tool.handler({
      projectIdOrKey: 100
    });
    
    expect(mockBacklog.getWikisCount).toHaveBeenCalledWith(100);
  });

  it("returns an error result when the API fails", async () => {
    const tool = getWikisCountTool({
      getWikisCount: () => Promise.reject(new Error("simulated error"))
    } as unknown as Backlog, mockTranslationHelper);

    const result = await tool.handler({} as any);
  
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain("simulated error");
  });
});
