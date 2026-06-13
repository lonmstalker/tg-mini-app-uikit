#!/usr/bin/env node
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, normalize } from "node:path";
import { buildDocs } from "./build-docs.mjs";

const root = new URL("../docs/site/dist/", import.meta.url).pathname;
const port = Number(process.env.PORT ?? 4174);
const types = { ".html": "text/html; charset=utf-8", ".css": "text/css", ".gif": "image/gif" };

await buildDocs();

createServer(async (req, res) => {
  const url = new URL(req.url ?? "/", `http://127.0.0.1:${port}`);
  const name = url.pathname === "/" ? "index.html" : normalize(url.pathname).replace(/^\/+/, "");
  try {
    const body = await readFile(join(root, name));
    res.writeHead(200, { "content-type": types[extname(name)] ?? "application/octet-stream" });
    res.end(body);
  } catch {
    res.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
    res.end("Not found");
  }
}).listen(port, "127.0.0.1", () => {
  console.log(`Docs running at http://127.0.0.1:${port}`);
});
