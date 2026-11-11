import { Avatar } from "@astryxdesign/core/Avatar";
import { Text } from "@astryxdesign/core/Text";
import { HStack } from "@astryxdesign/core/Stack";
import type { PullDetail } from "@/lib/github";
import Markdown from "./Markdown";

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
    <div className="flex h-full flex-col overflow-y-auto border-r border-border bg-surface">
      <HStack
        align="center"
        gap={2}
        paddingInline={5}
        paddingBlock={3}
        className="border-b border-border"
      >
        <Avatar src={pull.userAvatar} name={pull.user} size="sm" />
        <Text type="supporting">
          <Text weight="semibold" color="primary">
            {pull.user}
          </Text>{" "}
          commented {timeAgo(pull.createdAt)}
        </Text>
      </HStack>
      <div className="px-5 py-4">
        {pull.body ? (
          <Markdown source={pull.body} />
        ) : (
          <Text type="supporting" className="italic">
            No description provided.
          </Text>
        )}
      </div>
    </div>
  );
}
