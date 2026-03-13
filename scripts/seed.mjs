#!/usr/bin/env node
import { spawnSync } from 'node:child_process';

const cmd = process.platform === 'win32' ? 'npx.cmd' : 'npx';
const args = [
  'convex',
  'run',
  'seed:seedDemoOrganization',
  '--args',
  JSON.stringify({
    organizationName: 'Демо компания',
    adminEmail: 'admin@example.com',
  }),
];

const result = spawnSync(cmd, args, { stdio: 'inherit' });
if (result.status !== 0) {
  process.exit(result.status ?? 1);
}
