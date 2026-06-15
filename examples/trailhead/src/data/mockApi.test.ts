import { afterEach, describe, expect, it, vi } from "vitest";
import {
  MockApiError,
  TOTAL_EXPERIENCES,
  configureMockApi,
  getExperience,
  getPerson,
  listBookings,
  listExperiences,
  listMessages,
  listPeople,
  listSessions,
  sendMessage,
} from "./mockApi";

afterEach(() => {
  configureMockApi({ delayMs: 0, fail: false });
  vi.useRealTimers();
});

describe("mockApi", () => {
  it("pages experiences with a cursor and ends with a null cursor", async () => {
    configureMockApi({ delayMs: 0 });
    const first = await listExperiences("en");
    expect(first.items.length).toBeGreaterThan(0);
    expect(first.nextCursor).toBe(first.items.length);

    // Walk to the end; the last page reports nextCursor === null.
    let cursor: number | null = 0;
    let count = 0;
    let guard = 0;
    while (cursor !== null && guard++ < 20) {
      const page = await listExperiences("en", cursor);
      count += page.items.length;
      cursor = page.nextCursor;
    }
    expect(count).toBe(TOTAL_EXPERIENCES);
  });

  it("returns localized text per language but shares structural fields", async () => {
    configureMockApi({ delayMs: 0 });
    const en = await getExperience("en", "sunrise-ridge");
    const ru = await getExperience("ru", "sunrise-ridge");
    expect(en.title).toBe("Sunrise Ridge");
    expect(ru.title).toBe("Рассветный хребет");
    expect(en.priceStars).toBe(ru.priceStars); // structural fields shared
    expect(en.route[0].label).not.toBe(ru.route[0].label);
  });

  it("honors the artificial delay", async () => {
    vi.useFakeTimers();
    configureMockApi({ delayMs: 800, fail: false });
    let resolved = false;
    const promise = listSessions("en").then((v) => {
      resolved = true;
      return v;
    });
    // Not yet — the delay has not elapsed.
    await vi.advanceTimersByTimeAsync(500);
    expect(resolved).toBe(false);
    await vi.advanceTimersByTimeAsync(400);
    await promise;
    expect(resolved).toBe(true);
  });

  it("throws a MockApiError for every endpoint when the failure flag is set", async () => {
    configureMockApi({ delayMs: 0, fail: true });
    await expect(listExperiences("en")).rejects.toBeInstanceOf(MockApiError);
    await expect(getExperience("en", "sunrise-ridge")).rejects.toBeInstanceOf(MockApiError);
    await expect(listBookings()).rejects.toBeInstanceOf(MockApiError);
    await expect(listSessions("en")).rejects.toBeInstanceOf(MockApiError);
    await expect(listPeople("en")).rejects.toBeInstanceOf(MockApiError);
    await expect(getPerson("en", "g-sora")).rejects.toBeInstanceOf(MockApiError);
    await expect(listMessages("en", "g-sora")).rejects.toBeInstanceOf(MockApiError);
    await expect(sendMessage("g-sora", "hi")).rejects.toBeInstanceOf(MockApiError);
  });

  it("getExperience rejects an unknown id", async () => {
    configureMockApi({ delayMs: 0, fail: false });
    await expect(getExperience("en", "does-not-exist")).rejects.toBeInstanceOf(MockApiError);
  });

  it("returns deep copies so callers cannot mutate the seed data", async () => {
    configureMockApi({ delayMs: 0 });
    const a = await listSessions("en");
    a[0].title = "MUTATED";
    const b = await listSessions("en");
    expect(b[0].title).not.toBe("MUTATED");
  });

  it("sendMessage echoes the text as a 'sent' message from me", async () => {
    configureMockApi({ delayMs: 0 });
    const msg = await sendMessage("g-sora", "See you at 7");
    expect(msg).toMatchObject({ threadId: "g-sora", authorId: "me", text: "See you at 7", status: "sent" });
  });
});
