import { render, screen } from "@testing-library/react";
import SystemMessageBubble from "@/components/SystemMessageBubble";
import { vi } from "vitest";

// mock util
vi.mock("@/utils/utils", () => ({
  formatDateToLocal24h: vi.fn(() => "12:34"),
}));

describe("SystemMessageBubble", () => {
  test("renders text", () => {
    render(
      <SystemMessageBubble text="Hello" createdAt="2025-01-01T12:34:00" />
    );
    expect(screen.getByText("Hello")).toBeInTheDocument();
  });

  test("renders with justify-start when isRight=false", () => {
    const { container } = render(
      <SystemMessageBubble text="Test" createdAt="2025-01-01" isRight={false} />
    );

    expect(container.firstChild).toHaveClass("justify-start");
  });

  test("renders with justify-end when isRight=true", () => {
    const { container } = render(
      <SystemMessageBubble text="Test" createdAt="2025-01-01" isRight={true} />
    );

    expect(container.firstChild).toHaveClass("justify-end");
  });

  test("renders formatted date", () => {
    render(<SystemMessageBubble text="Test" createdAt="2025-01-01T12:34:00" />);

    expect(screen.getByText("12:34")).toBeInTheDocument();
  });

  test("does not render date when createdAt is empty", () => {
    render(<SystemMessageBubble text="Test" createdAt="" />);

    // date is inside a <span>, so we search by role or text match failure
    const date = screen.queryByText("12:34");
    expect(date).toBeNull();
  });
});
