import { parse, SelectionSetNode } from "graphql";

export function withPickingFields<I extends { fields?: string }, O>(
  fn: (input: Omit<I, "fields">) => Promise<unknown>,
): (input: I) => Promise<unknown> {
  return async (input: I) => {
    const { fields, ...rest } = input;
    const result = await fn(rest as Omit<I, "fields">);

    if (!fields) {
      return result;
    }

    const selectionSet = parseFieldsSelection(fields);

    if (Array.isArray(result)) {
      return result.map(item => pickFieldsFromData(item, selectionSet)) as unknown as O;
    } else if (typeof result === "object" && result !== null) {
      return pickFieldsFromData(result as Record<string, unknown>, selectionSet) as O;
    } else {
      return result
    }
  }
};

function parseFieldsSelection(fieldsString: string): SelectionSetNode {
  const query = `query Dummy ${fieldsString}`;
  const ast = parse(query);
  const opDef = ast.definitions[0];
  if (opDef.kind !== 'OperationDefinition' || !opDef.selectionSet) {
    throw new Error('Invalid GraphQL fields');
  }
  return opDef.selectionSet;
}

function pickFieldsFromData(data: Record<string, unknown> | null | undefined, selectionSet: SelectionSetNode): Record<string, unknown> {
  const result: Record<string, unknown> = {};

  for (const selection of selectionSet.selections) {
    if (selection.kind === 'Field') {
      const key = selection.name.value;
      if (data != null && key in data) {
        const value = data[key];
        if (selection.selectionSet && value != null) {
          result[key] = pickFieldsFromData(data[key] as Record<string, unknown>, selection.selectionSet);
        } else {
          result[key] = data[key];
        }
      }
    }
  }

  return result;
}
