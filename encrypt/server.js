const http = require("http");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>凭据生成器 GUI</title>
  <style>
    body { font-family: Arial, sans-serif; max-width: 700px; margin: 40px auto; padding: 20px; background: #f7f7f7; }
    .card { background: white; padding: 20px; border-radius: 10px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
    .row { display: flex; gap: 10px; margin-bottom: 12px; flex-wrap: wrap; }
    input { flex: 1; min-width: 180px; padding: 10px; border: 1px solid #ccc; border-radius: 6px; }
    button { padding: 10px 14px; border: none; border-radius: 6px; cursor: pointer; background: #2563eb; color: white; }
    button:hover { background: #1d4ed8; }
    ul { padding-left: 20px; }
    pre { background: #111827; color: #f9fafb; padding: 12px; border-radius: 6px; white-space: pre-wrap; min-height: 120px; }
    .hint { color: #666; font-size: 13px; margin-top: 6px; }
  </style>
</head>
<body>
  <div class="card">
    <h2>凭据生成器</h2>
    <div class="row">
      <input id="username" placeholder="请输入用户名" />
      <input id="password" type="password" placeholder="请输入密码" />
      <button id="addBtn">加入列表</button>
      <button id="generateBtn">生成凭据</button>
    </div>
    <div class="hint">先点击“加入列表”，再点击“生成凭据”。</div>
    <h3>已添加列表</h3>
    <ul id="entryList"></ul>
    <h3>命令输出</h3>
    <pre id="output">等待执行...</pre>
  </div>
  <script>
    const state = { entries: [] };
    const usernameInput = document.getElementById("username");
    const passwordInput = document.getElementById("password");
    const addBtn = document.getElementById("addBtn");
    const generateBtn = document.getElementById("generateBtn");
    const entryList = document.getElementById("entryList");
    const output = document.getElementById("output");

    function renderList() {
      entryList.innerHTML = "";
      if (state.entries.length === 0) {
        entryList.innerHTML = "<li>当前还没有添加任何内容</li>";
        return;
      }
      state.entries.forEach((item, index) => {
        const li = document.createElement("li");
        li.textContent = \`\${index + 1}. 用户名: \${item.username} | 密码: \${item.password}\`;
        entryList.appendChild(li);
      });
    }

    addBtn.addEventListener("click", () => {
      const username = usernameInput.value.trim();
      const password = passwordInput.value.trim();
      if (!username || !password) {
        output.textContent = "请输入用户名和密码。";
        return;
      }
      state.entries.push({ username, password });
      renderList();
      usernameInput.value = "";
      passwordInput.value = "";
      output.textContent = \`已加入: \${username}\`;
    });

    generateBtn.addEventListener("click", async () => {
      if (state.entries.length === 0) {
        output.textContent = "请先至少添加一个用户名和密码。";
        return;
      }
      output.textContent = "正在生成，请稍候...";
      try {
        const response = await fetch("/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ entries: state.entries })
        });
        const data = await response.json();
        output.textContent = data.output || "执行完成。";
        if (data.ok) {
          state.entries = [];
          renderList();
        }
      } catch (err) {
        output.textContent = \`请求失败: \${err.message}\`;
      }
    });

    renderList();
  </script>
</body>
</html>`;

function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(data));
}

function sendHtml(res, htmlText) {
  res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
  res.end(htmlText);
}

function generateCredentials(entries) {
  return entries.map(item => {
    const [username, password] = [String(item.username || ""), String(item.password || "")];
    if (!username || !password) {
      throw new Error("用户名和密码不能为空");
    }
    const salt = crypto.randomBytes(16);
    const hash = crypto.pbkdf2Sync(password, salt, 150000, 32, "sha256");
    return {
      username,
      salt: salt.toString("base64"),
      iterations: 150000,
      hash: hash.toString("base64"),
      digest: "sha256"
    };
  });
}

const server = http.createServer((req, res) => {
  if ((req.method === "GET" && (req.url === "/" || req.url === "/index.html")) || req.url === "/") {
    return sendHtml(res, html);
  }

  if (req.method === "POST" && req.url === "/generate") {
    let body = "";
    req.on("data", chunk => {
      body += chunk;
      if (body.length > 1e6) req.connection.destroy();
    });
    req.on("end", () => {
      try {
        const parsed = JSON.parse(body || "{}");
        const entries = Array.isArray(parsed.entries) ? parsed.entries : [];
        if (!entries.length) {
          return sendJson(res, 400, { ok: false, output: "请先至少添加一个用户名和密码。" });
        }
        const result = generateCredentials(entries);
        const filePath = path.join(process.cwd(), "credentials.json");
        fs.writeFileSync(filePath, JSON.stringify(result, null, 2) + "\n", "utf8");
        sendJson(res, 200, { ok: true, output: `已写入 ${filePath}` });
      } catch (err) {
        sendJson(res, 400, { ok: false, output: err.message });
      }
    });
    return;
  }

  res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
  res.end("404 Not Found");
});

server.listen(3000, () => {
  console.log("GUI 已启动，访问 http://localhost:3000");
});