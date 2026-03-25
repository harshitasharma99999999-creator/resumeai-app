/**
 * Integration tests for /api/checkout route
 * @jest-environment node
 */

// Mock fetch globally before any imports
const mockFetch = jest.fn();
global.fetch = mockFetch as unknown as typeof fetch;

// Mock console to suppress logs in tests
jest.spyOn(console, "error").mockImplementation(() => {});

// Helper: create a minimal mock NextRequest-like object
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

  test("returns 400 when email is missing", async () => {
    const POST = await getHandler();
    const req = makeRequest({});
    const res = await POST(req as never);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toBe("Email required");
  });

  test("returns 400 when email is empty string", async () => {
    const POST = await getHandler();
    const req = makeRequest({ email: "" });
    const res = await POST(req as never);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toBe("Email required");
  });

  test("returns checkout URL when Dodo Payments succeeds with payment_link", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ payment_link: "https://pay.dodo.io/session/abc123" }),
    });

    const POST = await getHandler();
    const req = makeRequest({ email: "test@example.com" });
    const res = await POST(req as never);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.url).toBe("https://pay.dodo.io/session/abc123");
  });

  test("returns checkout URL when Dodo Payments succeeds with url field", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ url: "https://pay.dodo.io/session/xyz" }),
    });

    const POST = await getHandler();
    const req = makeRequest({ email: "user@domain.com" });
    const res = await POST(req as never);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.url).toBe("https://pay.dodo.io/session/xyz");
  });

  test("falls back to app URL when Dodo Payments returns no checkout URL", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ some_other_field: "value" }),
    });

    const POST = await getHandler();
    const req = makeRequest({ email: "fallback@test.com" });
    const res = await POST(req as never);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.url).toContain("/app?email=fallback%40test.com&paid=true");
  });

  test("falls back to app URL when Dodo Payments API fails (non-2xx)", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: "Invalid API key" }),
    });

    const POST = await getHandler();
    const req = makeRequest({ email: "error@test.com" });
    const res = await POST(req as never);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.url).toContain("/app?email=error%40test.com&paid=true");
  });

  test("returns 500 when fetch throws an exception", async () => {
    mockFetch.mockRejectedValueOnce(new Error("Network error"));

    const POST = await getHandler();
    const req = makeRequest({ email: "crash@test.com" });
    const res = await POST(req as never);
    const data = await res.json();

    expect(res.status).toBe(500);
    expect(data.error).toBe("Internal server error");
  });

  test("calls Dodo Payments API with correct headers", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ payment_link: "https://checkout.dodo.io/pay" }),
    });

    const POST = await getHandler();
    const req = makeRequest({ email: "jane@example.com" });
    await POST(req as never);

    expect(mockFetch).toHaveBeenCalledWith(
      "https://api.dodopayments.com/payments",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          Authorization: "Bearer test-api-key",
          "Content-Type": "application/json",
        }),
      })
    );
  });

  test("sends customer email in Dodo Payments payload", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ payment_link: "https://checkout.dodo.io/pay" }),
    });

    const POST = await getHandler();
    const req = makeRequest({ email: "jane@example.com" });
    await POST(req as never);

    const callBody = JSON.parse((mockFetch.mock.calls[0][1] as { body: string }).body);
    expect(callBody.customer.email).toBe("jane@example.com");
    expect(callBody.payment_link).toBe(true);
  });

  test("encodes email in return_url", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ payment_link: "https://checkout.dodo.io/pay" }),
    });

    const POST = await getHandler();
    const req = makeRequest({ email: "test+tag@example.com" });
    await POST(req as never);

    const callBody = JSON.parse((mockFetch.mock.calls[0][1] as { body: string }).body);
    expect(callBody.return_url).toContain(encodeURIComponent("test+tag@example.com"));
  });

  test("uses NEXT_PUBLIC_URL env var for base URL", async () => {
    process.env.NEXT_PUBLIC_URL = "https://resumeai.app";
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ payment_link: "https://checkout.dodo.io/pay" }),
    });

    const POST = await getHandler();
    const req = makeRequest({ email: "prod@test.com" });
    await POST(req as never);

    const callBody = JSON.parse((mockFetch.mock.calls[0][1] as { body: string }).body);
    expect(callBody.return_url).toMatch(/^https:\/\/resumeai\.app\/success/);
  });
});
