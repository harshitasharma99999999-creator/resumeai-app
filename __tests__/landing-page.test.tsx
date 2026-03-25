/**
 * Unit tests for the LandingPage component (app/page.tsx)
 */

import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import LandingPage from "../app/page";

// Mock fetch globally
const mockFetch = jest.fn();
global.fetch = mockFetch as unknown as typeof fetch;

// Suppress jsdom navigation errors (window.location.href assignment)
const originalConsoleError = console.error;
beforeAll(() => {
  console.error = (...args: unknown[]) => {
    if (typeof args[0] === "string" && args[0].includes("Not implemented")) return;
    originalConsoleError(...args);
  };
});
afterAll(() => {
  console.error = originalConsoleError;
});

describe("LandingPage", () => {
  beforeEach(() => {
    mockFetch.mockReset();
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

    test("renders all three feature card headings", () => {
      render(<LandingPage />);
      const headings = screen.getAllByRole("heading", { level: 3 });
      const headingTexts = headings.map((h) => h.textContent);
      expect(headingTexts).toContain("ATS Resume Optimizer");
      expect(headingTexts).toContain("LinkedIn Summary Generator");
      expect(headingTexts).toContain("Cover Letter Generator");
    });

    test("renders email input field with correct placeholder", () => {
      render(<LandingPage />);
      expect(screen.getByPlaceholderText("your@email.com")).toBeInTheDocument();
    });

    test("renders CTA button", () => {
      render(<LandingPage />);
      expect(screen.getByRole("button")).toBeInTheDocument();
    });

    test("renders CTA button text mentioning $9", () => {
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

    test("renders checklist with key features", () => {
      render(<LandingPage />);
      const items = screen.getAllByRole("listitem");
      const texts = items.map((li) => li.textContent ?? "");
      expect(texts.some((t) => t.includes("ATS Resume Optimizer"))).toBe(true);
      expect(texts.some((t) => t.includes("Copy to clipboard"))).toBe(true);
      expect(texts.some((t) => t.includes("No subscription"))).toBe(true);
    });

    test("CTA button is enabled initially", () => {
      render(<LandingPage />);
      expect(screen.getByRole("button")).not.toBeDisabled();
    });

    test("does not show error message initially", () => {
      render(<LandingPage />);
      expect(screen.queryByText(/Something went wrong/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/Network error/i)).not.toBeInTheDocument();
    });
  });

  describe("Email input behavior", () => {
    test("updates email value as user types", async () => {
      const user = userEvent.setup();
      render(<LandingPage />);

      const input = screen.getByPlaceholderText("your@email.com");
      await user.type(input, "test@example.com");

      expect(input).toHaveValue("test@example.com");
    });

    test("email input has required attribute", () => {
      render(<LandingPage />);
      expect(screen.getByPlaceholderText("your@email.com")).toBeRequired();
    });

    test("email input has type=email", () => {
      render(<LandingPage />);
      expect(screen.getByPlaceholderText("your@email.com")).toHaveAttribute("type", "email");
    });

    test("input is wrapped in a form element", () => {
      render(<LandingPage />);
      const input = screen.getByPlaceholderText("your@email.com");
      expect(input.closest("form")).toBeInTheDocument();
    });
  });

  describe("Checkout flow - success path", () => {
    test("calls /api/checkout with POST method and email", async () => {
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

    test("shows loading/redirecting state while awaiting API", async () => {
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

      expect(screen.getByRole("button").textContent).toMatch(/Redirecting/i);

      // Resolve to clean up
      resolvePromise({
        ok: true,
        json: async () => ({ url: "https://checkout.example.com" }),
      });
    });

    test("does not show error when API returns a URL", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ url: "https://pay.dodo.io/session/abc" }),
      });

      const user = userEvent.setup();
      render(<LandingPage />);

      await user.type(screen.getByPlaceholderText("your@email.com"), "buyer@test.com");
      await user.click(screen.getByRole("button"));

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalled();
      });

      expect(screen.queryByText(/Something went wrong/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/Network error/i)).not.toBeInTheDocument();
    });
  });

  describe("Checkout flow - error handling", () => {
    test("shows error message when API response contains no URL", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ error: "some error" }),
      });

      const user = userEvent.setup();
      render(<LandingPage />);

      await user.type(screen.getByPlaceholderText("your@email.com"), "bad@test.com");
      await user.click(screen.getByRole("button"));

      await waitFor(() => {
        expect(screen.getByText(/Something went wrong/i)).toBeInTheDocument();
      });
    });

    test("shows network error message when fetch throws", async () => {
      mockFetch.mockRejectedValueOnce(new Error("Network failure"));

      const user = userEvent.setup();
      render(<LandingPage />);

      await user.type(screen.getByPlaceholderText("your@email.com"), "netfail@test.com");
      await user.click(screen.getByRole("button"));

      await waitFor(() => {
        expect(screen.getByText(/Network error/i)).toBeInTheDocument();
      });
    });

    test("re-enables button after network error", async () => {
      mockFetch.mockRejectedValueOnce(new Error("Network failure"));

      const user = userEvent.setup();
      render(<LandingPage />);

      await user.type(screen.getByPlaceholderText("your@email.com"), "netfail@test.com");
      await user.click(screen.getByRole("button"));

      await waitFor(() => {
        expect(screen.getByRole("button")).not.toBeDisabled();
      });
    });

    test("re-enables button after API returns no URL", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ error: "something" }),
      });

      const user = userEvent.setup();
      render(<LandingPage />);

      await user.type(screen.getByPlaceholderText("your@email.com"), "bad@test.com");
      await user.click(screen.getByRole("button"));

      await waitFor(() => {
        expect(screen.getByRole("button")).not.toBeDisabled();
      });
    });

    test("clears previous error message on new submission attempt", async () => {
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

      // Second call is in-flight - error should clear
      let resolveSecond!: (v: unknown) => void;
      mockFetch.mockReturnValueOnce(new Promise((r) => { resolveSecond = r; }));

      await user.click(screen.getByRole("button"));

      // Error should be cleared while loading
      await waitFor(() => {
        expect(screen.queryByText(/Something went wrong/i)).not.toBeInTheDocument();
      });

      // Clean up
      resolveSecond({ ok: true, json: async () => ({ url: "https://example.com" }) });
    });
  });
});
