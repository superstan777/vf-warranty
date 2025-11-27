interface MessageBubbleProps {
  content: string;
  createdAt: string;
  isRight: boolean;
  children?: React.ReactNode; // do załączników
}

export default function MessageBubble({
  content,
  createdAt,
  isRight,
  children,
}: MessageBubbleProps) {
  return (
    <div className={`flex ${isRight ? "justify-end" : "justify-start"}`}>
      <div className="max-w-xs rounded-lg bg-white p-4 shadow dark:bg-zinc-800 dark:text-zinc-50">
        <p>{content}</p>
        {children && <div className="mt-2 flex flex-col gap-2">{children}</div>}
        <span className="mt-2 block text-xs text-gray-400 dark:text-zinc-400">
          {createdAt}
        </span>
      </div>
    </div>
  );
}
