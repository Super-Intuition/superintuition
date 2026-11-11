"use client";

import { useState } from "react";
import { Card } from "@astryxdesign/core/Card";
import { Text } from "@astryxdesign/core/Text";
import { Code } from "@astryxdesign/core/Code";
import { Icon } from "@astryxdesign/core/Icon";
import { Button } from "@astryxdesign/core/Button";
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
      <Text type="body" size="sm">
        {children}
      </Text>
    </VStack>
  );
}

function CandidateBubble({ children }: { children: React.ReactNode }) {
  return (
    <HStack justify="end">
      <HStack
        maxWidth="80%"
        paddingInline={3}
        paddingBlock={1.5}
        className="rounded-lg bg-accent"
      >
        <Text type="body" size="sm" color="inherit" className="text-on-accent">
          {children}
        </Text>
      </HStack>
    </HStack>
  );
}

/** Decorative call visualisation — a stylised waveform using the spacing scale. */
function Waveform() {
  const steps = ["h-2", "h-3", "h-4", "h-5", "h-6", "h-8", "h-10"];
  const bars = Array.from({ length: 32 }, (_, i) => {
    const t = Math.abs(Math.sin(i * 0.7));
    return steps[Math.round(t * (steps.length - 1))];
  });
  return (
    <HStack
      align="center"
      justify="center"
      gap={0.5}
      className="h-24 flex-1 rounded-md bg-muted"
    >
      {bars.map((h, i) => (
        <VStack key={i} className={`w-0.5 rounded-full bg-accent ${h}`} />
      ))}
    </HStack>
  );
}

export default function ChatPanel({ prNumber }: { prNumber: number }) {
  const [draft, setDraft] = useState("");

  return (
    <VStack gap={3} padding={3} className="h-full bg-body">
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
          <HStack gap={2} align="stretch">
            <Waveform />
            <HStack
              align="center"
              justify="center"
              className="h-24 flex-1 rounded-md bg-muted"
            >
              <Text type="supporting">camera off</Text>
            </HStack>
          </HStack>
          <HStack align="center" justify="between">
            <HStack align="center" gap={1.5}>
              <VStack className="h-2 w-2 animate-pulse rounded-full bg-green-vivid" />
              <Text type="supporting">Listening…</Text>
            </HStack>
            <HStack gap={1}>
              <IconButton
                variant="ghost"
                size="sm"
                label="Mute microphone"
                icon={<Icon icon="microphone" />}
              />
              <IconButton
                variant="ghost"
                size="sm"
                label="Call settings"
                icon={<Icon icon="wrench" />}
              />
            </HStack>
          </HStack>
        </VStack>
      </Card>

      {/* Ask thread + composer */}
      <VStack
        gap={0}
        className="min-h-0 flex-1 rounded-lg border border-border bg-surface"
      >
        <VStack gap={3} padding={4} isScrollable className="min-h-0 flex-1">
          <VStack
            gap={1}
            paddingInline={3}
            paddingBlock={2}
            className="rounded-md border border-border bg-muted"
          >
            <Text type="supporting">✦ Highlighted in PR</Text>
            <Text type="code" color="secondary">
              Ask Peer <Code color="inherit" className="text-blue-vivid">export const CALLING_HOURS</Code> = {"{…}"}
            </Text>
          </VStack>
          <CandidateBubble>What do these lines of code do?</CandidateBubble>
          <VStack gap={1}>
            <Text type="code" color="secondary">
              Ref: src/lib/calling-hours.ts:L6
            </Text>
            <Text type="body" size="sm">
              This checks whether the supplied time falls within calling hours:
              9:00 a.m. up to, but not including, 9:00 p.m.
            </Text>
          </VStack>
        </VStack>

        {/* composer */}
        <VStack gap={2} padding={3} className="border-t border-border">
          <VStack
            gap={2}
            paddingInline={3}
            paddingBlock={2}
            className="rounded-lg border border-border bg-muted"
          >
            <TextArea
              label="Ask anything"
              isLabelHidden
              value={draft}
              onChange={(v) => setDraft(v)}
              placeholder="Ask anything (⌘L)"
              rows={1}
            />
            <HStack align="center" justify="between">
              <IconButton
                variant="ghost"
                size="sm"
                label="Add attachment"
                icon={<Icon icon="upload" />}
              />
              <HStack align="center" gap={1}>
                <Button
                  variant="secondary"
                  size="sm"
                  label="Opus 5.5"
                  endContent={<Icon icon="chevronDown" />}
                />
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
          </VStack>
          <HStack align="center" justify="between">
            <Text type="supporting">ringback</Text>
            <Text type="supporting">PR #{prNumber}</Text>
          </HStack>
        </VStack>
      </VStack>
    </VStack>
  );
}
