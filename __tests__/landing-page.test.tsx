/**
 * Unit tests for the LandingPage component (app/page.tsx)
 */

import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import LandingPage from "../app/page";

// Mock fetch globally
const mockFetch = jest.fn();
global.fetch = mockFetch;

// Mock window.location.href via delete + redefine
delete (window as unknown as Record<string, unknown>).location;
(window as unknown as Record<string, unknown>).location = { href: "" };

// Mock window.alert
global.alert = jest.fn();

describe("LandingPage", () => {
  beforeEach(() => {
    mockFetch.mockReset();
    (global.alert as jest.Mock).mockReset();
    window.location.href = "";
  });

  describe("Rendering", () => {
    test("renders hero heading", () => {
      render(<LandingPage />);
      expect(screen.getByText(/Get More Interviews/i)).toBeInTheDocument();
    });

    test("renders price display", () => {
      render(<LandingPage />);
      expect(screen.getByText("$9")).toBeInTheDocument();
    });

    test("renders all three feature items", () => {
      render(<LandingPage />);
      expect(screen.getByText("ATS Resume Optimizer")).toBeInTheDocument();
      expect(screen.getByText("LinkedIn Summary Generator")).toBeInTheDocument();
      expect(screen.getByText("Cover Letter Generator")).toBeInTheDocument();
    });

    test("renders email input field", () => {
      render(<LandingPage />);
      expect(screen.getByPlaceholderText("Enter your email")).toBeInTheDocument();
    });

    test("renders CTA button with correct text", () => {
      render(<LandingPage />);
      expect(screen.getByRole("button", { name: /Get Access for \$9/i })).toBeInTheDocument();
    });

    test("renders 'Secure payment via Dodo Payments' note", () => {
      render(<LandingPage />);
      expect(screen.getByText(/Secure payment via Dodo Payments/i)).toBeInTheDocument();
    });

    test("renders footer", () => {
      render(<LandingPage />);
      expect(screen.getByText(/ResumeAI © 2024/i)).toBeInTheDocument();
    });

    test("renders social proof stats", () => {
      render(<LandingPage />);
      expect(screen.getByText("2,400+")).toBeInTheDocument();
      expect(screen.getByText("3x")).toBeInTheDocument();
    });

    test("renders feature checklist items", () => {
      render(<LandingPage />);
      expect(screen.getByText(/ATS Resume Optimizer/)).toBeInTheDocument();
      expect(screen.getByText(/Unlimited uses/i)).toBeInTheDocument();
      expect(screen.getByText(/Copy-to-clipboard/i)).toBeInTheDocument();
    });
  });

  describe("Email input behavior", () => {
    test("updates email state on input", async () => {
      const user = userEvent.setup();
      render(<LandingPage />);

      const input = screen.getByPlaceholderText("Enter your email");
      await user.type(input, "test@example.com");

      expect(input).toHaveValue("test@example.com");
    });

    test("triggers checkout on Enter key press", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ url: "https://checkout.example.com" }),
      });

      const user = userEvent.setup();
      render(<LandingPage />);

      const input = screen.getByPlaceholderText("Enter your email");
      await user.type(input, "enter@example.com{Enter}");

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith("/api/checkout", expect.any(Object));
      });
    });
  });

  describe("Checkout flow - success", () => {
    test("calls /api/checkout with email on button click", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ url: "https://checkout.example.com" }),
      });

      const user = userEvent.setup();
      render(<LandingPage />);

      await user.type(screen.getByPlaceholderText("Enter your email"), "buyer@test.com");
      await user.click(screen.getByRole("button", { name: /Get Access/i }));

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

      await user.type(screen.getByPlaceholderText("Enter your email"), "buyer@test.com");
      await user.click(screen.getByRole("button", { name: /Get Access/i }));

      await waitFor(() => {
        expect(window.location.href).toBe("https://pay.dodo.io/session/abc");
      });
    });

    test("shows loading state while processing", async () => {
      let resolvePromise: (value: unknown) => void;
      const pendingPromise = new Promise((resolve) => {
        resolvePromise = resolve;
      });
      mockFetch.mockReturnValueOnce(pendingPromise);

      const user = userEvent.setup();
      render(<LandingPage />);

      await user.type(screen.getByPlaceholderText("Enter your email"), "buyer@test.com");
      await user.click(screen.getByRole("button", { name: /Get Access/i }));

      expect(screen.getByRole("button", { name: /Processing.../i })).toBeInTheDocument();
      expect(screen.getByRole("button")).toBeDisabled();

      // Resolve to clean up
      resolvePromise!({
        ok: true,
        json: async () => ({ url: "https://checkout.example.com" }),
      });
    });
  });

  describe("Checkout flow - validation", () => {
    test("shows alert when email is empty", async () => {
      const user = userEvent.setup();
      render(<LandingPage />);

      await user.click(screen.getByRole("button", { name: /Get Access/i }));

      expect(global.alert).toHaveBeenCalledWith("Please enter your email address");
      expect(mockFetch).not.toHaveBeenCalled();
    });

    test("does not call fetch when email is empty", async () => {
      const user = userEvent.setup();
      render(<LandingPage />);

      await user.click(screen.getByRole("button", { name: /Get Access/i }));

      expect(mockFetch).not.toHaveBeenCalled();
    });
  });

  describe("Checkout flow - error handling", () => {
    test("shows alert when API returns no URL", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ error: "something" }),
      });

      const user = userEvent.setup();
      render(<LandingPage />);

      await user.type(screen.getByPlaceholderText("Enter your email"), "bad@test.com");
      await user.click(screen.getByRole("button", { name: /Get Access/i }));

      await waitFor(() => {
        expect(global.alert).toHaveBeenCalledWith("Something went wrong. Please try again.");
      });
    });

    test("shows alert when fetch throws a network error", async () => {
      mockFetch.mockRejectedValueOnce(new Error("Network failure"));

      const user = userEvent.setup();
      render(<LandingPage />);

      await user.type(screen.getByPlaceholderText("Enter your email"), "netfail@test.com");
      await user.click(screen.getByRole("button", { name: /Get Access/i }));

      await waitFor(() => {
        expect(global.alert).toHaveBeenCalledWith("Something went wrong. Please try again.");
      });
    });

    test("re-enables button after error", async () => {
      mockFetch.mockRejectedValueOnce(new Error("Network failure"));

      const user = userEvent.setup();
      render(<LandingPage />);

      await user.type(screen.getByPlaceholderText("Enter your email"), "netfail@test.com");
      await user.click(screen.getByRole("button", { name: /Get Access/i }));

      await waitFor(() => {
        expect(screen.getByRole("button")).not.toBeDisabled();
      });
    });
  });
});
