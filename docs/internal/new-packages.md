# Publishing a new package

New packages start out `private` and stay that way until they're ready for an RC release. Making one public takes a one-time bootstrap, because CI publishes through npm's trusted publishing (OIDC), and npm only lets you configure a trusted publisher for a package that already exists on the registry.

## Overview

> [!NOTE]
> This process requires you to repeat more 2FA codes than any other service in the history of mankind.
>
> Steel yourself. Prepare for a gauntlet of pain.

1. Publish a placeholder by hand.
2. Configure trusted publishing for the release workflow.
3. Wait for npm's staged rollout.
4. Mark the bootstrap version as deprecated.
5. Enable setting `Require two-factor authentication and disallow bypass 2fa tokens`.
6. Drop `private` from the package.
7. Merge to `main`.

Steps 1–5 happen once per package, by hand, with an npm account that has 2FA enabled. Everything after that is automated.

## 1. Publish a placeholder

Publish a stub (just a manifest and a README pointing back to this repo), not the real build. Real releases should only ever come from CI so they carry provenance.

- Use a version that sorts below any real release.
- Publish it under the `rc` dist-tag. The first CI canary takes the tag over, so nothing is left dangling.
- npm forces a `latest` tag onto the first publish regardless. It points at the placeholder until the next stable release replaces it.

## 2. Configure trusted publishing

Trust `.github/workflows/release.yml` to publish the package with `npm trust`. It must be that file: npm only has enough brainpower to trust a single workflow.

## 3. Wait for the staged rollout

The placeholder goes through npm's staged rollout before it's live. Wait for it to finish and for the trust config to take effect before moving on.

## 4. Deprecate the placeholder

Mark the bootstrap version as deprecated. Since `latest` points at it until the next stable release, this communicates its temporary nature to anyone who installs it.

## 5. Require 2FA for publishing

In the package's settings on npmjs.com, under publishing access, enable `Require two-factor authentication and disallow bypass 2fa tokens`. Trusted publishing is unaffected; this only locks out token-based publishes.

## 6. Drop `private`

Remove `private: true` from the package manifest. Lerna then includes the package in every RC and stable publish alongside the others. Add a changelog entry announcing it.

Don't merge this before step 3 is done. Lerna publishes packages one by one, so a missing trust config fails partway through, after other packages have already gone out. The next push to `main` recovers.

## 7. Merge

Merging to `main` triggers the RC publisher, which ships the new package at the current version under `rc`. It joins the next stable release like any other package; see [publishing.md](./publishing.md).
