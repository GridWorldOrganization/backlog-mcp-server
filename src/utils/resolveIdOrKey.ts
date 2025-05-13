import { TranslationHelper } from "../createTranslationHelper.js";

export type EntityName = "issue" | "project" | "issueComment";

type ResolveResult = { ok: true; value: string } | { ok: false; error: Error };

type IdOrKey = {
    id?: number;
    key?: string;
};

/**
 * Resolves either the ID or the key of a given entity.
 * Returns a Result-like object with either the resolved value or an error.
 * Does not throw directly; allows handler-level error control.
 */
export function resolveIdOrKey<E extends EntityName>(
    entity: E,
    values: { id?: number; key?: string },
    t: TranslationHelper["t"]
): ResolveResult {
    const idOrKey = tryResolveIdOrKey(values);
    if (!idOrKey) {
        return {
            ok: false,
            error: new Error(
                t(
                    `TOOL_${entity.toUpperCase()}_ID_OR_KEY_REQUIRED`,
                    `${capitalize(entity)} ID or key is required`
                )
            ),
        };
    }

    return { ok: true, value: idOrKey };
}

/**
 * Resolves the ID or key from a given object.
 * Returns the stringified ID if present, otherwise the key.
 * Returns undefined if neither is present.
 */
function tryResolveIdOrKey(values: IdOrKey): string | undefined {
    return values.id !== undefined
        ? String(values.id)
        : values.key;
}

function capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
}
