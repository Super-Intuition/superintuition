import type { PullDetail } from "@/lib/github";
import Markdown from "./Markdown";

function Avatar({ src, login }: { src: string; login: string }) {
  if (src) {
    // eslint-disable-next-line @next/next/no-img-element
    return (
      <img
        src={src}
        alt={login}
        className="h-7 w-7 rounded-full border border-[var(--border)]"
      />
    );
  }
  return (
    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--panel-2)] text-xs uppercase text-[var(--text-muted)]">
      {login.slice(0, 2)}
    </div>
  );
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const d = Math.floor(diff / 86400000);
  if (d > 30) return `${Math.floor(d / 30)} months ago`;
  if (d >= 14) return `${Math.floor(d / 7)} weeks ago`;
  if (d >= 7) return "a week ago";
  if (d >= 1) return `${d} day${d > 1 ? "s" : ""} ago`;
  const h = Math.floor(diff / 3600000);
  if (h >= 1) return `${h} hour${h > 1 ? "s" : ""} ago`;
  return "just now";
}

export default function ConversationPanel({ pull }: { pull: PullDetail }) {
  return (
    <div className="flex h-full flex-col overflow-y-auto border-r border-[var(--border)] bg-[var(--panel)]">
      <div className="flex items-center gap-2 border-b border-[var(--border)] px-5 py-3">
        <Avatar src={pull.userAvatar} login={pull.user} />
        <div className="text-sm">
          <span className="font-semibold text-[var(--text)]">{pull.user}</span>
          <span className="text-[var(--text-muted)]">
            {" "}
            commented {timeAgo(pull.createdAt)}
          </span>
        </div>
      </div>
      <div className="px-5 py-4">
        {pull.body ? (
          <Markdown source={pull.body} />
        ) : (
          <p className="text-sm italic text-[var(--text-muted)]">
            No description provided.
          </p>
        )}
      </div>
    </div>
  );
}
