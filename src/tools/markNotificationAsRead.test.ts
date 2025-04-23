import { markNotificationAsReadTool } from "./markNotificationAsRead.js";
import { jest, describe, it, expect } from '@jest/globals'; 
import type { Backlog } from "backlog-js";
import { createTranslationHelper } from "../createTranslationHelper.js";

describe("markNotificationAsReadTool", () => {
  const mockBacklog: Partial<Backlog> = {
    markAsReadNotification: jest.fn<() => Promise<void>>().mockResolvedValue(undefined)
  };

  const mockTranslationHelper = createTranslationHelper();
  const tool = markNotificationAsReadTool(mockBacklog as Backlog, mockTranslationHelper);

  it("returns success message as formatted JSON text", async () => {
    const result = await tool.handler({
      id: 123
    });

    expect(result.content).toHaveLength(1);
    expect(result.content[0].type).toBe("text");
    expect(result.content[0].text).toContain("success");
    expect(result.content[0].text).toContain("123");
  });

  it("calls backlog.markAsReadNotification with correct params", async () => {
    await tool.handler({
      id: 123
    });
    
    expect(mockBacklog.markAsReadNotification).toHaveBeenCalledWith(123);
  });

  it("returns an error result when the API fails", async () => {
    const tool = markNotificationAsReadTool({
      markAsReadNotification: () => Promise.reject(new Error("simulated error"))
    } as unknown as Backlog, mockTranslationHelper);

    const result = await tool.handler({} as any);
  
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain("simulated error");
  });
});
