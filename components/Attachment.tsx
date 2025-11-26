interface AttachmentProps {
  attachment: { id: number; filename: string; url: string };
}

export default function Attachment({ attachment }: AttachmentProps) {
  return (
    <div className="border rounded p-2 bg-gray-50 dark:bg-zinc-700">
      <a
        href={attachment.url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-600 dark:text-blue-400 underline"
      >
        {attachment.filename}
      </a>
    </div>
  );
}
