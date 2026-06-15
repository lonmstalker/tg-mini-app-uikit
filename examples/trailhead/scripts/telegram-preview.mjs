#!/usr/bin/env node
import { spawn } from "node:child_process";

const args = new Set(process.argv.slice(2));
const help = args.has("--help") || args.has("-h");
const port = process.env.TRAILHEAD_PORT ?? "5173";
const host = process.env.TRAILHEAD_HOST ?? "127.0.0.1";
const menuText = process.env.TELEGRAM_MENU_TEXT ?? "Open Trailhead";
const botToken = process.env.TELEGRAM_BOT_TOKEN;
const botUsername = process.env.TELEGRAM_BOT_USERNAME?.replace(/^@/, "");
const chatId = process.env.TELEGRAM_CHAT_ID;

if (help) {
  console.log(`Trailhead Telegram preview

Starts the local Trailhead Vite server, exposes it through a temporary HTTPS
localtunnel URL, and optionally wires that URL into a Telegram bot menu button.

Usage:
  npm run telegram:preview -w trailhead

Environment:
  TRAILHEAD_HOST=127.0.0.1       Local Vite host.
  TRAILHEAD_PORT=5173            Local Vite port.
  TELEGRAM_BOT_TOKEN=...         Optional. Enables Bot API setChatMenuButton.
  TELEGRAM_BOT_USERNAME=...      Optional. Printed as a quick-open bot link.
  TELEGRAM_CHAT_ID=...           Optional. Targets one private chat menu button.
  TELEGRAM_MENU_TEXT=Trailhead   Optional. Menu button text.

Stop with Ctrl-C. No project dependencies are installed.`);
  process.exit(0);
}

const children = new Set();
let shuttingDown = false;

function run(label, command, commandArgs, options = {}) {
  const child = spawn(command, commandArgs, {
    stdio: options.stdio ?? ["ignore", "pipe", "pipe"],
    env: process.env,
    shell: false,
  });
  children.add(child);
  child.once("exit", () => children.delete(child));
  child.once("error", (error) => {
    console.error(`[${label}] ${error.message}`);
    shutdown(1);
  });
  return child;
}

function shutdown(code = 0) {
  if (shuttingDown) return;
  shuttingDown = true;
  for (const child of children) child.kill("SIGINT");
  setTimeout(() => process.exit(code), 250).unref();
}

process.once("SIGINT", () => shutdown(130));
process.once("SIGTERM", () => shutdown(143));

function waitForLine(child, pattern, label, timeoutMs = 30_000) {
  return new Promise((resolve, reject) => {
    let buffer = "";
    const timer = setTimeout(() => {
      cleanup();
      reject(new Error(`${label} did not become ready within ${timeoutMs}ms`));
    }, timeoutMs);
    const onData = (chunk) => {
      const text = chunk.toString();
      process.stdout.write(text);
      buffer += text;
      const match = buffer.match(pattern);
      if (match) {
        cleanup();
        resolve(match[1] ?? match[0]);
      }
    };
    const onErr = (chunk) => {
      const text = chunk.toString();
      process.stderr.write(text);
      buffer += text;
      const match = buffer.match(pattern);
      if (match) {
        cleanup();
        resolve(match[1] ?? match[0]);
      }
    };
    const onExit = (code) => {
      cleanup();
      reject(new Error(`${label} exited before it was ready (code ${code ?? "unknown"})`));
    };
    const cleanup = () => {
      clearTimeout(timer);
      child.stdout?.off("data", onData);
      child.stderr?.off("data", onErr);
      child.off("exit", onExit);
    };
    child.stdout?.on("data", onData);
    child.stderr?.on("data", onErr);
    child.once("exit", onExit);
  });
}

async function waitForTrailhead(url) {
  const deadline = Date.now() + 20_000;
  let lastError;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(url);
      const body = await response.text();
      if (response.ok && body.includes("Trailhead") && body.includes("/src/main.tsx")) return;
      lastError = new Error(`unexpected response ${response.status}`);
    } catch (error) {
      lastError = error;
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  throw lastError ?? new Error(`timed out waiting for ${url}`);
}

async function setChatMenuButton(url) {
  if (!botToken) return;

  const body = {
    menu_button: {
      type: "web_app",
      text: menuText,
      web_app: { url },
    },
  };
  if (chatId) body.chat_id = chatId;

  const response = await fetch(`https://api.telegram.org/bot${botToken}/setChatMenuButton`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  const json = await response.json().catch(() => undefined);
  if (!response.ok || json?.ok !== true) {
    const description = json?.description ? `: ${json.description}` : "";
    throw new Error(`setChatMenuButton failed (${response.status})${description}`);
  }
}

async function main() {
  console.log(`[trailhead] starting Vite on http://${host}:${port}/`);
  const vite = run("vite", "npm", ["run", "dev", "--", "--host", host, "--port", port]);
  await waitForLine(vite, /Local:\s+http:\/\/[^\s]+/, "vite");

  console.log("[trailhead] starting HTTPS localtunnel");
  const tunnel = run("localtunnel", "npx", ["--yes", "localtunnel", "--port", port, "--local-host", host]);
  const tunnelUrl = await waitForLine(tunnel, /https:\/\/[^\s]+\.loca\.lt/, "localtunnel");

  await waitForTrailhead(tunnelUrl);
  console.log(`[trailhead] HTTPS preview verified: ${tunnelUrl}`);

  if (botToken) {
    await setChatMenuButton(tunnelUrl);
    console.log("[telegram] Bot menu button updated via setChatMenuButton");
  } else {
    console.log("[telegram] TELEGRAM_BOT_TOKEN is not set, skipped Bot API menu button update");
  }

  if (botUsername) {
    console.log(`[telegram] Open the bot in Telegram: https://t.me/${botUsername}`);
  }
  console.log("[telegram] Press the bot menu button, then run the real-client checklist in plans.md.");
  console.log("[trailhead] Stop with Ctrl-C when the Telegram pass is finished.");
}

main().catch((error) => {
  console.error(error.message);
  shutdown(1);
});
