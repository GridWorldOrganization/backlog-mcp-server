import { withPickingFields } from "./withPickingFields"; 
import { jest, describe, it, expect } from '@jest/globals';

describe("withPickingFields", () => {
    const baseData = {
        id: 1,
        name: "Sample Project",
        config: {
            enable: true,
            mode: "advanced",
            details: {
                retries: 3,
                owner: "admin"
            }
        },
        unused: "skipme"
    };

    const fn = jest.fn(async (_) => baseData);

    it("returns full data when fields is not specified", async () => {
        const wrapped = withPickingFields(fn);
        const result = await wrapped({});

        expect(result).toEqual(baseData);
    });

    it("filters top-level fields", async () => {
        const wrapped = withPickingFields(fn);
        const result = await wrapped({
            fields: `{ id name }`
        });

        expect(result).toEqual({
            id: 1,
            name: "Sample Project"
        });
    });

    it("filters nested fields", async () => {
        const wrapped = withPickingFields(fn);
        const result = await wrapped({
            fields: `{ config { mode } }`
        });

        expect(result).toEqual({
            config: {
                mode: "advanced"
            }
        });
    });

    it("ignores fields not in data", async () => {
        const wrapped = withPickingFields(fn);
        const result = await wrapped({
            fields: `{ id unknown }`
        });

        expect(result).toEqual({
            id: 1
        });
    });

    it("filters array of objects", async () => {
        const arrayFn = jest.fn(async () => [
            { id: 1, name: "A", extra: 1 },
            { id: 2, name: "B", extra: 2 }
        ]);

        const wrapped = withPickingFields(arrayFn);
        const result = await wrapped({
            fields: `{ name }`
        });

        expect(result).toEqual([
            { name: "A" },
            { name: "B" }
        ]);
    });

    it("filters deeply nested fields", async () => {
        const wrapped = withPickingFields(fn);
        const result = await wrapped({
            fields: `{ config { details { owner } } }`
        });

        expect(result).toEqual({
            config: {
                details: {
                    owner: "admin"
                }
            }
        });
    });
});
