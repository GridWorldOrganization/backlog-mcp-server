import { getUsersTool } from "./getUsers.js";
import { jest, describe, it, expect } from '@jest/globals'; 
import type { Backlog } from "backlog-js";
import { createTranslationHelper } from "../createTranslationHelper.js";

describe("getUsersTool", () => {
  const mockBacklog: Partial<Backlog> = {
    getUsers: jest.fn<() => Promise<any>>().mockResolvedValue([
      {
        id: 1,
        userId: "admin",
        name: "Admin User",
        roleType: 1,
        lang: "en",
        mailAddress: "admin@example.com",
        lastLoginTime: "2023-01-01T00:00:00Z"
      },
      {
        id: 2,
        userId: "user1",
        name: "Regular User",
        roleType: 2,
        lang: "en",
        mailAddress: "user1@example.com",
        lastLoginTime: "2023-01-02T00:00:00Z"
      }
    ])
  };

  const mockTranslationHelper = createTranslationHelper();
  const tool = getUsersTool(mockBacklog as Backlog, mockTranslationHelper);

  it("returns users list as formatted JSON text", async () => {
    const result = await tool.handler({});

    expect(result.content).toHaveLength(1);
    expect(result.content[0].type).toBe("text");
    expect(result.content[0].text).toContain("Admin User");
    expect(result.content[0].text).toContain("Regular User");
  });

  it("calls backlog.getUsers", async () => {
    await tool.handler({});
    
    expect(mockBacklog.getUsers).toHaveBeenCalled();
  });

  it("returns an error result when the API fails", async () => {
    const tool = getUsersTool({
      getUsers: () => Promise.reject(new Error("simulated error"))
    } as Backlog, mockTranslationHelper);
  
    const result = await tool.handler({});
  
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain("error");
  });

  it("returns an error result when the API fails", async () => {
    const tool = getUsersTool({
      getUsers: () => Promise.reject(new Error("simulated error"))
    } as unknown as Backlog, mockTranslationHelper);

    const result = await tool.handler({} as any);
  
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain("simulated error");
  });
});
