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

    if (Array.isArray(result)) {
      throw new Error("Unexpected array result");
    }
    expect(result.count).toEqual(42);
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
});
