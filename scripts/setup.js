#!/usr/bin/env node
/**
 * gitfolio setup wizard
 * Run: npm run setup
 *
 * Prompts for personal info, site settings, and admin credentials,
 * then writes src/data/portfolio.json, src/data/site-settings.json, and .env.local.
 */

import { createInterface } from 'readline';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

// ─── helpers ──────────────────────────────────────────────────────────────────

const rl = createInterface({ input: process.stdin, output: process.stdout });

function ask(question, defaultValue = '') {
  const hint = defaultValue ? ` (${defaultValue})` : '';
  return new Promise((resolve) => {
    rl.question(`${question}${hint}: `, (answer) => {
      resolve(answer.trim() || defaultValue);
    });
  });
}

function askSecret(question) {
  return new Promise((resolve) => {
    process.stdout.write(`${question}: `);
    // Disable echo for password input if TTY
    if (process.stdin.isTTY) {
      process.stdin.setRawMode(true);
      let input = '';
      process.stdin.resume();
      process.stdin.setEncoding('utf8');
      const onData = (char) => {
        if (char === '\r' || char === '\n') {
          process.stdin.setRawMode(false);
          process.stdin.pause();
          process.stdin.removeListener('data', onData);
          process.stdout.write('\n');
          resolve(input);
        } else if (char === '\u0003') {
          process.stdout.write('\n');
          process.exit();
        } else if (char === '\u007f') {
          if (input.length > 0) {
            input = input.slice(0, -1);
            process.stdout.clearLine(0);
            process.stdout.cursorTo(0);
            process.stdout.write(`${question}: ${'*'.repeat(input.length)}`);
          }
        } else {
          input += char;
          process.stdout.write('*');
        }
      };
      process.stdin.on('data', onData);
    } else {
      // Non-TTY (piped input) — fall back to normal readline
      rl.question('', (answer) => resolve(answer.trim()));
    }
  });
}

function section(title) {
  console.log(`\n\x1b[36m── ${title} ──\x1b[0m`);
}

function success(msg) {
  console.log(`\x1b[32m✓\x1b[0m ${msg}`);
}

function warn(msg) {
  console.log(`\x1b[33m⚠\x1b[0m  ${msg}`);
}

function readJson(relPath) {
  return JSON.parse(readFileSync(resolve(ROOT, relPath), 'utf-8'));
}

function writeJson(relPath, data) {
  writeFileSync(resolve(ROOT, relPath), JSON.stringify(data, null, 2) + '\n', 'utf-8');
}

// ─── main ─────────────────────────────────────────────────────────────────────

console.log('\n\x1b[1m\x1b[35mWelcome to gitfolio setup!\x1b[0m');
console.log("Let's personalize your portfolio in a few steps.\n");

const portfolio = readJson('src/data/portfolio.json');
const settings  = readJson('src/data/site-settings.json');

// ── Personal Info ──────────────────────────────────────────────────────────────
section('Personal Info');
const name     = await ask('Full name',  portfolio.personal.name);
const title    = await ask('Job title',  portfolio.personal.title);
const tagline  = await ask('Tagline',    portfolio.personal.tagline);
const location = await ask('Location',   portfolio.personal.location);
const email    = await ask('Email',      portfolio.personal.email);

// ── Social Links ───────────────────────────────────────────────────────────────
section('Social Links');
const github   = await ask('GitHub URL',    portfolio.personal.social.github);
const linkedin = await ask('LinkedIn URL',  portfolio.personal.social.linkedin);
const twitter  = await ask('Twitter/X URL (leave blank to hide)', portfolio.personal.social.twitter);

// ── Site Settings ──────────────────────────────────────────────────────────────
section('Site Settings');
const siteName   = await ask('Site name (shown in header)', name);
const siteUrl    = await ask('Site URL', settings.siteUrl);

console.log('\nAccent color presets:');
console.log('  \x1b[34m1\x1b[0m  #6366f1  Indigo (default)');
console.log('  \x1b[33m2\x1b[0m  #fbbf24  Amber');
console.log('  \x1b[32m3\x1b[0m  #22c55e  Green');
console.log('  \x1b[31m4\x1b[0m  #ef4444  Red');
console.log('  \x1b[35m5\x1b[0m  #a855f7  Purple');
console.log('  \x1b[36m6\x1b[0m  #06b6d4  Cyan');
console.log('  \x1b[37m7\x1b[0m  Custom hex value');
const accentPresets = {
  '1': '#6366f1', '2': '#fbbf24', '3': '#22c55e',
  '4': '#ef4444', '5': '#a855f7', '6': '#06b6d4',
};
const accentChoice = await ask('Choose accent color', '1');
let accentColor;
if (accentPresets[accentChoice]) {
  accentColor = accentPresets[accentChoice];
} else {
  accentColor = await ask('Enter hex color', settings.accentColor || '#6366f1');
}

const defaultThemeChoice = await ask('Default theme — dark / light / system', settings.defaultTheme || 'dark');
const defaultTheme = ['dark', 'light', 'system'].includes(defaultThemeChoice) ? defaultThemeChoice : 'dark';

// ── Analytics ──────────────────────────────────────────────────────────────────
section('Analytics (optional)');
const gaId = await ask('Google Analytics ID (leave blank to skip)', settings.googleAnalyticsId || '');

// ── Admin Panel ────────────────────────────────────────────────────────────────
section('Admin Panel');
console.log('The admin panel lets you edit content at /admin.');
console.log('It needs a password and a GitHub token to commit changes.\n');

const adminPassword = await askSecret('Admin password');
const githubToken   = await askSecret('GitHub Personal Access Token (repo scope)');
const githubOwner   = await ask('GitHub username or org', '');
const githubRepo    = await ask('GitHub repository name', 'gitfolio');
const githubBranch  = await ask('Branch', 'main');

rl.close();

// ── Write portfolio.json ───────────────────────────────────────────────────────
section('Writing files');

portfolio.personal.name     = name;
portfolio.personal.title    = title;
portfolio.personal.tagline  = tagline;
portfolio.personal.location = location;
portfolio.personal.email    = email;
portfolio.personal.website  = siteUrl;
portfolio.personal.social.github   = github;
portfolio.personal.social.linkedin = linkedin;
portfolio.personal.social.twitter  = twitter;

writeJson('src/data/portfolio.json', portfolio);
success('src/data/portfolio.json');

// ── Write site-settings.json ───────────────────────────────────────────────────
settings.siteName         = siteName;
settings.siteUrl          = siteUrl;
settings.accentColor      = accentColor;
settings.defaultTheme     = defaultTheme;
settings.googleAnalyticsId = gaId;

writeJson('src/data/site-settings.json', settings);
success('src/data/site-settings.json');

// ── Write .env.local ───────────────────────────────────────────────────────────
const envPath = resolve(ROOT, '.env.local');
const existingEnv = existsSync(envPath) ? readFileSync(envPath, 'utf-8') : '';

// Parse existing vars so we don't clobber unrelated entries
const envMap = {};
for (const line of existingEnv.split('\n')) {
  const match = line.match(/^([^#=\s][^=]*)=(.*)/);
  if (match) envMap[match[1]] = match[2];
}

// Apply new values
envMap['VITE_ADMIN_PASSWORD'] = adminPassword;
if (githubToken)  envMap['VITE_GITHUB_TOKEN']  = githubToken;
if (githubOwner)  envMap['VITE_GITHUB_OWNER']  = githubOwner;
if (githubRepo)   envMap['VITE_GITHUB_REPO']   = githubRepo;
if (githubBranch) envMap['VITE_GITHUB_BRANCH'] = githubBranch;

const envContent = Object.entries(envMap)
  .map(([k, v]) => `${k}=${v}`)
  .join('\n') + '\n';

writeFileSync(envPath, envContent, 'utf-8');
success('.env.local');

// ── Done ───────────────────────────────────────────────────────────────────────
console.log('\n\x1b[1m\x1b[32mSetup complete!\x1b[0m');
console.log('Next steps:');
console.log('  1. Replace \x1b[36mpublic/logo.svg\x1b[0m (or add logo.jpg) with your own photo');
console.log('  2. Edit \x1b[36msrc/data/portfolio.json\x1b[0m to add your real projects and bio');
console.log('  3. Run \x1b[36mnpm run dev\x1b[0m to preview your site');
console.log('  4. Push to GitHub and deploy to Vercel');
console.log('\nAdmin panel: \x1b[36mhttp://localhost:8080/admin\x1b[0m');

if (!githubToken || !githubOwner) {
  warn('GitHub credentials are incomplete — admin save/publish will not work until you add them to .env.local');
}
