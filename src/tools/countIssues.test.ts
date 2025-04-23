import { countIssuesTool } from "./countIssues.js";
import { jest, describe, it, expect } from '@jest/globals'; 
import type { Backlog } from "backlog-js";
import { createTranslationHelper } from "../createTranslationHelper.js";

describe("countIssuesTool", () => {
  const mockBacklog: Partial<Backlog> = {
    getIssuesCount: jest.fn<() => Promise<any>>().mockResolvedValue({
      count: 42
    })
  };

  const mockTranslationHelper = createTranslationHelper();
  const tool = countIssuesTool(mockBacklog as Backlog, mockTranslationHelper);

  it("returns issue count as formatted JSON text", async () => {
    const result = await tool.handler({
      projectId: [100]
    });

    expect(result.content).toHaveLength(1);
    expect(result.content[0].type).toBe("text");
    expect(result.content[0].text).toContain("42");
  });

  it("calls backlog.getIssuesCount with correct params", async () => {
    const params = {
      projectId: [100],
      statusId: [1],
      keyword: "bug"
    };
    
    await tool.handler(params);
    
    expect(mockBacklog.getIssuesCount).toHaveBeenCalledWith(params);
  });

  it("calls backlog.getIssuesCount with date filters", async () => {
    await tool.handler({
      createdSince: "2023-01-01",
      createdUntil: "2023-01-31"
    });
    
    expect(mockBacklog.getIssuesCount).toHaveBeenCalledWith({
      createdSince: "2023-01-01",
      createdUntil: "2023-01-31"
    });
  });

  it("returns an error result when the API fails", async () => {
    const tool = countIssuesTool({
      getIssuesCount: () => Promise.reject(new Error("simulated error"))
    } as unknown as Backlog, mockTranslationHelper);

    const result = await tool.handler({} as any);
  
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain("simulated error");
  });
});
