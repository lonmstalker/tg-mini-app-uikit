/*
 * Telegram Mini App initData validation (Web Crypto, runs in a Cloudflare
 * Worker): HMAC-SHA256 per https://core.telegram.org/bots/webapps#validating-data-received-via-the-mini-app
 * — secret = HMAC_SHA256(key: "WebAppData", msg: bot_token), then
 * hash === HMAC_SHA256(key: secret, msg: data_check_string). This is the
 * server-side trust boundary: the client's `authorization: tma <initData>`
 * header is attacker-controlled until this check passes.
 */

const encoder = new TextEncoder();

async function hmacSha256(key: ArrayBuffer | Uint8Array, message: string): Promise<Uint8Array> {
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    key as BufferSource,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  return new Uint8Array(await crypto.subtle.sign("HMAC", cryptoKey, encoder.encode(message)));
}

const toHex = (bytes: Uint8Array) => Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");

/** Constant-time-ish comparison — both sides are fixed-length hex digests. */
function digestsEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export interface TKInitDataResult {
  ok: boolean;
  /** Parsed `user.id` when validation passed and the field is present. */
  userId?: number;
  reason?: "empty" | "no-hash" | "bad-hash" | "expired";
}

export async function validateInitData(
  initData: string,
  botToken: string,
  maxAgeSeconds = 24 * 60 * 60,
  nowSeconds = Math.floor(Date.now() / 1000),
): Promise<TKInitDataResult> {
  if (!initData) return { ok: false, reason: "empty" };
  const params = new URLSearchParams(initData);
  const hash = params.get("hash");
  if (!hash) return { ok: false, reason: "no-hash" };
  params.delete("hash");

  const dataCheckString = [...params.entries()]
    .map(([key, value]) => `${key}=${value}`)
    .sort()
    .join("\n");

  const secret = await hmacSha256(encoder.encode("WebAppData"), botToken);
  const computed = toHex(await hmacSha256(secret, dataCheckString));
  if (!digestsEqual(computed, hash.toLowerCase())) return { ok: false, reason: "bad-hash" };

  const authDate = Number(params.get("auth_date"));
  if (!Number.isFinite(authDate) || nowSeconds - authDate > maxAgeSeconds) {
    return { ok: false, reason: "expired" };
  }

  let userId: number | undefined;
  try {
    userId = (JSON.parse(params.get("user") ?? "") as { id?: number }).id;
  } catch {
    /* user field is optional */
  }
  return { ok: true, userId };
}
