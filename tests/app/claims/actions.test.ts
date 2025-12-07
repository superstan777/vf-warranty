import { describe, it, expect, vi, beforeEach, Mock } from "vitest";

// Mocky
vi.mock("@/auth", () => ({
  auth: vi.fn(),
}));
vi.mock("@/utils/queries/claims", () => ({
  insertClaim: vi.fn(),
}));
vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

// Import testowanej funkcji i mockowanych modułów
import { createClaim } from "@/app/claims/actions";
import { auth } from "@/auth";
import { insertClaim } from "@/utils/queries/claims";
import { revalidatePath } from "next/cache";

describe("createClaim", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("calls insertClaim and revalidatePath on success", async () => {
    // Mock auth
    (auth as unknown as Mock).mockResolvedValue({
      user: { name: "Alice", email: "alice@example.com", image: null },
      expires: "2026-01-01T00:00:00.000Z",
    });

    // Mock insertClaim
    (insertClaim as unknown as Mock).mockResolvedValue({
      data: [
        {
          id: "claim-1",
          title: "Test title",
          description: "Test description",
          created_by: "Alice",
        },
      ],
      error: null,
    });

    // Mock revalidatePath
    (revalidatePath as unknown as Mock).mockImplementation(() => {});

    const result = await createClaim("Test title", "Test description");

    expect(insertClaim).toHaveBeenCalledWith({
      title: "Test title",
      description: "Test description",
      created_by: "Alice",
    });

    expect(revalidatePath).toHaveBeenCalledWith("/claims");

    expect(result).toMatchObject({
      id: "claim-1",
      title: "Test title",
      description: "Test description",
      created_by: "Alice",
    });
  });

  it("throws an error if auth returns no user name", async () => {
    (auth as unknown as Mock).mockResolvedValue({ user: { name: "" } });

    await expect(createClaim("Test title", "Test description")).rejects.toThrow(
      "User name is missing"
    );
  });

  it("throws an error if insertClaim fails", async () => {
    (auth as unknown as Mock).mockResolvedValue({
      user: { name: "Alice" },
    });

    (insertClaim as unknown as Mock).mockResolvedValue({
      data: null,
      error: "DB error",
    });

    await expect(createClaim("Test title", "Test description")).rejects.toThrow(
      "Failed to create claim"
    );
  });
});
