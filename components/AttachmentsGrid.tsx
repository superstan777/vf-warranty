"use client";
import { Download } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import PreviewModal from "./PreviewModal";

export interface Attachment {
  id: string;
  url: string;
  path: string;
  type: "image" | "other";
}

interface Props {
  attachments: Attachment[];
}

const IMAGE_EXT = ["png", "jpg", "jpeg", "gif", "webp", "svg"];

export default function AttachmentsGrid({ attachments }: Props) {
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);

  return (
    <>
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mt-2">
        {attachments.map((att, i) => {
          const filename = att.path.split("/").pop();
          const ext = att.path.split(".").pop()?.toLowerCase();
          const isImage = ext && IMAGE_EXT.includes(ext);

          return (
            <div
              key={att.id}
              className="border rounded-lg p-2 bg-gray-50 dark:bg-zinc-700 cursor-pointer hover:bg-gray-100 dark:hover:bg-zinc-600 transition"
              onClick={() => setPreviewIndex(i)}
            >
              <div className="w-full h-20 bg-white dark:bg-zinc-800 rounded overflow-hidden flex items-center justify-center">
                {isImage ? (
                  <Image
                    src={att.url}
                    alt={filename || ""}
                    width={80}
                    height={80}
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <span className="text-xs text-gray-600 dark:text-gray-300">
                    {filename}
                  </span>
                )}
              </div>

              <div className="flex justify-between items-center mt-1">
                <span className="text-[10px] truncate w-full">{filename}</span>

                <button
                  onClick={async (e) => {
                    e.stopPropagation();
                    try {
                      const response = await fetch(att.url);
                      const blob = await response.blob();
                      const blobUrl = window.URL.createObjectURL(blob);
                      const link = document.createElement("a");
                      link.href = blobUrl;
                      link.download = filename || "file";
                      document.body.appendChild(link);
                      link.click();
                      link.remove();
                      window.URL.revokeObjectURL(blobUrl);
                    } catch (err) {
                      console.error("Download failed", err);
                    }
                  }}
                  className="ml-1 p-1 hover:bg-gray-200 dark:hover:bg-zinc-500 rounded cursor-pointer"
                >
                  <Download className="w-3 h-3" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {previewIndex !== null && (
        <PreviewModal
          attachments={attachments}
          initialIndex={previewIndex}
          onClose={() => setPreviewIndex(null)}
        />
      )}
    </>
  );
}
