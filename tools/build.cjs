const fs = require("node:fs");
const path = require("node:path");
const esbuild = require("esbuild");
const root = path.resolve(__dirname, "..");
const output = path.join(root, "dist");
fs.mkdirSync(output, { recursive: true });
for (const name of ["index.html", "style.css"]) {
  fs.copyFileSync(path.join(root, "src", name), path.join(output, name));
}
esbuild.buildSync({
  entryPoints: [path.join(root, "src", "script.js")],
  outfile: path.join(output, "script.js"),
  bundle: true,
  minify: true,
  format: "iife",
  platform: "browser",
  define: { "process.env.NODE_ENV": '"production"' },
  legalComments: "eof"
});
console.log("Готово: dist/index.html, dist/style.css, dist/script.js");
