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
- Options for field picking and token limiting are injected into handlers

### 3. Adapter Pattern
- Converts Backlog API responses to MCP tool output format
- Adapts diverse response formats from different API endpoints to a unified format

### 4. Strategy Pattern
- Translation system selects appropriate translations from different sources (environment variables, configuration files, default values)
- Provides optimal translations based on priority

### 5. Decorator Pattern
- Tool handlers are wrapped with various transformers (error handling, field picking, token limiting, result formatting)
- Each transformer adds specific functionality while maintaining the same interface
- Transformers can be composed in different orders based on requirements

### 6. Pipeline Pattern
- Response processing follows a clear pipeline: handler → error handling → field picking → token limiting → result formatting
- Each step in the pipeline processes the data and passes it to the next step

## Important Implementation Paths

### Tool Registration Flow
```mermaid
sequenceDiagram
    participant Main as index.ts
    participant Register as registerTools.ts
    participant Tools as tools.ts
    participant Tool as Individual Tools
    participant Compose as composeToolHandler.ts

    Main->>Register: registerTools(server, backlog, helper, options)
    Register->>Tools: allTools(backlog, helper)
    Tools->>Tool: Tool factory function
    Tool-->>Tools: Tool instance
    Tools-->>Register: Array of tools
    Register->>Register: Duplicate check
    Register->>Compose: composeToolHandler(tool, options)
    Compose-->>Register: Composed handler
    Register->>Main: Register tools with server
```

### Request Processing Flow
```mermaid
sequenceDiagram
    participant Claude as Claude
    participant Server as MCP Server
    participant Handler as Composed Handler
    participant ErrorHandler as Error Handler
    participant FieldPicker as Field Picker
    participant TokenLimiter as Token Limiter
    participant ResultFormatter as Result Formatter
    participant Tool as Tool Handler
    participant Backlog as Backlog API

    Claude->>Server: Tool request with fields
    Server->>Handler: Call with input
    Handler->>ErrorHandler: Safe execution
    ErrorHandler->>Tool: Execute tool handler
    Tool->>Backlog: API call
    Backlog-->>Tool: API response
    Tool-->>ErrorHandler: Raw result
    alt Field picking enabled
        ErrorHandler->>FieldPicker: Result with fields
        FieldPicker->>FieldPicker: Parse GraphQL fields
        FieldPicker->>FieldPicker: Pick requested fields
        FieldPicker->>TokenLimiter: Filtered result
    else Field picking disabled
        ErrorHandler->>TokenLimiter: Full result
    end
    TokenLimiter->>TokenLimiter: Count tokens
    TokenLimiter->>TokenLimiter: Stream if large
    TokenLimiter->>TokenLimiter: Truncate if over limit
    TokenLimiter->>ResultFormatter: Limited result
    ResultFormatter->>Server: Formatted response
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

### Token Limiting Flow
```mermaid
sequenceDiagram
    participant Handler as Tool Handler
    participant Limiter as Token Limiter
    participant Counter as Token Counter
    participant Streamer as Content Streamer

    Handler->>Limiter: Large response
    Limiter->>Limiter: Convert to stream
    Limiter->>Streamer: Stream chunks
    loop For each chunk
        Streamer->>Counter: Count tokens
        Counter-->>Streamer: Token count
        alt Under limit
            Streamer->>Streamer: Add chunk
            Streamer->>Streamer: Update total count
        else Over limit
            Streamer->>Streamer: Add truncation message
            Streamer->>Streamer: Break loop
        end
    end
    Streamer-->>Limiter: Limited content
    Limiter-->>Handler: Formatted result
```

## Component Relationships

### Tool Structure
Each tool has the following structure:
- **Name**: Identifier representing the API endpoint
- **Description**: Description of the tool's functionality (translatable)
- **Schema**: Definition of input parameters (Zod)
- **OutputSchema**: Definition of output structure (Zod, for field picking)
- **ImportantFields**: List of fields that are most commonly needed (for examples)
- **Handler**: Function that performs the actual processing

### Handler Composition Structure
```mermaid
graph TD
    RawHandler[Raw Tool Handler] --> ErrorHandler[Error Handler]
    ErrorHandler --> FieldPicker[Field Picker]
    FieldPicker --> TokenLimiter[Token Limiter]
    TokenLimiter --> ResultFormatter[Result Formatter]
    ResultFormatter --> FinalHandler[Final Handler]
```

### File Structure
```
src/
├── index.ts              # Entry point
├── registerTools.ts      # Tool registration logic
├── createTranslationHelper.ts # Translation helper
├── backlog/
│   ├── backlogErrorHandler.ts # Backlog-specific error handling
│   └── parseBacklogAPIError.ts # Error parsing utilities
├── handlers/
│   ├── builders/
│   │   └── composeToolHandler.ts # Handler composition
│   └── transformers/
│       ├── wrapWithErrorHandling.ts # Error handling transformer
│       ├── wrapWithFieldPicking.ts # Field picking transformer
│       ├── wrapWithTokenLimit.ts # Token limiting transformer
│       └── wrapWithToolResult.ts # Result formatting transformer
├── tools/
│   ├── tools.ts          # Exports all tools
│   ├── getSpace.ts       # Individual tool implementation
│   ├── getSpace.test.ts  # Corresponding test
│   └── ...               # Other tools
├── types/
│   ├── mcp.ts            # MCP-related types
│   ├── result.ts         # Result types
│   ├── tool.ts           # Tool definition types
│   └── zod/              # Zod schema definitions
└── utils/
    ├── contentStreamingWithTokenLimit.ts # Token limiting utilities
    ├── generateFieldsDescription.ts # Field description generation
    ├── runToolSafely.ts  # Safe tool execution
    └── tokenCounter.ts   # Token counting utilities
```

## Test Strategy

- Create unit tests corresponding to each tool
- Use mocks to eliminate external dependencies on the Backlog API
- Focus on validating input parameters and output format
- Use translation helper mocks to test translation functionality
