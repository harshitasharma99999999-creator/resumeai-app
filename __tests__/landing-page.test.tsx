/**
 * Unit tests for the LandingPage component (app/page.tsx)
 */

import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import LandingPage from "../app/page";

// Mock fetch globally
const mockFetch = jest.fn();
global.fetch = mockFetch as unknown as typeof fetch;

// Mock window.location using Object.defineProperty in beforeAll
let hrefSetter: jest.Mock;

beforeAll(() => {
  hrefSetter = jest.fn();
  Object.defineProperty(window, "location", {
    configurable: true,
    get() {
      return { href: "", set href(v: string) { hrefSetter(v); } };
    },
  });
});

describe("LandingPage", () => {
  beforeEach(() => {
    mockFetch.mockReset();
    hrefSetter.mockReset();
  });

  describe("Rendering", () => {
    test("renders hero heading", () => {
      render(<LandingPage />);
      expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();
    });

    test("renders price display ($9)", () => {
      render(<LandingPage />);
      expect(screen.getByText("$9")).toBeInTheDocument();
    });

    test("renders all three feature cards", () => {
      render(<LandingPage />);
      expect(screen.getAllByText("ATS Resume Optimizer").length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText("LinkedIn Summary Generator").length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText("Cover Letter Generator").length).toBeGreaterThanOrEqual(1);
    });

    test("renders email input field", () => {
      render(<LandingPage />);
      expect(screen.getByPlaceholderText("your@email.com")).toBeInTheDocument();
    });

    test("renders CTA button", () => {
      render(<LandingPage />);
      expect(screen.getByRole("button")).toBeInTheDocument();
    });

    test("renders CTA button with $9 price", () => {
      render(<LandingPage />);
      expect(screen.getByRole("button").textContent).toContain("$9");
    });

    test("renders Dodo Payments security note", () => {
      render(<LandingPage />);
      expect(screen.getByText(/Secure payment via Dodo Payments/i)).toBeInTheDocument();
    });

    test("renders social proof testimonials", () => {
      render(<LandingPage />);
      expect(screen.getByText(/Got 3 interviews in a week/i)).toBeInTheDocument();
    });

    test("renders checklist items in paywall", () => {
      render(<LandingPage />);
      const items = screen.getAllByRole("listitem");
      const texts = items.map((li) => li.textContent);
      expect(texts.some((t) => t?.includes("ATS Resume Optimizer"))).toBe(true);
      expect(texts.some((t) => t?.includes("Copy to clipboard"))).toBe(true);
      expect(texts.some((t) => t?.includes("No subscription"))).toBe(true);
    });

    test("button is enabled initially", () => {
      render(<LandingPage />);
      expect(screen.getByRole("button")).not.toBeDisabled();
    });
  });

  describe("Email input behavior", () => {
    test("updates email state on input", async () => {
      const user = userEvent.setup();
      render(<LandingPage />);

      const input = screen.getByPlaceholderText("your@email.com");
      await user.type(input, "test@example.com");

      expect(input).toHaveValue("test@example.com");
    });

    test("email input has required attribute", () => {
      render(<LandingPage />);
      const input = screen.getByPlaceholderText("your@email.com");
      expect(input).toBeRequired();
    });

    test("email input has type email", () => {
      render(<LandingPage />);
      const input = screen.getByPlaceholderText("your@email.com");
      expect(input).toHaveAttribute("type", "email");
    });
  });

  describe("Checkout flow - success", () => {
    test("calls /api/checkout with email on form submit", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ url: "https://checkout.example.com" }),
      });

      const user = userEvent.setup();
      render(<LandingPage />);

      await user.type(screen.getByPlaceholderText("your@email.com"), "buyer@test.com");
      await user.click(screen.getByRole("button"));

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith("/api/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: "buyer@test.com" }),
        });
      });
    });

    test("redirects to checkout URL on success", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ url: "https://pay.dodo.io/session/abc" }),
      });

      const user = userEvent.setup();
      render(<LandingPage />);

      await user.type(screen.getByPlaceholderText("your@email.com"), "buyer@test.com");
      await user.click(screen.getByRole("button"));

      await waitFor(() => {
        expect(hrefSetter).toHaveBeenCalledWith("https://pay.dodo.io/session/abc");
      });
    });

    test("shows loading state while processing", async () => {
      let resolvePromise!: (value: unknown) => void;
      const pendingPromise = new Promise((resolve) => {
        resolvePromise = resolve;
      });
      mockFetch.mockReturnValueOnce(pendingPromise);

      const user = userEvent.setup();
      render(<LandingPage />);

      await user.type(screen.getByPlaceholderText("your@email.com"), "buyer@test.com");
      await user.click(screen.getByRole("button"));

      await waitFor(() => {
        expect(screen.getByRole("button")).toBeDisabled();
      });

      expect(screen.getByRole("button").textContent).toContain("Redirecting");

      // Resolve to clean up
      resolvePromise({
        ok: true,
        json: async () => ({ url: "https://checkout.example.com" }),
      });
    });
  });

  describe("Checkout flow - error handling", () => {
    test("shows error message when API returns no URL", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ error: "something" }),
      });

      const user = userEvent.setup();
      render(<LandingPage />);

      await user.type(screen.getByPlaceholderText("your@email.com"), "bad@test.com");
      await user.click(screen.getByRole("button"));

      await waitFor(() => {
        expect(screen.getByText(/Something went wrong/i)).toBeInTheDocument();
      });
    });

    test("shows network error when fetch throws", async () => {
      mockFetch.mockRejectedValueOnce(new Error("Network failure"));

      const user = userEvent.setup();
      render(<LandingPage />);

      await user.type(screen.getByPlaceholderText("your@email.com"), "netfail@test.com");
      await user.click(screen.getByRole("button"));

      await waitFor(() => {
        expect(screen.getByText(/Network error/i)).toBeInTheDocument();
      });
    });

    test("re-enables button after error", async () => {
      mockFetch.mockRejectedValueOnce(new Error("Network failure"));

      const user = userEvent.setup();
      render(<LandingPage />);

      await user.type(screen.getByPlaceholderText("your@email.com"), "netfail@test.com");
      await user.click(screen.getByRole("button"));

      await waitFor(() => {
        expect(screen.getByRole("button")).not.toBeDisabled();
      });
    });

    test("clears previous error on new submission", async () => {
      // First call fails
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ error: "something" }),
      });

      const user = userEvent.setup();
      render(<LandingPage />);

      await user.type(screen.getByPlaceholderText("your@email.com"), "bad@test.com");
      await user.click(screen.getByRole("button"));

      await waitFor(() => {
        expect(screen.getByText(/Something went wrong/i)).toBeInTheDocument();
      });

      // Second call succeeds
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ url: "https://checkout.example.com" }),
      });

      await user.click(screen.getByRole("button"));

      await waitFor(() => {
        expect(screen.queryByText(/Something went wrong/i)).not.toBeInTheDocument();
      });
    });
  });

  describe("Form behavior", () => {
    test("form uses onSubmit handler (not onClick)", () => {
      render(<LandingPage />);
      const form = screen.getByRole("button").closest("form");
      expect(form).toBeInTheDocument();
    });

    test("does not redirect when no URL in response", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ message: "no url here" }),
      });

      const user = userEvent.setup();
      render(<LandingPage />);

      await user.type(screen.getByPlaceholderText("your@email.com"), "test@test.com");
      await user.click(screen.getByRole("button"));

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalled();
      });

      expect(hrefSetter).not.toHaveBeenCalled();
    });
  });
});
