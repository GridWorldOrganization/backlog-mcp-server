import { getPrioritiesTool } from "./getPriorities.js";
import { jest, describe, it, expect } from '@jest/globals'; 
import type { Backlog } from "backlog-js";
import { createTranslationHelper } from "../createTranslationHelper.js";

describe("getPrioritiesTool", () => {
  const mockBacklog: Partial<Backlog> = {
    getPriorities: jest.fn<() => Promise<any>>().mockResolvedValue([
      {
        id: 2,
        name: "High"
      },
      {
        id: 3,
        name: "Normal"
      },
      {
        id: 4,
        name: "Low"
      }
    ])
  };

  const mockTranslationHelper = createTranslationHelper();
  const tool = getPrioritiesTool(mockBacklog as Backlog, mockTranslationHelper);

  it("returns priorities list as formatted JSON text", async () => {
    const result = await tool.handler({});

    expect(result.content).toHaveLength(1);
    expect(result.content[0].type).toBe("text");
    expect(result.content[0].text).toContain("High");
    expect(result.content[0].text).toContain("Normal");
    expect(result.content[0].text).toContain("Low");
  });

  it("calls backlog.getPriorities", async () => {
    await tool.handler({});
    
    expect(mockBacklog.getPriorities).toHaveBeenCalled();
  });

  it("returns an error result when the API fails", async () => {
    const tool = getPrioritiesTool({
      getPriorities: () => Promise.reject(new Error("simulated error"))
    } as unknown as Backlog, mockTranslationHelper);

    const result = await tool.handler({} as any);
  
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain("simulated error");
  });
});
