"use client";

import { useState } from "react";
import { Card } from "@astryxdesign/core/Card";
import { Text } from "@astryxdesign/core/Text";
import { Icon } from "@astryxdesign/core/Icon";
import { IconButton } from "@astryxdesign/core/IconButton";
import { TextArea } from "@astryxdesign/core/TextArea";
import { HStack, VStack } from "@astryxdesign/core/Stack";
import Logo from "./Logo";

function AssistantMsg({ children }: { children: React.ReactNode }) {
  return (
    <VStack gap={1.5}>
      <HStack align="center" gap={1.5}>
        <Logo className="h-4 w-4 text-primary" />
        <Text type="supporting">SuperIntuition</Text>
      </HStack>
      <Text className="text-[13px] leading-5">{children}</Text>
    </VStack>
  );
}

function CandidateBubble({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex justify-end">
      <div className="max-w-[80%] rounded-lg bg-accent px-3 py-1.5 text-[13px] text-on-accent">
        {children}
      </div>
    </div>
  );
}

/** Fake waveform — purely decorative. */
function Waveform() {
  const bars = Array.from({ length: 28 }, (_, i) =>
    Math.round(6 + Math.abs(Math.sin(i * 0.9)) * 26),
  );
  return (
    <div className="flex h-24 w-full items-center justify-center gap-[3px] rounded-md bg-muted px-3">
      {bars.map((h, i) => (
        <span
          key={i}
          className="w-[3px] rounded-full bg-text-blue"
          style={{ height: `${h}px`, opacity: 0.5 + (h / 32) * 0.5 }}
        />
      ))}
    </div>
  );
}

export default function ChatPanel({ prNumber }: { prNumber: number }) {
  const [draft, setDraft] = useState("");

  return (
    <div className="flex h-full flex-col gap-3 bg-body p-3">
      {/* Voice / call card */}
      <Card padding={4}>
        <VStack gap={4}>
          <AssistantMsg>
            You have access to the Ringback repo. Let&apos;s go through a mock
            code review session. Ready?
          </AssistantMsg>
          <CandidateBubble>Yes, I&apos;m ready</CandidateBubble>
          <AssistantMsg>
            Here&apos;s the first PR. Does anything look suspicious to you in
            this code?
          </AssistantMsg>
          <div className="grid grid-cols-2 gap-2">
            <Waveform />
            <div className="flex h-24 items-center justify-center rounded-md bg-muted text-xs text-secondary">
              camera off
            </div>
          </div>
          <HStack align="center" justify="between">
            <HStack align="center" gap={1.5}>
              <span className="h-2 w-2 animate-pulse rounded-full bg-text-green" />
              <Text type="supporting">Listening…</Text>
            </HStack>
            <HStack gap={2}>
              <IconButton
                variant="ghost"
                size="sm"
                label="Mute microphone"
                icon={<Icon icon="microphone" />}
              />
              <IconButton
                variant="ghost"
                size="sm"
                label="Edit"
                icon={<Icon icon="wrench" />}
              />
            </HStack>
          </HStack>
        </VStack>
      </Card>

      {/* Ask card */}
      <div className="flex min-h-0 flex-1 flex-col rounded-lg border border-border bg-surface">
        <VStack gap={3} padding={4} isScrollable className="min-h-0">
          <div className="rounded-md border border-border bg-muted px-3 py-2">
            <HStack align="center" gap={1.5} className="mb-1">
              <Text type="supporting">✦ Highlighted in PR</Text>
            </HStack>
            <Text type="code" color="secondary" className="font-mono text-xs">
              Ask Peer{" "}
              <span className="text-text-blue">export const CALLING_HOURS</span>{" "}
              = {"{…}"}
            </Text>
          </div>
          <CandidateBubble>What do these line of code do?</CandidateBubble>
          <VStack gap={1}>
            <Text type="supporting" className="font-mono text-[11px]">
              Ref: src/lib/calling-hours.ts:L6
            </Text>
            <Text className="text-[13px] leading-5">
              This checks whether the supplied time falls within calling hours:
              9:00 a.m. up to, but not including, 9:00 p.m.
            </Text>
          </VStack>
        </VStack>

        {/* composer */}
        <div className="mt-auto border-t border-border p-3">
          <div className="rounded-lg border border-border bg-muted px-3 py-2">
            <TextArea
              label="Ask anything"
              isLabelHidden
              value={draft}
              onChange={(v) => setDraft(v)}
              placeholder="Ask anything (⌘L)"
              rows={1}
            />
            <HStack align="center" justify="between" className="mt-2">
              <IconButton
                variant="ghost"
                size="sm"
                label="Add attachment"
                icon={<Icon icon="upload" />}
              />
              <HStack align="center" gap={2}>
                <span className="flex items-center gap-1 rounded border border-border px-2 py-1 text-xs text-secondary">
                  Opus 5.5 ▾
                </span>
                <IconButton
                  variant="ghost"
                  size="sm"
                  label="Dictate"
                  icon={<Icon icon="microphone" />}
                />
                <IconButton
                  variant="primary"
                  size="sm"
                  label="Send"
                  isDisabled={!draft.trim()}
                  icon={<Icon icon="arrowUp" />}
                />
              </HStack>
            </HStack>
          </div>
          <HStack
            align="center"
            justify="between"
            className="mt-2 text-secondary"
          >
            <Text type="supporting">▢ ringback</Text>
            <Text type="supporting">PR #{prNumber}</Text>
          </HStack>
        </div>
      </div>
    </div>
  );
}
