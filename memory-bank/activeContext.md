# Active Context

## Current Work Focus

Currently, the Backlog MCP Server implements tools corresponding to the following feature categories:

1. **Space-related Tools**
   - Retrieving space information
   - Retrieving user lists
   - Retrieving information about oneself
   - Retrieving priority lists
   - Retrieving resolution lists
   - Retrieving issue type lists

2. **Project-related Tools**
   - Retrieving project lists
   - Creating projects
   - Retrieving project information
   - Updating projects
   - Deleting projects

3. **Issue-related Tools**
   - Retrieving issue information
   - Retrieving issue lists
   - Retrieving issue counts
   - Creating issues
   - Updating issues
   - Deleting issues

4. **Comment-related Tools**
   - Retrieving issue comment lists
   - Adding issue comments

5. **Wiki-related Tools**
   - Retrieving Wiki page lists
   - Retrieving Wiki page counts
   - Retrieving Wiki information
   - Creating Wiki pages

6. **Category-related Tools**
   - Retrieving category lists

7. **Notification-related Tools**
   - Retrieving notification lists
   - Retrieving notification counts
   - Resetting unread notification counts
   - Marking notifications as read

8. **Git Repository-related Tools**
   - Retrieving Git repository lists
   - Retrieving Git repository information

9. **Pull Request-related Tools**
   - Retrieving pull request lists
   - Retrieving pull request counts
   - Retrieving pull request information
   - Creating pull requests
   - Updating pull requests
   - Retrieving pull request comment lists
   - Adding pull request comments
   - Updating pull request comments

10. **Watch-related Tools**
    - Retrieving watched item lists
    - Retrieving watch counts

## Recent Changes

1. **Token Limiting Implementation**
   - Added token limiting functionality to prevent large responses from exceeding token limits
   - Implemented streaming for large responses with automatic truncation
   - Added configurable maximum token limit via environment variables or CLI arguments

2. **Field Picking Optimization**
   - Added GraphQL-style field selection to allow clients to request only specific fields
   - Implemented field picking transformer to optimize response size
   - Added field description generation for better documentation

3. **Error Handling Improvements**
   - Enhanced Backlog API error parsing and handling
   - Added more descriptive error messages for different error types
   - Implemented unified error handling system

4. **Documentation Updates**
   - Updated README with new features and usage examples
   - Added Japanese translation of documentation
   - Improved installation and configuration instructions

5. **Build and Infrastructure**
   - Updated Docker configuration to use Node.js 22
   - Improved multi-stage Docker build for smaller image size
   - Updated dependencies to latest versions

## Active Decisions and Considerations

1. **Response Optimization**
   - Implementing GraphQL-style field selection to reduce response size
   - Adding token limiting to prevent large responses from causing issues
   - Balancing between comprehensive data and performance

2. **API Endpoint Coverage**
   - Prioritizing implementation of API endpoints listed in URLlist.md
   - Gradually adding unimplemented endpoints
   - Focusing on most commonly used endpoints first

3. **Test Strategy**
   - Creating unit tests corresponding to each tool
   - Using mocks to isolate Backlog API dependencies
   - Focusing on validating input parameters and output format
   - Testing error handling and edge cases

4. **Multi-language Support**
   - Using English as the default language, with support for other languages like Japanese
   - Providing customization possibilities through translation files
   - Supporting translation overrides through environment variables
   - Maintaining consistent translation keys across the system

5. **Deployment Options**
   - Prioritizing easy deployment via Docker
   - Also supporting direct Node.js execution
   - Customization through mounted configuration files
   - Supporting environment variable configuration for flexibility

## Important Patterns and Design Principles

1. **Tool Implementation Consistency**
   - Each tool has the same structure (name, description, schema, handler)
   - Input validation using Zod schemas
   - Unified response format
   - Consistent error handling

2. **Handler Composition Pattern**
   - Using function composition for tool handlers
   - Applying transformers in a specific order (error handling → field picking → token limiting → result formatting)
   - Separation of concerns through transformer functions

3. **Translation System**
   - Key-based translation system
   - Priority: environment variables → configuration file → default value
   - Tracking of all translation keys used
   - Support for multiple languages through configuration

4. **Error Handling**
   - Appropriate handling of API errors and meaningful error messages
   - Clear reporting of input validation errors
   - Categorization of errors (authentication, API, unexpected, unknown)
   - Consistent error response format

5. **Testability**
   - Ease of testing through dependency injection
   - Isolation of external dependencies using mocks
   - Unit tests for each component and transformer

## Learnings and Project Insights

1. **MCP Integration Best Practices**
   - Importance of tool naming conventions and parameters
   - Improved usability through appropriate descriptions
   - Importance of schema validation
   - Balancing between comprehensive data and token limits

2. **Response Optimization Techniques**
   - GraphQL-style field selection for targeted data retrieval
   - Token counting and limiting for large responses
   - Streaming large responses in chunks
   - Balancing between data completeness and performance

3. **Backlog API-specific Considerations**
   - Flexibility to support both IDs and keys
   - Permission requirements for some API endpoints
   - Handling differences in response formats
   - Error handling for various API response scenarios

4. **Multi-language Support Challenges**
   - Management and consistency of translation keys
   - Importance of default values
   - Maintainability of translation files
   - Balancing between translation flexibility and complexity
