#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

const args = process.argv.slice(2);
if (args.length === 0) {
  console.error('Usage: node typeorm-migrate.js <migration-name>');
  process.exit(1);
}

const migrationName = args[0];
const migrationPath = `src/migrations/${migrationName}`;

const typeormArgs = [
  '--require', 'ts-node/register',
  '--require', 'tsconfig-paths/register',
  './node_modules/typeorm/cli.js',
  'migration:generate',
  '--dataSource', './typeorm.config.ts',
  migrationPath
];

const child = spawn('node', typeormArgs, { stdio: 'inherit' });
child.on('exit', (code) => process.exit(code));

