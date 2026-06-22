# scripts/experiments — 実API手動実験

このフォルダは **実際の Backlog API を叩いて挙動を確かめる手動実験スクリプト** 置き場。
`*.test.ts`（vitest のユニットテスト、`src/` に同居）とは別物。ここのスクリプトは
**本物の API キーと本番スペースへの書き込み** を伴うので、CI では実行しない。

実行には自分の API キーが要る:

```bash
export BACKLOG_API_KEY=（自分のキー）
```

---

## wiki_tag_test.py — Wiki タグ挙動の検証

### 背景 / 疑問
Backlog Wiki の編集画面には「タグ」専用の入力欄・メニューが無い。ではタグはどう付くのか。

### 仮説
タグは **ページ名（タイトル）の先頭に `[タグ名]` と書く** ことで設定される。
保存時に Backlog が `[...]` をパースしてタグへ変換し、ページ名本体からは除去する。
であれば API の `name` フィールドに角括弧タグを含めるだけで、API からタグを設定できるはず。

### 実行
```bash
# URL からプロジェクトを解決して作成
python3 scripts/experiments/wiki_tag_test.py \
    --url https://YOURSPACE.backlog.com/wiki/PROJECT_KEY/Home \
    --name 'とびさこClaudeがテスト' \
    --tags テスト,タグ実験

# 送信内容だけ確認（書き込まない）
python3 scripts/experiments/wiki_tag_test.py --project-id 12345 --name x --tags a,b --dry-run
```

`--tags a,b` を渡すと、送信ページ名は `[a][b] <name>` に組み立てられる。

### 検証結果（2026-06-22 / gridworld.backlog.com / GJ_BOARD）
送信:
- `projectId`: 767868（`GJ_BOARD`）
- `name`: `[テスト][タグ実験] とびさこClaudeがテスト`

API レスポンス:
- `wikiId`: 5512798
- 保存後 `name`: **`とびさこClaudeがテスト`**（角括弧は剥がれた）
- `tags`: **`['テスト', 'タグ実験']`**（角括弧がタグへ変換）
- URL: `https://gridworld.backlog.com/alias/wiki/5512798`

### 結論
1. Backlog Wiki のタグ = **ページ名先頭の `[タグ名]` 記法**。GUI に専用欄は無い。
2. 保存時に `[...]` がタグへ変換され、ページ名本体からは除去される。
3. **API（`add_wiki` / `update_wiki` の `name`）でもタグを設定できる。**
   このリポジトリの MCP ツールは `name` をそのまま渡すので、追加実装なしでタグ操作可能。
4. `get_wiki_tags` は読み取り専用（既存タグの一覧）。タグ付け自体には不要だが、
   既存タグと表記を揃えたい場合の参照に使える。

### 依存
- `scripts/resolve_project.py`（URL → projectId 解決を再利用）
- Python 3.8+ / 標準ライブラリのみ
