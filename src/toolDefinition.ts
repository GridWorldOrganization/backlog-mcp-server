import { z } from "zod";
import { TranslationHelper } from "./createTranslationHelper.js";

export type ToolDefinition<
  Shape extends z.ZodRawShape,
  CallToolResult
> = {
  name: string;
  description: string;
  schema: z.ZodObject<Shape>;
  handler: (input: z.infer<z.ZodObject<Shape>>) => Promise<CallToolResult>;
};

export const buildToolSchema = <
  T extends z.ZodRawShape
>(fn: (t: TranslationHelper["t"]) => T) => fn;
