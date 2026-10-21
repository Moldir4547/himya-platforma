// Read-only local preview; only explicit public assets are served.
import http from "node:http";
import { readFile } from "node:fs/promises";
import path from "node:path";
const root = path.dirname(
  new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1"),
);
const assets = new Set([
  "index.html",
  "404.html",
  "app.js",
  "store.js",
  "config.js",
  "data.js",
  "catalog.js",
  "platform-utils.js",
  "learning.js",
  "university-control.js",
  "university-labs.js",
  "university-lab-co2.html",
  "university-lab-metal.html",
  "university-lab-classes.html",
  "university-control-data.js",
  "registration.js",
  "bond-practice.js",
  "bridge-path.js",
  "bond-models.js",
  "bond-lab.js",
  "equivalent-path.js",
  "school.js",
  "school-materials.js",
  "guided-lab.js",
  "guided-lab-model.js",
  "guided-lab-data.js",
  "guided-lab-8-data.js",
  "guided-lab-8-scene.js",
  "guided-lab.css",
  "school-labs.js",
  "school-curriculum.js",
  "school.css",
  "bond-models.css",
  "bridge-path.css",
  "bond-practice.css",
  "learning-api.js",
  "redox-data.js",
  "styles.css",
  "components.css",
  "accessibility.css",
  "learning.css",
  "platform.css",
  "experience.css",
]);
http
  .createServer(async (req, res) => {
    try {
      let name = new URL(req.url, "http://localhost").pathname
        .replace(/^\/himya-platforma/, "")
        .replace(/^\//, "");
      if (!name || !path.extname(name)) name = "index.html";
      if (!assets.has(name)) {
        res.writeHead(404);
        res.end("Not found");
        return;
      }
      res.setHeader(
        "Content-Type",
        name.endsWith(".js")
          ? "text/javascript; charset=utf-8"
          : name.endsWith(".css")
            ? "text/css; charset=utf-8"
            : "text/html; charset=utf-8",
      );
      res.setHeader("Cache-Control", "no-store");
      res.end(await readFile(path.join(root, name)));
    } catch {
      res.writeHead(500);
      res.end("Preview error");
    }
  })
  .listen(4173, "127.0.0.1", () =>
    console.log("Preview: http://127.0.0.1:4173"),
  );

