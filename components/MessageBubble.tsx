import { formatDateToLocal24h } from "@/lib/utils";
import type { Tables } from "@/types/supabase";

type Note = Tables<"notes">;

interface MessageBubbleProps {
  note: Note;
  isRight: boolean;
  children?: React.ReactNode;
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
  isRight,
  children,
}: MessageBubbleProps) {
  const topBarColor = originColors[note.origin];
  const topBarLabel = originLabels[note.origin];

  return (
    <div className={`flex ${isRight ? "justify-end" : "justify-start"}`}>
      <div className="max-w-lg rounded-lg bg-white shadow dark:bg-zinc-800 dark:text-zinc-50 overflow-hidden">
        <div className={`${topBarColor} w-full px-2 py-1`}>
          <span className="text-xs  text-white tracking-wide">
            {topBarLabel}
          </span>
        </div>

        <div className="p-4">
          {note.user_name && (
            <span className="block text-xs font-semibold text-gray-500 dark:text-zinc-400 mb-1">
              {note.user_name}
            </span>
          )}

          <div className="prose dark:prose-invert max-w-none">
            {note.content}
          </div>

          {children && (
            <div className="mt-2 flex flex-col gap-2">{children}</div>
          )}

          <span className="mt-2 block text-xs text-gray-400 dark:text-zinc-400">
            {formatDateToLocal24h(note.created_at)}
          </span>
        </div>
      </div>
    </div>
  );
}
