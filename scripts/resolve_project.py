#!/usr/bin/env python3
"""Backlog の URL からプロジェクトキーと数値プロジェクト ID を解決する。

例:
    BACKLOG_API_KEY=xxxx python3 scripts/resolve_project.py \
        https://gridworld.backlog.com/view/GRIDJAPAN-83

対応 URL:
    https://SPACE.backlog.com/view/KEY-123      課題ビュー
    https://SPACE.backlog.com/projects/KEY      プロジェクトトップ
    https://SPACE.backlog.com/wiki/KEY/Home     Wiki ページ
    https://SPACE.backlog.com/git/KEY/...       Git / その他 KEY 先頭型
    https://SPACE.backlog.com/alias/wiki/12345  Wiki ID 形式（2 ホップ解決）
    https://SPACE.backlog.jp/...                .jp / .com いずれも可
"""
import argparse
import json
import os
import re
import urllib.error
import urllib.parse
import urllib.request


def parse_url(url):
    """URL から (スペースホスト, kind, 値) を返す。

    kind == "key"     : 値はプロジェクトキー（文字列）。直接プロジェクト取得可。
    kind == "wiki_id" : 値は Wiki ページの数値 ID。先に Wiki を引いて projectId へ。
    """
    parsed = urllib.parse.urlparse(url)
    host = parsed.netloc
    if not host:
        raise ValueError(f"URL にホストがない: {url}")

    segments = parsed.path.strip("/").split("/")

    # /alias/wiki/{wikiId} … プロジェクトキー不在。Wiki ID 経由で解決。
    if "alias" in segments:
        ai = segments.index("alias")
        if ai + 2 < len(segments) and segments[ai + 1] == "wiki":
            return host, "wiki_id", segments[ai + 2]

    # 次セグメントがプロジェクトキー（または課題キー）になる先頭セグメント
    key_holders = {"wiki", "projects", "git", "document", "documents", "file"}
    project_key = None
    for i, seg in enumerate(segments):
        if seg == "view" and i + 1 < len(segments):
            # 課題キー (例 GRIDJAPAN-83) の末尾 "-番号" を除去 → プロジェクトキー
            issue_key = segments[i + 1]
            project_key = issue_key.rsplit("-", 1)[0]
            break
        if seg in key_holders and i + 1 < len(segments):
            nxt = segments[i + 1]
            # 純数値 = ID（キーは数字始まり不可）→ Wiki ID 扱い
            if nxt.isdigit():
                return host, "wiki_id", nxt
            # /wiki/KEY/... · /projects/KEY · /git/KEY/... → 次がプロジェクトキー
            project_key = nxt
            break

    if project_key is None:
        # フォールバック: 末尾セグメントの "-番号" を除去
        last = segments[-1] if segments else ""
        project_key = re.sub(r"-\d+$", "", last)

    if not project_key:
        raise ValueError(f"プロジェクトキーを抽出できない: {url}")
    return host, "key", project_key


def _get_json(host, path, api_key):
    """Backlog API を叩いて JSON を返す共通処理。"""
    query = urllib.parse.urlencode({"apiKey": api_key})
    api_url = f"https://{host}/api/v2/{path}?{query}"
    req = urllib.request.Request(api_url, headers={"Accept": "application/json"})
    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            return json.loads(resp.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        body = e.read().decode("utf-8", "replace")
        raise SystemExit(f"Backlog API エラー {e.code}: {body}")
    except urllib.error.URLError as e:
        raise SystemExit(f"接続失敗: {e.reason}")


def fetch_project(host, project_id_or_key, api_key):
    """プロジェクトキーまたは数値 ID からプロジェクトを取得する。"""
    return _get_json(
        host, f"projects/{urllib.parse.quote(str(project_id_or_key))}", api_key
    )


def fetch_wiki(host, wiki_id, api_key):
    """Wiki ページ ID から Wiki オブジェクトを取得する（projectId を含む）。"""
    return _get_json(host, f"wikis/{urllib.parse.quote(str(wiki_id))}", api_key)


def main():
    ap = argparse.ArgumentParser(
        description="Backlog URL → プロジェクトキー / プロジェクト ID"
    )
    ap.add_argument(
        "url", help="例: https://gridworld.backlog.com/view/GRIDJAPAN-83"
    )
    ap.add_argument(
        "--api-key",
        default=os.environ.get("BACKLOG_API_KEY"),
        help="Backlog API キー (既定: 環境変数 BACKLOG_API_KEY)",
    )
    ap.add_argument("--json", action="store_true", help="JSON で出力")
    args = ap.parse_args()

    host, kind, value = parse_url(args.url)

    if not args.api_key:
        hint = "Wiki ID" if kind == "wiki_id" else "プロジェクトキー"
        raise SystemExit(
            "API キー未指定。環境変数 BACKLOG_API_KEY か --api-key で渡す。\n"
            f"(URL から抽出した {hint}: {value})"
        )

    if kind == "wiki_id":
        # Wiki ID → projectId → プロジェクト の 2 ホップ
        wiki = fetch_wiki(host, value, args.api_key)
        project = fetch_project(host, wiki["projectId"], args.api_key)
    else:
        project = fetch_project(host, value, args.api_key)

    result = {
        "space": host,
        "projectKey": project.get("projectKey"),
        "projectId": project.get("id"),
        "name": project.get("name"),
    }

    if args.json:
        print(json.dumps(result, ensure_ascii=False, indent=2))
    else:
        print(f"space      : {result['space']}")
        print(f"projectKey : {result['projectKey']}")
        print(f"projectId  : {result['projectId']}")
        print(f"name       : {result['name']}")


if __name__ == "__main__":
    main()
