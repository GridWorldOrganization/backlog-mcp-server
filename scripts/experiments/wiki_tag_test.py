#!/usr/bin/env python3
"""Backlog Wiki のタグ挙動を実APIで検証する手動実験スクリプト。

検証する仮説:
  Backlog Wiki にはタグ専用の入力欄が無く、タグは **ページ名の先頭に
  [タグ名] と書く** ことで設定される。よって POST /api/v2/wikis や
  PATCH /api/v2/wikis/:id の `name` フィールドに角括弧タグを含めれば、
  API からもタグを設定できる。

使い方:
  export BACKLOG_API_KEY=（自分のキー）
  python3 scripts/experiments/wiki_tag_test.py \
      --url https://YOURSPACE.backlog.com/wiki/PROJECT_KEY/Home \
      --name 'とびさこClaudeがテスト' \
      --tags テスト,タグ実験

  # projectId を直接渡す場合
  python3 scripts/experiments/wiki_tag_test.py --project-id 767868 --name '...' --tags a,b

  # 送信内容だけ確認（書き込まない）
  python3 scripts/experiments/wiki_tag_test.py --project-id 767868 --name x --tags a --dry-run

注意: これは本番 Backlog に Wiki ページを**新規作成**する書き込み操作。
"""
import argparse
import json
import os
import sys
import urllib.error
import urllib.parse
import urllib.request

# 同梱ヘルパー resolve_project を再利用（URL → projectId 解決）
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from resolve_project import parse_url, fetch_project, fetch_wiki  # noqa: E402


def resolve_project_id(url, api_key):
    host, kind, value = parse_url(url)
    if kind == "wiki_id":
        wiki = fetch_wiki(host, value, api_key)
        project = fetch_project(host, wiki["projectId"], api_key)
    else:
        project = fetch_project(host, value, api_key)
    return host, project["id"]


def main():
    ap = argparse.ArgumentParser(description="Backlog Wiki タグ挙動の実APIテスト")
    src = ap.add_mutually_exclusive_group(required=True)
    src.add_argument("--url", help="プロジェクト/Wiki/課題いずれかの Backlog URL")
    src.add_argument("--project-id", type=int, help="数値プロジェクト ID を直接指定")
    ap.add_argument("--host", default="gridworld.backlog.com",
                    help="--project-id 指定時のスペースホスト (既定: gridworld.backlog.com)")
    ap.add_argument("--name", required=True, help="ページ名（タグを除いた本体）")
    ap.add_argument("--tags", default="", help="カンマ区切りのタグ（例: テスト,タグ実験）")
    ap.add_argument("--content", default=None, help="本文（省略時は既定の説明文）")
    ap.add_argument("--dry-run", action="store_true", help="送信せず内容だけ表示")
    args = ap.parse_args()

    api_key = os.environ.get("BACKLOG_API_KEY")
    if not api_key and not args.dry_run:
        raise SystemExit("API キー未指定。環境変数 BACKLOG_API_KEY を設定。")

    if args.url:
        host, project_id = resolve_project_id(args.url, api_key)
    else:
        host, project_id = args.host, args.project_id

    tags = [t.strip() for t in args.tags.split(",") if t.strip()]
    tagged_name = "".join(f"[{t}]" for t in tags)
    if tagged_name:
        tagged_name += " "
    tagged_name += args.name

    content = args.content or (
        "Claude によるタグ機能の実験ページ。\n\n"
        "Backlog Wiki のタグはページ名先頭の [タグ名] 記法で設定される。\n"
        f"送信ページ名: {tagged_name}\n"
        f"→ 期待タグ: {tags}\n"
    )

    print(f"host       : {host}")
    print(f"projectId  : {project_id}")
    print(f"送信name   : {tagged_name}")
    print(f"期待タグ   : {tags}")

    if args.dry_run:
        print("(dry-run: 送信しない)")
        return

    body = urllib.parse.urlencode({
        "projectId": project_id,
        "name": tagged_name,
        "content": content,
        "mailNotify": "false",
    }).encode()
    url = f"https://{host}/api/v2/wikis?" + urllib.parse.urlencode({"apiKey": api_key})
    req = urllib.request.Request(
        url, data=body, method="POST",
        headers={"Content-Type": "application/x-www-form-urlencoded"},
    )
    try:
        r = json.load(urllib.request.urlopen(req, timeout=20))
    except urllib.error.HTTPError as e:
        raise SystemExit(f"HTTP {e.code}: {e.read().decode('utf-8', 'replace')[:300]}")

    print("--- 作成結果 ---")
    print(f"wikiId     : {r.get('id')}")
    print(f"保存後name : {r.get('name')}")
    print(f"登録タグ   : {[t.get('name') for t in r.get('tags', [])]}")
    print(f"url        : https://{host}/alias/wiki/{r.get('id')}")


if __name__ == "__main__":
    main()
