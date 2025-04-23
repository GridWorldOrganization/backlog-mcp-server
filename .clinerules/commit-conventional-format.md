# Conventional Commit Format Guide

This document describes the conventional commit message format. Use this as a reference for generating or validating commit messages via an LLM (Large Language Model).

## Format

Each commit message should follow the structure:

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

### Examples

```
feat: add login button component
fix(auth): handle token expiration error
docs(readme): update setup instructions
refactor(api): simplify request handler logic
```

## Types

Use the following standard types:

- `feat`: A new feature  
- `fix`: A bug fix  
- `docs`: Documentation-only changes  
- `style`: Changes that do not affect the meaning of the code (white-space, formatting, missing semicolons, etc)  
- `refactor`: A code change that neither fixes a bug nor adds a feature  
- `perf`: A code change that improves performance  
- `test`: Adding missing tests or correcting existing tests  
- `chore`: Changes to the build process or auxiliary tools and libraries  
- `ci`: Changes to CI configuration files and scripts  
- `build`: Changes that affect the build system or external dependencies  

## Scope (Optional)

The scope specifies the module or area affected by the change, such as `auth`, `api`, `db`, etc.

Example:

```
fix(auth): re-validate session token after refresh
```

## Description

Keep it short and imperative, like a commit title.  
Do not capitalize the first letter unless it's a proper noun, and do not add a period at the end.

## Body (Optional)

Explain what and why, not how.  
Use bullet points if helpful.

## Footer (Optional)

Used for breaking changes or issue references.

Examples:

```
BREAKING CHANGE: auth tokens are now rotated every hour
```

```
Closes #123
```

## Summary

Follow this format strictly when generating commit messages programmatically or interacting with a Git workflow tool powered by LLMs. This helps ensure consistent, parsable, and meaningful commit history.
