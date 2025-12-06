import { render, screen } from "@testing-library/react";
import StatusTag from "@/components/StatusTag";

describe("StatusTag", () => {
  it("renders formatted status text", () => {
    render(<StatusTag status="in_progress" />);
    expect(screen.getByText("in progress")).toBeInTheDocument();
  });

  it("applies correct style for each status", () => {
    const { rerender } = render(<StatusTag status="in_progress" />);
    const span = screen.getByText("in progress");

    expect(span.className).toContain("bg-yellow-100");

    rerender(<StatusTag status="resolved" />);
    expect(screen.getByText("resolved").className).toContain("bg-green-100");

    rerender(<StatusTag status="cancelled" />);
    expect(screen.getByText("cancelled").className).toContain("bg-blue-100");
  });
});
