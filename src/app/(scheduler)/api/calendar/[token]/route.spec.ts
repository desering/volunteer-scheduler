import { beforeEach, describe, expect, it, mock } from "bun:test";

const mockGetPayload = mock();
const mockConvertLexicalToPlaintext = mock();

mock.module("payload", () => ({ getPayload: mockGetPayload }));
mock.module("@payload-config", () => ({ default: {} }));
mock.module("@payloadcms/richtext-lexical/plaintext", () => ({
  convertLexicalToPlaintext: mockConvertLexicalToPlaintext,
}));

const { GET } = await import("./route");

const makeRequest = () =>
  new Request("http://localhost/api/calendar/test-token");
const makeParams = (token: string) => Promise.resolve({ token });

const makeSignup = (overrides = {}) => ({
  event: {
    id: 1,
    title: "Volunteer Shift",
    start_date: "2026-03-20T10:00:00Z",
    end_date: "2026-03-20T12:00:00Z",
    description: null,
    locations: [],
  },
  role: { title: "Cook" },
  ...overrides,
});

describe("GET /api/calendar/[token]", () => {
  const mockPayload = {
    find: mock(),
  };

  beforeEach(() => {
    mockGetPayload.mockClear();
    mockConvertLexicalToPlaintext.mockClear();
    mockPayload.find.mockClear();
    mockGetPayload.mockResolvedValue(mockPayload);
  });

  it("returns 404 for an unknown token", async () => {
    mockPayload.find.mockResolvedValueOnce({ totalDocs: 0, docs: [] });

    const response = await GET(makeRequest(), {
      params: makeParams("unknown"),
    });

    expect(response.status).toBe(404);
  });

  it("returns a valid iCal response with correct headers", async () => {
    mockPayload.find
      .mockResolvedValueOnce({ totalDocs: 1, docs: [{ user: 42 }] })
      .mockResolvedValueOnce({ docs: [makeSignup()] });

    const response = await GET(makeRequest(), {
      params: makeParams("valid-token"),
    });

    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toBe(
      "text/calendar; charset=utf-8",
    );
    const body = await response.text();
    expect(body).toContain("BEGIN:VCALENDAR");
    expect(body).toContain("END:VCALENDAR");
  });

  it("includes event title and role in the calendar output", async () => {
    mockPayload.find
      .mockResolvedValueOnce({ totalDocs: 1, docs: [{ user: 42 }] })
      .mockResolvedValueOnce({ docs: [makeSignup()] });

    const response = await GET(makeRequest(), {
      params: makeParams("valid-token"),
    });
    const body = await response.text();

    expect(body).toContain("SUMMARY:Volunteer Shift");
    expect(body).toContain("You're joining as: Cook");
  });

  it("includes event description when present", async () => {
    mockConvertLexicalToPlaintext.mockReturnValue("Bring your own apron");
    mockPayload.find
      .mockResolvedValueOnce({ totalDocs: 1, docs: [{ user: 42 }] })
      .mockResolvedValueOnce({
        docs: [
          makeSignup({
            event: {
              id: 1,
              title: "Shift",
              start_date: "2026-03-20T10:00:00Z",
              end_date: "2026-03-20T12:00:00Z",
              description: { root: {} },
              locations: [],
            },
          }),
        ],
      });

    const response = await GET(makeRequest(), {
      params: makeParams("valid-token"),
    });
    const body = await response.text();

    expect(body).toContain("Bring your own apron");
  });

  it("includes location from event when available", async () => {
    mockPayload.find
      .mockResolvedValueOnce({ totalDocs: 1, docs: [{ user: 42 }] })
      .mockResolvedValueOnce({
        docs: [
          makeSignup({
            event: {
              id: 1,
              title: "Shift",
              start_date: "2026-03-20T10:00:00Z",
              end_date: "2026-03-20T12:00:00Z",
              description: null,
              locations: [{ title: "Main Hall", address: "Kerkstraat 1" }],
            },
          }),
        ],
      });

    const response = await GET(makeRequest(), {
      params: makeParams("valid-token"),
    });
    const body = await response.text();

    expect(body).toContain("Main Hall\\, Kerkstraat 1");
  });

  it("returns an empty calendar when user has no signups", async () => {
    mockPayload.find
      .mockResolvedValueOnce({ totalDocs: 1, docs: [{ user: 42 }] })
      .mockResolvedValueOnce({ docs: [] });

    const response = await GET(makeRequest(), {
      params: makeParams("valid-token"),
    });
    const body = await response.text();

    expect(body).toContain("BEGIN:VCALENDAR");
    expect(body).not.toContain("BEGIN:VEVENT");
  });
});
