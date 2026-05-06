import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';

const DATA_DIR = join(process.cwd(), 'data');

function resolveDataPath(filename: string): string {
  return join(DATA_DIR, filename);
}

function getGitHubConfig() {
  const token = process.env.GITHUB_TOKEN;
  const owner = process.env.GITHUB_USERNAME;
  const repo = process.env.GITHUB_REPO;
  const branch = process.env.GITHUB_BRANCH || 'main';

  if (!token || !owner || !repo) return null;

  return { token, owner, repo, branch };
}

export async function readJsonFile<T>(filename: string, defaultValue: T): Promise<T> {
  const isProd = process.env.NODE_ENV === 'production';
  const gh = getGitHubConfig();

  // PRODUCTION: Use GitHub API (Vercel is read-only)
  if (isProd && gh) {
    try {
      const url = `https://api.github.com/repos/${gh.owner}/${gh.repo}/contents/data/${filename}?ref=${gh.branch}`;
      const res = await fetch(url, {
        headers: {
          Authorization: `token ${gh.token}`,
          Accept: 'application/vnd.github.v3.raw'
        },
        cache: 'no-store' // Ensure we get fresh data
      });

      if (res.ok) {
        const text = await res.text();
        return JSON.parse(text) as T;
      }
    } catch (error) {
      console.error(`[github-storage] Failed to read ${filename}`, error);
    }
  }

  // LOCAL or Fallback: Use local filesystem
  const filePath = resolveDataPath(filename);
  if (!existsSync(filePath)) return defaultValue;

  try {
    const raw = readFileSync(filePath, 'utf-8');
    return JSON.parse(raw) as T;
  } catch {
    console.error(`[json-storage] Failed to read ${filename}`);
    return defaultValue;
  }
}

export async function writeJsonFile<T>(filename: string, data: T): Promise<void> {
  const content = JSON.stringify(data, null, 2);
  const isProd = process.env.NODE_ENV === 'production';
  const gh = getGitHubConfig();

  // PRODUCTION: Push to GitHub
  if (isProd && gh) {
    try {
      const url = `https://api.github.com/repos/${gh.owner}/${gh.repo}/contents/data/${filename}`;

      // 1. Get current file for SHA
      const getRes = await fetch(`${url}?ref=${gh.branch}`, {
        headers: { Authorization: `token ${gh.token}` },
        cache: 'no-store'
      });

      let sha = '';
      if (getRes.ok) {
        const info = await getRes.json();
        sha = info.sha;
      }

      // 2. Push update
      const putRes = await fetch(url, {
        method: 'PUT',
        headers: {
          Authorization: `token ${gh.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: `update: ${filename} via API`,
          content: Buffer.from(content).toString('base64'),
          branch: gh.branch,
          sha: sha || undefined
        })
      });

      if (!putRes.ok) {
        const err = await putRes.text();
        console.error(`[github-storage] Failed to write ${filename}: ${err}`);
      }
      return; // Don't write locally in production
    } catch (error) {
      console.error(`[github-storage] Push failed for ${filename}`, error);
    }
  }

  // LOCAL: ALWAYS write to local filesystem
  const filePath = resolveDataPath(filename);
  const dir = dirname(filePath);

  try {
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
    writeFileSync(filePath, content, 'utf-8');
  } catch (error) {
    console.error(`[json-storage] Local write failed for ${filename}`, error);
  }
}
