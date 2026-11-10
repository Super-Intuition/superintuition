"use client";

import { useState } from "react";

function Logo() {
  return (
    <span className="flex h-4 w-4 items-center justify-center rounded-sm bg-gradient-to-br from-[#2f81f7] to-[#8957e5] text-[8px] font-bold text-white">
      S
    </span>
  );
}

function AssistantMsg({ children }: { children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-1.5 text-xs text-[var(--text-muted)]">
        <Logo /> SuperIntuition
      </div>
      <p className="text-[13px] leading-5 text-[var(--text)]">{children}</p>
    </div>
  );
}

function CandidateBubble({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex justify-end">
      <div className="max-w-[80%] rounded-lg bg-[#1f6feb] px-3 py-1.5 text-[13px] text-white">
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
    <div className="flex h-24 w-full items-center justify-center gap-[3px] rounded-md bg-[var(--panel-2)] px-3">
      {bars.map((h, i) => (
        <span
          key={i}
          className="w-[3px] rounded-full bg-[#539bf5]"
          style={{ height: `${h}px`, opacity: 0.5 + (h / 32) * 0.5 }}
        />
      ))}
    </div>
  );
}

export default function ChatPanel({ prNumber }: { prNumber: number }) {
  const [draft, setDraft] = useState("");

  return (
    <div className="flex h-full flex-col gap-3 bg-[var(--bg)] p-3">
      {/* Voice / call card */}
      <div className="space-y-4 rounded-lg border border-[var(--border)] bg-[var(--panel)] p-4">
        <AssistantMsg>
          You have access to the Ringback repo. Let&apos;s go through a mock code
          review session. Ready?
        </AssistantMsg>
        <CandidateBubble>Yes, I&apos;m ready</CandidateBubble>
        <AssistantMsg>
          Here&apos;s the first PR. Does anything look suspicious to you in this
          code?
        </AssistantMsg>
        <div className="grid grid-cols-2 gap-2">
          <Waveform />
          <div className="flex h-24 items-center justify-center rounded-md bg-[var(--panel-2)] text-xs text-[var(--text-muted)]">
            camera off
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-[var(--text-muted)]">
            <span className="h-2 w-2 animate-pulse rounded-full bg-[#3fb950]" />
            Listening…
          </div>
          <div className="flex gap-2">
            <button className="flex h-7 w-7 items-center justify-center rounded-full border border-[var(--border)] text-[var(--text-muted)] hover:bg-[var(--panel-2)]">
              🎤
            </button>
            <button className="flex h-7 w-7 items-center justify-center rounded-full border border-[var(--border)] text-[var(--text-muted)] hover:bg-[var(--panel-2)]">
              ✎
            </button>
          </div>
        </div>
      </div>

      {/* Ask card */}
      <div className="flex min-h-0 flex-1 flex-col rounded-lg border border-[var(--border)] bg-[var(--panel)]">
        <div className="space-y-3 overflow-y-auto p-4">
          <div className="rounded-md border border-[var(--border)] bg-[var(--panel-2)] px-3 py-2">
            <div className="mb-1 flex items-center gap-1.5 text-xs text-[var(--text-muted)]">
              ✦ Highlighted in PR
            </div>
            <div className="mono text-xs text-[var(--text-muted)]">
              Ask Peer <span className="text-[#79c0ff]">export const CALLING_HOURS</span> = {"{…}"}
            </div>
          </div>
          <CandidateBubble>What do these line of code do?</CandidateBubble>
          <div className="space-y-1">
            <div className="mono text-[11px] text-[var(--text-muted)]">
              Ref: src/lib/calling-hours.ts:L6
            </div>
            <p className="text-[13px] leading-5 text-[var(--text)]">
              This checks whether the supplied time falls within calling hours:
              9:00 a.m. up to, but not including, 9:00 p.m.
            </p>
          </div>
        </div>

        {/* composer */}
        <div className="mt-auto border-t border-[var(--border)] p-3">
          <div className="rounded-lg border border-[var(--border)] bg-[var(--panel-2)] px-3 py-2">
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Ask anything (⌘L)"
              rows={1}
              className="w-full resize-none bg-transparent text-sm text-[var(--text)] placeholder:text-[var(--text-muted)] focus:outline-none"
            />
            <div className="mt-2 flex items-center justify-between">
              <button className="flex h-6 w-6 items-center justify-center rounded border border-[var(--border)] text-[var(--text-muted)]">
                +
              </button>
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1 rounded border border-[var(--border)] px-2 py-1 text-xs text-[var(--text-muted)]">
                  Opus 5.5 ▾
                </span>
                <button className="flex h-6 w-6 items-center justify-center rounded-full border border-[var(--border)] text-[var(--text-muted)]">
                  🎤
                </button>
                <button
                  className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--accent)] text-white disabled:opacity-40"
                  disabled={!draft.trim()}
                >
                  ↑
                </button>
              </div>
            </div>
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-[var(--text-muted)]">
            <span className="flex items-center gap-1">▢ ringback</span>
            <span>PR #{prNumber}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
