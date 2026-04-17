# `delete_issue_comment` とステータス変更コメントの挙動（設計メモ）

## TL;DR

Backlog API の `DELETE /api/v2/issues/:issueIdOrKey/comments/:commentId` は **ステータス変更・担当者変更など `content: null` かつ `changeLog` を伴う "システム生成コメント" に対しては HTTP 200 を返すが実際には削除されない** no-op であることを実験で確認した。

従って `delete_issue_comment` ツールはこのケースを検出し、**呼び出し前に拒否する**（あるいは明示的に警告フラグを立てる）設計が必要。無条件に API を叩くと「ログ上は削除済・実際は残存」という監査ログ汚染を招く。

## 実験

`backlog-js` を直接呼び出し、`getIssueComment` / `postIssueComments` / `deleteIssueComment` の組み合わせで 2 種類のコメントを比較検証。スクリプトは破棄済み（リポジトリに残さない）。

### Case A: ステータス変更コメント（`content: null` + `changeLog` 非空）

- 対象: `GJ_PROJECT-222` / comment id `723047684`
- changeLog: `status: 処理中 → 外部レビュー完了`, `assigner: グリ姉 → サクラ`

| ステップ | 結果 |
|---|---|
| 削除前 GET | 200、`content: null`, `updated = 2026-04-17T16:54:22Z` |
| DELETE | **200 成功**、ペイロードは削除前と同一（`content: null` のまま） |
| 削除後 GET | **200 成功**、コメント依然存在。`updated` が `2026-04-17T16:54:22Z` → `2026-04-17T18:03:02Z` に変化 |

**結論: サイレント no-op。API は成功を返すが実際には削除されない。**

### Case B: 通常のテキストコメント（`content: "..."` + `changeLog: []`）

- 対象: `GJ_PROJECT-222` / comment id `723050546`（検証用に POST → 即削除）
- content: `"[TEST] delete-API experiment — safe to remove. ..."`

| ステップ | 結果 |
|---|---|
| POST | 201、id 払い出し、`content` 設定、`changeLog: []` |
| DELETE | **200 成功**、削除前ペイロードを返却（これが「消された本文」） |
| 削除後 GET | **404 Not Found** — コメント完全消失 |

**結論: 期待どおり削除される。削除後 GET は 404。**

### Case C: ステータス変更コメントに PATCH で本文を足してから DELETE

- 対象: `GJ_PROJECT-222` / comment id `723047684`（Case A 使用済のコメント）
- 仮説: Case A の DELETE が no-op だったのは content が null だったため。PATCH で本文を加えれば削除できるのでは？

| ステップ | content | changeLog 件数 | updated |
|---|---|---|---|
| baseline | null | 2 | 18:03:02Z |
| PATCH（本文追加） | `"[TEST] ..."` | 2 | **18:09:08Z** |
| DELETE | `"[TEST] ..."`（削除前スナップショット返却） | 2 | 18:09:08Z |
| 削除後 GET | **null** | 2（**残存**） | 18:09:08Z |

**結論:**
- ✅ PATCH で後付けの本文追加は成功する
- ✅ その後の DELETE は本文を null に戻す（Case B と同じく「本文削除」は効く）
- ❌ しかし **changeLog は消えず**、エンベロープ自体は残存。GET は 200 を返し続ける

### 削除挙動の統一モデル

3 ケースの結果から、`DELETE /comments/:id` の規則は:

> **`content` フィールドを null 化する。`changeLog` が空ならエンベロープも同時に除去し、以降の GET は 404。`changeLog` が非空なら本文だけ消えてエンベロープは残る。**

同一エンドポイントで呼び出し挙動が 3 種類（no-op / 本文削除＋残存 / 完全削除）に分岐するのは、エンベロープに "ワークフロー記録" としての永続性があるかどうかで決まる。

### 解釈（Case A + B + C から確定）

下記「削除挙動の統一モデル」を参照。ステータス/担当者変更履歴（changeLog）は Backlog のワークフロー記録として保護されており、同じエンドポイントでは消せない — 本文を後付け（Case C の PATCH）しても、DELETE で消えるのは本文だけでエンベロープは残る。

### 反証候補と却下理由

- **HTTP 400/403 で拒否される** → 却下。200 が返る。
- **ペイロードに "deleted" マーカーが入る** → 却下。削除前と同一構造。
- **cache/eventual consistency で一時的に残存** → 低確率。同一セッション内で `updated` は変わっており、サーバ側の書き込みは確定している。5 分後・30 分後に再 GET しても同じなら確定（要追試だが、現状は「削除されない」と結論）。

## `delete_issue_comment` への影響

### 現状（問題）

```ts
handler: async ({ issueId, issueKey, commentId }) => {
  // ...
  const snapshot = await backlog.getIssueComment(issueIdOrKey, commentId);
  await appendDeletionLog({ ...snapshot info... });       // ログ書き込み
  return backlog.deleteIssueComment(issueIdOrKey, commentId);  // no-op でも 200 で成功扱い
}
```

ステータス変更コメントに対しても成功を返し、`.backlog/deletions.log.jsonl` に "削除した" 記録が残る。実際は残っているので、ログが現実と乖離する。

### 採るべき対策: Pre-flight 拒否

`handler` の先頭（snapshot 取得直後）で以下を判定して早期 throw:

```ts
const isSystemGeneratedChangeLogComment =
  snapshot.content === null &&
  Array.isArray(snapshot.changeLog) &&
  snapshot.changeLog.length > 0;

if (isSystemGeneratedChangeLogComment) {
  throw new Error(
    `Comment ${commentId} on ${issueIdOrKey} is a system-generated status/field-change record ` +
    `(content=null, changeLog has ${snapshot.changeLog.length} entr${snapshot.changeLog.length === 1 ? 'y' : 'ies'}). ` +
    `Backlog API returns 200 for DELETE on this type but does NOT actually remove it. ` +
    `Refusing to log a deletion that will not happen.`
  );
}
```

### 採らない対策（却下）

- **`force: true` オプションで上書き許可**: 強制しても Backlog API は削除しない。オプションが機能しないのにあると混乱を招く。
- **ログに `warning` フラグを立てて通す**: 呼び出し側が警告を読まなければ意味がない。API が成功を返すため、LLM が呼び出し元の場合は通常成功と解釈してしまう。Fail-loud が安全。

### 呼び出し側への示唆

削除対象が `content: null` + `changeLog` を伴うコメントの場合、本ツールでは削除できない旨のエラーが返る。そのコメントを履歴から消したい場合は:

1. Backlog Web UI でステータス変更を取り消す（= 新しいステータス変更コメントが追加される）
2. Backlog 管理者経由で DB レベル操作（非推奨・非サポート）

API 経由での強制削除パスは存在しない（Case C 実証: PATCH で本文を足しても changeLog は消せない）。

### `content: "..."` + `changeLog` 非空 というハイブリッドケース

ユーザーが UI から「ステータス変更と同時に本文コメント」を書いた場合、または API で後付けで PATCH した場合、このパターンが発生する。このケースに対して本ツールは現状 **pre-flight 拒否せず DELETE を通す**。理由:

- DELETE は本文だけ消す。ユーザーの意図（本文を消す）は達成できる
- エンベロープは残るが、それは Backlog の仕様上やむなし
- 二度目の DELETE は `content: null + changeLog` 状態になるため pre-flight で拒否される（冪等で安全）

つまり pre-flight の判定条件は **`content === null && changeLog.length > 0`** のままで正しい。`content` がある間は削除する意味があり、なくなったら拒否する。

## `export_deleted_comments` への影響

同じ `content: null` コメントを `.backlog/deletions.log.jsonl` に入れてしまった場合（現行実装では可能）、`export_deleted_comments` で復元コメントを生成すると本文欄が `"(削除時に本文を取得できませんでした)"` のフォールバック表示になる。

この「そもそも削除されていないコメント」がログに入り込まないよう、**入口（`delete_issue_comment`）で弾く** のが正しい責務分担。`export_deleted_comments` 側に特殊ロジックを足す必要はない。

## 追試ですべきこと（優先度低）

- `changeLog` が空かつ `content: null` というレアケース（理論上は存在しないはずだが API 側で変更の余地あり。検出されれば拒否条件の見直しが必要）
- 添付ファイルのみのコメント（`content: null` + `changeLog: []` + `attachments: [...]`）の削除挙動（該当 API の挙動未検証）

## 結論

- Backlog API は status-change-only コメントの DELETE を **静かに no-op 化** する。HTTP 200 を返す。
- `delete_issue_comment` は事前にこのパターンを検出して早期エラーする責務を負う。
- この対策を実装することで、`.backlog/deletions.log.jsonl` の監査ログが現実と一致することが保証される。
