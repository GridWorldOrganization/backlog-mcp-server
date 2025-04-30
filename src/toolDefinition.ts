import { z } from "zod";
import { TranslationHelper } from "./createTranslationHelper.js";

export type ToolDefinition<
  Shape extends z.ZodRawShape,
  OutputShape extends z.ZodRawShape
> = {
  name: string;
  description: string;
  schema: z.ZodObject<Shape>;
  outputSchema: z.ZodObject<OutputShape>;
  handler: (input: z.infer<z.ZodObject<Shape>> & { fields?: string }) => Promise<
  z.infer<z.ZodObject<OutputShape>> | z.infer<z.ZodObject<OutputShape>>[]
>;
  importantFields?: (keyof z.infer<z.ZodObject<OutputShape>>)[];
};

export const buildToolSchema = <
  T extends z.ZodRawShape
>(fn: (t: TranslationHelper["t"]) => T) => fn;

export type MCPOptions = {
  useFields: boolean
}