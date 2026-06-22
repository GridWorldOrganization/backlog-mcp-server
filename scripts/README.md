# resolve_project — Backlog URL → projectKey / 数値 projectId 解決ガイド

別システム（AI エージェント含む）が **このガイドだけ** を見て、**自前の Backlog API キー** を使い即実装・即利用できる自己完結ドキュメント。

---

## 1. 何をするか / なぜ要るか

Backlog の人間向け URL（課題・Wiki・プロジェクト）から、**プロジェクトキー**（例 `GRIDJAPAN`）と **数値プロジェクト ID**（例 `740913`）を解決する。

理由: この MCP サーバの `add_issue` / `get_issues` 等は **数値 `projectId` 必須**。だが人間も AI も普段見るのは URL かキー。キー→数値 ID の変換手段が MCP 単体に無い。このスクリプトがその穴を埋める。

```
入力:  https://gridworld.backlog.com/view/GRIDJAPAN-83
出力:  projectKey=GRIDJAPAN  projectId=740913
```

---

## 2. 必要なもの

- **自分の Backlog API キー**（読み取り権限）。Backlog 個人設定 → API で発行。
- 経路 A（そのまま使う）: **Python 3.8+**。標準ライブラリのみ。`pip install` 不要。
- 経路 B（移植）: 任意言語。下の「§5 API 契約」を見て再実装。

API キーはコード・URL・ログに直書きしない。**環境変数 `BACKLOG_API_KEY`** で渡す。

---

## 3. クイックスタート（経路 A: 同梱スクリプト）

```bash
export BACKLOG_API_KEY=（自分のキー）
python3 scripts/resolve_project.py https://YOURSPACE.backlog.com/view/KEY-123
```

出力（テキスト）:

```
space      : YOURSPACE.backlog.com
projectKey : KEY
projectId  : 123456
name       : プロジェクト名
```

JSON が欲しい場合 `--json`:

```bash
python3 scripts/resolve_project.py --json https://YOURSPACE.backlog.com/alias/wiki/5511068
# => {"space": "...", "projectKey": "...", "projectId": 740913, "name": "..."}
```

キーを環境変数でなく引数で渡す場合 `--api-key xxxx`（履歴に残るので非推奨）。

---

## 4. 対応 URL 形式

| 形式 | 例 | 解決方法 |
|------|----|---------|
| 課題ビュー | `/view/GRIDJAPAN-83` | 課題キーの末尾 `-数字` を除去 → projectKey |
| プロジェクト | `/projects/GRIDJAPAN` | 次セグメント = projectKey |
| Wiki（キー形式） | `/wiki/GRIDJAPAN/Home` | 次セグメント = projectKey |
| Git 等 | `/git/GRIDJAPAN/repo` | 次セグメント = projectKey |
| **Wiki（ID 形式）** | `/alias/wiki/5511068` | キー不在 → Wiki ID で **2 ホップ**解決 |
| 純数値セグメント | `/wiki/123456` | ID とみなし Wiki ID 経路へ |

プロジェクトキーは英大文字・数字・`_` で **数字始まり不可**。よって純数値セグメントは必ず ID と判定できる。

---

## 5. API 契約（経路 B: 任意言語へ移植する場合）

ベース URL: `https://{space}/api/v2`
認証: **全リクエストにクエリ `?apiKey={KEY}`** を付与。

使うエンドポイントは 2 つだけ:

| メソッド | パス | 返却（抜粋） | 用途 |
|---------|------|------------|------|
| GET | `/projects/{projectIdOrKey}` | `{ "id": 740913, "projectKey": "GRIDJAPAN", "name": "GridJapan" }` | キー or ID → プロジェクト |
| GET | `/wikis/{wikiId}` | `{ "id": 5511068, "name": "...", "projectId": 740913 }` | Wiki ID → projectId |

### アルゴリズム

```
1. URL を分解 → host（= space）, パスセグメント配列
2. 種別判定（kind）:
   a. セグメントに "alias","wiki" が連続し直後がある    → kind=wiki_id, value=その値
   b. "view" の次セグメント                            → kind=key,     value=末尾"-数字"除去
   c. {wiki|projects|git|document|file} の次が純数値    → kind=wiki_id, value=その数値
   d. {wiki|projects|git|document|file} の次セグメント  → kind=key,     value=その値
   e. フォールバック: 末尾セグメントの"-数字"を除去      → kind=key
3. 解決:
   - kind=key     → GET /projects/{value}            → project
   - kind=wiki_id → GET /wikis/{value} で projectId
                    → GET /projects/{projectId}       → project
4. 結果: projectKey = project.projectKey, projectId = project.id
```

### 最小実装イメージ（疑似コード）

```
func resolve(url, apiKey):
    host, kind, value = parseUrl(url)
    if kind == "wiki_id":
        wiki = GET https://{host}/api/v2/wikis/{value}?apiKey={apiKey}
        proj = GET https://{host}/api/v2/projects/{wiki.projectId}?apiKey={apiKey}
    else:
        proj = GET https://{host}/api/v2/projects/{value}?apiKey={apiKey}
    return { projectKey: proj.projectKey, projectId: proj.id }
```

---

## 6. エラーと対処

| 症状 | 原因 | 対処 |
|------|------|------|
| `401` / `403` | API キー無効・権限不足 | キー再発行。対象プロジェクトの参加権限を確認 |
| `404` | プロジェクト / Wiki が無い・キー誤り | URL とキー（大小文字）を確認 |
| `接続失敗` | ネットワーク・ドメイン誤り | `{space}.backlog.com` か `.jp` か確認 |
| projectKey 抽出ミス | 未知の URL 形式 | §4 の形式か確認。§5 の規則で要拡張 |

---

## 7. セキュリティ

- API キーは **環境変数のみ**。コード・URL・コミット・ログに残さない。
- ログ出力時は `apiKey=xxxx` を必ずマスクする。
- キーは利用者ごとに発行し、権限は必要最小限（読み取り）に絞る。
