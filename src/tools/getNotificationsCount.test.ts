import { getNotificationsCountTool } from "./getNotificationsCount.js";
import { jest, describe, it, expect } from '@jest/globals'; 
import type { Backlog } from "backlog-js";
import { createTranslationHelper } from "../createTranslationHelper.js";

describe("getNotificationsCountTool", () => {
  const mockBacklog: Partial<Backlog> = {
    getNotificationsCount: jest.fn<() => Promise<any>>().mockResolvedValue({
      count: 42
    })
  };

  const mockTranslationHelper = createTranslationHelper();
  const tool = getNotificationsCountTool(mockBacklog as Backlog, mockTranslationHelper);

  it("returns notification count as formatted JSON text", async () => {
    const result = await tool.handler({
      alreadyRead: false,
      resourceAlreadyRead: false
    });

    expect(result.content).toHaveLength(1);
    expect(result.content[0].type).toBe("text");
    expect(result.content[0].text).toContain("42");
  });

  it("calls backlog.getNotificationsCount with correct params", async () => {
    const params = {
      alreadyRead: true,
      resourceAlreadyRead: false
    };
    
    await tool.handler(params);
    
    expect(mockBacklog.getNotificationsCount).toHaveBeenCalledWith(params);
  });

  it("returns an error result when the API fails", async () => {
    const tool = getNotificationsCountTool({
      getNotificationsCount: () => Promise.reject(new Error("simulated error"))
    } as unknown as Backlog, mockTranslationHelper);

    const result = await tool.handler({} as any);
  
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain("simulated error");
  });
});
