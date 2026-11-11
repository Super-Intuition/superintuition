"use client";

import { useState } from "react";
import { Text } from "@astryxdesign/core/Text";
import { Icon } from "@astryxdesign/core/Icon";
import { IconButton } from "@astryxdesign/core/IconButton";
import { HStack } from "@astryxdesign/core/Stack";
import type { PullFile } from "@/lib/github";
import { parsePatch } from "@/lib/diff";

function StatPill({ additions, deletions }: { additions: number; deletions: number }) {
  // Five squares, GitHub-style: green for add, red for del, neutral for none.
  const total = additions + deletions;
  const greens = total === 0 ? 0 : Math.round((additions / total) * 5);
  const reds = total === 0 ? 0 : Math.min(5 - greens, Math.ceil((deletions / total) * 5));
  const squares = Array.from({ length: 5 }, (_, i) => {
    if (i < greens) return "add";
    if (i < greens + reds) return "del";
    return "none";
  });
  return (
    <span className="flex items-center gap-2 font-mono text-xs">
      {additions > 0 && <span className="text-text-green">+{additions}</span>}
      {deletions > 0 && <span className="text-text-red">-{deletions}</span>}
      <span className="flex gap-[2px]">
        {squares.map((s, i) => (
          <span
            key={i}
            className={`h-2 w-2 rounded-[2px] ${
              s === "add"
                ? "bg-text-green"
                : s === "del"
                  ? "bg-text-red"
                  : "bg-track"
            }`}
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
    <div className="overflow-hidden rounded-md border border-border bg-surface">
      {/* file header */}
      <HStack
        align="center"
        justify="between"
        gap={3}
        paddingInline={3}
        paddingBlock={2}
        className="sticky top-0 z-10 border-b border-border bg-muted"
      >
        <HStack align="center" gap={2} className="min-w-0">
          <IconButton
            variant="ghost"
            size="sm"
            label={open ? "Collapse" : "Expand"}
            onClick={() => setOpen((o) => !o)}
            icon={
              <Icon
                icon="chevronDown"
                className={open ? "" : "-rotate-90"}
              />
            }
          />
          <Text className="truncate font-mono" type="code">
            {file.filename}
          </Text>
        </HStack>
        <HStack align="center" gap={3} className="shrink-0">
          <StatPill additions={file.additions} deletions={file.deletions} />
          <label className="flex cursor-pointer items-center gap-1.5 rounded border border-border px-2 py-1 text-xs text-secondary hover:bg-muted">
            <input
              type="checkbox"
              checked={viewed}
              onChange={(e) => setViewed(e.target.checked)}
              className="accent-accent"
            />
            Viewed
          </label>
        </HStack>
      </HStack>

      {/* diff body */}
      {open && (
        <div className="overflow-x-auto">
          {rows.length === 0 ? (
            <Text type="supporting" className="block px-4 py-3">
              {file.status === "renamed"
                ? "File renamed — no content changes."
                : "No textual diff available (binary or too large)."}
            </Text>
          ) : (
            <table className="w-full border-collapse font-mono text-[12px] leading-5">
              <tbody>
                {rows.map((r, i) => {
                  if (r.type === "hunk") {
                    return (
                      <tr key={i} className="bg-background-blue text-text-blue">
                        <td className="select-none border-r border-border px-2 text-right align-top" />
                        <td className="select-none border-r border-border px-2 text-right align-top" />
                        <td className="whitespace-pre-wrap px-3 py-0.5">
                          {r.content}
                        </td>
                      </tr>
                    );
                  }
                  const bg =
                    r.type === "add"
                      ? "bg-background-green"
                      : r.type === "del"
                        ? "bg-background-red"
                        : "";
                  const sign =
                    r.type === "add" ? "+" : r.type === "del" ? "-" : " ";
                  return (
                    <tr key={i} className={bg}>
                      <td className="w-[1%] select-none whitespace-nowrap border-r border-border px-2 text-right align-top text-secondary">
                        {r.oldLine ?? ""}
                      </td>
                      <td className="w-[1%] select-none whitespace-nowrap border-r border-border px-2 text-right align-top text-secondary">
                        {r.newLine ?? ""}
                      </td>
                      <td className="whitespace-pre-wrap px-3 align-top text-primary">
                        <span className="select-none text-secondary">
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
