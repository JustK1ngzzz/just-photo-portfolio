const GITHUB_TOKEN  = import.meta.env.VITE_GITHUB_TOKEN;
const GITHUB_OWNER  = import.meta.env.VITE_GITHUB_OWNER;
const GITHUB_REPO   = import.meta.env.VITE_GITHUB_REPO;
const GITHUB_BRANCH = import.meta.env.VITE_GITHUB_BRANCH || 'main';
const USE_LOCAL     = import.meta.env.VITE_USE_LOCAL_FILES === 'true';

const BASE_URL = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}`;

function headers() {
  return {
    Authorization: `Bearer ${GITHUB_TOKEN}`,
    'Content-Type': 'application/json',
    Accept: 'application/vnd.github+json',
  };
}

export interface GitHubFile {
  name: string;
  path: string;
  sha: string;
  size: number;
  type: 'file' | 'dir';
  content?: string;
  encoding?: string;
}

// ---------------------------------------------------------------------------
// Local file API — reads/writes directly to disk via Vite dev server plugin.
// Active when VITE_USE_LOCAL_FILES=true in .env.local
// ---------------------------------------------------------------------------

async function localGetFile(filePath: string): Promise<{ content: string; sha: string }> {
  const res = await fetch(`/__local?path=${encodeURIComponent(filePath)}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(`File not found: ${filePath} — ${err.error ?? ''}`);
  }
  const { content } = await res.json();
  return { content, sha: 'local' };
}

async function localWriteFile(filePath: string, content: string): Promise<void> {
  const res = await fetch(`/__local?path=${encodeURIComponent(filePath)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(`Failed to write ${filePath}: ${err.error ?? res.status}`);
  }
}

async function localDeleteFile(filePath: string): Promise<void> {
  const res = await fetch(`/__local?path=${encodeURIComponent(filePath)}`, {
    method: 'DELETE',
  });
  if (!res.ok && res.status !== 404) {
    throw new Error(`Failed to delete ${filePath}`);
  }
}

// ---------------------------------------------------------------------------
// Public API — routes to local or GitHub depending on VITE_USE_LOCAL_FILES
// ---------------------------------------------------------------------------

export async function getFile(path: string): Promise<{ content: string; sha: string }> {
  if (USE_LOCAL) return localGetFile(path);

  const res = await fetch(`${BASE_URL}/contents/${path}?ref=${GITHUB_BRANCH}`, {
    headers: headers(),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(`Failed to get file ${path}: ${err.message || res.statusText || `HTTP ${res.status}`}`);
  }
  const data: GitHubFile = await res.json();
  const bytes = Uint8Array.from(atob(data.content!.replace(/\n/g, '')), (c) => c.charCodeAt(0));
  const content = new TextDecoder().decode(bytes);
  return { content, sha: data.sha };
}

export async function listDir(path: string): Promise<GitHubFile[]> {
  if (USE_LOCAL) return [];

  const res = await fetch(`${BASE_URL}/contents/${path}?ref=${GITHUB_BRANCH}`, {
    headers: headers(),
  });
  if (!res.ok) {
    throw new Error(`Failed to list directory ${path}: ${res.statusText}`);
  }
  return res.json();
}

export async function createFile(
  path: string,
  content: string,
  message: string
): Promise<void> {
  if (USE_LOCAL) return localWriteFile(path, content);

  const encoded = btoa(unescape(encodeURIComponent(content)));
  const res = await fetch(`${BASE_URL}/contents/${path}`, {
    method: 'PUT',
    headers: headers(),
    body: JSON.stringify({ message, content: encoded, branch: GITHUB_BRANCH }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(`Failed to create file ${path}: ${err.message || res.statusText}`);
  }
}

export async function updateFile(
  path: string,
  content: string,
  sha: string,
  message: string
): Promise<void> {
  if (USE_LOCAL) return localWriteFile(path, content);

  const encoded = btoa(unescape(encodeURIComponent(content)));
  const res = await fetch(`${BASE_URL}/contents/${path}`, {
    method: 'PUT',
    headers: headers(),
    body: JSON.stringify({ message, content: encoded, sha, branch: GITHUB_BRANCH }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(`Failed to update file ${path}: ${err.message || res.statusText}`);
  }
}

export async function deleteFile(
  path: string,
  sha: string,
  message: string
): Promise<void> {
  if (USE_LOCAL) return localDeleteFile(path);

  const res = await fetch(`${BASE_URL}/contents/${path}`, {
    method: 'DELETE',
    headers: headers(),
    body: JSON.stringify({ message, sha, branch: GITHUB_BRANCH }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(`Failed to delete file ${path}: ${err.message || res.statusText}`);
  }
}

export function isGitHubConfigured(): boolean {
  if (USE_LOCAL) return true; // local file API always available
  return !!(GITHUB_TOKEN && GITHUB_OWNER && GITHUB_REPO);
}

// Fetch and parse portfolio.json — always up-to-date
export async function getPortfolioJson(): Promise<Record<string, unknown>> {
  const { content } = await getFile('src/data/portfolio.json');
  return JSON.parse(content);
}

// Fetch full blog post index (all posts, used by admin + blog listing page)
export async function getBlogIndex(): Promise<Record<string, unknown>[]> {
  if (USE_LOCAL) {
    const { content } = await localGetFile('public/blog-index.json');
    return JSON.parse(content);
  }
  const res = await fetch('/blog-index.json');
  if (!res.ok) throw new Error('Failed to load blog index');
  return res.json();
}

// Fetch full projects index (all projects, used by admin + projects listing)
export async function getProjectsIndex(): Promise<Record<string, unknown>[]> {
  if (USE_LOCAL) {
    const { content } = await localGetFile('public/projects-index.json');
    return JSON.parse(content);
  }
  const res = await fetch('/projects-index.json');
  if (!res.ok) throw new Error('Failed to load projects index');
  return res.json();
}
