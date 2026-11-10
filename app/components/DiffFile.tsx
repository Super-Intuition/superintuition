"use client";

import { useState } from "react";
import type { PullFile } from "@/lib/github";
import { parsePatch } from "@/lib/diff";

function StatPill({ additions, deletions }: { additions: number; deletions: number }) {
  // Five squares, GitHub-style: green for add, red for del, grey for none.
  const total = additions + deletions;
  const greens = total === 0 ? 0 : Math.round((additions / total) * 5);
  const reds = total === 0 ? 0 : Math.min(5 - greens, Math.ceil((deletions / total) * 5));
  const squares = Array.from({ length: 5 }, (_, i) => {
    if (i < greens) return "add";
    if (i < greens + reds) return "del";
    return "none";
  });
  return (
    <span className="flex items-center gap-2 mono text-xs">
      {additions > 0 && <span className="text-[#3fb950]">+{additions}</span>}
      {deletions > 0 && <span className="text-[#f85149]">-{deletions}</span>}
      <span className="flex gap-[2px]">
        {squares.map((s, i) => (
          <span
            key={i}
            className="h-2 w-2 rounded-[2px]"
            style={{
              background:
                s === "add" ? "#3fb950" : s === "del" ? "#f85149" : "#30363d",
            }}
          />
        ))}
      </span>
    </span>
  );
}

export default function DiffFile({ file }: { file: PullFile }) {
  const [open, setOpen] = useState(true);
  const [viewed, setViewed] = useState(false);
  const rows = parsePatch(file.patch);

  return (
    <div className="rounded-md border border-[var(--border)] bg-[var(--panel)] overflow-hidden">
      {/* file header */}
      <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-[var(--border)] bg-[var(--panel-2)] px-3 py-2">
        <div className="flex min-w-0 items-center gap-2">
          <button
            onClick={() => setOpen((o) => !o)}
            className="text-[var(--text-muted)] hover:text-[var(--text)] shrink-0"
            aria-label={open ? "Collapse" : "Expand"}
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 16 16"
              fill="currentColor"
              className={open ? "" : "-rotate-90"}
              style={{ transition: "transform .15s" }}
            >
              <path d="M12.78 5.22a.75.75 0 0 0-1.06 0L8 8.94 4.28 5.22a.75.75 0 0 0-1.06 1.06l4.25 4.25a.75.75 0 0 0 1.06 0l4.25-4.25a.75.75 0 0 0 0-1.06Z" />
            </svg>
          </button>
          <span className="mono truncate text-sm text-[var(--text)]">
            {file.filename}
          </span>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <StatPill additions={file.additions} deletions={file.deletions} />
          <label className="flex cursor-pointer items-center gap-1.5 rounded border border-[var(--border)] px-2 py-1 text-xs text-[var(--text-muted)] hover:bg-[var(--border-muted)]">
            <input
              type="checkbox"
              checked={viewed}
              onChange={(e) => setViewed(e.target.checked)}
              className="accent-[var(--accent)]"
            />
            Viewed
          </label>
        </div>
      </div>

      {/* diff body */}
      {open && (
        <div className="overflow-x-auto">
          {rows.length === 0 ? (
            <div className="px-4 py-3 text-xs text-[var(--text-muted)]">
              {file.status === "renamed"
                ? "File renamed — no content changes."
                : "No textual diff available (binary or too large)."}
            </div>
          ) : (
            <table className="mono w-full border-collapse text-[12px] leading-5">
              <tbody>
                {rows.map((r, i) => {
                  if (r.type === "hunk") {
                    return (
                      <tr key={i} className="bg-[#0b1b34] text-[#539bf5]">
                        <td className="select-none border-r border-[var(--border)] px-2 text-right align-top" />
                        <td className="select-none border-r border-[var(--border)] px-2 text-right align-top" />
                        <td className="whitespace-pre-wrap px-3 py-0.5">
                          {r.content}
                        </td>
                      </tr>
                    );
                  }
                  const bg =
                    r.type === "add"
                      ? "bg-[var(--add-bg)]"
                      : r.type === "del"
                        ? "bg-[var(--del-bg)]"
                        : "";
                  const sign =
                    r.type === "add" ? "+" : r.type === "del" ? "-" : " ";
                  return (
                    <tr key={i} className={bg}>
                      <td className="w-[1%] select-none whitespace-nowrap border-r border-[var(--border-muted)] px-2 text-right align-top text-[var(--text-muted)]">
                        {r.oldLine ?? ""}
                      </td>
                      <td className="w-[1%] select-none whitespace-nowrap border-r border-[var(--border-muted)] px-2 text-right align-top text-[var(--text-muted)]">
                        {r.newLine ?? ""}
                      </td>
                      <td className="whitespace-pre-wrap px-3 align-top">
                        <span className="select-none text-[var(--text-muted)]">
                          {sign}
                        </span>
                        {r.content}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
