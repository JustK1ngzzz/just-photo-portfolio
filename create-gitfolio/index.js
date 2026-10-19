#!/usr/bin/env node
/**
 * create-gitfolio
 *
 * Usage:
 *   npm create gitfolio@latest
 *   npm create gitfolio@latest my-portfolio
 *   npx create-gitfolio my-portfolio
 */

import { execSync, spawn } from 'child_process';
import { existsSync, rmSync } from 'fs';
import { resolve, basename } from 'path';
import { createInterface } from 'readline';

const TEMPLATE_REPO = 'https://github.com/cyberkishor/gitfolio.git';
const MIN_NODE = 18;

// ─── helpers ──────────────────────────────────────────────────────────────────

function log(msg)     { console.log(msg); }
function info(msg)    { console.log(`\x1b[36m${msg}\x1b[0m`); }
function success(msg) { console.log(`\x1b[32m✓\x1b[0m  ${msg}`); }
function error(msg)   { console.error(`\x1b[31m✗\x1b[0m  ${msg}`); }
function step(msg)    { console.log(`\x1b[1m${msg}\x1b[0m`); }

function run(cmd, cwd) {
  execSync(cmd, { cwd, stdio: 'inherit' });
}

function runSilent(cmd, cwd) {
  execSync(cmd, { cwd, stdio: 'pipe' });
}

function ask(question, defaultValue = '') {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  const hint = defaultValue ? ` (${defaultValue})` : '';
  return new Promise((resolve) => {
    rl.question(`${question}${hint}: `, (answer) => {
      rl.close();
      resolve(answer.trim() || defaultValue);
    });
  });
}

function hasGit() {
  try { runSilent('git --version'); return true; } catch { return false; }
}

function hasNpm() {
  try { runSilent('npm --version'); return true; } catch { return false; }
}

// ─── main ─────────────────────────────────────────────────────────────────────

// Node version check
const nodeMajor = parseInt(process.versions.node.split('.')[0], 10);
if (nodeMajor < MIN_NODE) {
  error(`Node.js ${MIN_NODE}+ required. You have ${process.versions.node}.`);
  process.exit(1);
}

// Banner
log('');
log('\x1b[1m\x1b[35m  gitfolio\x1b[0m  — developer portfolio template');
log('');

// Project name from argv or prompt
let projectName = process.argv[2];
if (!projectName) {
  projectName = await ask('Project name', 'my-portfolio');
}

// Validate name
if (!/^[a-z0-9][a-z0-9._-]*$/.test(projectName)) {
  error(`Invalid project name "${projectName}". Use lowercase letters, numbers, hyphens, dots, or underscores.`);
  process.exit(1);
}

const targetDir = resolve(process.cwd(), projectName);

if (existsSync(targetDir)) {
  error(`Directory "${projectName}" already exists. Choose a different name or delete it first.`);
  process.exit(1);
}

// Pre-flight checks
if (!hasGit()) {
  error('git is required but was not found. Install git and try again.');
  process.exit(1);
}
if (!hasNpm()) {
  error('npm is required but was not found.');
  process.exit(1);
}

log('');
step(`Creating ${projectName}...`);
log('');

// ── 1. Clone template ─────────────────────────────────────────────────────────
info('Cloning template...');
try {
  runSilent(`git clone --depth 1 ${TEMPLATE_REPO} ${projectName}`);
  success('Template cloned');
} catch (err) {
  error(`Failed to clone template: ${err.message}`);
  error(`Make sure you have internet access and git is configured.`);
  process.exit(1);
}

// ── 2. Clean git history ──────────────────────────────────────────────────────
info('Initialising fresh git repository...');
try {
  rmSync(resolve(targetDir, '.git'), { recursive: true, force: true });
  runSilent('git init', targetDir);
  success('Git initialised');
} catch (err) {
  error(`Git init failed: ${err.message}`);
  // Non-fatal — continue without git
}

// ── 3. Install dependencies ───────────────────────────────────────────────────
info('Installing dependencies (this may take a moment)...');
try {
  run('npm install', targetDir);
  success('Dependencies installed');
} catch (err) {
  error(`npm install failed: ${err.message}`);
  process.exit(1);
}

// ── 4. Run setup wizard ───────────────────────────────────────────────────────
log('');
log('─'.repeat(50));
log('');

await new Promise((resolve, reject) => {
  const wizard = spawn('node', ['scripts/setup.js'], {
    cwd: targetDir,
    stdio: 'inherit',
  });
  wizard.on('close', (code) => {
    if (code === 0) resolve();
    else reject(new Error(`Setup wizard exited with code ${code}`));
  });
  wizard.on('error', reject);
});

// ── 5. Initial commit ─────────────────────────────────────────────────────────
log('');
info('Creating initial commit...');
try {
  runSilent('git add -A', targetDir);
  runSilent('git commit -m "Initial commit"', targetDir);
  success('Initial commit created');
} catch {
  // Git may not be configured — non-fatal, user can commit manually
}

// ── Done ──────────────────────────────────────────────────────────────────────
log('');
log('─'.repeat(50));
log('');
log(`\x1b[1m\x1b[32mYour portfolio is ready!\x1b[0m`);
log('');
log('Next steps:');
log(`  \x1b[36mcd ${projectName}\x1b[0m`);
log(`  \x1b[36mnpm run dev\x1b[0m          # preview at http://localhost:8080`);
log('');
log('When you\'re happy:');
log(`  1. Push to GitHub`);
log(`  2. Import the repo in \x1b[36mvercel.com/new\x1b[0m`);
log(`  3. Add your env vars in Vercel → Settings → Environment Variables`);
log(`  4. Deploy!`);
log('');
log(`Admin panel: \x1b[36mhttp://localhost:8080/admin\x1b[0m`);
log('');
