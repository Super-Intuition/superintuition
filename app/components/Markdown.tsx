import { Fragment, type ReactNode } from "react";

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
        <code
          key={`${keyBase}-${k++}`}
          className="mono rounded bg-[var(--panel-2)] px-1 py-0.5 text-[0.85em] text-[#79c0ff]"
        >
          {token.slice(1, -1)}
        </code>,
      );
    } else {
      const label = token.slice(1, token.indexOf("]"));
      const href = token.slice(token.indexOf("(") + 1, -1);
      nodes.push(
        <a
          key={`${keyBase}-${k++}`}
          href={href}
          className="text-[var(--accent)] hover:underline"
          target="_blank"
          rel="noreferrer"
        >
          {label}
        </a>,
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
        <ul key={`ul-${listKey++}`} className="my-2 space-y-1 pl-1">
          {list}
        </ul>,
      );
      list = [];
    }
  };

  lines.forEach((line, i) => {
    const h = /^(#{1,6})\s+(.*)$/.exec(line);
    if (h) {
      flush();
      const level = h[1].length;
      const size = level <= 1 ? "text-xl" : level === 2 ? "text-lg" : "text-base";
      out.push(
        <h3
          key={`h-${i}`}
          className={`${size} mt-5 mb-2 font-semibold text-[var(--text)]`}
        >
          {renderInline(h[2], `h-${i}`)}
        </h3>,
      );
      return;
    }

    const task = /^\s*[-*]\s+\[([ xX])\]\s+(.*)$/.exec(line);
    if (task) {
      const checked = task[1].toLowerCase() === "x";
      list.push(
        <li key={`li-${i}`} className="flex items-start gap-2 text-sm">
          <input
            type="checkbox"
            checked={checked}
            readOnly
            className="mt-1 accent-[var(--accent)]"
          />
          <span className="text-[var(--text)]">
            {renderInline(task[2], `li-${i}`)}
          </span>
        </li>,
      );
      return;
    }

    const bullet = /^\s*[-*]\s+(.*)$/.exec(line);
    if (bullet) {
      list.push(
        <li
          key={`li-${i}`}
          className="flex items-start gap-2 text-sm text-[var(--text)]"
        >
          <span className="mt-[2px] text-[var(--text-muted)]">•</span>
          <span>{renderInline(bullet[1], `li-${i}`)}</span>
        </li>,
      );
      return;
    }

    flush();
    if (line.trim() === "") {
      out.push(<div key={`sp-${i}`} className="h-2" />);
    } else {
      out.push(
        <p key={`p-${i}`} className="my-1 text-sm leading-6 text-[var(--text)]">
          {renderInline(line, `p-${i}`)}
        </p>,
      );
    }
  });
  flush();

  return <Fragment>{out}</Fragment>;
}
