/* ============================================================
   PRISM X · 数据
   ------------------------------------------------------------
   数据版本号 DATA_VERSION 用于跨设备自动同步：
   每次管理员同步到 GitHub 后版本号 +1，
   访客端检测到新版本即自动更新。
   ============================================================ */

const DATA_VERSION = 1;
const PRISM_STORAGE_KEY = "prismx_accounts_v1";

const DEFAULT_ACCOUNTS = [
  {
    "id": "acct-aurora",
    "name": "Aurora · 高稳定型",
    "strategy": "PRISM-STABLE EA v3.2",
    "status": "running",
    "broker": "Make Capital",
    "startDate": "2024-03-01",
    "balance": "125,800 USD",
    "totalReturn": 28.6,
    "annualReturn": 19.4,
    "maxDrawdown": 6.8,
    "description": "以稳定为第一需求的旗舰策略，优先控制回撤，适合追求长期复利的投资者。",
    "link": ""
  },
  {
    "id": "acct-1781541344065",
    "name": "新账户",
    "strategy": "1111",
    "status": "running",
    "broker": "Make Capital",
    "startDate": "2026-06-15",
    "balance": "48,200 USD",
    "totalReturn": 55,
    "annualReturn": 556,
    "maxDrawdown": 0,
    "description": "",
    "link": ""
  }
];

/* ---------- 共享读写函数 ---------- */

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

const FAQ_STORAGE_KEY = "prismx_faq_v1";

const DEFAULT_FAQ = [
  {
    "q": "我的资金安全吗？由谁保管？",
    "a": "资金存放在你<strong>本人名下、受监管经纪商</strong>的交易账户中，出入金由你本人操作，我们不接触你的本金。具体请以你与经纪商签署的协议为准。"
  },
  {
    "q": "需要多少资金起步？",
    "a": "不同策略对应不同的建议起始资金与风险等级。请联系我们，我们会根据你的风险承受能力给出匹配建议，而不是一刀切。"
  },
  {
    "q": "收益有保证吗？会不会亏损？",
    "a": "没有任何策略能保证盈利。量化与杠杆交易<strong>存在亏损本金的风险</strong>，历史表现不代表未来收益。我们能做的，是用规则化执行与多重风控把回撤控制在合理范围，并对你完全透明。"
  },
  {
    "q": "数据是真实的吗？能验证吗？",
    "a": "账户追踪展示的是实盘数据，包含回撤等完整表现。如对应账户提供了第三方验证链接（如 Myfxbook / FXBlue），可直接点击核验。"
  },
  {
    "q": "怎么开始？麻烦吗？",
    "a": "见上方「如何开始」三步：了解咨询 → 开通你本人的账户并接入策略 → 实时跟踪复盘。整个过程公开可控，任何阶段都可暂停或退出。"
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
