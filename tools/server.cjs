const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "../dist");
if (!fs.existsSync(path.join(root, "index.html"))) {
  console.error("Сначала выполните npm run build.");
  process.exit(1);
}
const files = {
  "/": ["index.html", "text/html; charset=utf-8"],
  "/index.html": ["index.html", "text/html; charset=utf-8"],
  "/style.css": ["style.css", "text/css; charset=utf-8"],
  "/script.js": ["script.js", "text/javascript; charset=utf-8"]
};
const server = http.createServer((request, response) => {
  const pathname = new URL(request.url, "http://localhost").pathname;
  const file = files[pathname];
  if (!file) {
    response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("Страница не найдена");
    return;
  }
  fs.readFile(path.join(root, file[0]), (error, content) => {
    if (error) {
      response.writeHead(500);
      response.end("Ошибка чтения файла");
      return;
    }
    response.writeHead(200, { "Content-Type": file[1] });
    response.end(content);
  });
});
server.on("error", error => {
  console.error("Не удалось запустить сервер:", error.message);
  process.exitCode = 1;
});
server.listen(3000, "127.0.0.1", () => console.log("Откройте http://localhost:3000"));
