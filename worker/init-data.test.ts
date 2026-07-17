import { createHmac } from "node:crypto";
import { describe, expect, it } from "vitest";
import { validateInitData } from "./init-data";

const BOT_TOKEN = "1234567:test-token";
const NOW = 1_800_000_000;

/** Builds an initData string signed exactly the way a Telegram client does. */
function signedInitData(fields: Record<string, string>): string {
  const dataCheckString = Object.entries(fields)
    .map(([key, value]) => `${key}=${value}`)
    .sort()
    .join("\n");
  const secret = createHmac("sha256", "WebAppData").update(BOT_TOKEN).digest();
  const hash = createHmac("sha256", secret).update(dataCheckString).digest("hex");
  const params = new URLSearchParams(fields);
  params.set("hash", hash);
  return params.toString();
}

const FIELDS = {
  auth_date: String(NOW - 60),
  query_id: "AAE1",
  user: '{"id":42,"first_name":"Maya"}',
};

describe("validateInitData", () => {
  it("accepts a correctly signed payload and extracts the user id", async () => {
    const result = await validateInitData(signedInitData(FIELDS), BOT_TOKEN, 86_400, NOW);
    expect(result).toEqual({ ok: true, userId: 42 });
  });

  it("rejects a tampered payload", async () => {
    const tampered = signedInitData(FIELDS).replace("Maya", "Eve");
    expect((await validateInitData(tampered, BOT_TOKEN, 86_400, NOW)).reason).toBe("bad-hash");
  });

  it("rejects a payload signed for another bot", async () => {
    const result = await validateInitData(signedInitData(FIELDS), "other:token", 86_400, NOW);
    expect(result).toEqual({ ok: false, reason: "bad-hash" });
  });

  it("rejects an expired auth_date", async () => {
    const old = signedInitData({ ...FIELDS, auth_date: String(NOW - 100_000) });
    expect((await validateInitData(old, BOT_TOKEN, 86_400, NOW)).reason).toBe("expired");
  });

  it("rejects empty and hashless payloads", async () => {
    expect((await validateInitData("", BOT_TOKEN)).reason).toBe("empty");
    expect((await validateInitData("auth_date=1", BOT_TOKEN)).reason).toBe("no-hash");
  });
});
