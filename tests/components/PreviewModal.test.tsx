import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import PreviewModal from "@/components/PreviewModal";
import type { Attachment } from "@/components/AttachmentsGrid";

const attachments: Attachment[] = [
  {
    id: "1",
    path: "folder/image1.jpg",
    url: "https://example.com/image1.jpg",
    type: "image",
    created_at: "2025-12-05T12:00:00.000Z",
    note_id: "note1",
  },
  {
    id: "2",
    path: "folder/image2.png",
    url: "https://example.com/image2.png",
    type: "image",
    created_at: "2025-12-05T12:10:00.000Z",
    note_id: "note1",
  },
];

describe("PreviewModal", () => {
  beforeEach(() => {
    // Mock fetch for file download
    vi.stubGlobal(
      "fetch",
      vi.fn(() =>
        Promise.resolve({
          blob: () => Promise.resolve(new Blob(["fake"])),
        })
      )
    );
    // Mock URL object
    vi.spyOn(URL, "createObjectURL").mockReturnValue("blob://test");
    vi.spyOn(URL, "revokeObjectURL").mockReturnValue();
  });

  it("renders the first attachment", () => {
    render(
      <PreviewModal
        attachments={attachments}
        initialIndex={0}
        onClose={() => {}}
      />
    );
    expect(screen.getByTestId("filename")).toHaveTextContent("image1.jpg");
  });

  it("navigates to the next image when clicking the next arrow", () => {
    render(
      <PreviewModal
        attachments={attachments}
        initialIndex={0}
        onClose={() => {}}
      />
    );
    const nextBtn = screen.getByTestId("next-button");
    fireEvent.click(nextBtn);
    expect(screen.getByTestId("filename")).toHaveTextContent("image2.png");
  });

  it("navigates to the previous image when clicking the previous arrow", () => {
    render(
      <PreviewModal
        attachments={attachments}
        initialIndex={1}
        onClose={() => {}}
      />
    );
    const prevBtn = screen.getByTestId("prev-button");
    fireEvent.click(prevBtn);
    expect(screen.getByTestId("filename")).toHaveTextContent("image1.jpg");
  });

  it("closes the modal when clicking the overlay", async () => {
    const onClose = vi.fn();
    render(
      <PreviewModal
        attachments={attachments}
        initialIndex={0}
        onClose={onClose}
      />
    );
    const overlay = screen.getByTestId("overlay-background");
    fireEvent.click(overlay);
    await new Promise((r) => setTimeout(r, 250));
    expect(onClose).toHaveBeenCalled();
  });

  it("closes the modal when pressing the Escape key", async () => {
    const onClose = vi.fn();
    render(
      <PreviewModal
        attachments={attachments}
        initialIndex={0}
        onClose={onClose}
      />
    );
    fireEvent.keyDown(window, { key: "Escape" });
    await new Promise((r) => setTimeout(r, 250));
    expect(onClose).toHaveBeenCalled();
  });

  it("downloads the file when clicking the Download button", () => {
    render(
      <PreviewModal
        attachments={attachments}
        initialIndex={0}
        onClose={() => {}}
      />
    );
    const downloadBtn = screen.getByTestId("download-button");
    fireEvent.click(downloadBtn);
    expect(fetch).toHaveBeenCalledWith("https://example.com/image1.jpg");
  });
});
