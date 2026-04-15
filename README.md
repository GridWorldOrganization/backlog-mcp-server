# Backlog MCP Server

![MIT License](https://img.shields.io/badge/license-MIT-green.svg)
![Build](https://github.com/nulab/backlog-mcp-server/actions/workflows/ci.yml/badge.svg)
![Last Commit](https://img.shields.io/github/last-commit/nulab/backlog-mcp-server.svg)

Backlog API と対話するための Model Context Protocol (MCP) サーバーです。Claude Desktop / Cline / Cursor などの AI エージェントから、プロジェクト・課題・Wiki ページなどを操作できます。

*A Model Context Protocol (MCP) server for interacting with the Backlog API. Provides tools for managing projects, issues, wiki pages, and more through AI agents like Claude Desktop / Cline / Cursor.*

> 📘 このドキュメントは日本語を主、英語を副として併記しています。
> *This document is written with Japanese as the primary language and English as a secondary annotation per section.*

## 機能 / Features

- プロジェクト管理ツール（作成・取得・更新・削除）
- 課題トラッキングとコメント（作成・更新・削除・一覧）
- バージョン／マイルストーン管理
- Wiki ページ操作
- Git リポジトリとプルリクエストツール
- 通知ツール
- GraphQL 風フィールド選択によるレスポンス最適化
- 大きなレスポンスに対するトークン制限

*Projects, issues & comments, version/milestones, wiki pages, Git repositories & pull requests, notifications, GraphQL-style field selection, and token limiting for large responses.*

## はじめに / Getting Started

### 必要環境 / Requirements

- Docker
- API アクセス可能な Backlog アカウント / A Backlog account with API access
- Backlog アカウントの API キー / API key from your Backlog account

### Option 1: Docker でインストール / Install via Docker

もっとも簡単な方法は MCP 設定経由で Docker イメージを使うことです。

*The easiest way to use this MCP server is through MCP configurations.*

1. MCP 設定を開きます / Open MCP settings
2. MCP 設定セクションへ移動します / Navigate to the MCP configuration section
3. 以下の設定を追加します / Add the following configuration:

```json
{
  "mcpServers": {
    "backlog": {
      "command": "docker",
      "args": [
        "run",
        "--pull",
        "always",
        "-i",
        "--rm",
        "-e",
        "BACKLOG_DOMAIN",
        "-e",
        "BACKLOG_API_KEY",
        "ghcr.io/nulab/backlog-mcp-server"
      ],
      "env": {
        "BACKLOG_DOMAIN": "your-domain.backlog.com",
        "BACKLOG_API_KEY": "your-api-key"
      }
    }
  }
}
```

`your-domain.backlog.com` と `your-api-key` は実際の値に置き換えてください。

*Replace `your-domain.backlog.com` with your Backlog domain and `your-api-key` with your Backlog API key.*

✅ `--pull always` が使えない環境では、手動でイメージを更新できます。
*If you cannot use `--pull always`, you can manually update the image:*

```
docker pull ghcr.io/nulab/backlog-mcp-server:latest
```

### Option 2: npx でインストール / Install via npx

リポジトリをクローンせず、`npx` で直接サーバーを起動する方法です。手軽にセットアップできます。

*You can also run the server directly using `npx` without cloning the repository — a convenient way to run the server without a full installation.*

```json
{
  "mcpServers": {
    "backlog": {
      "command": "npx",
      "args": ["backlog-mcp-server"],
      "env": {
        "BACKLOG_DOMAIN": "your-domain.backlog.com",
        "BACKLOG_API_KEY": "your-api-key"
      }
    }
  }
}
```

### Option 3: 手動セットアップ (Node.js) / Manual Setup (Node.js)

1. クローンしてインストール / Clone and install:

   ```bash
   git clone https://github.com/nulab/backlog-mcp-server.git
   cd backlog-mcp-server
   npm install
   npm run build
   ```

2. テンプレートから `.env` を作成して必要な変数を設定します。
   *Create `.env` from template and set required variables:*

   ```bash
   cp .env.example .env
   ```

   `.env` に以下の値を設定します / Set the following in `.env`:

   - `BACKLOG_DOMAIN=your-domain.backlog.com`
   - `BACKLOG_API_KEY=your-api-key`

3. ローカル起動 / Run locally:

   ```bash
   npm run dev
   ```

4. MCP 設定として JSON を指定します。
   *Set your JSON to use as MCP:*

   ```json
   {
     "mcpServers": {
       "backlog": {
         "command": "node",
         "args": ["your-repository-location/build/index.js"],
         "env": {
           "BACKLOG_DOMAIN": "your-domain.backlog.com",
           "BACKLOG_API_KEY": "your-api-key"
         }
       }
     }
   }
   ```

## ツール設定 / Tool Configuration

`--enable-toolsets` フラグまたは `ENABLE_TOOLSETS` 環境変数で、個別の **ツールセット** を有効・無効にできます。AI エージェントに公開するツールを絞り込むことで、コンテキストサイズの削減にもつながります。

*You can selectively enable or disable specific **toolsets** using the `--enable-toolsets` flag or the `ENABLE_TOOLSETS` environment variable. This gives better control over which tools are exposed to the AI agent and helps reduce context size.*

### 利用可能なツールセット / Available Toolsets

`"all"` 指定時はすべてのツールセットが有効になります（デフォルト）。

*All toolsets are enabled when `"all"` is specified (default).*

| Toolset         | 説明 / Description                                                      |
| --------------- | ----------------------------------------------------------------------- |
| `space`         | Backlog スペース全般の情報管理 / Space settings and general information |
| `project`       | プロジェクト・カテゴリ・カスタムフィールド・課題タイプ管理 / Projects, categories, custom fields, issue types |
| `issue`         | 課題・コメント・バージョンマイルストーン管理 / Issues, comments, version milestones |
| `wiki`          | Wiki ページ管理 / Wiki pages                                            |
| `git`           | Git リポジトリとプルリクエスト管理 / Git repositories and pull requests |
| `notifications` | 通知管理 / User notifications                                           |
| `document`      | ドキュメント閲覧 / Documents and document trees                         |

### ツールセットの指定 / Specifying Toolsets

CLI から指定する場合 / Using via CLI:

```bash
--enable-toolsets space,project,issue
```

環境変数で指定する場合 / Or via environment variable:

```
ENABLE_TOOLSETS="space,project,issue"
```

`all` を指定するとすべて有効化されます（デフォルト挙動と同じ）。エージェントに渡るツール数が多すぎて不安定なときは、使わないツールセットを無効化すると安定することがあります。

*If `all` is specified, all toolsets will be enabled — this is also the default. Disabling unused toolsets can improve stability when the tool list is too large.*

> 🧩 ヒント: 多くのツールはプロジェクト情報を起点にするため、`project` ツールセットは有効のままにすることを強く推奨します。
> *Tip: The `project` toolset is highly recommended, as many other tools rely on project data as an entry point.*

### 動的ツールセット検出 (実験的) / Dynamic Toolset Discovery (Experimental)

AI エージェントと組み合わせる場合、実行時にツールセットを動的に検出・有効化できます。

*When used with AI agents, you can enable runtime discovery of toolsets.*

CLI での有効化 / Enabling via CLI:

```
--dynamic-toolsets
```

環境変数での有効化 / Or via environment variable:

```
-e DYNAMIC_TOOLSETS=1 \
```

この設定を有効化すると、LLM がツールインターフェース経由でツールセットを一覧・有効化できるようになります。

*With dynamic toolsets enabled, the LLM can list and activate toolsets on demand via the tool interface.*

## 利用可能なツール / Available Tools

### Toolset: `space`

Backlog スペース設定と全般情報のためのツール。
*Tools for managing Backlog space settings and general information.*

- `get_space`: スペース情報を返します / Returns information about the Backlog space.
- `get_users`: スペース内のユーザー一覧を返します / Returns list of users in the space.
- `get_myself`: 認証済みユーザーの情報を返します / Returns info about the authenticated user.

### Toolset: `project`

プロジェクト・カテゴリ・カスタムフィールド・課題タイプを管理するツール。
*Tools for managing projects, categories, custom fields, and issue types.*

- `get_project_list`: プロジェクト一覧 / Returns list of projects.
- `add_project`: プロジェクト作成 / Creates a new project.
- `get_project`: プロジェクト詳細 / Returns information about a specific project.
- `update_project`: プロジェクト更新 / Updates an existing project.
- `delete_project`: プロジェクト削除 / Deletes a project.

### Toolset: `issue`

課題・コメント・優先度・カテゴリ・カスタムフィールド・課題タイプ・完了理由・ウォッチリスト管理ツール。
*Tools for managing issues, comments, priorities, categories, custom fields, issue types, resolutions, and watching lists.*

- `get_issue`: 課題詳細 / Returns information about a specific issue.
- `get_issues`: 課題一覧 / Returns list of issues.
- `count_issues`: 課題件数 / Returns count of issues.
- `add_issue`: 課題作成 / Creates a new issue in the specified project.
- `update_issue`: 課題更新 / Updates an existing issue.
- `delete_issue`: 課題削除 / Deletes an issue.
- `get_issue_comments`: コメント一覧 / Returns list of comments for an issue.
- `add_issue_comment`: コメント追加 / Adds a comment to an issue.
- `update_issue_comment`: コメント更新（投稿者のみ）/ Updates a comment (author only).
- `get_priorities`: 優先度一覧 / Returns list of priorities.
- `get_categories`: カテゴリ一覧 / Returns list of categories for a project.
- `get_custom_fields`: カスタムフィールド一覧 / Returns list of custom fields for a project.
- `get_issue_types`: 課題タイプ一覧 / Returns list of issue types for a project.
- `get_resolutions`: 完了理由一覧 / Returns list of issue resolutions.
- `get_watching_list_items`: ウォッチ一覧 / Returns watching items for a user.
- `get_watching_list_count`: ウォッチ件数 / Returns count of watching items.
- `add_watching`: ウォッチ追加 / Adds a new watch to an issue.
- `update_watching`: ウォッチ更新 / Updates an existing watch note.
- `delete_watching`: ウォッチ削除 / Deletes a watch from an issue.
- `mark_watching_as_read`: ウォッチ既読化 / Marks a watch as read.
- `get_version_milestone_list`: マイルストーン一覧 / Returns version milestones for a project.
- `add_version_milestone`: マイルストーン作成 / Creates a new version milestone.
- `update_version_milestone`: マイルストーン更新 / Updates a version milestone.
- `delete_version_milestone`: マイルストーン削除 / Deletes a version milestone.

### Toolset: `wiki`

Wiki ページ管理ツール。
*Tools for managing wiki pages.*

- `get_wiki_pages`: Wiki 一覧 / Returns list of Wiki pages.
- `get_wikis_count`: Wiki 件数 / Returns count of wiki pages in a project.
- `get_wiki`: Wiki 詳細 / Returns information about a specific wiki page.
- `add_wiki`: Wiki 作成。`content` に含まれる過剰エスケープされた `\n` を自動復元します。/ Creates a wiki page; auto-recovers over-escaped `\n` sequences in `content`.
- `update_wiki`: Wiki 更新。`add_wiki` と同じ `\n` 自動復元。/ Updates a wiki page; same `\n` auto-recovery.
- `delete_wiki`: Wiki 削除 / Deletes a wiki page.
- `get_wiki_history`: 編集履歴 / Returns the edit history of a wiki page.
- `get_wiki_stars`: スター一覧 / Returns the list of stars on a wiki page.
- `get_wiki_tags`: タグ一覧 / Returns tags used by wiki pages in a project.
- `get_wiki_attachments`: 添付一覧 / Returns attachments on a wiki page.
- `add_wiki_attachments`: アップロード済み添付を Wiki に紐付け（`upload_attachment` 参照）/ Links uploaded attachments to a wiki page.
- `delete_wiki_attachment`: 添付削除 / Removes an attachment from a wiki page.

### Toolset: `shared` (横断ユーティリティ / cross-resource utilities)

- `upload_attachment`: ローカルファイルを Backlog スペースへアップロードし、添付 ID を返します。戻り値を `add_wiki_attachments` や課題作成・コメント等で利用します。/ Uploads a local file to Backlog and returns an attachment ID; use the returned id with `add_wiki_attachments`, issue creation, comments, etc.
- `add_star`: 課題・コメント・Wiki・プルリクエスト・PR コメントにスターを付けます。対象 ID はいずれか1つだけ指定します。/ Adds a star to an issue, comment, wiki, pull request, or PR comment. Exactly one target ID must be provided.

### Toolset: `git`

Git リポジトリとプルリクエスト管理ツール。
*Tools for managing Git repositories and pull requests.*

- `get_git_repositories`: リポジトリ一覧 / Returns list of Git repositories.
- `get_git_repository`: リポジトリ詳細 / Returns a specific Git repository.
- `get_pull_requests`: PR 一覧 / Returns list of pull requests.
- `get_pull_requests_count`: PR 件数 / Returns count of pull requests.
- `get_pull_request`: PR 詳細 / Returns a specific pull request.
- `add_pull_request`: PR 作成 / Creates a new pull request.
- `update_pull_request`: PR 更新 / Updates an existing pull request.
- `get_pull_request_comments`: PR コメント一覧 / Returns PR comments.
- `add_pull_request_comment`: PR コメント追加 / Adds a comment to a PR.
- `update_pull_request_comment`: PR コメント更新 / Updates a PR comment.

### Toolset: `notifications`

ユーザー通知管理ツール。
*Tools for managing user notifications.*

- `get_notifications`: 通知一覧 / Returns list of notifications.
- `get_notifications_count`: 通知件数 / Returns count of notifications.
- `reset_unread_notification_count`: 未読件数リセット / Resets unread notification count.
- `mark_notification_as_read`: 通知既読化 / Marks a notification as read.

### Toolset: `document`

ドキュメントとドキュメントツリーの管理ツール。
*Tools for managing documents and document trees.*

- `get_document_tree`: プロジェクトのドキュメント階層ツリー / Returns the hierarchical tree of documents for a project.
- `get_documents`: ドキュメントのフラット一覧 / Returns a flat list of documents in a project or folder.
- `get_document`: ドキュメント詳細（メタデータ・本文・添付）/ Returns detailed information about a specific document.

## 使用例 / Usage Examples

AI エージェントに MCP サーバーを登録したら、会話の中で直接ツールを利用できます。

*Once the MCP server is configured in AI agents, you can use the tools directly in your conversations.*

- プロジェクト一覧 / Listing Projects

  ```
  Could you list all my Backlog projects?
  ```

- 課題作成 / Creating a New Issue

  ```
  Create a new bug issue in the PROJECT-KEY project with high priority titled "Fix login page error"
  ```

- プロジェクト詳細 / Getting Project Details

  ```
  Show me the details of the PROJECT-KEY project
  ```

- Git リポジトリ / Working with Git Repositories

  ```
  List all Git repositories in the PROJECT-KEY project
  ```

- プルリクエスト / Managing Pull Requests

  ```
  Show me all open pull requests in the repository "repo-name" of PROJECT-KEY project
  ```

  ```
  Create a new pull request from branch "feature/new-feature" to "main" in the repository "repo-name" of PROJECT-KEY project
  ```

- ウォッチ中アイテム / Watching Items

  ```
  Show me all items I'm watching
  ```

### 国際化 / 説明の上書き / i18n / Overriding Descriptions

ホームディレクトリに `.backlog-mcp-serverrc.json` を置くことで、ツールの説明（description）を上書きできます。

*You can override tool descriptions by creating a `.backlog-mcp-serverrc.json` in your **home directory**.*

キーにツール名、値に新しい説明を記述します。
*The file is a JSON object with tool names as keys and new descriptions as values.*

```json
{
  "TOOL_ADD_ISSUE_COMMENT_DESCRIPTION": "An alternative description",
  "TOOL_CREATE_PROJECT_DESCRIPTION": "Create a new project in Backlog"
}
```

サーバー起動時には以下の優先順位で説明が決定されます。
*When the server starts, descriptions are resolved in this priority order:*

1. 環境変数 / Environment variables (e.g., `BACKLOG_MCP_TOOL_ADD_ISSUE_COMMENT_DESCRIPTION`)
2. `.backlog-mcp-serverrc.json` のエントリ（`.json`, `.yaml`, `.yml` 対応）/ Entries in the config file (`.json`, `.yaml`, `.yml` supported)
3. 組み込みの英語フォールバック値 / Built-in fallback values (English)

設定例 / Sample config:

```json
{
  "mcpServers": {
    "backlog": {
      "command": "docker",
      "args": [
        "run",
        "-i",
        "--rm",
        "-e",
        "BACKLOG_DOMAIN",
        "-e",
        "BACKLOG_API_KEY",
        "-v",
        "/yourcurrentdir/.backlog-mcp-serverrc.json:/root/.backlog-mcp-serverrc.json:ro",
        "ghcr.io/nulab/backlog-mcp-server"
      ],
      "env": {
        "BACKLOG_DOMAIN": "your-domain.backlog.com",
        "BACKLOG_API_KEY": "your-api-key"
      }
    }
  }
}
```

### 現在の翻訳をエクスポート / Exporting Current Translations

`--export-translations` フラグを付けて起動すると、現在のデフォルト翻訳（上書き分を含む）を標準出力へ書き出せます。

*Running the binary with `--export-translations` prints all tool descriptions to stdout, including any customizations.*

例 / Example:

```bash
docker run -i --rm ghcr.io/nulab/backlog-mcp-server node build/index.js --export-translations
```

または / or:

```bash
npx github:nulab/backlog-mcp-server --export-translations
```

### 日本語テンプレートの利用 / Using a Japanese Translation Template

日本語設定のサンプルは以下のパスに同梱されています。
*A sample Japanese configuration file is provided at:*

```bash
translationConfig/.backlog-mcp-serverrc.json.example
```

ホームディレクトリへコピーして `.backlog-mcp-serverrc.json` として使用し、内容を必要に応じて編集してください。

*Copy it to your home directory as `.backlog-mcp-serverrc.json` and edit as needed.*

### 環境変数による上書き / Using Environment Variables

ツールごとの説明は環境変数でも上書きできます。変数名はツールキーを大文字化し、`BACKLOG_MCP_` を前置します。

*You can also override descriptions via environment variables. Names are based on tool keys, prefixed with `BACKLOG_MCP_` in uppercase.*

例: `TOOL_ADD_ISSUE_COMMENT_DESCRIPTION` を上書きする場合 / Example — to override `TOOL_ADD_ISSUE_COMMENT_DESCRIPTION`:

```json
{
  "mcpServers": {
    "backlog": {
      "command": "docker",
      "args": [
        "run",
        "-i",
        "--rm",
        "-e", "BACKLOG_DOMAIN",
        "-e", "BACKLOG_API_KEY",
        "-e", "BACKLOG_MCP_TOOL_ADD_ISSUE_COMMENT_DESCRIPTION"
        "ghcr.io/nulab/backlog-mcp-server"
      ],
      "env": {
        "BACKLOG_DOMAIN": "your-domain.backlog.com",
        "BACKLOG_API_KEY": "your-api-key",
        "BACKLOG_MCP_TOOL_ADD_ISSUE_COMMENT_DESCRIPTION": "An alternative description"
      }
    }
  }
}
```

設定ファイルは起動時に同期的にロードされます。環境変数は常に設定ファイルより優先されます。

*The config file is loaded synchronously at startup. Environment variables always take precedence over the config file.*

## 高度な機能 / Advanced Features

### ツール名のプレフィックス / Tool Name Prefixing

ツール名に任意のプレフィックスを付けられます。
*You can add a prefix to tool names:*

```
--prefix backlog_
```

環境変数の場合 / Or via environment variable:

```
PREFIX="backlog_"
```

同一環境で複数の MCP サーバー／ツールを使う際、名前衝突を避けるのに便利です。例えば `get_project` を `backlog_get_project` にして他サービスと区別できます。

*Useful when multiple MCP servers or tools live in the same environment — e.g., `get_project` becomes `backlog_get_project` to avoid collisions.*

### レスポンス最適化とトークン制限 / Response Optimization & Token Limits

#### フィールド選択 (GraphQL 風) / Field Selection (GraphQL-style)

```
--optimize-response
```

環境変数の場合 / Or environment variable:

```
OPTIMIZE_RESPONSE=1
```

必要なフィールドだけをリクエストできます / Then request only specific fields:

```
get_project(projectIdOrKey: "PROJECT-KEY", fields: "{ name key description }")
```

AI はフィールド選択を使ってレスポンスを最適化します。
*The AI will use field selection to optimize the response.*

利点 / Benefits:

- 不要フィールドを除外してレスポンスサイズを削減 / Reduce response size by requesting only needed fields
- 必要なデータ点へフォーカス / Focus on specific data points
- 大きなレスポンスでの性能改善 / Improve performance for large responses

#### トークン制限 / Token Limiting

トークン上限を超えないよう、大きなレスポンスは自動的に切り詰められます。
*Large responses are automatically limited to prevent exceeding token limits.*

- デフォルト上限: 50,000 トークン / Default limit: 50,000 tokens
- `MAX_TOKENS` 環境変数で変更可能 / Configurable via `MAX_TOKENS`
- 上限を超えると、警告メッセージと共に切り詰められます / Exceeding the limit truncates the response with a message

変更方法 / Change it via:

```
MAX_TOKENS=10000
```

> 注意: ベストエフォートによる緩和策であり、厳密な強制ではありません。
> *Note: This is a best-effort mitigation, not a guaranteed enforcement.*

### 完全なカスタム設定例 / Full Custom Configuration Example

このセクションは複数の環境変数を組み合わせた高度な設定例です。実験的機能を含み、すべての MCP クライアントで動作するとは限りません。MCP 標準仕様の一部ではないため、利用は自己責任でお願いします。

*This section demonstrates advanced configuration using multiple environment variables. These are experimental and may not be supported across all MCP clients — not part of the MCP standard spec; use with caution.*

```json
{
  "mcpServers": {
    "backlog": {
      "command": "docker",
      "args": [
        "run",
        "-i",
        "--rm",
        "-e",
        "BACKLOG_DOMAIN",
        "-e",
        "BACKLOG_API_KEY",
        "-e",
        "MAX_TOKENS",
        "-e",
        "OPTIMIZE_RESPONSE",
        "-e",
        "PREFIX",
        "-e",
        "ENABLE_TOOLSETS",
        "ghcr.io/nulab/backlog-mcp-server"
      ],
      "env": {
        "BACKLOG_DOMAIN": "your-domain.backlog.com",
        "BACKLOG_API_KEY": "your-api-key",
        "MAX_TOKENS": "10000",
        "OPTIMIZE_RESPONSE": "1",
        "PREFIX": "backlog_",
        "ENABLE_TOOLSETS": "space,project,issue",
        "ENABLE_DYNAMIC_TOOLSETS": "1"
      }
    }
  }
}
```

## 開発 / Development

### テスト実行 / Running Tests

```bash
npm test
```

### 新しいツールの追加 / Adding New Tools

1. 既存ツールのパターンに従い、`src/tools/` 配下に新規ファイルを作成 / Create a new file in `src/tools/` following existing patterns
2. 対応するテストファイルを作成 / Create a corresponding test file
3. `src/tools/tools.ts` に追加 / Register in `src/tools/tools.ts`
4. ビルドして動作確認 / Build and test your changes

### コマンドラインオプション / Command Line Options

サーバーは次のオプションをサポートします。
*The server supports these command line options:*

- `--export-translations`: 翻訳キーと値をエクスポート / Export all translation keys and values
- `--optimize-response`: GraphQL 風フィールド選択を有効化 / Enable GraphQL-style field selection
- `--max-tokens=NUMBER`: レスポンスのトークン上限 / Set maximum token limit
- `--prefix=STRING`: ツール名に付与する任意プレフィックス（デフォルトは空）/ Optional prefix for tool names (default: "")
- `--enable-toolsets <toolsets...>`: 有効化するツールセット（カンマ区切り or 複数指定）。デフォルトは `"all"`。/ Specify which toolsets to enable (comma-separated or multiple). Defaults to `"all"`.
  例 / Example: `--enable-toolsets space,project` または / or `--enable-toolsets issue --enable-toolsets git`
  利用可能 / Available: `space`, `project`, `issue`, `wiki`, `git`, `notifications`.

例 / Example:

```bash
node build/index.js --optimize-response --max-tokens=100000 --prefix="backlog_" --enable-toolsets space,issue
```

## ライセンス / License

本プロジェクトは [MIT License](./LICENSE) の下で提供されています。
*This project is licensed under the [MIT License](./LICENSE).*

本ツールは MIT License に基づき、**無保証・公式サポートなし** で提供されます。内容を確認のうえ、自身のニーズに合うかを判断してから利用してください。不具合は [GitHub Issues](../../issues) へご報告ください。

*Please note: this tool is provided under the MIT License **without any warranty or official support**. Use it at your own risk after reviewing the contents and determining its suitability for your needs. Report issues via [GitHub Issues](../../issues).*

---

## このフォークについて / About this fork

本フォークは以下のメンバーが保守しています。
*This fork is maintained by:*

- [GridWorld合同会社 (GridWorld LLC)](https://gridworld.co)
- [GridJapan株式会社 (GridJapan Inc.)](https://gridjapan.com)
