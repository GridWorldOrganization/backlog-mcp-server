#!/usr/bin/env node
// Copyright (c) 2025 Nulab inc.
// Licensed under the MIT License.

import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { default as env } from 'env-var';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { getBacklogOAuthConfig } from './auth/backlogOAuthConfig.js';
import { createTokenStore } from './auth/tokenStore.js';
import { createTranslationHelper } from './createTranslationHelper.js';
import { createBacklogMcpServer } from './createBacklogMcpServer.js';
import { runHttpMcpServer } from './httpMcpServer.js';
import {
  createBacklogClientRegistry,
  createOAuthBacklogClientRegistry,
} from './utils/backlogClientRegistry.js';
import { logger } from './utils/logger.js';
import packageJson from '../package.json' with { type: 'json' };

const { version } = packageJson;

const SLIM_TOOLS = [
  'get_issue',
  'get_issues',
  'count_issues',
  'add_issue',
  'update_issue',
  'delete_issue',
  'get_issue_comments',
  'add_issue_comment',
  'update_issue_comment',
  'delete_issue_comment',
  'get_priorities',
  'get_categories',
  'get_custom_fields',
  'get_issue_types',
  'get_resolutions',
  'get_wiki_pages',
  'get_wikis_count',
  'get_wiki',
  'add_wiki',
  'update_wiki',
  'delete_wiki',
  'get_wiki_history',
  'get_wiki_tags',
  'get_wiki_stars',
];

// Swallow SIGPIPE and stdout/stderr EPIPE so the process doesn't crash when a
// client disconnects mid-stream. Node.js emits EPIPE as both a Unix signal and
// as an error event on stdout/stderr streams — both must be handled.
process.on('SIGPIPE', () => {});
process.stdout.on('error', (err) => {
  if (!('code' in err) || err.code !== 'EPIPE') throw err;
});
process.stderr.on('error', (err) => {
  if (!('code' in err) || err.code !== 'EPIPE') throw err;
});

process.on('uncaughtException', (error) => {
  logger.error({ err: error }, 'Uncaught exception');
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  logger.error({ err: reason }, 'Unhandled rejection');
  process.exit(1);
});

try {
  process.loadEnvFile();
} catch {
  // .env file is optional
}

const oauthConfig = getBacklogOAuthConfig();

const argv = yargs(hideBin(process.argv))
  .option('transport', {
    type: 'string',
    choices: ['stdio', 'http'] as const,
    describe: 'MCP transport: stdio (default) or Streamable HTTP',
    default:
      env.get('MCP_TRANSPORT').default('stdio').asString().toLowerCase() ===
      'http'
        ? 'http'
        : 'stdio',
  })
  .option('http-host', {
    type: 'string',
    describe: 'Host to bind for HTTP transport',
    default: env.get('MCP_HTTP_HOST').default('127.0.0.1').asString(),
  })
  .option('http-port', {
    type: 'number',
    describe: 'Port for HTTP transport',
    default: env.get('MCP_HTTP_PORT').default(3333).asPortNumber(),
  })
  .option('http-path', {
    type: 'string',
    describe: 'URL path for MCP endpoint (must start with /)',
    default: env.get('MCP_HTTP_PATH').default('/mcp').asString(),
  })
  .option('http-json-response', {
    type: 'boolean',
    describe:
      'Prefer JSON responses over SSE streams when supported (Streamable HTTP)',
    default: env.get('MCP_HTTP_JSON_RESPONSE').default('false').asBool(),
  })
  .option('http-allowed-hosts', {
    type: 'string',
    describe:
      'Comma-separated allowed Host header values when binding to all interfaces (recommended with 0.0.0.0)',
    default: env.get('MCP_HTTP_ALLOWED_HOSTS').default('').asString(),
  })
  .option('max-tokens', {
    type: 'number',
    describe: 'Maximum number of tokens allowed in the response',
    default: env.get('MAX_TOKENS').default('50000').asIntPositive(),
  })
  .option('optimize-response', {
    type: 'boolean',
    describe:
      'Enable GraphQL-style response optimization to include only requested fields',
    default: env.get('OPTIMIZE_RESPONSE').default('false').asBool(),
  })
  .option('prefix', {
    type: 'string',
    describe: 'Optional string prefix to prepend to all generated outputs',
    default: env.get('PREFIX').default('').asString(),
  })
  .option('export-translations', {
    type: 'boolean',
    describe: 'Export translations and exit',
    default: false,
  })
  .option('enable-toolsets', {
    type: 'array',
    describe: `Specify which toolsets to enable. Defaults to 'all'.
Available toolsets:
  - space:       Tools for managing Backlog space settings and general information
  - project:     Tools for managing projects, categories, custom fields, and issue types
  - issue:       Tools for managing issues and their comments
  - wiki:        Tools for managing wiki pages
  - git:         Tools for managing Git repositories and pull requests
  - notifications: Tools for managing user notifications`,
    default: env.get('ENABLE_TOOLSETS').default('all').asArray(','),
  })
  .option('enable-tools', {
    type: 'array',
    describe:
      'Specify individual tool names to enable. When set, only these tools are registered (regardless of --enable-toolsets and --preset). Leave unset to rely on --preset.',
    default: env
      .get('ENABLE_TOOLS')
      .default('')
      .asArray(',')
      .filter((s: string) => s.length > 0),
  })
  .option('preset', {
    type: 'string',
    choices: ['slim', 'full'] as const,
    describe:
      'Tool preset: "slim" (31 core tools, default) or "full" (all 69 tools)',
    default: env.get('PRESET').default('slim').asString(),
  })
  .option('dynamic-toolsets', {
    type: 'boolean',
    describe:
      'Enable dynamic toolsets such as enable_toolset, list_available_toolsets, etc.',
    default: env.get('ENABLE_DYNAMIC_TOOLSETS').default('false').asBool(),
  })
  .parseSync();

const clientRegistry = oauthConfig
  ? createOAuthBacklogClientRegistry(oauthConfig.backlogDomain)
  : createBacklogClientRegistry();
const backlog = clientRegistry.createScopedClient();

const tokenStore = oauthConfig ? createTokenStore() : undefined;
let cleanupTimer: ReturnType<typeof setInterval> | undefined;
if (tokenStore) {
  cleanupTimer = setInterval(() => tokenStore.cleanup(), 5 * 60 * 1000);
  cleanupTimer.unref();
}

const useFields = argv.optimizeResponse;

const transHelper = createTranslationHelper();

const maxTokens = argv.maxTokens;
const prefix = argv.prefix;
const enabledToolsets = argv.dynamicToolsets
  ? (argv.enableToolsets as string[]).filter((a) => a !== 'all')
  : (argv.enableToolsets as string[]);

// Determine active tool list
// Priority: --enable-tools (explicit) > --preset
const explicitTools = (argv.enableTools as string[]).filter(
  (s) => s.length > 0
);
const enableTools =
  explicitTools.length > 0
    ? explicitTools
    : argv.preset === 'full'
      ? [] // empty = no filter = all tools
      : SLIM_TOOLS; // default: slim

const mcpOption = { useFields: useFields, maxTokens, prefix };

// Factory: creates a fresh MCP server with all tools registered.
// Used once for stdio; one fresh instance per HTTP session for Streamable HTTP.
const createServer = () =>
  createBacklogMcpServer({
    version,
    useFields,
    backlog,
    clientRegistry,
    transHelper,
    enabledToolsets,
    enableTools,
    mcpOption,
    dynamicToolsets: argv.dynamicToolsets,
  });

if (argv.exportTranslations) {
  const data = transHelper.dump();
  // eslint-disable-next-line no-console
  console.log(JSON.stringify(data, null, 2));
  process.exit(0);
}

function normalizeHttpPath(p: string): string {
  if (!p.startsWith('/')) {
    return `/${p}`;
  }
  return p;
}

async function main() {
  if (oauthConfig && argv.transport === 'stdio') {
    logger.warn(
      'OAuth is configured but transport is stdio. OAuth is only available with HTTP transport.'
    );
  }

  if (argv.transport === 'http') {
    const httpPath = normalizeHttpPath(argv.httpPath);
    const allowedHostsRaw = argv.httpAllowedHosts;
    const allowedHosts =
      allowedHostsRaw && allowedHostsRaw.trim().length > 0
        ? allowedHostsRaw
            .split(',')
            .map((h) => h.trim())
            .filter(Boolean)
        : undefined;

    const { shutdown } = await runHttpMcpServer({
      host: argv.httpHost,
      port: argv.httpPort,
      path: httpPath,
      version,
      enableJsonResponse: argv.httpJsonResponse,
      allowedHosts,
      createServer,
      oauthConfig,
      tokenStore,
    });

    process.once('SIGINT', () => {
      void shutdown()
        .catch((err) => logger.error({ err }, 'Error during shutdown'))
        .finally(() => process.exit(0));
    });
    process.once('SIGTERM', () => {
      void shutdown()
        .catch((err) => logger.error({ err }, 'Error during shutdown'))
        .finally(() => process.exit(0));
    });

    logger.info(
      {
        transport: 'http',
        host: argv.httpHost,
        port: argv.httpPort,
        path: httpPath,
        oauth: !!oauthConfig,
      },
      oauthConfig
        ? 'Backlog MCP Server listening (Streamable HTTP + OAuth)'
        : 'Backlog MCP Server listening (Streamable HTTP)'
    );
    return;
  }

  const server = createServer();
  const transport = new StdioServerTransport();
  await server.connect(transport);
  logger.info('Backlog MCP Server running on stdio');
}

main().catch((error) => {
  logger.error({ err: error }, 'Fatal error in main()');
  process.exit(1);
});
