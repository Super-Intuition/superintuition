"use client";

import { useState } from "react";
import { Text } from "@astryxdesign/core/Text";
import { Icon } from "@astryxdesign/core/Icon";
import { IconButton } from "@astryxdesign/core/IconButton";
import { CheckboxInput } from "@astryxdesign/core/CheckboxInput";
import { Card } from "@astryxdesign/core/Card";
import { HStack, VStack } from "@astryxdesign/core/Stack";
import type { PullFile } from "@/lib/github";
import { parsePatch, type DiffRow } from "@/lib/diff";

// Structural widths for the line-number gutters. Raw px is intentional here:
// the scaffold guide reserves px for structural widths, everything else uses tokens.
const GUTTER = 52;

function Gutter({ value }: { value: number | null | undefined }) {
  return (
    <HStack
      width={GUTTER}
      justify="end"
      paddingInline={2}
      paddingBlock={0.5}
      align="start"
      className="shrink-0 select-none border-r border-border"
    >
      <Text type="code" color="secondary" hasTabularNumbers>
        {value ?? ""}
      </Text>
    </HStack>
  );
}

function Row({ row }: { row: DiffRow }) {
  if (row.type === "hunk") {
    return (
      <HStack gap={0} className="bg-blue-subtle">
        <HStack
          paddingInline={3}
          paddingBlock={0.5}
          className="min-w-0 flex-1"
        >
          <Text type="code" className="whitespace-pre-wrap break-all text-blue-vivid">
            {row.content}
          </Text>
        </HStack>
      </HStack>
    );
  }

  const bg =
    row.type === "add"
      ? "bg-green-subtle"
      : row.type === "del"
        ? "bg-red-subtle"
        : "";
  const sign = row.type === "add" ? "+" : row.type === "del" ? "-" : " ";

  return (
    <HStack gap={0} align="stretch" className={bg}>
      <Gutter value={row.oldLine} />
      <Gutter value={row.newLine} />
      <HStack
        paddingInline={3}
        paddingBlock={0.5}
        align="start"
        className="min-w-0 flex-1"
      >
        <Text type="code" className="whitespace-pre-wrap break-all">
          <Text as="span" type="code" color="secondary" className="select-none">
            {sign}
          </Text>
          {row.content}
        </Text>
      </HStack>
    </HStack>
  );
}

export default function DiffFile({ file }: { file: PullFile }) {
  const [open, setOpen] = useState(true);
  const [viewed, setViewed] = useState(false);
  const rows = parsePatch(file.patch);

  return (
    <Card padding={0}>
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
            label={open ? "Collapse file" : "Expand file"}
            onClick={() => setOpen((o) => !o)}
            icon={<Icon icon="chevronDown" className={open ? "" : "-rotate-90"} />}
          />
          <Text type="code" maxLines={1} className="min-w-0">
            {file.filename}
          </Text>
        </HStack>
        <HStack align="center" gap={3} className="shrink-0">
          {file.additions > 0 && (
            <Text type="code" hasTabularNumbers className="text-green-vivid">
              +{file.additions}
            </Text>
          )}
          {file.deletions > 0 && (
            <Text type="code" hasTabularNumbers className="text-red-vivid">
              -{file.deletions}
            </Text>
          )}
          <CheckboxInput
            label="Viewed"
            size="sm"
            value={viewed}
            onChange={setViewed}
          />
        </HStack>
      </HStack>

      {/* diff body */}
      {open &&
        (rows.length === 0 ? (
          <HStack paddingInline={4} paddingBlock={3}>
            <Text type="supporting">
              {file.status === "renamed"
                ? "File renamed — no content changes."
                : "No textual diff available (binary or too large)."}
            </Text>
          </HStack>
        ) : (
          <VStack gap={0}>
            {rows.map((r, i) => (
              <Row key={i} row={r} />
            ))}
          </VStack>
        ))}
    </Card>
  );
}
