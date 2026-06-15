/* ============================================================
   PRISM X · 可互动背景
   紫色粒子网络：粒子缓慢漂移，鼠标靠近时被轻微排斥，
   并与光标之间连出光线 —— 像光线穿过棱镜被折射。
   尊重 prefers-reduced-motion。
   ============================================================ */

(function () {
  const canvas = document.getElementById("bg-canvas");
  if (!canvas) return;

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const ctx = canvas.getContext("2d");

  let W, H, dpr;
  let particles = [];
  const mouse = { x: -9999, y: -9999, active: false };

  const CONFIG = {
    density: 0.00008,      // 粒子数量 = 面积 × density
    maxParticles: 130,
    linkDist: 140,         // 粒子间连线距离
    mouseDist: 200,        // 鼠标连线 / 排斥距离
    speed: 0.25,
    colors: ["#7c3aed", "#8b5cf6", "#a78bfa", "#c4b5fd", "#67e8f9"]
  };

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    canvas.style.width = W + "px";
    canvas.style.height = H + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    initParticles();
  }

  function initParticles() {
    const target = Math.min(Math.floor(W * H * CONFIG.density), CONFIG.maxParticles);
    particles = [];
    for (let i = 0; i < target; i++) {
      particles.push({
        x: Math.random() * W,
        y: Math.random() * H,
        vx: (Math.random() - 0.5) * CONFIG.speed,
        vy: (Math.random() - 0.5) * CONFIG.speed,
        r: Math.random() * 1.6 + 0.6,
        c: CONFIG.colors[Math.floor(Math.random() * CONFIG.colors.length)]
      });
    }
  }

  function step() {
    ctx.clearRect(0, 0, W, H);

    for (const p of particles) {
      // 鼠标轻微排斥
      if (mouse.active) {
        const dx = p.x - mouse.x;
        const dy = p.y - mouse.y;
        const d = Math.hypot(dx, dy);
        if (d < CONFIG.mouseDist && d > 0.001) {
          const force = (CONFIG.mouseDist - d) / CONFIG.mouseDist * 0.035;
          p.vx += (dx / d) * force;
          p.vy += (dy / d) * force;
        }
      }

      // 速度阻尼，避免越跑越快
      p.vx *= 0.985;
      p.vy *= 0.985;
      // 保持最低漂移
      if (Math.abs(p.vx) < 0.05) p.vx += (Math.random() - 0.5) * 0.02;
      if (Math.abs(p.vy) < 0.05) p.vy += (Math.random() - 0.5) * 0.02;

      p.x += p.vx;
      p.y += p.vy;

      if (p.x < -20) p.x = W + 20;
      if (p.x > W + 20) p.x = -20;
      if (p.y < -20) p.y = H + 20;
      if (p.y > H + 20) p.y = -20;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = p.c;
      ctx.globalAlpha = 0.55;
      ctx.fill();
      ctx.globalAlpha = 1;
    }

    // 粒子间连线
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const a = particles[i], b = particles[j];
        const dx = a.x - b.x, dy = a.y - b.y;
        const d = dx * dx + dy * dy;
        const max = CONFIG.linkDist * CONFIG.linkDist;
        if (d < max) {
          const alpha = (1 - d / max) * 0.14;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.strokeStyle = "rgba(139, 92, 246," + alpha + ")";
          ctx.lineWidth = 0.7;
          ctx.stroke();
        }
      }
      // 鼠标"折射"光线
      if (mouse.active) {
        const p = particles[i];
        const dx = p.x - mouse.x, dy = p.y - mouse.y;
        const d = Math.hypot(dx, dy);
        if (d < CONFIG.mouseDist) {
          const alpha = (1 - d / CONFIG.mouseDist) * 0.35;
          ctx.beginPath();
          ctx.moveTo(mouse.x, mouse.y);
          ctx.lineTo(p.x, p.y);
          ctx.strokeStyle = "rgba(167, 139, 250," + alpha + ")";
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
      }
    }

    requestAnimationFrame(step);
  }

  function drawStatic() {
    // 减少动态偏好：只画一帧静态星点
    ctx.clearRect(0, 0, W, H);
    for (const p of particles) {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = p.c;
      ctx.globalAlpha = 0.4;
      ctx.fill();
      ctx.globalAlpha = 1;
    }
  }

  window.addEventListener("resize", () => {
    resize();
    if (reduceMotion) drawStatic();
  });
  window.addEventListener("pointermove", (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    mouse.active = true;
  });
  window.addEventListener("pointerleave", () => { mouse.active = false; });
  document.addEventListener("mouseleave", () => { mouse.active = false; });

  resize();
  if (reduceMotion) {
    drawStatic();
  } else {
    requestAnimationFrame(step);
  }
})();
