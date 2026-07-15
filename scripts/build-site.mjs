#!/usr/bin/env node
import { cp, readdir, rm, stat } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { spawn } from "node:child_process";

const root = join(fileURLToPath(new URL("..", import.meta.url)));
const showcaseDist = join(root, "examples/showcase/dist");
const storybookDist = join(root, "packages/uikit/storybook-static");
const docsDist = join(root, "docs/site/dist");
const trailheadDist = join(root, "examples/trailhead/dist");
const siteDist = join(root, "site-dist");

// GH Pages serves the site from /tg-mini-app-uikit/; root-domain hosts
// (Cloudflare Pages, Netlify, …) need "/". Override via SITE_BASE=/ .
const siteBase = process.env.SITE_BASE || "/tg-mini-app-uikit/";

function runNpm(script, extraArgs = []) {
  return new Promise((resolve, reject) => {
    const child = spawn("npm", ["run", script, ...extraArgs], {
      cwd: root,
      stdio: "inherit",
      shell: process.platform === "win32",
    });
    child.once("error", reject);
    child.once("exit", (code, signal) => {
      if (code === 0) {
        resolve();
        return;
      }
      reject(
        new Error(
          `npm run ${script} failed${signal ? ` with signal ${signal}` : ` with exit code ${code}`}`,
        ),
      );
    });
  });
}

async function requireBuild(name, directory) {
  let metadata;
  try {
    metadata = await stat(directory);
  } catch {
    throw new Error(`${name} build output is missing: ${directory}`);
  }

  if (!metadata.isDirectory() || (await readdir(directory)).length === 0) {
    throw new Error(`${name} build output is empty: ${directory}`);
  }
}

async function buildSite() {
  await runNpm("build", ["-w", "showcase", "--", "--base", siteBase]);
  // Trailhead is the flagship Mini App demo — deployed at /trailhead/ so the
  // BotFather Web App URL can point straight at it.
  await runNpm("build", ["-w", "trailhead", "--", "--base", `${siteBase}trailhead/`]);
  await runNpm("stories:build");
  await runNpm("docs:build");

  await requireBuild("Showcase", showcaseDist);
  await requireBuild("Trailhead", trailheadDist);
  await requireBuild("Storybook", storybookDist);
  await requireBuild("Docs", docsDist);

  await rm(siteDist, { recursive: true, force: true });
  await cp(showcaseDist, siteDist, { recursive: true });
  await cp(trailheadDist, join(siteDist, "trailhead"), { recursive: true });
  await cp(storybookDist, join(siteDist, "storybook"), { recursive: true });
  await cp(docsDist, join(siteDist, "docs"), { recursive: true });

  console.log(`Built combined Pages artifact at ${siteDist}`);
}

buildSite().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
