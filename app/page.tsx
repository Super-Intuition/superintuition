"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@astryxdesign/core/AppShell";
import {
  Layout,
  LayoutHeader,
  LayoutPanel,
  LayoutContent,
} from "@astryxdesign/core/Layout";
import { Text } from "@astryxdesign/core/Text";
import { Code } from "@astryxdesign/core/Code";
import { Heading } from "@astryxdesign/core/Heading";
import { Badge } from "@astryxdesign/core/Badge";
import { Banner } from "@astryxdesign/core/Banner";
import { Selector } from "@astryxdesign/core/Selector";
import { HStack, VStack } from "@astryxdesign/core/Stack";
import { useMediaQuery } from "@astryxdesign/core/hooks";
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

  // Responsive contract (max-width queries default to false, so the full
  // three-pane desktop layout renders first and panels yield as width drops):
  //   >=1280  conversation | diff | assistant
  //   768–1279  diff | assistant   (conversation yields)
  //   <768  diff only               (assistant yields)
  const hideConversation = useMediaQuery("(max-width: 1279px)");
  const hideAssistant = useMediaQuery("(max-width: 767px)");
  // Below this the full PR title would crowd out the version; show just "#n".
  const compactSelector = useMediaQuery("(max-width: 640px)");

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
    <AppShell height="fill" variant="surface" contentPadding={0}>
      <Layout
        height="fill"
        header={
          <LayoutHeader hasDivider padding={0} height={52}>
            <HStack
              align="center"
              justify="between"
              gap={3}
              paddingInline={4}
              className="h-full bg-surface"
            >
              <HStack align="center" gap={2} className="min-w-0">
                <Logo className="h-6 w-6 shrink-0 text-primary" />
                <Text
                  weight="semibold"
                  type="label"
                  textWrap="nowrap"
                  className="hidden shrink-0 sm:inline"
                >
                  SuperIntuition
                </Text>
                {repo && (
                  <HStack
                    align="center"
                    gap={2}
                    className="hidden min-w-0 lg:flex"
                  >
                    <Text type="code" color="secondary" maxLines={1}>
                      {repo.full}
                    </Text>
                    {repo.private && <Badge variant="yellow" label="private" />}
                  </HStack>
                )}
              </HStack>
              <HStack align="center" gap={3} className="min-w-0">
                <HStack className="min-w-0">
                  <Selector
                    label="Pull request"
                    isLabelHidden
                    size="sm"
                    variant="secondary"
                    statusVariant="tooltip"
                    placeholder="No pull requests"
                    value={active != null ? String(active) : undefined}
                    onChange={(v) => setActive(Number(v))}
                    isDisabled={!pulls.length}
                    width={compactSelector ? 104 : undefined}
                    renderValue={(o) =>
                      compactSelector ? `#${o.value}` : o.label
                    }
                    options={pulls.map((p) => ({
                      value: String(p.number),
                      label: `#${p.number} · ${p.title}`,
                    }))}
                  />
                </HStack>
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
          </LayoutHeader>
        }
        start={
          hideConversation || !detail ? undefined : (
            <LayoutPanel
              width={340}
              hasDivider
              label="Pull request conversation"
            >
              <ConversationPanel pull={detail} />
            </LayoutPanel>
          )
        }
        end={
          hideAssistant ? undefined : (
            <LayoutPanel
              width={380}
              hasDivider
              padding={0}
              isScrollable={false}
              label="Review assistant"
            >
              <ChatPanel prNumber={active ?? 0} />
            </LayoutPanel>
          )
        }
        content={
          <LayoutContent padding={4}>
            <VStack gap={4}>
              {error && (
                <Banner
                  status="error"
                  container="card"
                  title={error}
                  description={
                    error.includes("not set") ? (
                      <Text type="supporting">
                        Copy <Code>.env.example</Code> to <Code>.env</Code> and
                        set GITHUB_TOKEN / GITHUB_REPO.
                      </Text>
                    ) : undefined
                  }
                  collapsible={false}
                />
              )}
              {loading && !error && <Text type="supporting">Loading…</Text>}
              {!loading && !error && detail && (
                <>
                  <VStack gap={2}>
                    <HStack align="center" gap={2} wrap="wrap">
                      <Heading level={1} weight="semibold">
                        {detail.title}
                      </Heading>
                      <Code color="secondary">#{detail.number}</Code>
                    </HStack>
                    <HStack gap={3} wrap="wrap" align="center">
                      <Text type="supporting">
                        {files.length} files changed
                      </Text>
                      {detail.additions != null && (
                        <Text
                          type="supporting"
                          hasTabularNumbers
                          className="text-text-green"
                        >
                          +{detail.additions}
                        </Text>
                      )}
                      {detail.deletions != null && (
                        <Text
                          type="supporting"
                          hasTabularNumbers
                          className="text-text-red"
                        >
                          -{detail.deletions}
                        </Text>
                      )}
                      <Code color="secondary">
                        {detail.baseRef} ← {detail.headRef}
                      </Code>
                    </HStack>
                  </VStack>
                  {files.map((f) => (
                    <DiffFile key={f.filename} file={f} />
                  ))}
                </>
              )}
              {!loading && !error && !detail && !pulls.length && (
                <Text type="supporting">
                  No pull requests found in this repository.
                </Text>
              )}
            </VStack>
          </LayoutContent>
        }
      />
    </AppShell>
  );
}
