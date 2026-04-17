---
name: release-npm
description: Cuts a GitHub Release and publishes the matching version to npm together. Extracts release notes from CHANGELOG.md, triggers the .github/workflows/release.yml workflow (which handles npm publish with NPM_TOKEN), waits for completion, and verifies both the GitHub Release and the npm registry reflect the new version. Run this after `git tag vX.Y.Z && git push origin vX.Y.Z`.
---

# Release to GitHub + npm together

## Overview

This skill publishes a pre-tagged version to both GitHub Releases and the npm registry in one coordinated flow.

- If `$ARGUMENTS` is non-empty: use it as the tag name (e.g. `v0.10.0`).
- If `$ARGUMENTS` is empty: use the latest tag on the current branch (`git describe --tags --abbrev=0`).

The tag MUST already exist on the remote before running this skill. This skill does NOT bump versions, commit, or create tags — that's upstream work (typically handled by `ship` or manual `npm version` + `git tag` + `git push`).

## Steps

### 1. Resolve and validate the tag

```bash
TAG="${ARGUMENTS:-$(git describe --tags --abbrev=0)}"
echo "Tag: $TAG"
```

Check the tag exists on the remote:

```bash
git ls-remote --tags origin "$TAG"
```

If empty output: stop. Tell the user the tag is not on origin yet — push it first (`git push origin $TAG`).

### 2. Verify tag matches package.json version

```bash
PKG_VERSION=$(node -p "require('./package.json').version")
EXPECTED="v$PKG_VERSION"
```

If `$TAG` != `$EXPECTED`: stop and show both values. A tag/package mismatch means the publish will put the wrong version on npm. Refuse to continue.

### 3. Verify HEAD is at the tag commit

```bash
TAG_COMMIT=$(git rev-parse "$TAG^{commit}")
HEAD_COMMIT=$(git rev-parse HEAD)
```

If they differ: warn. The workflow checks out the tag via `workflow_dispatch` with `--ref $TAG`, so this isn't fatal, but it usually means the user committed after tagging without re-tagging. Ask whether to continue.

### 4. Confirm clean working tree

```bash
git status --porcelain
```

If non-empty: stop. Release should be cut from a clean tree to avoid surprises.

### 5. Check npm registry for pre-existing publish

```bash
PKG_NAME=$(node -p "require('./package.json').name")
EXISTING=$(npm view "$PKG_NAME@$PKG_VERSION" version 2>/dev/null || true)
```

If `$EXISTING` is non-empty: the version already exists on npm. Skip the publish step and tell the user — we'll still create the GitHub Release if missing, but won't re-trigger the workflow.

### 6. Extract release notes from CHANGELOG.md

Read `CHANGELOG.md`. Extract the section for the version being released — from the `## [VERSION]` heading down to (but not including) the next `## [` heading or end-of-file.

Format for `gh release create --notes`:
- Keep the heading format (`### Features`, `### Bug Fixes`, etc.)
- Drop the top-level `## [VERSION] - DATE` line (redundant with the Release title)
- Preserve bullet lists and inline code verbatim

If the CHANGELOG has no section for this version: stop. Ask the user to add the entry first.

### 7. Check whether a GitHub Release already exists

```bash
gh release view "$TAG" --json name,tagName 2>/dev/null
```

- If it exists: record its state, skip re-creation (`gh release edit` can adjust notes later if the user asks).
- If it does NOT exist: create it in step 9.

### 8. Trigger the npm publish workflow (if not already published)

Only run if `$EXISTING` was empty in step 5:

```bash
gh workflow run Release --ref "$TAG"
```

Wait for the run to start (the API returns before the run is queued). Then watch it:

```bash
sleep 5
RUN_ID=$(gh run list --workflow Release --branch "$TAG" --limit 1 --json databaseId --jq '.[0].databaseId')
gh run watch "$RUN_ID" --exit-status
```

If `gh run watch` exits non-zero: fetch the logs and show the user the failure. Do NOT proceed to create the GitHub Release until the publish succeeded (a release without npm artifacts is misleading).

### 9. Create the GitHub Release

Only run if step 7 found no existing release:

```bash
NOTES_FILE=$(mktemp /tmp/release-notes-XXXXXX.md)
# write the extracted CHANGELOG section to $NOTES_FILE
gh release create "$TAG" \
  --title "$TAG" \
  --notes-file "$NOTES_FILE" \
  --verify-tag
rm -f "$NOTES_FILE"
```

### 10. Post-release verification

Run both checks, show the user:

```bash
# npm
npm view "$PKG_NAME" versions --json | jq -r 'last'
npm view "$PKG_NAME@$PKG_VERSION" dist.tarball

# GitHub
gh release view "$TAG" --json url,publishedAt,tagName
```

Confirm the new version appears on npm and the Release URL is reachable. Report both to the user.

## Error handling

- **Tag not on remote** → stop, tell user to `git push origin $TAG`.
- **Version mismatch** → stop, show both.
- **Dirty tree** → stop, tell user to commit or stash.
- **Already published on npm** → skip publish, continue with GitHub Release if missing.
- **Workflow run failed** → fetch logs, show error, do NOT create GitHub Release.
- **GitHub Release already exists** → skip creation, tell user. Do NOT overwrite notes unless asked.

## Non-goals

- Does not bump the version in `package.json`.
- Does not commit or tag.
- Does not run tests — upstream `ship` flow should have done that.
- Does not publish to any registry other than public npm.

## Notes

The npm publish is done by `.github/workflows/release.yml` using `NPM_TOKEN` from GitHub secrets (granular access token, no 2FA prompt). Keeping publish inside CI means the token never touches the local machine.

If the workflow ever needs to change (e.g. add a `gh release create` step inside the workflow itself), this skill should simplify to "trigger workflow, wait, verify" — the extraction step in this skill becomes redundant.
