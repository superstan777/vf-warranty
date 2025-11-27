import { formatDateToLocal24h } from "@/lib/utils";

interface MessageBubbleProps {
  content: string;
  createdAt: string;
  isRight: boolean;
  userName?: string;
  children?: React.ReactNode;
}

export default function MessageBubble({
  content,
  createdAt,
  isRight,
  userName,
  children,
}: MessageBubbleProps) {
  return (
    <div className={`flex ${isRight ? "justify-end" : "justify-start"}`}>
      <div className="max-w-xs rounded-lg bg-white p-4 shadow dark:bg-zinc-800 dark:text-zinc-50">
        {userName && (
          <span className="block text-xs font-semibold text-gray-500 dark:text-zinc-400 mb-1">
            {userName}
          </span>
        )}
        <p>{content}</p>
        {children && <div className="mt-2 flex flex-col gap-2">{children}</div>}
        <span className="mt-2 block text-xs text-gray-400 dark:text-zinc-400">
          <span className="mt-2 block text-xs text-gray-400 dark:text-zinc-400">
            {formatDateToLocal24h(createdAt)}
          </span>
        </span>
      </div>
    </div>
  );
}
