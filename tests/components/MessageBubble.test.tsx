import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import MessageBubble from "@/components/MessageBubble";
import type { Tables } from "@/types/supabase";

type Note = Tables<"notes">;

describe("MessageBubble", () => {
  const baseNote: Note = {
    id: "1",
    claim_id: "123",
    content: "Hello world!",
    user_name: "John Doe",
    created_at: "2025-01-01T10:00:00Z",
    origin: "app",
  };

  it("renders note content", () => {
    render(<MessageBubble note={baseNote} isRight={false} />);

    expect(screen.getByText("Hello world!")).toBeInTheDocument();
  });

  it("renders user name", () => {
    render(<MessageBubble note={baseNote} isRight={false} />);

    expect(screen.getByText("John Doe")).toBeInTheDocument();
  });

  it("renders formatted date", () => {
    render(<MessageBubble note={baseNote} isRight={false} />);

    expect(screen.getByText(/01\/01\/25/)).toBeInTheDocument();
  });

  it("applies correct color based on origin", () => {
    render(<MessageBubble note={baseNote} isRight={false} />);

    const topBar = screen.getByText("App").parentElement;
    expect(topBar).toHaveClass("bg-gray-500");
  });

  it("aligns bubble to the right when isRight=true", () => {
    const { container } = render(
      <MessageBubble note={baseNote} isRight={true} />
    );

    expect(container.firstChild).toHaveClass("justify-end");
  });

  it("aligns bubble to the left when isRight=false", () => {
    const { container } = render(
      <MessageBubble note={baseNote} isRight={false} />
    );

    expect(container.firstChild).toHaveClass("justify-start");
  });

  it("renders attachments when provided", () => {
    const attachments = [
      {
        id: "a1",
        note_id: "1",
        path: "file.jpg",
        created_at: "2025-01-01T10:00:00Z",
        url: "http://url",
      },
    ];

    render(
      <MessageBubble
        note={baseNote}
        isRight={false}
        attachments={attachments}
      />
    );

    expect(screen.getByRole("img")).toBeInTheDocument();
  });
});
