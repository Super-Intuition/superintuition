import { type ReactNode } from "react";
import { Text } from "@astryxdesign/core/Text";
import { Code } from "@astryxdesign/core/Code";
import { Link } from "@astryxdesign/core/Link";
import { Heading } from "@astryxdesign/core/Heading";
import { CheckboxInput } from "@astryxdesign/core/CheckboxInput";
import { HStack, VStack } from "@astryxdesign/core/Stack";

// Minimal, dependency-free markdown good enough for PR bodies:
// headings, bullet/number lists, task-list checkboxes, inline `code` and links.

function renderInline(text: string, keyBase: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  // Split on inline code and links, keeping delimiters.
  const re = /(`[^`]+`)|(\[[^\]]+\]\([^)]+\))/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let k = 0;
  while ((m = re.exec(text))) {
    if (m.index > last) nodes.push(text.slice(last, m.index));
    const token = m[0];
    if (token.startsWith("`")) {
      nodes.push(
        <Code
          key={`${keyBase}-${k++}`}
          size="inherit"
          className="text-text-blue"
        >
          {token.slice(1, -1)}
        </Code>,
      );
    } else {
      const label = token.slice(1, token.indexOf("]"));
      const href = token.slice(token.indexOf("(") + 1, -1);
      nodes.push(
        <Link
          key={`${keyBase}-${k++}`}
          href={href}
          type="inherit"
          isExternalLink
        >
          {label}
        </Link>,
      );
    }
    last = m.index + token.length;
  }
  if (last < text.length) nodes.push(text.slice(last));
  return nodes;
}

export default function Markdown({ source }: { source: string }) {
  const lines = source.replace(/\r\n/g, "\n").split("\n");
  const out: ReactNode[] = [];
  let list: ReactNode[] = [];
  let listKey = 0;

  const flush = () => {
    if (list.length) {
      out.push(
        <VStack key={`ul-${listKey++}`} gap={1.5}>
          {list}
        </VStack>,
      );
      list = [];
    }
  };

  lines.forEach((line, i) => {
    const h = /^(#{1,6})\s+(.*)$/.exec(line);
    if (h) {
      flush();
      // Clamp to 2–6 so these never collide with the page-level h1.
      const level = Math.min(Math.max(h[1].length, 2), 6) as 2 | 3 | 4 | 5 | 6;
      out.push(
        <Heading key={`h-${i}`} level={level} weight="semibold">
          {renderInline(h[2], `h-${i}`)}
        </Heading>,
      );
      return;
    }

    const task = /^\s*[-*]\s+\[([ xX])\]\s+(.*)$/.exec(line);
    if (task) {
      const checked = task[1].toLowerCase() === "x";
      list.push(
        <HStack key={`li-${i}`} gap={2} align="start">
          <CheckboxInput
            label={task[2]}
            isLabelHidden
            size="sm"
            value={checked}
            isReadOnly
            onChange={() => {}}
          />
          <Text type="body" size="sm">
            {renderInline(task[2], `li-${i}`)}
          </Text>
        </HStack>,
      );
      return;
    }

    const bullet = /^\s*[-*]\s+(.*)$/.exec(line);
    if (bullet) {
      list.push(
        <HStack key={`li-${i}`} gap={2} align="start">
          <Text type="body" size="sm" color="secondary">
            •
          </Text>
          <Text type="body" size="sm">
            {renderInline(bullet[1], `li-${i}`)}
          </Text>
        </HStack>,
      );
      return;
    }

    flush();
    if (line.trim() !== "") {
      out.push(
        <Text key={`p-${i}`} type="body" size="sm" display="block">
          {renderInline(line, `p-${i}`)}
        </Text>,
      );
    }
  });
  flush();

  return <VStack gap={2}>{out}</VStack>;
}
