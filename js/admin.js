/* ============================================================
   PRISM X · 管理控制台
   ============================================================ */

const SALT = "px8f3kL2mN9vR7wQ1";
const ITER = 10000;
const PASSWORD_HASH =
  "31028e2933f5e48ef25eebc90f87af1997782078d422fec8548f28e6ebff7793";

const SESSION_KEY = "prismx_admin_session";

/* ---------- SHA-256（纯 JS 实现，兼容 file:// 等非安全上下文） ---------- */
function sha256Hex(ascii) {
  return Promise.resolve(sha256Sync(ascii));
}
function sha256Sync(input) {
  const msg = unescape(encodeURIComponent(input));
  function rotr(n, x) { return (x >>> n) | (x << (32 - n)); }
  const K = [];
  const H = [];
  (function init() {
    function frac(x) { return ((x - Math.floor(x)) * 4294967296) | 0; }
    let n = 2, count = 0;
    while (count < 64) {
      let isPrime = true;
      for (let f = 2; f * f <= n; f++) if (n % f === 0) { isPrime = false; break; }
      if (isPrime) {
        if (count < 8) H[count] = frac(Math.sqrt(n));
        K[count] = frac(Math.cbrt(n));
        count++;
      }
      n++;
    }
  })();
  const bytes = [];
  for (let i = 0; i < msg.length; i++) bytes.push(msg.charCodeAt(i));
  const bitLen = bytes.length * 8;
  bytes.push(0x80);
  while (bytes.length % 64 !== 56) bytes.push(0);
  for (let i = 7; i >= 0; i--) bytes.push((bitLen / Math.pow(2, i * 8)) & 0xff);

  const h = H.slice();
  for (let i = 0; i < bytes.length; i += 64) {
    const w = new Array(64);
    for (let t = 0; t < 16; t++) {
      w[t] = (bytes[i + t * 4] << 24) | (bytes[i + t * 4 + 1] << 16) |
             (bytes[i + t * 4 + 2] << 8) | bytes[i + t * 4 + 3];
    }
    for (let t = 16; t < 64; t++) {
      const s0 = rotr(7, w[t - 15]) ^ rotr(18, w[t - 15]) ^ (w[t - 15] >>> 3);
      const s1 = rotr(17, w[t - 2]) ^ rotr(19, w[t - 2]) ^ (w[t - 2] >>> 10);
      w[t] = (w[t - 16] + s0 + w[t - 7] + s1) | 0;
    }
    let [a, b, c, d, e, f, g, hh] = h;
    for (let t = 0; t < 64; t++) {
      const S1 = rotr(6, e) ^ rotr(11, e) ^ rotr(25, e);
      const ch = (e & f) ^ (~e & g);
      const t1 = (hh + S1 + ch + K[t] + w[t]) | 0;
      const S0 = rotr(2, a) ^ rotr(13, a) ^ rotr(22, a);
      const maj = (a & b) ^ (a & c) ^ (b & c);
      const t2 = (S0 + maj) | 0;
      hh = g; g = f; f = e; e = (d + t1) | 0;
      d = c; c = b; b = a; a = (t1 + t2) | 0;
    }
    h[0] = (h[0] + a) | 0; h[1] = (h[1] + b) | 0;
    h[2] = (h[2] + c) | 0; h[3] = (h[3] + d) | 0;
    h[4] = (h[4] + e) | 0; h[5] = (h[5] + f) | 0;
    h[6] = (h[6] + g) | 0; h[7] = (h[7] + hh) | 0;
  }
  return h.map((x) => ("00000000" + (x >>> 0).toString(16)).slice(-8)).join("");
}

/* ---------- 视图切换 ---------- */
const loginView = document.getElementById("loginView");
const dashView = document.getElementById("dashView");
const logoutBtn = document.getElementById("logoutBtn");
const toast = document.getElementById("toast");

let editing = []; // 正在编辑的账户数组
let faqEditing = []; // 正在编辑的 FAQ 数组

function showToast(msg) {
  toast.textContent = msg;
  toast.classList.add("show");
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => toast.classList.remove("show"), 2400);
}

function enterDashboard() {
  loginView.classList.add("hidden");
  dashView.classList.remove("hidden");
  logoutBtn.classList.remove("hidden");
  editing = loadAccounts();
  faqEditing = loadFAQ();
  renderEditors();
  renderFaqEditors();
  updateGitHubTokenStatus();
}

function exitDashboard() {
  sessionStorage.removeItem(SESSION_KEY);
  dashView.classList.add("hidden");
  logoutBtn.classList.add("hidden");
  loginView.classList.remove("hidden");
  document.getElementById("pwInput").value = "";
}

/* ---------- 登录 ---------- */
async function tryLogin() {
  const pw = document.getElementById("pwInput").value;
  const err = document.getElementById("loginError");
  if (!pw) { err.textContent = "请输入密码"; return; }
  const hash = await hashPassword(pw);
  if (hash === PASSWORD_HASH) {
    sessionStorage.setItem(SESSION_KEY, "1");
    err.textContent = "";
    enterDashboard();
  } else {
    err.textContent = "密码错误，请重试";
  }
}

/* 带盐迭代哈希：SALT + ITER 轮 SHA-256 */
async function hashPassword(pw) {
  let h = (pw + SALT);
  for (let i = 0; i < ITER; i++) {
    h = sha256Sync(h);
  }
  return h;
}

document.getElementById("loginBtn").addEventListener("click", tryLogin);
document.getElementById("pwInput").addEventListener("keydown", (e) => {
  if (e.key === "Enter") tryLogin();
});
logoutBtn.addEventListener("click", (e) => { e.preventDefault(); exitDashboard(); });

if (sessionStorage.getItem(SESSION_KEY) === "1") enterDashboard();

/* ---------- 编辑器渲染 ---------- */
function escAttr(s) {
  return String(s == null ? "" : s)
    .replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function fieldHTML(idx, key, label, value, opts) {
  opts = opts || {};
  const id = "f-" + idx + "-" + key;
  if (opts.type === "select") {
    const options = opts.options.map(
      (o) => '<option value="' + o.value + '"' + (o.value === value ? " selected" : "") + ">" + o.label + "</option>"
    ).join("");
    return '<div class="field ' + (opts.span || "") + '"><label for="' + id + '">' + label + "</label>" +
      '<select id="' + id + '" data-idx="' + idx + '" data-key="' + key + '">' + options + "</select></div>";
  }
  if (opts.type === "textarea") {
    return '<div class="field ' + (opts.span || "") + '"><label for="' + id + '">' + label + "</label>" +
      '<textarea id="' + id + '" data-idx="' + idx + '" data-key="' + key + '">' + escAttr(value) + "</textarea></div>";
  }
  return '<div class="field ' + (opts.span || "") + '"><label for="' + id + '">' + label + "</label>" +
    '<input type="' + (opts.type || "text") + '" id="' + id + '" data-idx="' + idx + '" data-key="' + key +
    '" value="' + escAttr(value) + '"' + (opts.step ? ' step="' + opts.step + '"' : "") + " /></div>";
}

function renderEditors() {
  const list = document.getElementById("editorList");
  if (!editing.length) {
    list.innerHTML = '<div class="accounts-empty">还没有账户，点击右上角「+ 新增账户」创建一个。</div>';
    return;
  }
  list.innerHTML = editing.map((a, i) => {
    return '<div class="acct-editor">' +
      '<div class="acct-editor-head"><h2>#' + (i + 1) + " · " + escAttr(a.name || "未命名账户") + "</h2>" +
      '<button class="btn btn-danger btn-ghost btn-sm" data-del="' + i + '">删除此账户</button></div>' +
      '<div class="editor-grid">' +
        fieldHTML(i, "name", "账户名称", a.name) +
        fieldHTML(i, "strategy", "策略名称 / 版本", a.strategy) +
        fieldHTML(i, "status", "运行状态", a.status, {
          type: "select",
          options: [
            { value: "running", label: "运行中" },
            { value: "paused", label: "暂停中" },
            { value: "closed", label: "已结束" }
          ]
        }) +
        fieldHTML(i, "broker", "经纪商 / 平台", a.broker) +
        fieldHTML(i, "startDate", "开始日期", a.startDate, { type: "date" }) +
        fieldHTML(i, "balance", "账户净值（含货币单位）", a.balance) +
        fieldHTML(i, "totalReturn", "累计收益率 %", a.totalReturn, { type: "number", step: "0.1" }) +
        fieldHTML(i, "annualReturn", "年化收益率 %", a.annualReturn, { type: "number", step: "0.1" }) +
        fieldHTML(i, "maxDrawdown", "最大回撤 %（正数）", a.maxDrawdown, { type: "number", step: "0.1" }) +
        fieldHTML(i, "link", "第三方验证链接（可选）", a.link, { span: "span-3", type: "url" }) +
        fieldHTML(i, "description", "账户介绍", a.description, { span: "span-3", type: "textarea" }) +
      "</div></div>";
  }).join("");

  // 输入绑定
  list.querySelectorAll("input, textarea, select").forEach((el) => {
    el.addEventListener("input", () => {
      const idx = Number(el.dataset.idx);
      const key = el.dataset.key;
      let v = el.value;
      if (["totalReturn", "annualReturn", "maxDrawdown"].includes(key)) {
        v = v === "" ? "" : Number(v);
      }
      editing[idx][key] = v;
      if (key === "name") {
        const h = list.querySelectorAll(".acct-editor-head h2")[idx];
        if (h) h.textContent = "#" + (idx + 1) + " · " + (v || "未命名账户");
      }
    });
  });

  // 删除绑定
  list.querySelectorAll("[data-del]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const idx = Number(btn.dataset.del);
      if (confirm("确定删除账户「" + (editing[idx].name || "未命名") + "」吗？")) {
        editing.splice(idx, 1);
        renderEditors();
      }
    });
  });
}

/* ---------- 工具栏 ---------- */
document.getElementById("addBtn").addEventListener("click", () => {
  editing.push({
    id: "acct-" + Date.now(),
    name: "新账户",
    strategy: "",
    status: "running",
    broker: "",
    startDate: new Date().toISOString().slice(0, 10),
    balance: "",
    totalReturn: 0,
    annualReturn: 0,
    maxDrawdown: 0,
    description: "",
    link: ""
  });
  renderEditors();
  window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
});

/* ---------- FAQ 编辑器 ---------- */
function renderFaqEditors() {
  var list = document.getElementById("faqEditorList");
  if (!list) return;
  if (!faqEditing.length) {
    list.innerHTML = '<div class="accounts-empty">还没有 FAQ 内容，点击右上角「+ 新增问题」创建。</div>';
    return;
  }
  list.innerHTML = faqEditing.map(function (fa, i) {
    return '<div class="acct-editor">' +
      '<div class="acct-editor-head"><h2>#' + (i + 1) + " · " + escAttr(fa.q || "未命名问题") + "</h2>" +
      '<button class="btn btn-danger btn-ghost btn-sm" data-faq-del="' + i + '">删除此问题</button></div>' +
      '<div class="editor-grid">' +
        '<div class="field span-3"><label for="faq-q-' + i + '">问题</label>' +
        '<input type="text" id="faq-q-' + i + '" data-faq-idx="' + i + '" data-faq-key="q" value="' + escAttr(fa.q) + '" /></div>' +
        '<div class="field span-3"><label for="faq-a-' + i + '">回答（支持 HTML 标签如 &lt;strong&gt;）</label>' +
        '<textarea id="faq-a-' + i + '" data-faq-idx="' + i + '" data-faq-key="a" style="min-height:100px">' + escAttr(fa.a) + "</textarea></div>" +
      "</div></div>";
  }).join("");

  list.querySelectorAll("input, textarea").forEach(function (el) {
    el.addEventListener("input", function () {
      var idx = Number(el.dataset.faqIdx);
      var key = el.dataset.faqKey;
      faqEditing[idx][key] = el.value;
      if (key === "q") {
        var h = list.querySelectorAll(".acct-editor-head h2")[idx];
        if (h) h.textContent = "#" + (idx + 1) + " · " + (el.value || "未命名问题");
      }
    });
  });

  list.querySelectorAll("[data-faq-del]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var idx = Number(btn.dataset.faqDel);
      if (confirm("确定删除 FAQ「" + (faqEditing[idx].q || "未命名") + "」吗？")) {
        faqEditing.splice(idx, 1);
        renderFaqEditors();
      }
    });
  });
}

document.getElementById("addFaqBtn").addEventListener("click", function () {
  faqEditing.push({ q: "新问题", a: "" });
  renderFaqEditors();
  window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
});

document.getElementById("resetFaqBtn").addEventListener("click", function () {
  if (confirm("确定恢复为默认 FAQ 吗？本机的修改将被清除。")) {
    resetFAQ();
    faqEditing = loadFAQ();
    renderFaqEditors();
    showToast("已恢复默认 FAQ");
  }
});

document.getElementById("saveBtn").addEventListener("click", () => {
  saveAccounts(editing);
  saveFAQ(faqEditing);
  showToast("✓ 已保存 — 本机主页已生效");
});

document.getElementById("resetBtn").addEventListener("click", () => {
  if (confirm("确定恢复为 data.js 中的默认数据吗？本机的修改将被清除。")) {
    resetAccounts();
    resetFAQ();
    editing = loadAccounts();
    faqEditing = loadFAQ();
    renderEditors();
    renderFaqEditors();
    showToast("已恢复默认数据");
  }
});

document.getElementById("exportBtn").addEventListener("click", () => {
  const header =
    "/* ============================================================\n" +
    "   PRISM X · 数据（由管理控制台导出）\n" +
    "   导出时间：" + new Date().toLocaleString() + "\n" +
    "   将本文件替换仓库中的 js/data.js 并推送，即可让所有访客看到更新。\n" +
    "   ============================================================ */\n\n" +
    'const PRISM_STORAGE_KEY = "prismx_accounts_v1";\n\n' +
    "const DEFAULT_ACCOUNTS = ";
  const mid =
    ";\n\n/* ---------- 共享读写函数（index 与 admin 共用） ---------- */\n\n" +
    "function loadAccounts() {\n" +
    "  try {\n" +
    "    const raw = localStorage.getItem(PRISM_STORAGE_KEY);\n" +
    "    if (raw) {\n" +
    "      const parsed = JSON.parse(raw);\n" +
    "      if (Array.isArray(parsed)) return parsed;\n" +
    "    }\n" +
    "  } catch (e) {\n" +
    '    console.warn("读取本地账户数据失败，使用默认数据。", e);\n' +
    "  }\n" +
    "  return JSON.parse(JSON.stringify(DEFAULT_ACCOUNTS));\n" +
    "}\n\n" +
    "function saveAccounts(accounts) {\n" +
    "  localStorage.setItem(PRISM_STORAGE_KEY, JSON.stringify(accounts));\n" +
    "}\n\n" +
    "function resetAccounts() {\n" +
    "  localStorage.removeItem(PRISM_STORAGE_KEY);\n" +
    "}\n\n" +
    'const FAQ_STORAGE_KEY = "prismx_faq_v1";\n\n' +
    "const DEFAULT_FAQ = ";
  const footer =
    ";\n\nfunction loadFAQ() {\n" +
    "  try {\n" +
    "    const raw = localStorage.getItem(FAQ_STORAGE_KEY);\n" +
    "    if (raw) {\n" +
    "      const parsed = JSON.parse(raw);\n" +
    "      if (Array.isArray(parsed)) return parsed;\n" +
    "    }\n" +
    "  } catch (e) {\n" +
    '    console.warn("读取 FAQ 数据失败，使用默认数据。", e);\n' +
    "  }\n" +
    "  return JSON.parse(JSON.stringify(DEFAULT_FAQ));\n" +
    "}\n\n" +
    "function saveFAQ(items) {\n" +
    "  localStorage.setItem(FAQ_STORAGE_KEY, JSON.stringify(items));\n" +
    "}\n\n" +
    "function resetFAQ() {\n" +
    "  localStorage.removeItem(FAQ_STORAGE_KEY);\n" +
    "}\n";

  const content = header + JSON.stringify(editing, null, 2) + mid + JSON.stringify(faqEditing, null, 2) + footer;
  const blob = new Blob([content], { type: "text/javascript;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "data.js";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
  showToast("已导出 data.js — 替换 js/data.js 后推送到 GitHub");
});

/* ---------- GitHub 同步 ---------- */

function updateGitHubTokenStatus() {
  var input = document.getElementById("ghTokenInput");
  var status = document.getElementById("ghStatus");
  if (!input || !status) return;
  if (hasGitHubToken()) {
    input.value = "•••••••• 已设置";
    input.placeholder = "Token 已设置（重新输入可覆盖）";
    status.textContent = "✓ Token 已设置 · 可点击紫色按钮同步";
    status.style.color = "var(--green-pale)";
  } else {
    input.value = "";
    input.placeholder = "ghp_xxxxxxxxxxxx";
    status.textContent = "未设置 Token";
    status.style.color = "var(--text-faint)";
  }
}

document.getElementById("ghSaveTokenBtn").addEventListener("click", function () {
  var input = document.getElementById("ghTokenInput");
  var token = input.value.trim();
  if (!token || token.indexOf("••••") !== -1) {
    showToast("请输入有效的 GitHub Token");
    return;
  }
  setGitHubToken(token);
  updateGitHubTokenStatus();
  showToast("✓ Token 已设置");
});

document.getElementById("ghClearTokenBtn").addEventListener("click", function () {
  sessionStorage.removeItem(GH_TOKEN_KEY);
  updateGitHubTokenStatus();
  showToast("Token 已清除");
});

document.getElementById("syncBtn").addEventListener("click", async function () {
  if (!hasGitHubToken()) {
    showToast("⚠ 请先在上方设置 GitHub Token");
    return;
  }

  /* 先本地保存 */
  saveAccounts(editing);
  saveFAQ(faqEditing);

  var btn = document.getElementById("syncBtn");
  btn.disabled = true;
  btn.textContent = "同步中...";
  showToast("⏳ 正在同步到 GitHub...");

  try {
    var url = await syncToGitHub(editing, faqEditing);
    showToast("✓ 已同步！刷新其他设备即可看到更新");
  } catch (e) {
    console.error("GitHub sync error:", e);
    showToast("同步失败: " + e.message);
  } finally {
    btn.disabled = false;
    btn.textContent = "保存并同步到 GitHub";
  }
});
