import { describe, it, expect, vi, beforeEach, Mock } from "vitest";

vi.mock("@/auth", () => ({
  auth: vi.fn(),
}));
vi.mock("@/utils/queries/notes", () => ({
  insertNote: vi.fn(),
}));
vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

import { addNote } from "@/app/claims/[claimId]/actions";
import { auth } from "@/auth";
import { insertNote } from "@/utils/queries/notes";
import { revalidatePath } from "next/cache";

describe("addNote", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("calls insertNote and revalidatePath on success", async () => {
    (auth as unknown as Mock).mockResolvedValue({
      user: { name: "John", email: "john@example.com", image: null },
      expires: "2026-01-01T00:00:00.000Z",
    });

    (insertNote as unknown as Mock).mockResolvedValue({
      data: [
        {
          id: "1",
          claim_id: "claim-1",
          content: "Test note",
          created_at: new Date().toISOString(),
          user_name: "John",
          origin: "app",
          ready_for_display: true,
        },
      ],
      error: null,
    });

    (revalidatePath as unknown as Mock).mockImplementation(() => {});

    const result = await addNote("claim-1", "Test note", "app");

    expect(insertNote).toHaveBeenCalledWith({
      claim_id: "claim-1",
      content: "Test note",
      user_name: "John",
      origin: "app",
      ready_for_display: true,
    });

    expect(revalidatePath).toHaveBeenCalledWith("/claims/claim-1");

    expect(result).toMatchObject({
      id: "1",
      claim_id: "claim-1",
      content: "Test note",
      user_name: "John",
      origin: "app",
    });
  });

  it("throws an error if auth returns no user name", async () => {
    (auth as unknown as Mock).mockResolvedValue({ user: { name: "" } });

    await expect(addNote("claim-1", "Test note", "app")).rejects.toThrow(
      "User name is missing"
    );
  });

  it("throws an error if insertNote fails", async () => {
    (auth as unknown as Mock).mockResolvedValue({
      user: { name: "John" },
    });
    (insertNote as unknown as Mock).mockResolvedValue({
      data: null,
      error: "DB error",
    });

    await expect(addNote("claim-1", "Test note", "app")).rejects.toThrow(
      "Failed to add note"
    );
  });
});
