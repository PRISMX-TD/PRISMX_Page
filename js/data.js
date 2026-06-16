/* ============================================================
   PRISM X · 数据（由管理控制台导出）
   导出时间：6/16/2026, 10:24:48 AM
   数据版本：2
   本文件由管理后台自动推送至 GitHub。
   ============================================================ */

const DATA_VERSION = 2;
const PRISM_STORAGE_KEY = "prismx_accounts_v1";

const DEFAULT_ACCOUNTS = [
  {
    "id": "acct-aurora",
    "name": "双线战斧",
    "strategy": "",
    "status": "running",
    "broker": "Make Capital",
    "startDate": "2021-03-08",
    "balance": "29823",
    "totalReturn": 1199.44,
    "annualReturn": "",
    "maxDrawdown": 30,
    "description": "作为长线稳健复利与大资金配置的压舱石，双线战斧专注于欧元/美元（EUR/USD）与美日（USD/JPY）的宏观大级别单边行情捕捉 。系统严格贯彻“一次一单”逻辑，坚决不扛单、绝不逆势加仓，并拥有连续 5 年的完整实盘与回测数据背书 。由于放弃了高频刷单与马丁加仓，其资金曲线不会完美平滑，必然伴随合理的战略性回撤，是专为具备长期投资视野的理性投资者打造的基石模型 。",
    "link": ""
  },
  {
    "id": "acct-1781541344065",
    "name": "海玛斯",
    "strategy": "",
    "status": "running",
    "broker": "Make Capital",
    "startDate": "2024-03-13",
    "balance": "137488",
    "totalReturn": 71.15,
    "annualReturn": "",
    "maxDrawdown": 7.88,
    "description": "定位于提供源源不断现金流引擎的【海玛斯】，是应对市场局部震荡行情的顶级流动性收割器 。该模型通过极具弹性的动态网格对冲覆盖机制，在缺乏明显单边趋势的现货黄金（XAU/USD）市场中，利用极高的开仓频率与资金利用率精准抓取局部空间的微小利润 。通过构建极其厚实的底层抗风险缓冲区，海玛斯在满足投资者对高频交易与资金流水渴望的同时，巧妙地化解了尾部波动风险，带来极具生命力的自动化资管体验",
    "link": ""
  },
  {
    "id": "acct-1781576303363",
    "name": "响尾蛇",
    "strategy": "",
    "status": "running",
    "broker": "Make Capital",
    "startDate": "2024-08-26",
    "balance": "33421",
    "totalReturn": 518.3,
    "annualReturn": "",
    "maxDrawdown": 23.6,
    "description": "作为长线资产配置中不可或缺的防御侧盾牌，【响尾蛇】利用棱镜量化独创的多因子指标组合验证机制，对现货黄金（XAU/USD）的进场信号进行着极其苛刻的自适应动能筛选 。系统摒弃了盲目出手的贪婪，会根据市场信号的共振强度动态调整每一次交易的手数暴露 。这是一款宁可牺牲交易频率也绝不妥协胜率的极度保守型避风港策略，主打在极端行情下的稳健长久存活能力，为您构建起坚不可摧的底层风控壁垒",
    "link": ""
  },
  {
    "id": "acct-1781576362988",
    "name": "地狱火",
    "strategy": "",
    "status": "running",
    "broker": "Make Capital",
    "startDate": "2024-08-26",
    "balance": "",
    "totalReturn": 1127.04,
    "annualReturn": "",
    "maxDrawdown": 26.9,
    "description": "专为展现硬核技术肌肉而生的【地狱火】模型，是现货黄金（XAU/USD）市场中极具杀伤力的微观套利引擎 。系统依托毫秒级的进出场算法，精准猎杀特定时间窗口内的微观动量突破，单均持仓通常以秒计算，实现真正的快进快出 。该策略对底层交易环境的点差与网络延迟有着极度严苛的要求，完全建立在纯粹的大数法则之上，用极致的交易频率和微观正期望值构建概率壁垒，在瞬息万变的市场微观结构中为您的账户捕捉极速红利",
    "link": ""
  },
  {
    "id": "acct-1781576435158",
    "name": "矩阵",
    "strategy": "",
    "status": "running",
    "broker": "Make Capital",
    "startDate": "2024-03-14",
    "balance": "4672",
    "totalReturn": 2013.5,
    "annualReturn": "",
    "maxDrawdown": 5.7,
    "description": "作为棱镜量化专门针对全球最大流动性池欧元/美元（EUR/USD）打造的综合性算法中枢，【矩阵】彻底摒弃了单线模型作战的局限性。系统在底层深度融合了多套互不相关的量化交易逻辑，通过多维度的信号共振与微观结构解析，实现对不同市场周期的无缝覆盖。我们不再将资金的命运押注于单一的行情特征，而是利用多策略内部的负相关性，巧妙对冲掉单一逻辑在特定极端环境下的失效风险。这套集大成的复合引擎，用极致的算法协同为您过滤掉市场的无序噪音，刻画出一条极具生命力与抗打击能力的复利曲线，是真正意义上面向复杂行情的全天候资产配置解决方案",
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
