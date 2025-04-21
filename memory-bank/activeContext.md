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

1. **Addition of Pull Request-related Tools**
   - Implemented pull request creation, update, and comment functionality
   - Added corresponding tests

2. **Addition of Watch-related Tools**
   - Implemented functionality to retrieve watched item lists and counts
   - Added corresponding tests

3. **README Updates**
   - Updated the "Available Tools" section to properly categorize all tools
   - Added the "Space Tools" section
   - Made the "Category Tools" section independent

4. **Enhanced Multi-language Support**
   - Created Japanese translation file (`.backlog-mcp-serverrc.json.ja.json`)
   - Organized and unified translation keys

5. **Build and Deploy Improvements**
   - Added support for multi-architecture (amd64, arm64) Docker image builds
   - Configured automatic publishing to GitHub Container Registry

## Active Decisions and Considerations

1. **API Endpoint Coverage**
   - Prioritizing implementation of API endpoints listed in URLlist.md
   - Gradually adding unimplemented endpoints

2. **Test Strategy**
   - Creating unit tests corresponding to each tool
   - Using mocks to isolate Backlog API dependencies
   - Focusing on validating input parameters and output format

3. **Multi-language Support**
   - Using English as the default language, with support for other languages like Japanese
   - Providing customization possibilities through translation files
   - Supporting translation overrides through environment variables

4. **Deployment Options**
   - Prioritizing easy deployment via Docker
   - Also supporting direct Node.js execution
   - Customization through mounted configuration files

## Important Patterns and Design Principles

1. **Tool Implementation Consistency**
   - Each tool has the same structure (name, description, schema, handler)
   - Input validation using Zod schemas
   - Unified response format

2. **Translation System**
   - Key-based translation system
   - Priority: environment variables → configuration file → default value
   - Tracking of all translation keys used

3. **Error Handling**
   - Appropriate handling of API errors and meaningful error messages
   - Clear reporting of input validation errors

4. **Testability**
   - Ease of testing through dependency injection
   - Isolation of external dependencies using mocks

## Learnings and Project Insights

1. **MCP Integration Best Practices**
   - Importance of tool naming conventions and parameters
   - Improved usability through appropriate descriptions
   - Importance of schema validation

2. **Backlog API-specific Considerations**
   - Flexibility to support both IDs and keys
   - Permission requirements for some API endpoints
   - Handling differences in response formats

3. **Multi-language Support Challenges**
   - Management and consistency of translation keys
   - Importance of default values
   - Maintainability of translation files
