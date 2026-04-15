# Plan: add_document_reaction MCP Tool (GridWorld独自)

## 目的
Backlogドキュメント/コメントへの絵文字リアクションをMCP経由で操作可能にする。
公開REST APIに該当エンドポイントが存在しないため、Backlog内部エンドポイントをセッション認証で叩く。

## 解明済みの仕様（Playwrightで実測）

### 認証
- **セッションCookieのみ**（APIキー/CSRFトークン不要）
- エンドポイント: `gridworld.backlog.com` 配下の `/document/backend/...`

### リアクション追加フロー（2段階POST）
1. `POST /document/backend/{PROJECT_KEY}/{DOC_ID}/comment/create`
   - multipart/form-data:
     - statusId: `0`
     - content: `{"type":"doc","content":[{"type":"paragraph","content":[]}]}`
     - plain: `(空)`
     - commentType: `reaction`
   - レスポンス: `{comment_id: "019d8f2b..."}`
2. `POST /document/backend/{PROJECT_KEY}/{DOC_ID}/comment/{comment_id}/reply/create`
   - multipart/form-data:
     - content: `😱`（任意Unicode絵文字）
     - plain: `😱`

## 実装範囲

### 新規ファイル
- `src/tools/addDocumentReaction.ts` — MCPツール本体
- `src/tools/addDocumentReaction.test.ts` — ユニットテスト（fetch mock）
- `src/backlog/sessionClient.ts` — セッションCookieでPOSTする薄いHTTPクライアント
- `scripts/refresh-session.ts` — PlaywrightでログインしてCookieを `.env` に書き出すヘルパー（手動実行）

### 変更ファイル
- `src/tools/tools.ts` — document toolset に登録
- `.env.example` — `BACKLOG_SESSION_COOKIE` を追加（済）

### ツール仕様
```
name: add_document_reaction
inputs:
  projectIdOrKey: string (例: "GJ_PROJECT")
  documentId: string (例: "019d8ede054f7bf7881e91968b40e2d0")
  emoji: string (例: "👍")
outputs:
  success: boolean
  commentId: string
  replyId: string
```

## 非対象（スコープ外）
- リアクション削除/一覧取得（別タスク）
- 課題・PRへのリアクション（本スコープはドキュメントのみ）
- 絵文字ピッカーUI再現（Unicodeで直接指定する設計）

## 既知のリスク
1. **内部API非公開**: 予告なく仕様変更の可能性 → バージョン固定不可
2. **規約グレーゾーン**: Nulab利用規約上の扱いが明示されていない → 社内利用限定
3. **Cookie期限切れ**: セッション有効期限到来時の再ログインが必要 → `scripts/refresh-session.ts` で運用
4. **認証情報の漏洩**: `.env` にパスワード・Cookie保存 → `.gitignore` で除外済、チーム共有時は別手段
5. **ボット検知**: Backlog側のbot検知に引っかかる可能性 → レート制限を実装

## 代替案（検討済み、不採用）
- **A**: Nulab本家にPR投げて公開API化を待つ → Issue #97 提出済だが実現まで時間かかる
- **B**: Playwrightで毎回ブラウザ操作 → 遅い、リソース消費大
- **C**: 本番公開MCPとして配布 → 規約リスク、採用せず（社内限定）
