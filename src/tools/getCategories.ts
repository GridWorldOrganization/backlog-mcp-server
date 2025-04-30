import { z } from "zod";
import { Backlog } from 'backlog-js';
import { buildToolSchema, ToolDefinition } from "../toolDefinition.js";
import { TranslationHelper } from "../createTranslationHelper.js";
import { CategorySchema } from "../backlogOutputDefinition.js";

const getCategoriesSchema = buildToolSchema(t => ({
  projectIdOrKey: z.union([z.string(), z.number()]).describe(t("TOOL_GET_CATEGORIES_PROJECT_ID_OR_KEY", "Project ID or project key")),
}));

export const getCategoriesTool = (backlog: Backlog, { t }: TranslationHelper): ToolDefinition<ReturnType<typeof getCategoriesSchema>, typeof CategorySchema["shape"]> => {
  return {
    name: "get_categories",
    description: t("TOOL_GET_CATEGORIES_DESCRIPTION", "Returns list of categories for a project"),
    schema: z.object(getCategoriesSchema(t)),
    importantFields: ["id", "projectId", "name"],
    outputSchema: CategorySchema,
    handler: async ({ projectIdOrKey }) => backlog.getCategories(projectIdOrKey),
  };
};
