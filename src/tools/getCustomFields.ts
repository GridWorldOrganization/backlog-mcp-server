import { Backlog } from "backlog-js";
import { z } from "zod";
import { ToolDefinition, buildToolSchema } from "../types/tool.js";
import { TranslationHelper } from "../createTranslationHelper.js";
import { CustomFieldSchema } from "../types/zod/backlogOutputDefinition.js";

const getCustomFieldsInputSchema = buildToolSchema((t) => ({
  projectIdOrKey: z
    .union([z.string(), z.number()])
    .describe(
      t(
        "TOOL_GET_CUSTOM_FIELDS_PROJECT_ID_OR_KEY",
        "Project ID or project key",
      ),
    ),
}));

export const getCustomFieldsTool = (
  backlog: Backlog,
  { t }: TranslationHelper,
): ToolDefinition<
  ReturnType<typeof getCustomFieldsInputSchema>, // Shape for input schema
  typeof CustomFieldSchema["shape"] // Shape for output schema (single item)
> => {
  const inputSchemaObject = z.object(getCustomFieldsInputSchema(t)); // Create the ZodObject for input

  return {
    name: "get_custom_fields",
    description: t(
      "TOOL_GET_CUSTOM_FIELDS_DESCRIPTION",
      "Returns list of custom fields for a project",
    ),
    schema: inputSchemaObject, 
    outputSchema: CustomFieldSchema, 
    importantFields: ["id", "name", "typeId", "required", "applicableIssueTypes"],
    handler: async ({ projectIdOrKey }) => {
      return backlog.getCustomFields(projectIdOrKey);
    },
  };
};
