import { resetUnreadNotificationCountTool } from "./resetUnreadNotificationCount.js";
import { jest, describe, it, expect } from '@jest/globals'; 
import type { Backlog } from "backlog-js";
import { createTranslationHelper } from "../createTranslationHelper.js";

describe("resetUnreadNotificationCountTool", () => {
  const mockBacklog: Partial<Backlog> = {
    resetNotificationsMarkAsRead: jest.fn<() => Promise<any>>().mockResolvedValue({
      count: 0
    })
  };

  const mockTranslationHelper = createTranslationHelper();
  const tool = resetUnreadNotificationCountTool(mockBacklog as Backlog, mockTranslationHelper);

  it("returns reset result as formatted JSON text", async () => {
    const result = await tool.handler({});

    expect(result.content).toHaveLength(1);
    expect(result.content[0].type).toBe("text");
    expect(result.content[0].text).toContain("0");
  });

  it("calls backlog.resetNotificationsMarkAsRead", async () => {
    await tool.handler({});
    
    expect(mockBacklog.resetNotificationsMarkAsRead).toHaveBeenCalled();
  });

  it("returns an error result when the API fails", async () => {
    const tool = resetUnreadNotificationCountTool({
      resetNotificationsMarkAsRead: () => Promise.reject(new Error("simulated error"))
    } as unknown as Backlog, mockTranslationHelper);

    const result = await tool.handler({} as any);
  
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain("simulated error");
  });
});
