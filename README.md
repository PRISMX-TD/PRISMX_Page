# PRISM X · 棱镜量化

黑暗风格 · 金融 × 科技 · 黑色为主、紫色点缀的量化交易团队官网。
纯静态网站（HTML / CSS / 原生 JS），零依赖、零构建，可直接上传 GitHub 并用 GitHub Pages 免费托管。

## ✨ 功能

- **可互动背景**：紫色粒子网络，粒子随鼠标排斥、与光标连出"折射光线"（自动适配 `prefers-reduced-motion`）
- **棱镜签名动画**：首屏棱镜将白光折射为五色光谱，光束随鼠标轻微偏转，对应五大核心理念
- **核心理念**：Precision / Risk-First / Intelligence / Stability / Multi-Strategy 五张光谱卡片
- **团队时间线**：2017 – 2025 发展历程
- **账户追踪**：实盘账户卡片（收益率、年化、最大回撤、净值、状态、第三方验证链接）
- **管理控制台**（`admin.html`）：密码登录后可视化编辑所有账户数据，支持新增 / 删除 / 一键导出 `data.js`
- 响应式布局，移动端适配；键盘焦点可见

## 📂 目录结构

```
prism-x/
├── index.html          # 主页
├── admin.html          # 管理控制台（密码保护）
├── hero-lab.html       # 实验室 I：10 套右侧视觉方案
├── hero-lab2.html      # 实验室 II：20 套完整首屏布局（L1–L20）
├── hero-lab3.html      # 实验室 III：报价墙 20 个发散方向（Q1–Q20）
├── hero-lab4.html      # 实验室 IV：数据×文字平衡的 20 种策略（R1–R20）
├── hero-lab5.html      # 实验室 V：6 种设计流派（S1–S6）
├── hero-lab6.html      # 实验室 VI：20 个独立概念世界（W1–W20）
├── hero-lab7.html      # 实验室 VII：克制报价墙 20 版（D1–D20）
├── hero-lab8.html      # 实验室 VIII：报价墙×互动背景平衡 20 版（F1–F20）
├── hero-lab9.html      # 实验室 IX：结构差异 20 版（G1–G20，标题位置×数据形态×切分，完整框架）
├── css/
│   ├── style.css       # 全站样式 + 设计令牌
│   └── admin.css       # 管理页样式
├── js/
│   ├── data.js         # ★ 账户默认数据（所有访客可见的数据源）
│   ├── background.js   # 可互动粒子背景
│   ├── main.js         # 主页交互 + 账户渲染
│   └── admin.js        # 管理页逻辑（登录 / 编辑 / 导出）
└── README.md
```

> 🎨 **hero-lab.html**：V1–V10，10 种右侧视觉方案（保持原布局）。
> 🎨 **hero-lab2.html**：L1–L20，20 套完整首屏版式（布局/排版/动效全部重构）。
> 🎨 **hero-lab3.html**：Q1–Q20，报价墙 20 个发散方向（聚光灯/数据雨/文字雕刻/订单簿/热力图…）。
> 🎨 **hero-lab4.html**：R1–R20，专攻"数据墙不压文字"的 20 种平衡策略。核心机制：墙体实时测量文案区块位置并按几何距离平滑退避，任何屏幕尺寸下文字区永远干净。选定后告知开发者整合进 index.html。

## 🚀 本地预览

> **⚠️ 打开后如果是白底、没有任何样式？**
> 说明 `css/style.css` 没有被加载，99% 是因为：
> 1. **直接在压缩包里双击了 index.html**（系统只解压这一个文件，css/ js/ 文件夹没跟过去）→ 请先把整个压缩包**完整解压**到一个文件夹，再打开其中的 index.html；
> 2. 解压后移动了 index.html，没有连同 `css/`、`js/` 文件夹一起移动 → 三者必须保持在同一目录结构下。
>
> 现在页面内置了检测：样式加载失败时顶部会出现紫色提示条说明原因。

直接双击（完整解压后的）`index.html` 即可打开；或在目录下启动任意静态服务器：

```bash
# Python
python3 -m http.server 8000
# 或 Node
npx serve .
```

## 🌐 部署到 GitHub Pages

1. 新建 GitHub 仓库，把本目录所有文件推送上去：
   ```bash
   git init
   git add .
   git commit -m "PRISM X website"
   git branch -M main
   git remote add origin https://github.com/<你的用户名>/<仓库名>.git
   git push -u origin main
   ```
2. 仓库 → **Settings → Pages** → Source 选择 `main` 分支根目录 → 保存。
3. 几分钟后即可通过 `https://<用户名>.github.io/<仓库名>/` 访问。

## 🔐 管理控制台

- 入口：导航栏右侧「管理入口」，或直接访问 `admin.html`
- **默认密码：`prismx2025`**（部署前务必修改）

### 修改密码

1. 打开 `admin.html` 页面，按 F12 打开浏览器控制台，运行：
   ```js
   sha256Hex("你的新密码").then(console.log)
   ```
2. 复制输出的 64 位哈希，替换 `js/admin.js` 顶部的 `PASSWORD_HASH` 值。

### 数据如何更新（重要）

这是纯静态网站，没有后端数据库，数据流转方式如下：

1. 在管理页编辑并点击「保存全部更改」→ 数据写入**当前浏览器**的 localStorage，本机主页立即生效；
2. 点击「**导出 data.js**」→ 下载包含最新数据的 `data.js`；
3. 用它替换仓库中的 `js/data.js` 并 `git push` → **所有访客**都能看到更新。

## ⚠️ 安全说明

`admin.html` 的密码校验在前端完成（SHA-256 哈希比对），它的作用是**防止普通访客误入编辑页**，
无法防御懂技术的人查看源码或直接修改自己浏览器的数据（且别人改的数据只存在于他自己的浏览器里，
不会影响你发布的 `data.js`）。请勿在本项目中存放任何敏感信息；如需真正的后台权限控制，
需配合后端服务（如 Cloudflare Workers / Supabase / 自建 API）。

## 📜 License

自由使用、修改与部署。
