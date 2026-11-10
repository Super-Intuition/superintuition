// Parse a unified-diff patch (as GitHub returns per file) into renderable rows.

export type DiffRowType = "hunk" | "add" | "del" | "context";

export interface DiffRow {
  type: DiffRowType;
  /** old-file line number (null for added/hunk rows) */
  oldLine: number | null;
  /** new-file line number (null for removed/hunk rows) */
  newLine: number | null;
  content: string;
}

const HUNK_RE = /^@@ -(\d+)(?:,\d+)? \+(\d+)(?:,\d+)? @@/;

export function parsePatch(patch: string | undefined): DiffRow[] {
  if (!patch) return [];
  const rows: DiffRow[] = [];
  let oldLine = 0;
  let newLine = 0;

  for (const raw of patch.split("\n")) {
    const hunk = HUNK_RE.exec(raw);
    if (hunk) {
      oldLine = Number(hunk[1]);
      newLine = Number(hunk[2]);
      rows.push({ type: "hunk", oldLine: null, newLine: null, content: raw });
      continue;
    }
    const marker = raw[0];
    const content = raw.slice(1);
    if (marker === "+") {
      rows.push({ type: "add", oldLine: null, newLine: newLine++, content });
    } else if (marker === "-") {
      rows.push({ type: "del", oldLine: oldLine++, newLine: null, content });
    } else {
      // context line (leading space) or the trailing "\ No newline" note
      rows.push({
        type: "context",
        oldLine: oldLine++,
        newLine: newLine++,
        content,
      });
    }
  }
  return rows;
}
