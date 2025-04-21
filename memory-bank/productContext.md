# Product Context

## Project Purpose

The Backlog MCP Server is a server that integrates Backlog's API with the [Model Context Protocol (MCP)](https://github.com/anthropics/model-context-protocol), allowing Claude AI assistant to directly access Backlog's project management features.

## Problems Solved

1. **AI and Backlog Integration**
   - Provides a means for large language models (LLMs) like Claude to access and manipulate Backlog data
   - Allows users to operate Backlog through AI assistants

2. **Project Management Efficiency**
   - Enables Backlog operations through natural language, reducing UI operations
   - Allows complex queries and batch operations to be delegated to AI

3. **Simplified Information Access**
   - Provides a unified access method to project, issue, Wiki, and Git information
   - Makes it easier to retrieve information across multiple Backlog features

## Key Use Cases

1. **Project Management**
   - Creating, updating, and deleting projects
   - Retrieving and analyzing project information

2. **Issue Management**
   - Creating, updating, and deleting issues
   - Searching and listing issues
   - Adding comments to issues

3. **Wiki Management**
   - Retrieving and searching Wiki pages
   - Analyzing Wiki information

4. **Git/Pull Request Management**
   - Retrieving repository information
   - Creating, updating, and commenting on pull requests
   - Retrieving and analyzing pull request lists

5. **Notification Management**
   - Retrieving and marking notifications as read
   - Counting and resetting notification counts

6. **Watch Management**
   - Retrieving lists of watched items
   - Counting watches

## User Experience Goals

1. **Seamless Integration**
   - Natural operation of Backlog from within Claude etc
   - Operation without being conscious of complex API details

2. **Multi-language Support**
   - Support for tool descriptions in multiple languages including Japanese and English
   - Providing a user experience tailored to the user's language environment

3. **Flexible Deployment**
   - Easy deployment via Docker
   - Customization of settings through environment variables

4. **Extensibility**
   - Easy adaptation to new Backlog API endpoints
   - Customization of functionality through custom descriptions
