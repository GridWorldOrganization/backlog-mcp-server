import { getSpaceTool } from "./getSpace.js";
import { jest, describe, it, expect } from '@jest/globals'; 
import type { Backlog } from "backlog-js";
import { createTranslationHelper } from "../createTranslationHelper.js";

describe("getSpaceTool", () => {
  const mockBacklog: Partial<Backlog> = {
    getSpace: jest.fn<() => Promise<any>>().mockResolvedValue({
      spaceKey: "demo",
      name: "Demo Space",
      ownerId: 1,
      lang: "en",
      timezone: "Asia/Tokyo",
      reportSendTime: "08:00:00",
      textFormattingRule: "backlog",
      created: "2023-01-01T00:00:00Z",
      updated: "2023-01-01T00:00:00Z"
    })
  };

  const mockTranslationHelper = createTranslationHelper();
  const tool = getSpaceTool(mockBacklog as Backlog, mockTranslationHelper);

  it("returns space information as formatted JSON text", async () => {
    const result = await tool.handler({});

    expect(result.content).toHaveLength(1);
    expect(result.content[0].type).toBe("text");
    expect(result.content[0].text).toContain("Demo Space");
    expect(result.content[0].text).toContain("demo");
  });

  it("calls backlog.getSpace", async () => {
    await tool.handler({});
    
    expect(mockBacklog.getSpace).toHaveBeenCalled();
  });

  it("returns an error result when the API fails", async () => {
    const tool = getSpaceTool({
      getSpace: () => Promise.reject(new Error("simulated error"))
    } as Backlog, mockTranslationHelper);
  
    const result = await tool.handler({});
  
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain("error");
  });

  it("returns an error result when the API fails", async () => {
    const tool = getSpaceTool({
      getSpace: () => Promise.reject(new Error("simulated error"))
    } as unknown as Backlog, mockTranslationHelper);

    const result = await tool.handler({} as any);
  
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain("simulated error");
  });
});
