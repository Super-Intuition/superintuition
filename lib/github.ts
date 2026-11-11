// Server-only GitHub REST client. The token and repo live in env and must never
// reach the browser — every function here runs on the server.

import "server-only";

const API = "https://api.github.com";

export function getRepo(): { owner: string; name: string; full: string } {
  const full = process.env.GITHUB_REPO;
  if (!full) throw new Error("GITHUB_REPO is not set");
  const [owner, name] = full.split("/");
  if (!owner || !name) {
    throw new Error(`GITHUB_REPO must be "owner/name", got "${full}"`);
  }
  return { owner, name, full };
}

async function gh<T>(path: string, init?: RequestInit): Promise<T> {
  const token = process.env.GITHUB_TOKEN;
  if (!token) throw new Error("GITHUB_TOKEN is not set");

  const res = await fetch(`${API}${path}`, {
    ...init,
    headers: {
      Accept: "application/vnd.github+json",
      "User-Agent": "SuperIntuition",
      Authorization: `Bearer ${token}`,
      "X-GitHub-Api-Version": "2022-11-28",
      ...init?.headers,
    },
    // PR data changes rarely during a review session; revalidate often enough.
    next: { revalidate: 30 },
  });

  if (!res.ok) {
    const body = await res.text();
    throw new GitHubError(
      `GitHub ${res.status} on ${path}: ${body.slice(0, 300)}`,
      res.status,
    );
  }
  return res.json() as Promise<T>;
}

export class GitHubError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
    this.name = "GitHubError";
  }
}

export interface RepoMeta {
  full: string;
  description: string | null;
  defaultBranch: string;
  private: boolean;
}

export interface PullSummary {
  number: number;
  title: string;
  state: string;
  user: string;
  userAvatar: string;
  createdAt: string;
  updatedAt: string;
  additions?: number;
  deletions?: number;
  changedFiles?: number;
}

export interface PullDetail extends PullSummary {
  body: string | null;
  headRef: string;
  baseRef: string;
  commits: number;
}

export interface PullFile {
  filename: string;
  status: string;
  additions: number;
  deletions: number;
  changes: number;
  patch?: string;
}

export async function fetchRepoMeta(): Promise<RepoMeta> {
  const { owner, name } = getRepo();
  const r = await gh<{
    full_name: string;
    description: string | null;
    default_branch: string;
    private: boolean;
  }>(`/repos/${owner}/${name}`);
  return {
    full: r.full_name,
    description: r.description,
    defaultBranch: r.default_branch,
    private: r.private,
  };
}

interface RawPull {
  number: number;
  title: string;
  state: string;
  body?: string | null;
  created_at: string;
  updated_at: string;
  user: { login: string; avatar_url: string } | null;
  head: { ref: string };
  base: { ref: string };
  additions?: number;
  deletions?: number;
  changed_files?: number;
  commits?: number;
}

function toSummary(p: RawPull): PullSummary {
  return {
    number: p.number,
    title: p.title,
    state: p.state,
    user: p.user?.login ?? "unknown",
    userAvatar: p.user?.avatar_url ?? "",
    createdAt: p.created_at,
    updatedAt: p.updated_at,
    additions: p.additions,
    deletions: p.deletions,
    changedFiles: p.changed_files,
  };
}

export async function fetchPulls(): Promise<PullSummary[]> {
  const { owner, name } = getRepo();
  const list = await gh<RawPull[]>(
    `/repos/${owner}/${name}/pulls?state=all&sort=created&direction=desc&per_page=50`,
  );
  return list.map(toSummary);
}

export async function fetchPull(number: number): Promise<PullDetail> {
  const { owner, name } = getRepo();
  const p = await gh<RawPull>(`/repos/${owner}/${name}/pulls/${number}`);
  return {
    ...toSummary(p),
    body: p.body ?? null,
    headRef: p.head.ref,
    baseRef: p.base.ref,
    commits: p.commits ?? 0,
  };
}

export async function fetchPullFiles(number: number): Promise<PullFile[]> {
  const { owner, name } = getRepo();
  const files = await gh<PullFile[]>(
    `/repos/${owner}/${name}/pulls/${number}/files?per_page=100`,
  );
  return files.map((f) => ({
    filename: f.filename,
    status: f.status,
    additions: f.additions,
    deletions: f.deletions,
    changes: f.changes,
    patch: f.patch,
  }));
}
