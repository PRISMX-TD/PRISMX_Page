/* ============================================================
   PRISM X · GitHub 同步模块
   ------------------------------------------------------------
   将 data.js（账户 + FAQ）推送到 GitHub 仓库。
   首次使用需在管理后台输入 Token（仅保存在 sessionStorage）。
   ============================================================ */

const GH_OWNER = "PRISMX-TD";
const GH_REPO  = "PRISMX_Page";
const GH_BRANCH = "main";
const GH_PATH  = "js/data.js";
const GH_TOKEN_KEY = "prismx_gh_token";

function getGitHubToken() {
  return sessionStorage.getItem(GH_TOKEN_KEY);
}

function setGitHubToken(token) {
  sessionStorage.setItem(GH_TOKEN_KEY, token);
}

function hasGitHubToken() {
  return !!getGitHubToken();
}

/* 构建完整的 data.js 文件内容 */
function buildDataJS(accounts, faq, version) {
  version = version || 1;
  var header =
    "/* ============================================================\n" +
    "   PRISM X · 数据（由管理控制台导出）\n" +
    "   导出时间：" + new Date().toLocaleString() + "\n" +
    "   数据版本：" + version + "\n" +
    "   本文件由管理后台自动推送至 GitHub。\n" +
    "   ============================================================ */\n\n" +
    "const DATA_VERSION = " + version + ";\n" +
    'const PRISM_STORAGE_KEY = "prismx_accounts_v1";\n\n' +
    "const DEFAULT_ACCOUNTS = ";
  var mid =
    ";\n\n/* ---------- 共享读写函数 ---------- */\n\n" +
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
  var footer =
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

  return header + JSON.stringify(accounts, null, 2) + mid + JSON.stringify(faq, null, 2) + footer;
}

/* 同步到 GitHub */
async function syncToGitHub(accounts, faq, version) {
  var token = getGitHubToken();
  if (!token) throw new Error("请先设置 GitHub Token");

  var content = buildDataJS(accounts, faq, version);
  var contentB64 = btoa(unescape(encodeURIComponent(content)));
  var apiBase = "https://api.github.com/repos/" + GH_OWNER + "/" + GH_REPO;

  /* 1. 先获取文件当前 SHA */
  var getResp = await fetch(apiBase + "/contents/" + GH_PATH, {
    headers: { "Authorization": "token " + token }
  });

  var sha = null;
  if (getResp.ok) {
    var data = await getResp.json();
    sha = data.sha;
  } else if (getResp.status !== 404) {
    var errBody = "";
    try { errBody = await getResp.text(); } catch (e) { }
    throw new Error("获取文件信息失败 (HTTP " + getResp.status + ")\n" + errBody);
  }

  /* 2. 提交更新 */
  var commitMsg = "admin: update data.js (" + new Date().toISOString().slice(0, 19).replace("T", " ") + ")";
  var putBody = {
    message: commitMsg,
    content: contentB64,
    branch: GH_BRANCH
  };
  if (sha) putBody.sha = sha;

  var putResp = await fetch(apiBase + "/contents/" + GH_PATH, {
    method: "PUT",
    headers: {
      "Authorization": "token " + token,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(putBody)
  });

  if (!putResp.ok) {
    var putErr = "";
    try { putErr = await putResp.text(); } catch (e) { }
    if (putResp.status === 401) {
      throw new Error("Token 无效或已过期，请重新设置。");
    } else if (putResp.status === 409 && !sha) {
      throw new Error("文件冲突，请刷新后重试。");
    }
    throw new Error("同步失败 (HTTP " + putResp.status + ")\n" + putErr);
  }

  var result = await putResp.json();
  return result.content.html_url;
}
