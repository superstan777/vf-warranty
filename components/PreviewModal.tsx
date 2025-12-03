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
  const [visible, setVisible] = useState(false);

  useEffect(() => setCurrentIndex(initialIndex), [initialIndex]);
  useEffect(() => setVisible(true), []);

  const next = useCallback(() => {
    setCurrentIndex((i) => (i + 1) % attachments.length);
  }, [attachments.length]);

  const prev = useCallback(() => {
    setCurrentIndex((i) => (i - 1 + attachments.length) % attachments.length);
  }, [attachments.length]);

  const closeWithFade = () => {
    setVisible(false);
    setTimeout(() => onClose(), 200);
  };

  const currentAttachment = attachments[currentIndex];
  const filename = currentAttachment.path.split("/").pop();
  const ext = currentAttachment.path.split(".").pop()?.toLowerCase();
  const isImage =
    ext && ["png", "jpg", "jpeg", "gif", "webp", "svg"].includes(ext);

  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const response = await fetch(currentAttachment.url);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = filename || "file";
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error("Download failed", err);
    }
  };

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") next();
      else if (e.key === "ArrowLeft") prev();
      else if (e.key === "Escape") closeWithFade();
    },
    [next, prev]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center pointer-events-none 
        transition-opacity duration-200 ${
          visible ? "opacity-100" : "opacity-0"
        }`}
    >
      <div
        className="absolute inset-0 bg-black pointer-events-auto transition-opacity duration-200"
        style={{ opacity: visible ? 0.8 : 0 }}
        onClick={closeWithFade}
      />

      <div className="relative z-10 w-full max-w-5xl max-h-full flex flex-col pointer-events-none">
        <div className="fixed top-0 left-0 right-0 z-20 flex justify-center items-center p-2 pointer-events-auto">
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
            onClick={closeWithFade}
            className="absolute right-2 text-gray-300 p-1 hover:text-white cursor-pointer"
          >
            <X />
          </button>
        </div>

        <div className="flex-1 flex items-center justify-center px-4 pt-10 overflow-auto pointer-events-none">
          {isImage ? (
            <Image
              src={currentAttachment.url}
              alt={filename || ""}
              width={800}
              height={600}
              className="object-contain max-h-[80vh] pointer-events-none"
            />
          ) : (
            <div className="w-full flex items-center justify-center text-gray-300 p-4 pointer-events-none">
              <span className="text-center text-lg text-gray-400">
                No preview available
              </span>
            </div>
          )}
        </div>

        <button
          onClick={prev}
          className="fixed left-2 top-1/2 -translate-y-1/2 p-2 bg-transparent text-gray-300 rounded-full
            hover:text-white z-20 pointer-events-auto cursor-pointer"
        >
          <ChevronLeft />
        </button>

        <button
          onClick={next}
          className="fixed right-2 top-1/2 -translate-y-1/2 p-2 bg-transparent text-gray-300 rounded-full
            hover:text-white z-20 pointer-events-auto cursor-pointer"
        >
          <ChevronRight />
        </button>
      </div>
    </div>
  );
}
