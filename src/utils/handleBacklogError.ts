import { Error as BacklogError } from 'backlog-js';
import { Output } from '../toolDefinition.js';
import { CallToolResult, McpError } from '@modelcontextprotocol/sdk/types.js';

/**
 * Converts a BacklogError (or unknown error) into Output format for MCP response
 */
type MaybeBacklogErrorObject = {
    _name?: string;
    _status?: number;
    _url?: string;
    _body?: {
        errors?: {
            message?: string;
            code?: number;
            moreInfo?: string;
        }[];
    };
};

export function handleBacklogError(err: unknown): CallToolResult {
    const e = err as MaybeBacklogErrorObject;

    if (e._name && e._status && e._url) {
        const code = e._body?.errors?.[0]?.code;
        const message = e._body?.errors?.[0]?.message ?? 'An unknown error occurred.';
        const status = e._status;
        const url = e._url;

        if (e._name === 'BacklogAuthError') {
            return {
                isError: true,
                content: [{
                    type: 'text',
                    text: `Authentication failed (HTTP ${status}). Please check your API key or permissions.`,
                }]
            };
        }

        if (e._name === 'BacklogApiError') {
            return {
                isError: true,
                content: [{
                    type: 'text',
                    text: `Backlog API error (code: ${code}, status: ${status})\n${message}`,
                }]
            };
        }

        if (e._name === 'UnexpectedError') {
            return {
                isError: true,
                content: [{
                    type: 'text',
                    text: `Unexpected error (HTTP ${status}) while accessing ${url}.`,
                }]
            };
        }
    }

    const fallbackMessage = (err as Error)?.message ?? "An unknown error occurred.";
    return {
        isError: true,
        content: [{
            type: "text",
            text: `Unknown error: ${fallbackMessage}`
        }]
    };
}
