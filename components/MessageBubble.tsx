"use client";

import { formatDateToLocal24h } from "@/utils/utils";
import type { Tables } from "@/types/supabase";
import AttachmentsGrid from "./AttachmentsGrid";

type Note = Tables<"notes">;

interface AttachmentWithUrl {
  id: string;
  note_id: string;
  path: string;
  created_at: string;
  url: string;
}

interface MessageBubbleProps {
  note: Note;
  attachments?: AttachmentWithUrl[];
  isRight: boolean;
}

function getAttachmentType(path: string): "image" | "other" {
  const imageExtensions = ["png", "jpg", "jpeg", "gif", "webp", "svg"];
  const ext = path.split(".").pop()?.toLowerCase();
  return ext && imageExtensions.includes(ext) ? "image" : "other";
}

const originColors: Record<string, string> = {
  app: "bg-gray-500",
  teams: "bg-[#6264A7]",
  mail: "bg-[#0078D4]",
};

const originLabels: Record<string, string> = {
  app: "App",
  teams: "Teams",
  mail: "Mail",
};

export default function MessageBubble({
  note,
  attachments,
  isRight,
}: MessageBubbleProps) {
  const processedAttachments =
    attachments?.map((att) => ({
      ...att,
      type: getAttachmentType(att.path),
    })) || [];

  const topBarColor = originColors[note.origin];
  const topBarLabel = originLabels[note.origin];

  return (
    <div className={`flex ${isRight ? "justify-end" : "justify-start"}`}>
      <div className="min-w-[75%] max-w-[90%] rounded-lg bg-white shadow dark:bg-zinc-800 dark:text-zinc-50 overflow-hidden">
        <div className={`${topBarColor} w-full px-2 py-1`}>
          <span className="text-xs text-white tracking-wide">
            {topBarLabel}
          </span>
        </div>

        <div className="p-4">
          {note.user_name && (
            <span className="block text-xs font-semibold text-gray-500 dark:text-zinc-400 mb-1">
              {note.user_name}
            </span>
          )}

          <div className="prose dark:prose-invert max-w-none mb-2">
            {note.content}
          </div>

          {processedAttachments.length > 0 && (
            <AttachmentsGrid attachments={processedAttachments} />
          )}

          <span className="mt-2 block text-xs text-gray-400 dark:text-zinc-400">
            {formatDateToLocal24h(note.created_at)}
          </span>
        </div>
      </div>
    </div>
  );
}
