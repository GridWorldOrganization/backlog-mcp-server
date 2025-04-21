# Backlog MCP Server（日本語）

![MIT License](https://img.shields.io/badge/license-MIT-green.svg)
![Build](https://github.com/nulab/backlog-mcp-server/actions/workflows/ci.yml/badge.svg)
![Last Commit](https://img.shields.io/github/last-commit/nulab/backlog-mcp-server.svg)

Backlog API とやり取りするための Model Context Protocol（MCP）サーバーです。Claude Desktop や Cline、Cursor などのAIエージェントを通じて、Backlog 上でプロジェクトや課題、Wikiページなどを操作するためのツールを提供します。

## 主な機能

- プロジェクト管理（作成、取得、更新、削除）
- 課題管理（作成、更新、削除、一覧）
- Wiki ページ管理
- Git リポジトリ管理
- プルリクエスト管理（作成、更新、一覧、コメント）
- 通知管理
- ウォッチリスト管理
- その他多数の Backlog API 機能に対応

## 必要条件

- Docker
- Backlog アカウント（API アクセス付き）
- Backlog の API キー

## インストール方法

### オプション1: Docker によるインストール

Claude Desktop または Cline の MCP 設定から以下を行ってください：

1. Claude Desktop または Cline の設定を開く  
2. MCP 設定セクションに移動  
3. 以下の設定を追加：

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

`your-domain.backlog.com` と `your-api-key` を実際の値に置き換えてください。

### オプション2: 手動インストール

1. リポジトリをクローン：
```bash
git clone https://github.com/nulab/backlog-mcp-server.git
cd backlog-mcp-server
```

2. 依存パッケージをインストール：
```bash
npm install
```

3. ビルド：
```bash
npm run build
```

4. MCP用のJSON設定を作成：

```json
{
  "mcpServers": {
    "backlog": {
      "command": "node",
      "args": [
        "your-repojitory-location/build/index.js"
      ],
      "env": {
        "BACKLOG_DOMAIN": "your-domain.backlog.com",
        "BACKLOG_API_KEY": "your-api-key"
      }
    }
  }
}
```

## 使用可能なツール

以下のような Backlog 機能に対応するツールを提供しています：

[Available Tools セクションへ](https://github.com/nulab/backlog-mcp-server?tab=readme-ov-file#available-tools)

## 使用例

MCP サーバーを Claude や Cline などの AI エージェントに設定すれば、以下のようなプロンプトで利用できます：

- `Backlog 上のすべてのプロジェクトを一覧表示して`
- `PROJECT-KEY に「ログインページのバグ修正」という高優先度の課題を作成して`
- `PROJECT-KEY に含まれる Git リポジトリをリストアップして`
- `repo-name のオープン中のプルリクエストを一覧表示して`
- `feature/new-feature ブランチから main ブランチへのプルリクを作成して`

## i18n / 説明文の上書き

ツールの説明文は、ホームディレクトリに `.backlog-mcp-serverrc.json` を作成することで上書きできます。

```json
{
  "TOOL_ADD_ISSUE_COMMENT_DESCRIPTION": "カスタムの説明文",
  "TOOL_CREATE_PROJECT_DESCRIPTION": "新しいプロジェクトを Backlog に作成します"
}
```

優先順位：

1. 環境変数（例：`BACKLOG_MCP_TOOL_ADD_ISSUE_COMMENT_DESCRIPTION`）
2. `.backlog-mcp-serverrc.json` に記載された値（.json / .yaml / .yml 対応）
3. 内部のデフォルト（英語）

サンプル構成：

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
        "-v", "/yourcurrentdir/.backlog-mcp-serverrc.json:/root/.backlog-mcp-serverrc.json:ro",
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

## 翻訳のエクスポート

以下コマンドで現在の翻訳設定を出力できます：

```bash
docker run -i --rm ghcr.io/nulab/backlog-mcp-server node build/index.js --export-translations
```

または：

```bash
npx github:nulab/backlog-mcp-server --export-translations
```

## 日本語テンプレートの使用

以下にテンプレートがあります：

```bash
translationConfig/.backlog-mcp-serverrc.json.example
```

ホームディレクトリにコピーして編集してください。

## 環境変数による上書き

環境変数は `BACKLOG_MCP_` を接頭辞にして使用します。

例：

```json
{
  "env": {
    "BACKLOG_MCP_TOOL_ADD_ISSUE_COMMENT_DESCRIPTION": "カスタムの説明文"
  }
}
```

環境変数が設定されている場合は、ファイルよりも優先されます。

## 開発

### テスト実行

```bash
npm test
```

### 新しいツールの追加

1. `src/tools/` に新しいファイルを追加  
2. 対応するテストを作成  
3. `src/tools/tools.ts` に追加  
4. ビルドとテストを実行  

## ライセンス

このプロジェクトは [MITライセンス](./LICENSE) のもとで公開されています。

> 本ツールは MIT ライセンスのもとで提供されており、**動作保証や公式サポートは行っておりません**。  
> ご利用にあたっては内容をご確認のうえ、自己責任でご判断ください。  
> 問題がある場合は [GitHub Issues](../../issues) にてご報告をお願いいたします。
