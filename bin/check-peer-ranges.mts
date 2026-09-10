#!/usr/bin/env node
import { glob, readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { styleText } from 'node:util';
import { satisfies, validRange } from 'semver';

interface Manifest {
  name: string;
  version: string;
  peerDependencies?: Record<string, string>;
}

interface Drift {
  file: string;
  peer: string;
  range: string;
  version: string;
  reason: 'unparseable' | 'excluded';
}

const root = new URL('../', import.meta.url);
const stderr = { stream: process.stderr };
const prefix = styleText('yellow', '[check-peer-ranges]', stderr);

async function findDrift(): Promise<Array<Drift>> {
  const manifests = new Map<string, Manifest>();

  for await (const file of glob('packages/*/package.json', {
    cwd: fileURLToPath(root),
  })) {
    const contents = await readFile(new URL(file, root), 'utf-8');
    manifests.set(file, JSON.parse(contents));
  }

  const versions = new Map(
    manifests.values().map((manifest) => [manifest.name, manifest.version]),
  );

  const drift: Array<Drift> = [];

  for (const [file, manifest] of manifests) {
    for (const [peer, range] of Object.entries(
      manifest.peerDependencies ?? {},
    )) {
      const version = versions.get(peer);

      if (version === undefined) {
        continue;
      }

      if (validRange(range) === null) {
        drift.push({ file, peer, range, version, reason: 'unparseable' });
      } else if (!satisfies(version, range)) {
        drift.push({ file, peer, range, version, reason: 'excluded' });
      }
    }
  }

  return drift.sort((a, b) => a.file.localeCompare(b.file));
}

function report(drift: Array<Drift>): string {
  const details = drift.map(({ file, peer, range, version, reason }) => {
    const selector = styleText('red', `"${range}"`, stderr);
    const problem =
      reason === 'unparseable'
        ? `${selector} is not a semver range`
        : `${selector} excludes ${version}`;

    return `${file}\n  ${peer}: ${problem}`;
  });

  return [
    `${prefix} found incompatible peer dependencies.`,
    'Selectors need to be reviewed and updated.',
    '',
    ...details,
  ].join('\n');
}

findDrift()
  .then((drift) => {
    if (drift.length === 0) {
      return;
    }

    console.error(report(drift));
    process.exitCode = 1;
  })
  .catch((error: unknown) => {
    const message = error instanceof Error ? error.message : String(error);

    console.error(`${prefix} ${message}`);
    process.exitCode = 1;
  });
