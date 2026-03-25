/**
 * Integration tests for /api/checkout route
 * @jest-environment node
 */

// Mock fetch globally before any imports
const mockFetch = jest.fn();
global.fetch = mockFetch as unknown as typeof fetch;

// Suppress console.error in tests
jest.spyOn(console, "error").mockImplementation(() => {});

// Helper: create a minimal mock Request-like object
function makeRequest(body: unknown) {
  return {
    json: async () => body,
  };
}

describe("POST /api/checkout", () => {
  beforeEach(() => {
    jest.resetModules();
    mockFetch.mockReset();
    process.env.DODO_PAYMENTS_API_KEY = "test-api-key";
    process.env.NEXT_PUBLIC_URL = "http://localhost:3000";
  });

  const getHandler = async () => {
    const mod = await import("../app/api/checkout/route");
    return mod.POST;
  };

  describe("Successful API calls", () => {
    test("returns url from Dodo payment_links response (url field)", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ url: "https://pay.dodo.io/link/abc123" }),
      });

      const POST = await getHandler();
      const res = await POST(makeRequest({ email: "test@example.com" }) as never);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.url).toBe("https://pay.dodo.io/link/abc123");
    });

    test("returns url from Dodo payment_links response (payment_link field)", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ payment_link: "https://pay.dodo.io/link/xyz" }),
      });

      const POST = await getHandler();
      const res = await POST(makeRequest({ email: "user@domain.com" }) as never);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.url).toBe("https://pay.dodo.io/link/xyz");
    });

    test("falls back to demo URL when Dodo returns neither url nor payment_link", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ some_other_field: "value" }),
      });

      const POST = await getHandler();
      const res = await POST(makeRequest({ email: "fallback@test.com" }) as never);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.url).toContain("success?demo=true");
    });
  });

  describe("Fallback behavior (graceful degradation)", () => {
    test("returns demo URL when Dodo API responds with non-2xx status", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        text: async () => "Unauthorized",
      });

      const POST = await getHandler();
      const res = await POST(makeRequest({ email: "error@test.com" }) as never);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.url).toContain("success?demo=true");
    });

    test("returns demo URL when fetch throws a network error", async () => {
      mockFetch.mockRejectedValueOnce(new Error("Network error"));

      const POST = await getHandler();
      const res = await POST(makeRequest({ email: "crash@test.com" }) as never);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.url).toContain("success?demo=true");
    });

    test("returns demo URL when request body cannot be parsed", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ url: "https://pay.dodo.io/link/noemail" }),
      });

      const POST = await getHandler();
      // Pass a request where json() throws
      const badReq = { json: async () => { throw new Error("parse error"); } };
      const res = await POST(badReq as never);
      const data = await res.json();

      // Should still work - defaults to 'customer@example.com'
      expect(res.status).toBe(200);
      expect(data.url).toBeDefined();
    });
  });

  describe("API call correctness", () => {
    test("calls Dodo payment_links endpoint (not /payments)", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ url: "https://checkout.dodo.io/pay" }),
      });

      const POST = await getHandler();
      await POST(makeRequest({ email: "jane@example.com" }) as never);

      expect(mockFetch).toHaveBeenCalledWith(
        "https://api.dodopayments.com/payment_links",
        expect.any(Object)
      );
    });

    test("sends Authorization header with API key", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ url: "https://checkout.dodo.io/pay" }),
      });

      const POST = await getHandler();
      await POST(makeRequest({ email: "jane@example.com" }) as never);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: "Bearer test-api-key",
          }),
        })
      );
    });

    test("sends POST method to Dodo API", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ url: "https://checkout.dodo.io/pay" }),
      });

      const POST = await getHandler();
      await POST(makeRequest({ email: "jane@example.com" }) as never);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ method: "POST" })
      );
    });

    test("sends amount of 900 cents ($9) to Dodo API", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ url: "https://checkout.dodo.io/pay" }),
      });

      const POST = await getHandler();
      await POST(makeRequest({ email: "jane@example.com" }) as never);

      const callBody = JSON.parse((mockFetch.mock.calls[0][1] as { body: string }).body);
      expect(callBody.amount).toBe(900);
      expect(callBody.currency).toBe("usd");
    });

    test("sends customer_email from request body", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ url: "https://checkout.dodo.io/pay" }),
      });

      const POST = await getHandler();
      await POST(makeRequest({ email: "customer@test.com" }) as never);

      const callBody = JSON.parse((mockFetch.mock.calls[0][1] as { body: string }).body);
      expect(callBody.customer_email).toBe("customer@test.com");
    });

    test("defaults customer_email to customer@example.com when email not provided", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ url: "https://checkout.dodo.io/pay" }),
      });

      const POST = await getHandler();
      await POST(makeRequest({}) as never);

      const callBody = JSON.parse((mockFetch.mock.calls[0][1] as { body: string }).body);
      expect(callBody.customer_email).toBe("customer@example.com");
    });

    test("sends redirect_url using NEXT_PUBLIC_URL env var", async () => {
      process.env.NEXT_PUBLIC_URL = "https://resumeai.app";
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ url: "https://checkout.dodo.io/pay" }),
      });

      const POST = await getHandler();
      await POST(makeRequest({ email: "prod@test.com" }) as never);

      const callBody = JSON.parse((mockFetch.mock.calls[0][1] as { body: string }).body);
      expect(callBody.redirect_url).toBe("https://resumeai.app/success");
    });

    test("sends redirect_url using localhost fallback when NEXT_PUBLIC_URL not set", async () => {
      delete process.env.NEXT_PUBLIC_URL;
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ url: "https://checkout.dodo.io/pay" }),
      });

      const POST = await getHandler();
      await POST(makeRequest({ email: "local@test.com" }) as never);

      const callBody = JSON.parse((mockFetch.mock.calls[0][1] as { body: string }).body);
      expect(callBody.redirect_url).toBe("http://localhost:3000/success");
    });

    test("always responds with status 200 (graceful degradation pattern)", async () => {
      // Test all error paths still return 200
      mockFetch.mockRejectedValueOnce(new Error("Network down"));

      const POST = await getHandler();
      const res = await POST(makeRequest({ email: "any@test.com" }) as never);

      expect(res.status).toBe(200);
    });

    test("response always contains a url property", async () => {
      mockFetch.mockRejectedValueOnce(new Error("Network down"));

      const POST = await getHandler();
      const res = await POST(makeRequest({ email: "any@test.com" }) as never);
      const data = await res.json();

      expect(data).toHaveProperty("url");
      expect(typeof data.url).toBe("string");
    });
  });
});
