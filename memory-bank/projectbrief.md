# Project Overview

## Purpose
- Build an MCP server to connect with the Backlog API
- Use backlog-js for connecting to Backlog
- The BacklogJS interface is published [here](https://github.com/nulab/backlog-js/blob/master/src/backlog.ts)

## Implementation Approach
- Create tools corresponding to each API endpoint and place them in `./src/tools/${endpointName}.ts`
- Write endpoint names in camelCase (e.g., `getProjectList`)
- Create corresponding test files (`${endpointName}.test.ts`) for each tool
- Refer to the API endpoints listed in URLlist.md for implementation

## Basic Tool Structure
1. Tool Definition
   - Name: Name representing the API endpoint (e.g., `get_space`)
   - Description: Description of the tool's functionality (in English)
   - Schema: Definition of input parameters (using Zod)
   - Handler: Function that performs the actual processing

2. Internationalization
   - Descriptions are defined in a translatable format
   - Descriptions can be customized via the `.backlog-mcp-serverrc.json` file

3. Testing
   - Create test files corresponding to each tool
   - Use mocks to simulate Backlog API calls

## Deployment Method
- Provided as a Docker container
- Published to GitHub Container Registry (ghcr.io)
- Configuration injected via environment variables (`BACKLOG_DOMAIN`, `BACKLOG_API_KEY`)

## Usage
- Register as an MCP server in Claude settings
- Set necessary environment variables when running Docker
- Multi-language support available through translation files
