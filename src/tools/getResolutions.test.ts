import { getResolutionsTool } from "./getResolutions.js";
import { jest, describe, it, expect } from '@jest/globals'; 
import type { Backlog } from "backlog-js";
import { createTranslationHelper } from "../createTranslationHelper.js";

describe("getResolutionsTool", () => {
  const mockBacklog: Partial<Backlog> = {
    getResolutions: jest.fn<() => Promise<any>>().mockResolvedValue([
      {
        id: 0,
        name: "Fixed"
      },
      {
        id: 1,
        name: "Won't Fix"
      },
      {
        id: 2,
        name: "Invalid"
      },
      {
        id: 3,
        name: "Duplicate"
      }
    ])
  };

  const mockTranslationHelper = createTranslationHelper();
  const tool = getResolutionsTool(mockBacklog as Backlog, mockTranslationHelper);

  it("returns resolutions list as formatted JSON text", async () => {
    const result = await tool.handler({});

    expect(result.content).toHaveLength(1);
    expect(result.content[0].type).toBe("text");
    expect(result.content[0].text).toContain("Fixed");
    expect(result.content[0].text).toContain("Won't Fix");
    expect(result.content[0].text).toContain("Invalid");
    expect(result.content[0].text).toContain("Duplicate");
  });

  it("calls backlog.getResolutions", async () => {
    await tool.handler({});
    
    expect(mockBacklog.getResolutions).toHaveBeenCalled();
  });

  it("returns an error result when the API fails", async () => {
    const tool = getResolutionsTool({
      getResolutions: () => Promise.reject(new Error("simulated error"))
    } as unknown as Backlog, mockTranslationHelper);

    const result = await tool.handler({} as any);
  
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain("simulated error");
  });
});
