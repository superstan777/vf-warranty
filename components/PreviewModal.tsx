"use client";

import { Download, X, ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import { useState, useEffect, useCallback } from "react";
import type { Attachment } from "./AttachmentsGrid";

interface Props {
  attachments: Attachment[];
  initialIndex: number;
  onClose: () => void;
}

export default function PreviewModal({
  attachments,
  initialIndex,
  onClose,
}: Props) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex]);

  const next = useCallback(() => {
    setCurrentIndex((currentIndex + 1) % attachments.length);
  }, [currentIndex, attachments.length]);

  const prev = useCallback(() => {
    setCurrentIndex(
      (currentIndex - 1 + attachments.length) % attachments.length
    );
  }, [currentIndex, attachments.length]);

  const currentAttachment = attachments[currentIndex];
  const filename = currentAttachment.path.split("/").pop();
  const IMAGE_EXT = ["png", "jpg", "jpeg", "gif", "webp", "svg"];
  const ext = currentAttachment.path.split(".").pop()?.toLowerCase();
  const isImage = ext && IMAGE_EXT.includes(ext);

  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const response = await fetch(currentAttachment.url);
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
  };

  // Obsługa klawiatury
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") {
        next();
      } else if (e.key === "ArrowLeft") {
        prev();
      } else if (e.key === "Escape") {
        onClose();
      }
    },
    [next, prev, onClose]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
      <div
        className="absolute inset-0 bg-black opacity-80 pointer-events-auto"
        onClick={onClose}
      />

      <div className="relative z-10 w-full max-w-5xl max-h-full flex flex-col pointer-events-auto">
        <div className="fixed top-0 left-0 right-0 flex justify-center items-center p-2 z-20 pointer-events-auto">
          <span className="text-sm font-semibold truncate text-gray-300">
            {filename}
          </span>

          <button
            onClick={handleDownload}
            className="absolute right-10 text-gray-300 p-1 hover:text-white cursor-pointer"
          >
            <Download />
          </button>

          <button
            onClick={onClose}
            className="absolute right-2 text-gray-300 p-1 hover:text-white cursor-pointer"
          >
            <X />
          </button>
        </div>

        <div className="flex-1 flex items-center justify-center h-screen pointer-events-auto px-4">
          {isImage ? (
            <Image
              src={currentAttachment.url}
              alt={filename || ""}
              width={800}
              height={600}
              className="object-contain max-h-screen max-w-full"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-300 p-4">
              <span className="text-center">{filename}</span>
            </div>
          )}
        </div>

        <button
          onClick={prev}
          className="fixed left-2 top-1/2 -translate-y-1/2 p-2 bg-transparent text-gray-300 rounded-full hover:text-white z-20 pointer-events-auto cursor-pointer"
        >
          <ChevronLeft />
        </button>

        <button
          onClick={next}
          className="fixed right-2 top-1/2 -translate-y-1/2 p-2 bg-transparent text-gray-300 rounded-full hover:text-white z-20 pointer-events-auto cursor-pointer"
        >
          <ChevronRight />
        </button>
      </div>
    </div>
  );
}
