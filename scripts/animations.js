/* =============================================================
   动态叙事与交互 动效引擎（animations.js）
   纯原生 JavaScript / Canvas 实现：
   1. 顶部滚动进度条
   2. 首屏打字机叙事
   3. IntersectionObserver 视差卡片渐入（fade-slide-up）
   4. 彩带粒子（Confetti）+ 气泡反馈（复制邮箱 / 打招呼）
   说明：
   - 渐入初始隐藏态由本脚本动态添加，未执行时元素保持可见（零白屏）。
   - 全部使用 transform/opacity + rAF，保持 60fps，避免重排。
   - 尊重 prefers-reduced-motion。
   ============================================================= */
(function () {
  "use strict";

  const prefersReducedMotion =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* rAF 节流：把滚动回调合并到每帧一次，避免抖动 */
  function rafThrottle(fn) {
    let ticking = false;
    return function (arg) {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(function () {
        fn(arg);
        ticking = false;
      });
    };
  }

  /* =============================================================
     1. 顶部全局滚动进度条（JS 注入，无需改 HTML）
     ============================================================= */
  function initScrollProgress() {
    const bar = document.createElement("div");
    bar.className = "scroll-progress";
    bar.setAttribute("aria-hidden", "true");
    document.body.appendChild(bar);

    function update() {
      const doc = document.documentElement;
      const scrollTop = window.pageYOffset || doc.scrollTop || 0;
      const max = doc.scrollHeight - doc.clientHeight;
      const ratio = max > 0 ? scrollTop / max : 0;
      bar.style.width = Math.min(ratio * 100, 100) + "%";
    }
    window.addEventListener("scroll", rafThrottle(update), { passive: true });
    window.addEventListener("resize", rafThrottle(update));
    update();
  }

  /* =============================================================
     2. 首屏打字机叙事（循环平滑打出身份关键词）
     仅当存在 #typewriterText 时运行（首页）
     ============================================================= */
  function initTypewriter() {
    const el = document.getElementById("typewriterText");
    if (!el) return;

    // 团队定位关键词（保留现有文案风格）
    const phrases = [
      "生物医学数据分析",
      "医学影像智能处理",
      "多组学特征融合",
      "机器学习与精准医疗",
    ];
    const TYPE_SPEED = 110;   // 打字速度
    const ERASE_SPEED = 55;   // 删除速度
    const HOLD_TIME = 1500;   // 完整词停留
    const GAP_TIME = 350;     // 删空后停顿

    let idx = 0;
    let len = 0;
    let deleting = false;

    // 减少动效时：直接静态展示第一个词，不循环
    if (prefersReducedMotion) {
      el.textContent = phrases[0];
      return;
    }

    function tick() {
      const word = phrases[idx];
      if (!deleting) {
        len++;
        el.textContent = word.slice(0, len);
        if (len === word.length) {
          deleting = true;
          window.setTimeout(tick, HOLD_TIME);
          return;
        }
        window.setTimeout(tick, TYPE_SPEED);
      } else {
        len--;
        el.textContent = word.slice(0, len);
        if (len === 0) {
          deleting = false;
          idx = (idx + 1) % phrases.length;
          window.setTimeout(tick, GAP_TIME);
          return;
        }
        window.setTimeout(tick, ERASE_SPEED);
      }
    }
    tick();
  }

  /* =============================================================
     3. 视差卡片渐入（IntersectionObserver + fade-slide-up）
     自动识别常见卡片，无需逐个加 class；含 stagger 顺序延迟
     ============================================================= */
  function initReveal() {
    const SELECTORS = [
      ".acad-item",
      ".news-item",
      ".contact-band",
      ".quick-list li",
      ".content-card",
      ".dir-card",
      ".member-card",
      ".list-item",
      ".dl-item",
      ".contact-item",
    ];
    const nodes = [];
    SELECTORS.forEach(function (sel) {
      document.querySelectorAll(sel).forEach(function (el) {
        nodes.push(el);
      });
    });
    if (!nodes.length) return;

    // 无 IntersectionObserver 或减少动效：保持可见，直接返回
    if (!("IntersectionObserver" in window) || prefersReducedMotion) {
      return;
    }

    // 先加初始隐藏态（JS 已执行，安全），并按父容器内序号设置 stagger 延迟
    nodes.forEach(function (el) {
      el.classList.add("reveal-init");
      const parent = el.parentElement;
      if (parent) {
        const siblings = Array.prototype.slice.call(parent.children);
        const i = siblings.indexOf(el);
        el.style.transitionDelay = Math.min(i * 90, 450) + "ms";
      }
    });

    const io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("reveal-in");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );
    nodes.forEach(function (el) {
      io.observe(el);
    });
  }

  /* =============================================================
     4. 彩带粒子（Confetti）+ 气泡反馈
     ============================================================= */
  const CONFETTI_COLORS = [
    "#22d3ee", "#34d399", "#f472b6", "#fbbf24",
    "#60a5fa", "#a78bfa", "#f87171", "#ffffff",
  ];

  let confettiCanvas = null;
  let confettiCtx = null;

  function ensureCanvas() {
    if (confettiCanvas) return;
    confettiCanvas = document.createElement("canvas");
    confettiCanvas.className = "confetti-canvas";
    confettiCanvas.setAttribute("aria-hidden", "true");
    document.body.appendChild(confettiCanvas);
    confettiCtx = confettiCanvas.getContext("2d");
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
  }

  function resizeCanvas() {
    if (!confettiCanvas) return;
    confettiCanvas.width = window.innerWidth;
    confettiCanvas.height = window.innerHeight;
  }

  /* 在 (x, y) 处发射一波彩带粒子 */
  function fireConfetti(x, y) {
    if (prefersReducedMotion) return;
    ensureCanvas();
    const COUNT = 90;
    const particles = [];
    for (let i = 0; i < COUNT; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 4 + Math.random() * 6;
      particles.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 3,
        w: 6 + Math.random() * 6,
        h: 8 + Math.random() * 8,
        color: CONFETTI_COLORS[(Math.random() * CONFETTI_COLORS.length) | 0],
        rot: Math.random() * Math.PI,
        vr: (Math.random() - 0.5) * 0.3,
        life: 1,
        decay: 0.012 + Math.random() * 0.008,
      });
    }

    function frame() {
      confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
      let alive = false;
      particles.forEach(function (p) {
        if (p.life <= 0) return;
        alive = true;
        p.vy += 0.18; // 重力
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.985; // 阻力
        p.rot += p.vr;
        p.life -= p.decay;
        confettiCtx.save();
        confettiCtx.globalAlpha = Math.max(p.life, 0);
        confettiCtx.translate(p.x, p.y);
        confettiCtx.rotate(p.rot);
        confettiCtx.fillStyle = p.color;
        confettiCtx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        confettiCtx.restore();
      });
      if (alive) {
        window.requestAnimationFrame(frame);
      } else {
        confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
      }
    }
    window.requestAnimationFrame(frame);
  }

  /* 在 (x, y) 处弹出气泡反馈 */
  function showBubble(text, x, y) {
    const bubble = document.createElement("div");
    bubble.className = "feedback-bubble";
    bubble.textContent = text;
    bubble.setAttribute("role", "status");
    bubble.style.left = x + "px";
    bubble.style.top = y - 14 + "px";
    document.body.appendChild(bubble);
    window.setTimeout(function () {
      if (bubble.parentNode) bubble.parentNode.removeChild(bubble);
    }, 1400);
  }

  /* 复制邮箱（含降级）+ 彩带 + 气泡 */
  function copyEmail(email) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(email).then(function () {
        return true;
      }).catch(function () {
        return legacyCopy(email);
      });
    }
    return Promise.resolve(legacyCopy(email));
  }

  function legacyCopy(text) {
    try {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.setAttribute("readonly", "");
      ta.style.position = "absolute";
      ta.style.left = "-9999px";
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand("copy");
      document.body.removeChild(ta);
      return ok;
    } catch (e) {
      return false;
    }
  }

  /* 绑定联系动作按钮（复制邮箱 / 打招呼） */
  function initContactActions() {
    const copyBtn = document.getElementById("copyEmailBtn");
    const hiBtn = document.getElementById("sayHiBtn");

    if (copyBtn) {
      copyBtn.addEventListener("click", function (e) {
        const email = copyBtn.getAttribute("data-email") || "team@scwl.edu.cn";
        const x = e.clientX;
        const y = e.clientY;
        copyEmail(email).then(function (ok) {
          fireConfetti(x, y);
          showBubble(ok ? "邮箱已复制 ✓ " + email : "复制失败，请手动复制", x, y);
        });
      });
    }

    if (hiBtn) {
      hiBtn.addEventListener("click", function (e) {
        fireConfetti(e.clientX, e.clientY);
        showBubble("👋 你好！欢迎与团队交流", e.clientX, e.clientY);
      });
    }
  }

  /* =============================================================
     启动
     ============================================================= */
  function init() {
    initScrollProgress();
    initTypewriter();
    initReveal();
    initContactActions();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
