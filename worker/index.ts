/*
 * The site Worker: static assets (landing + /demo + /storybook + /docs +
 * /trailhead) plus the one API the Trailhead demo needs — Stars invoice
 * creation. The checkout posts here because invoice links can only be minted
 * server-side with the bot token (Bot API createInvoiceLink, currency XTR).
 *
 * Setup (one-time, Cloudflare dash): Workers → tg-mini-app-uikit → Settings →
 * Variables and Secrets → add secret TELEGRAM_BOT_TOKEN (the bot's token).
 * Without it the endpoint answers 503 and the checkout shows its error state.
 */
import { validateInitData } from "./init-data";

interface Env {
  ASSETS: { fetch(request: Request): Promise<Response> };
  TELEGRAM_BOT_TOKEN?: string;
}

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });

// Bot API createInvoiceLink field limits.
const TITLE_MAX = 32;
const DESCRIPTION_MAX = 255;
const PAYLOAD_MAX = 128;
const STARS_MAX = 10_000;

interface InvoiceRequest {
  experienceId?: unknown;
  title?: unknown;
  date?: unknown;
  slot?: unknown;
  totalStars?: unknown;
}

async function createInvoice(request: Request, env: Env): Promise<Response> {
  if (request.method !== "POST") return json(405, { error: "POST only" });
  const botToken = env.TELEGRAM_BOT_TOKEN;
  if (!botToken) return json(503, { error: "TELEGRAM_BOT_TOKEN secret is not configured" });

  // Trust boundary: the header is attacker-controlled until the HMAC passes.
  const auth = request.headers.get("authorization") ?? "";
  const initData = auth.startsWith("tma ") ? auth.slice(4) : "";
  const valid = await validateInitData(initData, botToken);
  if (!valid.ok) return json(401, { error: `initData rejected: ${valid.reason}` });

  let body: InvoiceRequest;
  try {
    body = (await request.json()) as InvoiceRequest;
  } catch {
    return json(400, { error: "invalid JSON body" });
  }
  const stars = Math.trunc(Number(body.totalStars));
  if (!Number.isFinite(stars) || stars < 1 || stars > STARS_MAX) {
    return json(400, { error: `totalStars must be 1..${STARS_MAX}` });
  }
  const title = String(body.title ?? "Trailhead booking").slice(0, TITLE_MAX);
  const date = String(body.date ?? "").slice(0, 16);
  const slot = String(body.slot ?? "").slice(0, 16);
  const experienceId = String(body.experienceId ?? "").slice(0, 64);

  const response = await fetch(`https://api.telegram.org/bot${botToken}/createInvoiceLink`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      title,
      description: `${title} — ${date} ${slot}`.slice(0, DESCRIPTION_MAX),
      payload: `bk-${experienceId}-${date}-${slot}`.slice(0, PAYLOAD_MAX),
      currency: "XTR", // Telegram Stars — no provider_token needed
      prices: [{ label: title, amount: stars }],
    }),
  });
  const data = (await response.json()) as { ok?: boolean; result?: string; description?: string };
  if (!data.ok || !data.result) {
    return json(502, { error: `createInvoiceLink failed: ${data.description ?? response.status}` });
  }
  return json(200, { invoiceUrl: data.result });
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const { pathname } = new URL(request.url);
    if (pathname === "/api/trailhead/invoice") return createInvoice(request, env);
    if (pathname.startsWith("/api/")) return json(404, { error: "unknown API route" });
    return env.ASSETS.fetch(request);
  },
};
