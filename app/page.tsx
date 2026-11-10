"use client";

import { useEffect, useState } from "react";
import type { PullSummary, PullDetail, PullFile, RepoMeta } from "@/lib/github";
import ConversationPanel from "./components/ConversationPanel";
import ChatPanel from "./components/ChatPanel";
import DiffFile from "./components/DiffFile";
import Logo from "./components/Logo";

async function getJSON<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed (${res.status})`);
  }
  return res.json();
}

export default function Home() {
  const [repo, setRepo] = useState<RepoMeta | null>(null);
  const [pulls, setPulls] = useState<PullSummary[]>([]);
  const [active, setActive] = useState<number | null>(null);
  const [detail, setDetail] = useState<PullDetail | null>(null);
  const [files, setFiles] = useState<PullFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load repo meta + pull list once.
  useEffect(() => {
    (async () => {
      try {
        const [r, p] = await Promise.all([
          getJSON<RepoMeta>("/api/repo"),
          getJSON<PullSummary[]>("/api/pulls"),
        ]);
        setRepo(r);
        setPulls(p);
        if (p.length) setActive(p[0].number);
        else setLoading(false);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load repo");
        setLoading(false);
      }
    })();
  }, []);

  // Load the selected PR's detail + files.
  useEffect(() => {
    if (active == null) return;
    setLoading(true);
    setError(null);
    (async () => {
      try {
        const [d, f] = await Promise.all([
          getJSON<PullDetail>(`/api/pulls/${active}`),
          getJSON<PullFile[]>(`/api/pulls/${active}/files`),
        ]);
        setDetail(d);
        setFiles(f);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load PR");
      } finally {
        setLoading(false);
      }
    })();
  }, [active]);

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      {/* top bar */}
      <header className="flex h-12 shrink-0 items-center justify-between border-b border-[var(--border)] bg-[var(--panel)] px-4">
        <div className="flex items-center gap-3">
          <Logo className="h-6 w-6 text-[var(--text)]" />
          <span className="text-sm font-semibold">SuperIntuition</span>
          {repo && (
            <span className="mono rounded border border-[var(--border)] px-2 py-0.5 text-xs text-[var(--text-muted)]">
              {repo.full}
              {repo.private && <span className="ml-1 text-[#d29922]">· private</span>}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs text-[var(--text-muted)]">PR</label>
          <select
            value={active ?? ""}
            onChange={(e) => setActive(Number(e.target.value))}
            disabled={!pulls.length}
            className="mono max-w-[380px] rounded border border-[var(--border)] bg-[var(--panel-2)] px-2 py-1 text-xs text-[var(--text)] focus:outline-none"
          >
            {pulls.map((p) => (
              <option key={p.number} value={p.number}>
                #{p.number} · {p.title}
              </option>
            ))}
          </select>
        </div>
      </header>

      {/* body: three columns */}
      <div className="grid min-h-0 flex-1 grid-cols-[minmax(280px,340px)_1fr_minmax(300px,380px)]">
        {/* left: conversation */}
        <div className="min-h-0 overflow-hidden">
          {detail ? (
            <ConversationPanel pull={detail} />
          ) : (
            <div className="h-full border-r border-[var(--border)] bg-[var(--panel)]" />
          )}
        </div>

        {/* center: diff */}
        <main className="min-h-0 overflow-y-auto bg-[var(--bg)] p-4">
          {error && (
            <div className="rounded-md border border-[var(--del-border)] bg-[var(--del-bg)] px-4 py-3 text-sm text-[#ff7b72]">
              {error}
              {error.includes("not set") && (
                <p className="mt-1 text-xs text-[var(--text-muted)]">
                  Copy <span className="mono">.env.example</span> to{" "}
                  <span className="mono">.env</span> and set GITHUB_TOKEN /
                  GITHUB_REPO.
                </p>
              )}
            </div>
          )}
          {loading && !error && (
            <div className="text-sm text-[var(--text-muted)]">Loading…</div>
          )}
          {!loading && !error && detail && (
            <div className="space-y-4">
              <div className="flex items-baseline gap-2">
                <h1 className="text-lg font-semibold text-[var(--text)]">
                  {detail.title}
                </h1>
                <span className="mono text-sm text-[var(--text-muted)]">
                  #{detail.number}
                </span>
              </div>
              <div className="mono flex flex-wrap gap-3 text-xs text-[var(--text-muted)]">
                <span>{files.length} files changed</span>
                {detail.additions != null && (
                  <span className="text-[#3fb950]">+{detail.additions}</span>
                )}
                {detail.deletions != null && (
                  <span className="text-[#f85149]">-{detail.deletions}</span>
                )}
                <span>
                  {detail.baseRef} ← {detail.headRef}
                </span>
              </div>
              {files.map((f) => (
                <DiffFile key={f.filename} file={f} />
              ))}
            </div>
          )}
          {!loading && !error && !detail && !pulls.length && (
            <div className="text-sm text-[var(--text-muted)]">
              No pull requests found in this repository.
            </div>
          )}
        </main>

        {/* right: chat */}
        <div className="min-h-0 overflow-hidden border-l border-[var(--border)]">
          <ChatPanel prNumber={active ?? 0} />
        </div>
      </div>
    </div>
  );
}
