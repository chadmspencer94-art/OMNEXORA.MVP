import test from "node:test";
import assert from "node:assert/strict";
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, normalize } from "node:path";
import { cwd } from "node:process";

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
};

function safeFilePath(pathname) {
  const normalized = normalize(pathname).replace(/^(\.\.(\/|\\|$))+/, "");
  const localPath = normalized === "/" ? "/index.html" : normalized;
  return join(cwd(), localPath);
}

async function startStaticServer() {
  const server = createServer(async (req, res) => {
    const requestUrl = new URL(req.url || "/", "http://127.0.0.1");
    const filePath = safeFilePath(requestUrl.pathname);
    try {
      const data = await readFile(filePath);
      res.writeHead(200, {
        "Content-Type": MIME_TYPES[extname(filePath)] || "text/plain; charset=utf-8",
      });
      res.end(data);
    } catch {
      res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      res.end("Not found");
    }
  });

  await new Promise((resolve) => {
    server.listen(0, "127.0.0.1", resolve);
  });

  const address = server.address();
  if (!address || typeof address === "string") {
    throw new Error("Unable to resolve test server address.");
  }

  return {
    server,
    port: address.port,
  };
}

function stopServer(server) {
  return new Promise((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()));
  });
}

test("local browser smoke: index page serves expected UI", async () => {
  const { server, port } = await startStaticServer();
  try {
    const response = await fetch(`http://127.0.0.1:${port}/`);
    assert.equal(response.status, 200);
    const html = await response.text();
    assert.match(html, /Ultra-Reliable Master Prompt Builder/);
    assert.match(html, /id="prompt-form"/);
    assert.match(html, /id="prompt-output"/);
    assert.match(html, /src="\.\/app\/main\.js"/);
  } finally {
    await stopServer(server);
  }
});
