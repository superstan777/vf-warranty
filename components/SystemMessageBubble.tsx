"use client";

import { formatDateToLocal24h } from "@/utils/utils";

interface SystemMessageBubbleProps {
  text: string;
  createdAt: string;
  isRight?: boolean;
}

export default function SystemMessageBubble({
  text,
  createdAt,
  isRight = false,
}: SystemMessageBubbleProps) {
  return (
    <div className={`flex ${isRight ? "justify-end" : "justify-start"}`}>
      <div className="max-w-lg rounded-lg bg-white shadow dark:bg-zinc-800 dark:text-zinc-50 overflow-hidden">
        <div className="bg-gray-400 w-full px-2 py-1">
          <span className="text-xs text-white tracking-wide">System</span>
        </div>

        <div className="p-4">
          <div className="prose dark:prose-invert max-w-none">{text}</div>

          {createdAt && (
            <span className="mt-2 block text-xs text-gray-400 dark:text-zinc-400">
              {formatDateToLocal24h(createdAt)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
