// Minimal static file server for Firebase App Hosting / Cloud Run.
// Serves the Vite SPA build from ./dist on $PORT (default 8080).
// Falls back to index.html for client-side routing.
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST = path.join(__dirname, "dist");
const PORT = Number(process.env.PORT) || 8080;
const HOST = "0.0.0.0";

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".mjs": "application/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".map": "application/json; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
};

function safeJoin(base, target) {
  const resolved = path.resolve(base, "." + target);
  if (!resolved.startsWith(base)) return null;
  return resolved;
}

function send(res, status, body, headers = {}) {
  res.writeHead(status, headers);
  res.end(body);
}

function serveFile(res, filePath, status = 200) {
  fs.readFile(filePath, (err, data) => {
    if (err) {
      send(res, 500, "Internal Server Error");
      return;
    }
    const ext = path.extname(filePath).toLowerCase();
    const isHashed = /\.[0-9a-f]{8,}\./i.test(path.basename(filePath));
    const cacheControl = ext === ".html"
      ? "no-cache"
      : isHashed
        ? "public, max-age=31536000, immutable"
        : "public, max-age=3600";
    send(res, status, data, {
      "content-type": MIME[ext] || "application/octet-stream",
      "cache-control": cacheControl,
    });
  });
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url || "/", "http://localhost");
  const pathname = decodeURIComponent(url.pathname);
  const indexFile = path.join(DIST, "index.html");

  // SPA fallback for non-file paths
  if (pathname === "/" || !path.extname(pathname)) {
    serveFile(res, indexFile);
    return;
  }

  const target = safeJoin(DIST, pathname);
  if (!target) {
    send(res, 403, "Forbidden");
    return;
  }

  fs.stat(target, (err, stat) => {
    if (err || !stat.isFile()) {
      // Unknown asset path → SPA fallback
      serveFile(res, indexFile, 200);
      return;
    }
    serveFile(res, target);
  });
});

server.listen(PORT, HOST, () => {
  console.log(`Server listening on http://${HOST}:${PORT}`);
});
