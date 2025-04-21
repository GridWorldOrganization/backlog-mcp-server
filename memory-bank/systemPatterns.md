# System Patterns

## Architecture Overview

The Backlog MCP Server functions as a bridge between Claude and the Backlog API using the Model Context Protocol (MCP). The system consists of the following main components:

```mermaid
graph TD
    Claude[Claude AI] <--> MCP[MCP Protocol]
    MCP <--> Server[Backlog MCP Server]
    Server <--> BacklogAPI[Backlog API]
    Server <--> Config[Configuration Files]
```

## Main Components

### 1. MCP Server
- Implements an MCP server using `@modelcontextprotocol/sdk`
- Communicates with Claude etc through standard input/output (stdio)
- Manages tool registration and execution

### 2. Tool Definition System
- Defines tools corresponding to each Backlog API endpoint
- Validates input parameters using Zod schemas
- Returns data in a unified response format

### 3. Translation System
- Translation helper for multi-language support
- Loads translations from configuration files or environment variables
- Ensures descriptions are always displayed with fallback functionality

### 4. Backlog API Client
- Communicates with the Backlog API using the `backlog-js` library
- Retrieves authentication information from environment variables
- Each tool uses the API client to perform operations

## Design Patterns

### 1. Factory Pattern
- The `allTools` function receives a Backlog client and translation helper, generating instances of all tools
- Each tool has its own definition and implementation while providing a unified interface

### 2. Dependency Injection
- Backlog client and translation helper are injected into tools
- Mock objects can be injected during testing for easier unit testing

### 3. Adapter Pattern
- Converts Backlog API responses to MCP tool output format
- Adapts diverse response formats from different API endpoints to a unified format

### 4. Strategy Pattern
- Translation system selects appropriate translations from different sources (environment variables, configuration files, default values)
- Provides optimal translations based on priority

## Important Implementation Paths

### Tool Registration Flow
```mermaid
sequenceDiagram
    participant Main as index.ts
    participant Register as registerTools.ts
    participant Tools as tools.ts
    participant Tool as Individual Tools

    Main->>Register: registerTools(server, backlog, helper)
    Register->>Tools: allTools(backlog, helper)
    Tools->>Tool: Tool factory function
    Tool-->>Tools: Tool instance
    Tools-->>Register: Array of tools
    Register->>Register: Duplicate check
    Register->>Main: Register tools with server
```

### Request Processing Flow
```mermaid
sequenceDiagram
    participant Claude as Claude
    participant Server as MCP Server
    participant Tool as Tool
    participant Backlog as Backlog API

    Claude->>Server: Tool request
    Server->>Tool: Handler call
    Tool->>Backlog: API call
    Backlog-->>Tool: API response
    Tool-->>Server: Formatted response
    Server-->>Claude: Tool response
```

### Translation Resolution Flow
```mermaid
sequenceDiagram
    participant Tool as Tool
    participant Helper as TranslationHelper
    participant Env as Environment Variables
    participant Config as Configuration File

    Tool->>Helper: t(key, fallback)
    Helper->>Env: Check environment variables
    alt Exists in environment variables
        Env-->>Helper: Translation value
    else Does not exist in environment variables
        Helper->>Config: Check configuration file
        alt Exists in configuration file
            Config-->>Helper: Translation value
        else Does not exist in configuration file
            Helper-->>Helper: Use fallback value
        end
    end
    Helper-->>Tool: Resolved translation
```

## Component Relationships

### Tool Structure
Each tool has the following structure:
- **Name**: Identifier representing the API endpoint
- **Description**: Description of the tool's functionality (translatable)
- **Schema**: Definition of input parameters (Zod)
- **Handler**: Function that performs the actual processing

### File Structure
```
src/
├── index.ts              # Entry point
├── registerTools.ts      # Tool registration logic
├── toolDefinition.ts     # Tool definition types and common functions
├── createTranslationHelper.ts # Translation helper
└── tools/
    ├── tools.ts          # Exports all tools
    ├── getSpace.ts       # Individual tool implementation
    ├── getSpace.test.ts  # Corresponding test
    └── ...               # Other tools
```

## Test Strategy

- Create unit tests corresponding to each tool
- Use mocks to eliminate external dependencies on the Backlog API
- Focus on validating input parameters and output format
- Use translation helper mocks to test translation functionality
