/* ============================================================
   PRISM X · 账户数据
   ------------------------------------------------------------
   DEFAULT_ACCOUNTS 是网站的"默认数据"，所有访客都能看到。
   管理员页面的修改保存在浏览器 localStorage 中（仅本机可见），
   在管理页点击「导出 data.js」即可下载新的本文件，
   将其替换并推送到 GitHub 后，所有访客即可看到最新数据。
   ============================================================ */

const PRISM_STORAGE_KEY = "prismx_accounts_v1";

const DEFAULT_ACCOUNTS = [
  {
    id: "acct-aurora",
    name: "Aurora · 高稳定型",
    strategy: "PRISM-STABLE EA v3.2",
    status: "running",            // running | paused | closed
    broker: "Make Capital",
    startDate: "2024-03-01",
    balance: "125,800 USD",
    totalReturn: 28.6,            // 累计收益率 %
    annualReturn: 19.4,           // 年化收益率 %
    maxDrawdown: 6.8,             // 最大回撤 %
    description: "以稳定为第一需求的旗舰策略，优先控制回撤，适合追求长期复利的投资者。",
    link: ""                      // 可选：Myfxbook / FXBlue 等第三方验证链接
  },
  {
    id: "acct-pulse",
    name: "Pulse · 高回报型",
    strategy: "PRISM-ALPHA EA v2.7",
    status: "running",
    broker: "Make Capital",
    startDate: "2024-08-15",
    balance: "48,200 USD",
    totalReturn: 64.2,
    annualReturn: 52.1,
    maxDrawdown: 18.3,
    description: "面向风险偏好者的进取型策略，在严格风控框架内追求更高收益弹性。",
    link: ""
  },
  {
    id: "acct-spectrum",
    name: "Spectrum · 多策略组合",
    strategy: "PRISM-MIX PORTFOLIO",
    status: "paused",
    broker: "Make Capital",
    startDate: "2025-01-10",
    balance: "86,500 USD",
    totalReturn: 11.9,
    annualReturn: 14.7,
    maxDrawdown: 4.2,
    description: "多策略分散组合，正在进行新一轮滚动优化与参数调校，近期将恢复运行。",
    link: ""
  }
];

/* ---------- 共享读写函数（index 与 admin 共用） ---------- */

function loadAccounts() {
  try {
    const raw = localStorage.getItem(PRISM_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.warn("读取本地账户数据失败，使用默认数据。", e);
  }
  return JSON.parse(JSON.stringify(DEFAULT_ACCOUNTS));
}

function saveAccounts(accounts) {
  localStorage.setItem(PRISM_STORAGE_KEY, JSON.stringify(accounts));
}

function resetAccounts() {
  localStorage.removeItem(PRISM_STORAGE_KEY);
}

/* ---------- FAQ 数据 ---------- */
const FAQ_STORAGE_KEY = "prismx_faq_v1";

const DEFAULT_FAQ = [
  {
    q: "我的资金安全吗？由谁保管？",
    a: "资金存放在你<strong>本人名下、受监管经纪商</strong>的交易账户中，出入金由你本人操作，我们不接触你的本金。具体请以你与经纪商签署的协议为准。"
  },
  {
    q: "需要多少资金起步？",
    a: "不同策略对应不同的建议起始资金与风险等级。请联系我们，我们会根据你的风险承受能力给出匹配建议，而不是一刀切。"
  },
  {
    q: "收益有保证吗？会不会亏损？",
    a: "没有任何策略能保证盈利。量化与杠杆交易<strong>存在亏损本金的风险</strong>，历史表现不代表未来收益。我们能做的，是用规则化执行与多重风控把回撤控制在合理范围，并对你完全透明。"
  },
  {
    q: "数据是真实的吗？能验证吗？",
    a: "账户追踪展示的是实盘数据，包含回撤等完整表现。如对应账户提供了第三方验证链接（如 Myfxbook / FXBlue），可直接点击核验。"
  },
  {
    q: "怎么开始？麻烦吗？",
    a: "见上方「如何开始」三步：了解咨询 → 开通你本人的账户并接入策略 → 实时跟踪复盘。整个过程公开可控，任何阶段都可暂停或退出。"
  }
];

function loadFAQ() {
  try {
    const raw = localStorage.getItem(FAQ_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.warn("读取 FAQ 数据失败，使用默认数据。", e);
  }
  return JSON.parse(JSON.stringify(DEFAULT_FAQ));
}

function saveFAQ(items) {
  localStorage.setItem(FAQ_STORAGE_KEY, JSON.stringify(items));
}

function resetFAQ() {
  localStorage.removeItem(FAQ_STORAGE_KEY);
}
