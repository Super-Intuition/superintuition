"use client";

import { useEffect, useState } from "react";
import { Text } from "@astryxdesign/core/Text";
import { Heading } from "@astryxdesign/core/Heading";
import { Badge } from "@astryxdesign/core/Badge";
import { Banner } from "@astryxdesign/core/Banner";
import { Selector } from "@astryxdesign/core/Selector";
import { HStack } from "@astryxdesign/core/Stack";
import packageInfo from "@/package.json";
import type { PullSummary, PullDetail, PullFile, RepoMeta } from "@/lib/github";
import ConversationPanel from "./components/ConversationPanel";
import ChatPanel from "./components/ChatPanel";
import DiffFile from "./components/DiffFile";
import Logo from "./components/Logo";

const version = packageInfo.version;

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
    <div className="flex h-screen flex-col overflow-hidden bg-body text-primary">
      {/* top bar */}
      <HStack
        align="center"
        justify="between"
        gap={3}
        paddingInline={4}
        className="h-12 shrink-0 border-b border-border bg-surface"
      >
        <HStack align="center" gap={3}>
          <Logo className="h-6 w-6 text-primary" />
          <Text weight="semibold" type="label">
            SuperIntuition
          </Text>
          {repo && (
            <HStack align="center" gap={2} className="hidden md:flex">
              <Text type="code" color="secondary">
                {repo.full}
              </Text>
              {repo.private && <Badge variant="yellow" label="private" />}
            </HStack>
          )}
        </HStack>
        <HStack align="center" gap={2}>
          <Selector
            label="Pull request"
            isLabelHidden
            size="sm"
            placeholder="No pull requests"
            value={active != null ? String(active) : undefined}
            onChange={(v) => setActive(Number(v))}
            isDisabled={!pulls.length}
            options={pulls.map((p) => ({
              value: String(p.number),
              label: `#${p.number} · ${p.title}`,
            }))}
          />
          <Text
            type="supporting"
            textWrap="nowrap"
            className="shrink-0"
            aria-label={`App version ${version}`}
          >
            v{version}
          </Text>
        </HStack>
      </HStack>

      {/* body: three columns */}
      <div className="grid min-h-0 flex-1 grid-cols-[minmax(280px,340px)_1fr_minmax(300px,380px)]">
        {/* left: conversation */}
        <div className="min-h-0 overflow-hidden">
          {detail ? (
            <ConversationPanel pull={detail} />
          ) : (
            <div className="h-full border-r border-border bg-surface" />
          )}
        </div>

        {/* center: diff */}
        <main className="min-h-0 overflow-y-auto bg-body p-4">
          {error && (
            <Banner
              status="error"
              container="card"
              title={error}
              description={
                error.includes("not set") ? (
                  <Text type="supporting">
                    Copy <span className="font-mono">.env.example</span> to{" "}
                    <span className="font-mono">.env</span> and set GITHUB_TOKEN
                    / GITHUB_REPO.
                  </Text>
                ) : undefined
              }
              collapsible={false}
            />
          )}
          {loading && !error && (
            <Text type="supporting">Loading…</Text>
          )}
          {!loading && !error && detail && (
            <div className="flex flex-col gap-4">
              <HStack align="center" gap={2}>
                <Heading level={1} weight="semibold">
                  {detail.title}
                </Heading>
                <Text color="secondary" className="font-mono">
                  #{detail.number}
                </Text>
              </HStack>
              <HStack gap={3} wrap="wrap" className="font-mono">
                <Text type="supporting">{files.length} files changed</Text>
                {detail.additions != null && (
                  <Text type="supporting" className="text-text-green">
                    +{detail.additions}
                  </Text>
                )}
                {detail.deletions != null && (
                  <Text type="supporting" className="text-text-red">
                    -{detail.deletions}
                  </Text>
                )}
                <Text type="supporting">
                  {detail.baseRef} ← {detail.headRef}
                </Text>
              </HStack>
              {files.map((f) => (
                <DiffFile key={f.filename} file={f} />
              ))}
            </div>
          )}
          {!loading && !error && !detail && !pulls.length && (
            <Text type="supporting">
              No pull requests found in this repository.
            </Text>
          )}
        </main>

        {/* right: chat */}
        <div className="min-h-0 overflow-hidden border-l border-border">
          <ChatPanel prNumber={active ?? 0} />
        </div>
      </div>
    </div>
  );
}
