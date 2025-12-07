import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { CreateClaimDialog } from "@/components/CreateClaimDialog";
import * as actions from "@/app/claims/actions";
import userEvent from "@testing-library/user-event";

import { toast } from "sonner";

vi.mock("@/app/claims/actions", () => ({
  createClaim: vi.fn(),
}));

vi.mock("sonner", () => ({
  toast: { promise: vi.fn() },
}));

describe("CreateClaimDialog", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("renders trigger button", () => {
    render(<CreateClaimDialog />);
    expect(screen.getByText(/create new claim/i)).toBeInTheDocument();
  });

  it("opens dialog when clicking trigger", async () => {
    render(<CreateClaimDialog />);
    const trigger = screen.getByText(/create new claim/i);
    fireEvent.click(trigger);

    await waitFor(() => {
      expect(
        screen.getByText(/provide a title and description/i)
      ).toBeInTheDocument();
      expect(screen.getByLabelText(/title/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
    });
  });

  it("shows validation errors when submitting empty form", async () => {
    render(<CreateClaimDialog />);
    fireEvent.click(screen.getByText(/create new claim/i));

    const submitBtn = screen.getByRole("button", { name: /create claim/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText(/title cannot be empty/i)).toBeInTheDocument();
      expect(
        screen.getByText(/description cannot be empty/i)
      ).toBeInTheDocument();
    });
  });

  it("calls createClaim and toast on valid submission", async () => {
    const createClaimMock = vi.spyOn(actions, "createClaim").mockResolvedValue({
      id: "claim-1",
      title: "Test title",
      description: "Test description",
      created_at: new Date().toISOString(),
      created_by: "Test User",
      inc_number: null,
      status: "in_progress",
    });

    const toastMock = vi.spyOn(toast, "promise");
    const user = userEvent.setup();

    render(<CreateClaimDialog />);

    await user.click(screen.getByText(/create new claim/i));

    const titleInput = await screen.findByLabelText(/title/i);
    const descriptionInput = await screen.findByLabelText(/description/i);

    await user.type(titleInput, "Test title");
    await user.type(descriptionInput, "Test description");

    await user.click(screen.getByRole("button", { name: /create claim/i }));

    await waitFor(() => {
      expect(createClaimMock).toHaveBeenCalledWith(
        "Test title",
        "Test description"
      );
      expect(toastMock).toHaveBeenCalled();
    });
  });

  it("disables inputs and buttons while submitting", async () => {
    vi.spyOn(actions, "createClaim").mockImplementation(
      () =>
        new Promise((resolve) =>
          setTimeout(
            () =>
              resolve({
                id: "claim-1",
                title: "Test title",
                description: "Test description",
                created_at: new Date().toISOString(),
                created_by: "Test User",
                inc_number: null,
                status: "in_progress",
              }),
            50
          )
        )
    );

    render(<CreateClaimDialog />);

    fireEvent.click(screen.getByText(/create new claim/i));
    await waitFor(() => {
      expect(screen.getByLabelText(/title/i)).toBeInTheDocument();
    });

    fireEvent.change(screen.getByLabelText(/title/i), {
      target: { value: "Test title" },
    });
    fireEvent.change(screen.getByLabelText(/description/i), {
      target: { value: "Test description" },
    });

    const submitBtn = screen.getByRole("button", { name: /create claim/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByLabelText(/title/i)).toBeDisabled();
      expect(screen.getByLabelText(/description/i)).toBeDisabled();
      expect(submitBtn).toBeDisabled();
    });
  });
});
