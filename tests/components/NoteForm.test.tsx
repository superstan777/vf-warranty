import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { NoteForm } from "@/components/NoteForm";
import * as actionsModule from "@/app/claims/[claimId]/actions";
import { toast } from "sonner";

vi.mock("@/app/claims/[claimId]/actions", () => ({
  addNote: vi.fn(),
}));

vi.mock("sonner", () => ({
  toast: { promise: vi.fn((fn) => fn()) },
}));

describe("NoteForm", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("renders resolved/cancelled message and disables form", () => {
    const { rerender } = render(
      <NoteForm claimId="claim-1" status="resolved" />
    );

    expect(
      screen.getByText("This claim has been resolved")
    ).toBeInTheDocument();
    expect(
      screen.queryByPlaceholderText("Write your note here...")
    ).not.toBeInTheDocument();

    rerender(<NoteForm claimId="claim-1" status="cancelled" />);
    expect(
      screen.getByText("This claim has been cancelled")
    ).toBeInTheDocument();
  });

  it("renders form for in_progress status", () => {
    render(<NoteForm claimId="claim-1" status="in_progress" />);

    expect(
      screen.getByPlaceholderText("Write your note here...")
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Add note/i })
    ).toBeInTheDocument();
  });

  it("calls addNote on submit and resets form", async () => {
    const mockAddNote = vi.spyOn(actionsModule, "addNote").mockResolvedValue({
      id: "1",
      claim_id: "claim-1",
      content: "Test note",
      user_name: "John",
      origin: "app",
      created_at: new Date().toISOString(),
    });

    render(<NoteForm claimId="claim-1" status="in_progress" />);

    const textarea = screen.getByPlaceholderText("Write your note here...");
    const button = screen.getByRole("button", { name: /Add note/i });

    fireEvent.change(textarea, { target: { value: "Test note" } });
    fireEvent.click(button);

    await waitFor(() => {
      expect(mockAddNote).toHaveBeenCalledWith("claim-1", "Test note", "app");
    });

    expect(textarea).toHaveValue("");
    expect(toast.promise).toHaveBeenCalled();
  });

  it("shows validation error if note is empty", async () => {
    render(<NoteForm claimId="claim-1" status="in_progress" />);
    const button = screen.getByRole("button", { name: /Add note/i });

    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText("Note cannot be empty")).toBeInTheDocument();
    });
  });
});
