/* ============================================================
   PRISM X · 主页交互
   ============================================================ */

(function () {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- 导航 ---------- */
  const nav = document.getElementById("nav");
  const navToggle = document.getElementById("navToggle");
  const navLinks = document.getElementById("navLinks");

  window.addEventListener("scroll", () => {
    nav.classList.toggle("scrolled", window.scrollY > 30);
  }, { passive: true });

  if (navToggle) {
    navToggle.addEventListener("click", () => navLinks.classList.toggle("open"));
    navLinks.querySelectorAll("a").forEach((a) =>
      a.addEventListener("click", () => navLinks.classList.remove("open"))
    );
  }

  /* ---------- 滚动浮现 ---------- */
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) {
          en.target.classList.add("visible");
          observer.unobserve(en.target);
        }
      });
    },
    { threshold: 0.12 }
  );
  document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));

  /* ---------- 数字滚动 ---------- */
  function animateCount(el) {
    const target = parseInt(el.dataset.count, 10);
    if (reduceMotion || !target) { el.textContent = target; return; }
    const dur = 1200;
    const t0 = performance.now();
    function tick(t) {
      const p = Math.min((t - t0) / dur, 1);
      el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }
  const countObserver = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (en.isIntersecting) {
        animateCount(en.target);
        countObserver.unobserve(en.target);
      }
    });
  });
  document.querySelectorAll("[data-count]").forEach((el) => countObserver.observe(el));

  /* ---------- 顶部滚动进度条 ---------- */
  const progressBar = document.getElementById("scrollProgress");
  if (progressBar) {
    const updateProgress = () => {
      const h = document.documentElement;
      const max = h.scrollHeight - h.clientHeight;
      progressBar.style.width = (max > 0 ? (h.scrollTop / max) * 100 : 0) + "%";
    };
    window.addEventListener("scroll", updateProgress, { passive: true });
    updateProgress();
  }

  /* ---------- 首屏净值仪表盘（数据源自 data.js / 账户追踪） ---------- */
  /* ---------- 首屏 G17：边缘环数据（向中心多层渐隐）+ 互动粒子 ---------- */
  (function heroG17() {
    const hero = document.getElementById("heroG17");
    const wallCv = document.getElementById("heroWall");
    const bgCv = document.getElementById("heroParticles");
    const center = document.getElementById("heroCenter");
    if (!hero || !wallCv || !bgCv) return;

    const SYMS = ["XAU","EUR","GBP","BTC","NAS","US30","JPY","ETH","SPX","OIL","DAX","HSI"];
    function hashStr(s){let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619);}return h>>>0;}
    function mb32(a){return function(){a|=0;a=(a+0x6D2B79F5)|0;let t=Math.imul(a^(a>>>15),1|a);t=(t+Math.imul(t^(t>>>7),61|t))^t;return((t^(t>>>14))>>>0)/4294967296;};}
    const smooth = t => t<=0?0 : t>=1?1 : t*t*(3-2*t);
    const clamp = (v,a,b)=>Math.max(a,Math.min(b,v));

    let W=0, H=0, dpr=1;
    const wx = wallCv.getContext("2d");
    const bx = bgCv.getContext("2d");
    const mouse = { x:-9999, y:-9999, active:false };

    /* ---- 报价墙：边缘亮、向中心多层渐隐 ---- */
    let cells = [];
    function buildCells() {
      cells = [];
      const mobile = W < 760;
      const cw = mobile ? 96 : 122, ch = mobile ? 30 : 34;
      const cols = Math.ceil(W/cw)+1, rows = Math.ceil(H/ch)+1;
      const rnd = mb32(hashStr("g17hero"));
      for (let r=0;r<rows;r++) for (let c=0;c<cols;c++) {
        cells.push({
          x:c*cw+10, y:r*ch+20,
          sym: rnd()<0.62 ? SYMS[(rnd()*SYMS.length)|0] : null,
          v:(rnd()*9000+10).toFixed(2),
          up: rnd()>0.5, flash:0,
          base: (mobile ? 0.24 : 0.30)*(0.55+rnd()*0.7), rseed: rnd()
        });
      }
    }

    /* 多层径向渐隐：越靠中心越透明，分多档平滑过渡，中心大留白；顶部导航区留空 */
    function edgeFactor(x, y) {
      // 归一化到以中心为原点的椭圆半径（0=正中心，~1=画面边缘）
      // 横向收紧（0.46）让报价板向两侧铺得更广；纵向 0.5
      const nx = (x - W/2) / (W*0.46);
      const ny = (y - H/2) / (H*0.50);
      const d = Math.hypot(nx, ny);
      // 四层平滑叠加，制造层次分明的渐变；中心留白区扩大（起点 0.42）
      const L1 = smooth(clamp((d - 0.54) / 0.20, 0, 1)); // 核心大留白边界（更大）
      const L2 = smooth(clamp((d - 0.68) / 0.16, 0, 1)); // 第二层抬升
      const L3 = smooth(clamp((d - 0.80) / 0.14, 0, 1)); // 第三层
      const L4 = smooth(clamp((d - 0.90) / 0.14, 0, 1)); // 边缘最亮
      const layered = L1*0.26 + L2*0.24 + L3*0.24 + L4*0.46;
      let f = clamp(layered * (0.5 + 0.5*smooth(clamp((d-0.40)/0.5,0,1))), 0, 1.2);
      // 顶部导航区渐隐留空：y < 96px 完全清空，96–150px 平滑过渡
      const navFade = smooth(clamp((y - 96) / 54, 0, 1));
      return f * navFade;
    }

    function drawWall() {
      wx.clearRect(0,0,W,H);
      const n = reduceMotion ? 0 : 5;
      for (let i=0;i<n;i++){
        const cl = cells[(Math.random()*cells.length)|0];
        if(!cl) continue;
        cl.up = Math.random()<0.55;
        cl.v = (parseFloat(cl.v)*(1+(cl.up?1:-1)*Math.random()*0.003)).toFixed(2);
        cl.flash = 1;
      }
      wx.textAlign = "left";
      wx.font = "11.5px JetBrains Mono, monospace";
      for (const cl of cells) {
        if (cl.flash>0) cl.flash = Math.max(0, cl.flash-0.02);
        let a = cl.base * edgeFactor(cl.x, cl.y);
        // 鼠标邻近轻微点亮（互动）
        if (mouse.active) {
          const dm = Math.hypot(cl.x-mouse.x, cl.y-mouse.y);
          if (dm < 150) a += smooth(1-dm/150) * 0.5;
        }
        let col = null;
        if (cl.flash>0 && a>0.04) { col = cl.up?"rgba(122,212,140,":"rgba(212,130,130,"; a = Math.min(0.8, a+cl.flash*0.32); }
        if (a <= 0.015) continue;
        wx.fillStyle = col ? col+a+")" : "rgba(150,140,194,"+a+")";
        wx.fillText(cl.sym ? cl.sym+" "+cl.v : cl.v, cl.x, cl.y);
      }
    }

    /* ---- 互动粒子 ---- */
    let ps = [];
    function buildParticles() {
      ps = [];
      const count = Math.min(110, Math.floor(W*H*0.00007));
      const cols = ["#7c3aed","#8b5cf6","#a78bfa","#c4b5fd","#67e8f9"];
      const rnd = mb32(hashStr("g17p"));
      for (let i=0;i<count;i++) ps.push({
        x:rnd()*W, y:rnd()*H, vx:(rnd()-0.5)*0.3, vy:(rnd()-0.5)*0.3,
        r:1.2+rnd()*1.7, c:cols[(rnd()*5)|0]
      });
    }
    const LINK = 150, MOUSE_R = 200;
    function drawParticles() {
      bx.clearRect(0,0,W,H);
      for (const p of ps) {
        if (!reduceMotion) { p.x+=p.vx; p.y+=p.vy; }
        if (p.x<0||p.x>W) p.vx*=-1;
        if (p.y<0||p.y>H) p.vy*=-1;
        if (mouse.active) {
          const dm = Math.hypot(p.x-mouse.x, p.y-mouse.y);
          if (dm < MOUSE_R && dm > 0.1) {
            const f = 1-dm/MOUSE_R;
            p.x += (p.x-mouse.x)/dm*f*1.6;
            p.y += (p.y-mouse.y)/dm*f*1.6;
            bx.beginPath(); bx.moveTo(p.x,p.y); bx.lineTo(mouse.x,mouse.y);
            bx.strokeStyle = "rgba(167,139,250,"+(f*0.5)+")"; bx.lineWidth=1; bx.stroke();
          }
        }
        bx.beginPath(); bx.arc(p.x,p.y,p.r,0,Math.PI*2);
        bx.fillStyle = p.c; bx.globalAlpha = 0.85; bx.fill(); bx.globalAlpha = 1;
      }
      for (let i=0;i<ps.length;i++) for (let j=i+1;j<ps.length;j++){
        const a=ps[i], b=ps[j]; const d=Math.hypot(a.x-b.x,a.y-b.y);
        if (d<LINK){ bx.beginPath(); bx.moveTo(a.x,a.y); bx.lineTo(b.x,b.y);
          bx.strokeStyle="rgba(139,92,246,"+((1-d/LINK)*0.18)+")"; bx.lineWidth=1; bx.stroke(); }
      }
    }

    function size() {
      dpr = Math.min(window.devicePixelRatio||1, 2);
      const r = hero.getBoundingClientRect();
      W = r.width; H = r.height;
      [wallCv, bgCv].forEach(cv => {
        cv.width = W*dpr; cv.height = H*dpr;
        cv.getContext("2d").setTransform(dpr,0,0,dpr,0,0);
      });
      buildCells();
      buildParticles();
    }

    let raf1=null;
    function loop() {
      drawWall();
      drawParticles();
      raf1 = requestAnimationFrame(loop);
    }

    size();
    if (reduceMotion) { drawWall(); drawParticles(); }
    else loop();

    // 互动：鼠标 / 触摸
    hero.addEventListener("pointermove", (e) => {
      const r = hero.getBoundingClientRect();
      mouse.x = e.clientX - r.left;
      mouse.y = e.clientY - r.top;
      mouse.active = true;
    });
    hero.addEventListener("pointerleave", () => { mouse.active = false; mouse.x=-9999; mouse.y=-9999; });

    // 文案随鼠标轻微视差
    if (!reduceMotion && center) {
      hero.addEventListener("pointermove", (e) => {
        const r = hero.getBoundingClientRect();
        const nx = (e.clientX-r.left)/r.width - 0.5;
        const ny = (e.clientY-r.top)/r.height - 0.5;
        center.style.transform = "translate("+(nx*10)+"px,"+(ny*8)+"px)";
      });
      hero.addEventListener("pointerleave", () => { center.style.transform = ""; });
    }

    let rt;
    window.addEventListener("resize", () => { clearTimeout(rt); rt = setTimeout(size, 160); });
  })();

  /* ---------- 账户追踪渲染 ---------- */
  const STATUS_LABEL = {
    running: "运行中",
    paused: "暂停中",
    closed: "已结束"
  };

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }

  function fmtPct(v, signed) {
    if (v === "" || v == null || isNaN(v)) return "—";
    const n = Number(v);
    const sign = signed && n > 0 ? "+" : "";
    return sign + n.toFixed(1) + "%";
  }

  function renderAccounts() {
    const grid = document.getElementById("accountsGrid");
    if (!grid) return;
    const accounts = loadAccounts();

    if (!accounts.length) {
      grid.innerHTML = '<div class="accounts-empty">暂无运行中的账户 · 敬请期待</div>';
      return;
    }

    grid.innerHTML = accounts.map((a) => {
      const status = (a.status in STATUS_LABEL) ? a.status : "running";
      const ret = Number(a.totalReturn);
      const retCls = isNaN(ret) ? "" : ret >= 0 ? "pos" : "neg";
      return (
        '<article class="acct-card reveal visible">' +
          '<div class="acct-top">' +
            '<div class="acct-name">' + esc(a.name) + "</div>" +
            '<span class="acct-badge ' + status + '">' + STATUS_LABEL[status] + "</span>" +
          "</div>" +
          '<div class="acct-strategy">' + esc(a.strategy) + "</div>" +
          '<p class="acct-desc">' + esc(a.description) + "</p>" +
          '<div class="acct-stats">' +
            '<div class="acct-stat"><div class="v ' + retCls + '">' + fmtPct(a.totalReturn, true) + '</div><div class="k">累计收益率</div></div>' +
            '<div class="acct-stat"><div class="v">' + fmtPct(a.annualReturn, true) + '</div><div class="k">年化收益率</div></div>' +
            '<div class="acct-stat"><div class="v neg">' + (isNaN(Number(a.maxDrawdown)) || a.maxDrawdown === "" ? "—" : "-" + Math.abs(Number(a.maxDrawdown)).toFixed(1) + "%") + '</div><div class="k">最大回撤</div></div>' +
            '<div class="acct-stat"><div class="v">' + esc(a.balance || "—") + '</div><div class="k">账户净值</div></div>' +
          "</div>" +
          '<div class="acct-meta">' +
            "<span>" + esc(a.broker || "") + "</span>" +
            "<span>SINCE " + esc(a.startDate || "—") + "</span>" +
          "</div>" +
          (a.link
            ? '<a class="acct-link" href="' + esc(a.link) + '" target="_blank" rel="noopener noreferrer">查看第三方验证 →</a>'
            : "") +
        "</article>"
      );
    }).join("");
  }

  /* 跨设备自动同步：主动拉取最新版本号（绕过浏览器缓存） */
  (function () {
    var verKey = "prismx_data_version";
    var localVer = 0;
    try { localVer = Number(localStorage.getItem(verKey)) || 0; } catch (e) { }

    /* 先尝试用已加载的 data.js 快速比较 */
    if (typeof DATA_VERSION !== "undefined" && DATA_VERSION > localVer) {
      localStorage.removeItem("prismx_accounts_v1");
      localStorage.removeItem("prismx_faq_v1");
      localStorage.setItem(verKey, String(DATA_VERSION));
    }

    /* 再发网络请求拉最新 data.js（加时间戳绕过缓存），确保不遗漏远程更新 */
    var xhr = new XMLHttpRequest();
    xhr.open("GET", "js/data.js?t=" + Date.now(), true);
    xhr.onload = function () {
      if (xhr.status >= 200 && xhr.status < 300) {
        var m = xhr.responseText.match(/const DATA_VERSION\s*=\s*(\d+)/);
        if (m) {
          var remoteVer = parseInt(m[1], 10);
          if (remoteVer > localVer) {
            localStorage.removeItem("prismx_accounts_v1");
            localStorage.removeItem("prismx_faq_v1");
            localStorage.setItem(verKey, String(remoteVer));
            /* 如果本机已显示旧数据，刷新即可看到最新 */
            if (document.getElementById("accountsGrid")) {
              location.reload();
            }
          }
        }
      }
    };
    xhr.send();
  })();

  renderAccounts();

  /* ---------- 渲染 FAQ ---------- */
  function renderFAQ() {
    var faqList = document.getElementById("faqList");
    if (!faqList) return;
    var items = loadFAQ();
    if (!items || !items.length) { faqList.innerHTML = ""; return; }
    faqList.innerHTML = items.map(function (fa) {
      return '<details class="faq-item">' +
        '<summary>' + escHTML(fa.q) + '<span class="pm">+</span></summary>' +
        '<div class="faq-a-inner">' + fa.a + "</div>" +
      "</details>";
    }).join("");
  }

  function escHTML(str) {
    return String(str == null ? "" : str)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  renderFAQ();
})();
