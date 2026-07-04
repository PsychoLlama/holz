# Publishing a stable release

This is the runbook for shipping a stable (`latest`) release to npm. RC
releases are fully automated — every push to `main` publishes an `rc`-tagged
canary via the `publish-rc` job. Stable releases need a few manual prep steps
followed by a button click.

Both publishers live in `.github/workflows/release.yml`. They can't be split
into separate files: npm's trusted publishing (OIDC) only trusts one workflow.

## Overview

1. Decide the next version (fixed-mode: all packages share one number).
2. Bump package versions.
3. Update the changelog.
4. Commit the bump and changelog together.
5. Create the annotated git tag.
6. Push `main` and the tag.
7. Dispatch the release workflow.

Steps 1–6 happen locally, from a clean `main`. Step 7 is a manual dispatch in
GitHub Actions, which handles the npm publish and the GitHub release.

## Prep (local)

Work from an up-to-date `main` with a clean working tree. Pick the version —
say `1.2.3`.

### 1. Bump versions

```bash
bin/version-bump 1.2.3
```

This rewrites every package to `1.2.3` (Lerna fixed mode) without committing,
tagging, or pushing.

### 2. Update the changelog

Edit `CHANGELOG.md` following [Keep a Changelog](https://keepachangelog.com/):

- Rename the `## [UNRELEASED]` heading to `## [1.2.3] - YYYY-MM-DD`.
- Add a fresh empty `## [UNRELEASED]` section above it for future work.
- Update the link references at the bottom of the file: point `[UNRELEASED]`
  at `v1.2.3...HEAD` and add a `[1.2.3]` compare link.

```
[UNRELEASED]: https://github.com/PsychoLlama/holz/compare/v1.2.3...HEAD
[1.2.3]: https://github.com/PsychoLlama/holz/compare/v1.1.0...v1.2.3
```

### 3. Commit

Stage the version bump and the changelog, and commit them together:

```bash
git add -A
git commit -m "Prep for v1.2.3 release"
```

### 4. Tag

Pipe the `1.2.3` changelog section (the entries, not the heading) into the tag
script. It becomes the annotated tag's message, which the workflow reuses as
the GitHub release notes:

```bash
bin/create-release-tag v1.2.3 <<'EOF'
### Added

- Something worth shipping.
EOF
```

Review it:

```bash
git show v1.2.3
```

### 5. Push

```bash
git push origin main --follow-tags
```

## Publish (GitHub Actions)

1. Go to **Actions → Release → Run workflow**.
2. Keep the branch set to `main`.
3. Enter the tag (e.g. `v1.2.3`) in the **tag** input.
4. Run it.

The `publish-stable` job will:

- Refuse to run unless dispatched from `main`.
- Fail with a descriptive error if the tag doesn't exist or isn't on `main`.
- Check out the tagged commit and re-run `pnpm check`.
- Publish to npm under the `latest` dist-tag with
  `lerna publish from-package` (no version bump, no new tag — prep already did
  that).
- Create a GitHub release named after the tag, using the tag message
  (the changelog section) as the release notes.

Stable and RC publishes share a serialized concurrency group, so a manual
release safely waits behind any in-flight RC publish rather than racing it.

## Recovering from a failure

- **Tag typo / wrong tag:** delete the tag locally and on the remote
  (`git tag -d v1.2.3 && git push origin :refs/tags/v1.2.3`), fix prep, and
  re-tag.
- **npm publish partially succeeded:** `lerna publish from-package` only
  publishes versions not already on the registry, so re-running the workflow
  is safe — it skips packages that already went out.
- **GitHub release already exists:** delete it (`gh release delete v1.2.3`)
  before re-running, or create it by hand from the tag message.
