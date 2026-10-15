/* =============================================================
   四川文理学院 信息与生物医学交叉创新团队
   原生 JS：轮播 + 移动端侧边抽屉 + 导航高亮 + MORE 占位跳转
   说明：使用 const/let、IIFE 避免全局污染，含边界处理。
   ============================================================= */
(function () {
  "use strict";

  /* =============================================================
     轮播图 Banner
     ============================================================= */
  function initBanner() {
    const viewport = document.getElementById("bannerViewport");
    const dotsWrap = document.getElementById("bannerDots");

    if (!viewport || !dotsWrap) return;

    const slides = Array.prototype.slice.call(
      viewport.querySelectorAll(".banner-slide")
    );
    const slideCount = slides.length;
    if (slideCount === 0) return;

    let current = 0;
    let timer = null;
    const INTERVAL = 6000; // 自动轮播间隔 6s（配合底图缓推，更从容）

    // 生成底部指示器（button 可聚焦，满足键盘可达）
    slides.forEach(function (_, i) {
      const dot = document.createElement("button");
      dot.type = "button";
      dot.className = "banner-dot";
      dot.setAttribute("role", "tab");
      dot.setAttribute("aria-label", "第 " + (i + 1) + " 张，共 " + slideCount + " 张");
      dot.addEventListener("click", function () {
        goTo(i);
        restart();
      });
      dotsWrap.appendChild(dot);
    });

    const dots = Array.prototype.slice.call(
      dotsWrap.querySelectorAll(".banner-dot")
    );

    // 线描塔标（西大式轮转小图标）：每页切换时旋转 + 重描
    let dotsIcon = null;
    if (!document.getElementById("dotsIcon")) {
      const NS = "http://www.w3.org/2000/svg";
      dotsIcon = document.createElementNS(NS, "svg");
      dotsIcon.setAttribute("id", "dotsIcon");
      dotsIcon.setAttribute("class", "dots-ico");
      dotsIcon.setAttribute("viewBox", "0 0 40 48");
      dotsIcon.setAttribute("aria-hidden", "true");
      dotsIcon.innerHTML =
        '<g fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round">' +
        '<path d="M 20 12 L 20 8"/>' +
        '<circle cx="20" cy="6" r="2.4"/>' +
        '<path d="M 14 13 Q 20 9.5 26 13"/>' +
        '<path d="M 12 19 Q 20 15.5 28 19"/>' +
        '<path d="M 10 25 Q 20 21.5 30 25"/>' +
        '<path d="M 8 31 Q 20 27.5 32 31"/>' +
        '<path d="M 6 37 Q 20 33.5 34 37"/>' +
        '<path d="M 9 41 L 31 41 L 33 45 L 7 45 Z"/>' +
        "</g>";
      dotsWrap.appendChild(dotsIcon);
    } else {
      dotsIcon = document.getElementById("dotsIcon");
    }

    function goTo(i) {
      current = (i + slideCount) % slideCount;
      slides.forEach(function (slide, si) {
        const isActive = si === current;
        slide.classList.toggle("active", isActive);
        if (dots[si]) {
          dots[si].classList.toggle("active", isActive);
          dots[si].setAttribute("aria-selected", isActive ? "true" : "false");
        }
      });
      // 西大式：指示条末端线描塔标随换页轮转重描
      if (dotsIcon) {
        dotsIcon.classList.remove("is-spin");
        void dotsIcon.getBoundingClientRect();
        dotsIcon.classList.add("is-spin");
      }
    }

    function next() {
      goTo(current + 1);
    }

    function restart() {
      stop();
      dotsWrap.classList.remove("paused");
      timer = window.setInterval(next, INTERVAL);
    }

    function stop() {
      dotsWrap.classList.add("paused");
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    // 左右箭头主动切换（默认仍自动播放，操作后重置计时）
    const prevBtn = document.getElementById("bannerPrev");
    const nextBtn = document.getElementById("bannerNext");
    if (prevBtn) {
      prevBtn.addEventListener("click", function () {
        goTo(current - 1);
        restart();
      });
    }
    if (nextBtn) {
      nextBtn.addEventListener("click", function () {
        goTo(current + 1);
        restart();
      });
    }

    // 鼠标悬停暂停（离开后自动恢复播放）
    viewport.addEventListener("mouseenter", stop);
    viewport.addEventListener("mouseleave", restart);

    // 标签页可见性变化时避免后台空转
    document.addEventListener("visibilitychange", function () {
      if (document.hidden) stop();
      else restart();
    });

    goTo(0);
    restart();
  }

  /* =============================================================
     新闻头条轮播：左大图自动切换 + 计数环
     ============================================================= */
  function initNewsFeature() {
    const feature = document.getElementById("newsFeature");
    if (!feature) return;

    const slides = Array.prototype.slice.call(
      feature.querySelectorAll(".nf-slide")
    );
    const idxEl = document.getElementById("nfIdx");
    if (slides.length === 0) return;

    let current = 0;
    let timer = null;
    const INTERVAL = 5000;

    function show(i) {
      current = (i + slides.length) % slides.length;
      slides.forEach(function (slide, si) {
        slide.classList.toggle("active", si === current);
      });
      if (idxEl) idxEl.textContent = String(current + 1);
    }

    function start() {
      stop();
      feature.classList.remove("paused");
      timer = window.setInterval(function () {
        show(current + 1);
      }, INTERVAL);
    }

    function stop() {
      feature.classList.add("paused");
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    feature.addEventListener("mouseenter", stop);
    feature.addEventListener("mouseleave", start);
    document.addEventListener("visibilitychange", function () {
      if (document.hidden) stop();
      else start();
    });

    show(0);
    start();
  }

  /* =============================================================
     走进团队：三色立体板块（悬停/点击/键盘横向展开）
     ============================================================= */
  function initFocusPanels() {
    const band = document.getElementById("focusBand");
    if (!band) return;

    const panels = Array.prototype.slice.call(
      band.querySelectorAll(".focus-panel")
    );
    if (panels.length === 0) return;

    function activate(target) {
      panels.forEach(function (panel) {
        const isActive = panel === target;
        panel.classList.toggle("active", isActive);
        panel.setAttribute("aria-expanded", isActive ? "true" : "false");
      });
    }

    panels.forEach(function (panel) {
      panel.addEventListener("click", function (e) {
        // 已展开面板内的链接正常跳转
        if (panel.classList.contains("active") && e.target.closest("a")) return;
        activate(panel);
      });
      panel.addEventListener("keydown", function (e) {
        if (e.key !== "Enter" && e.key !== " ") return;
        if (e.target.closest("a")) return;
        e.preventDefault();
        activate(panel);
      });
      if (window.matchMedia("(hover: hover)").matches) {
        panel.addEventListener("mouseenter", function () {
          activate(panel);
        });
      }
    });
  }

  /* =============================================================
     移动端侧边抽屉导航
     ============================================================= */
  function initSidebar() {
    const sidebar = document.getElementById("sidebar");
    const overlay = document.getElementById("sidebarOverlay");
    const toggle = document.getElementById("sidebarToggle");
    const closeBtn = document.getElementById("sidebarClose");

    if (!sidebar || !overlay) return;

    function openSidebar() {
      sidebar.classList.add("open");
      overlay.classList.add("show");
      document.body.classList.add("menu-open");
      if (toggle) {
        toggle.setAttribute("aria-expanded", "true");
        toggle.setAttribute("aria-label", "关闭菜单");
      }
      // 焦点移入关闭按钮，便于键盘操作
      if (closeBtn) closeBtn.focus();
    }

    function closeSidebar() {
      sidebar.classList.remove("open");
      overlay.classList.remove("show");
      document.body.classList.remove("menu-open");
      if (toggle) {
        toggle.setAttribute("aria-expanded", "false");
        toggle.setAttribute("aria-label", "打开菜单");
        toggle.focus();
      }
    }

    if (toggle) toggle.addEventListener("click", openSidebar);
    if (closeBtn) closeBtn.addEventListener("click", closeSidebar);
    overlay.addEventListener("click", closeSidebar);

    // 点击侧边内连接后收起
    sidebar.querySelectorAll('a[href^="#"]').forEach(function (a) {
      a.addEventListener("click", closeSidebar);
    });

    // 子菜单展开/收起（防止重复绑定）
    sidebar.querySelectorAll(".side-toggle").forEach(function (btn) {
      if (btn.dataset.bound) return;
      btn.dataset.bound = "1";
      btn.addEventListener("click", function (e) {
        e.preventDefault();
        const item = btn.closest(".side-item");
        const sub = item ? item.querySelector(".side-sub") : null;
        const expanded = btn.getAttribute("aria-expanded") === "true";
        if (sub) sub.classList.toggle("open", !expanded);
        btn.setAttribute("aria-expanded", expanded ? "false" : "true");
        btn.classList.toggle("expanded", !expanded);
        btn.textContent = expanded ? "+" : "−";
      });
    });

    // ESC 关闭
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeSidebar();
    });
  }

  /* =============================================================
     MORE + 跳转占位
     ============================================================= */
  function initMoreLinks() {
    document.querySelectorAll(".js-more").forEach(function (el) {
      if (el.dataset.boundMore) return;
      el.dataset.boundMore = "1";
      el.addEventListener("click", function (e) {
        e.preventDefault();
        const targetId = el.getAttribute("data-target");
        // 占位：滚动到对应区块；后续替换为真实列表页地址
        const target = document.getElementById(targetId);
        if (target) {
          if ("scrollBehavior" in document.documentElement.style) {
            target.scrollIntoView({ behavior: "smooth", block: "start" });
          } else {
            target.scrollIntoView({ block: "start" });
          }
        }
      });
    });
  }

  /* =============================================================
     占位交互：资料下载 / 在线留言（接入真实功能前的演示提示）
     ============================================================= */
  function initPlaceholderActions() {
    // 资料下载：提示真实下载地址待配置
    document.querySelectorAll(".dl-btn").forEach(function (btn) {
      if (btn.dataset.boundDl) return;
      btn.dataset.boundDl = "1";
      btn.addEventListener("click", function () {
        const name = btn.getAttribute("data-name") || "该文件";
        window.alert("「" + name + "」为占位演示，真实下载地址待配置。");
      });
    });
    // 在线留言：拦截提交，提示待接入后端
    const form = document.querySelector(".contact-form");
    if (form && !form.dataset.boundForm) {
      form.dataset.boundForm = "1";
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        window.alert("留言功能为占位演示，待接入后端接口后启用。");
      });
    }
  }

  /* =============================================================
     当前区块导航高亮（节流）
     ============================================================= */
  function initScrollHighlight() {
    const sections = [
      "home", "about", "research", "members", "achievements",
      "frontier", "news", "contact", "links",
    ];
    const navAnchors = Array.prototype.slice.call(
      document.querySelectorAll('#navList a[href^="#"]')
    );
    // 多页站点（导航为独立页面、无页内锚点）时禁用滚动高亮，
    // 避免误清除各页面 HTML 中预设的当前栏目 active 状态
    if (!navAnchors.length) return;

    const sidebar = document.getElementById("sidebar");

    let ticking = false;

    function highlight() {
      const scrollY =
        window.pageYOffset || document.documentElement.scrollTop;
      let current = "home";

      sections.forEach(function (id) {
        const el = document.getElementById(id);
        if (!el) return;
        const rect = el.getBoundingClientRect();
        if (rect.top <= 160) current = id;
      });

      navAnchors.forEach(function (a) {
        const match = a.getAttribute("href") === "#" + current;
        a.parentElement.classList.toggle("active", match);
      });

      // 同步侧边菜单高亮
      if (sidebar) {
        sidebar.querySelectorAll(".side-item").forEach(function (item) {
          const link = item.querySelector("a[href^='#']");
          const href = link ? link.getAttribute("href") : "";
          item.classList.toggle("active", href === "#" + current);
        });
      }

      ticking = false;
    }

    // 用 rAF 节流，减少滚动期间的重排
    function requestHighlight() {
      if (!ticking) {
        window.requestAnimationFrame(highlight);
        ticking = true;
      }
    }

    window.addEventListener("scroll", requestHighlight, { passive: true });
    window.addEventListener("resize", requestHighlight);
    highlight();
  }

  /* =============================================================
     返回顶部按钮（全站通用）
     ============================================================= */
  function initBackTop() {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "back-top";
    btn.setAttribute("aria-label", "返回顶部");
    btn.title = "返回顶部";
    btn.innerHTML = '<span class="back-top-arrow" aria-hidden="true"></span>';
    document.body.appendChild(btn);

    let visible = false;
    window.addEventListener(
      "scroll",
      function () {
        const show = (window.pageYOffset || 0) > 480;
        if (show !== visible) {
          visible = show;
          btn.classList.toggle("show", visible);
        }
      },
      { passive: true }
    );

    btn.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  /* =============================================================
     右侧模块进度条（scroll-spy：高亮当前板块，点击平滑定位）
     ============================================================= */
  function initScrollRail() {
    var rail = document.getElementById("scrollRail");
    if (!rail) return;
    var links = Array.prototype.slice.call(rail.querySelectorAll("a[data-rail]"));
    if (!links.length) return;
    var sections = links
      .map(function (a) {
        return document.getElementById(a.getAttribute("data-rail"));
      })
      .filter(Boolean);
    if (!sections.length) return;

    var ticking = false;
    function update() {
      ticking = false;
      var line = window.scrollY + window.innerHeight * 0.36;
      var current = sections[0];
      for (var i = 0; i < sections.length; i++) {
        if (sections[i].getBoundingClientRect().top + window.scrollY <= line) {
          current = sections[i];
        }
      }
      // 滚动到底部时点亮最后一项
      if (window.innerHeight + window.scrollY >= document.body.scrollHeight - 4) {
        current = sections[sections.length - 1];
      }
      links.forEach(function (a) {
        a.classList.toggle(
          "active",
          a.getAttribute("data-rail") === current.id
        );
      });
    }
    function onScroll() {
      if (!ticking) {
        ticking = true;
        window.requestAnimationFrame(update);
      }
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    update();

    links.forEach(function (a) {
      a.addEventListener("click", function (e) {
        var target = document.getElementById(a.getAttribute("data-rail"));
        if (!target) return;
        e.preventDefault();
        var reduced = window.matchMedia(
          "(prefers-reduced-motion: reduce)"
        ).matches;
        window.scrollTo({
          top:
            target.getBoundingClientRect().top +
            window.scrollY -
            headerOffset(),
          behavior: reduced ? "auto" : "smooth",
        });
      });
    });
  }

  /* =============================================================
     页头高度：吸顶导航收缩后高度会变，跳转补偿需动态取
     ============================================================= */
  function headerOffset() {
    var bar = document.querySelector(".topbar");
    return bar ? bar.offsetHeight + 16 : 72;
  }

  /* =============================================================
     吸顶导航：滚动后收缩、毛玻璃、投影（武大 / 东南式）
     ============================================================= */
  function initStickyHeader() {
    var bar = document.querySelector(".topbar");
    if (!bar) return;
    var ticking = false;
    function update() {
      ticking = false;
      bar.classList.toggle("is-scrolled", window.scrollY > 60);
    }
    window.addEventListener(
      "scroll",
      function () {
        if (!ticking) {
          ticking = true;
          window.requestAnimationFrame(update);
        }
      },
      { passive: true }
    );
    update();
  }

  /* =============================================================
     顶部滚动进度条：反映当前阅读位置
     ============================================================= */
  function initScrollProgress() {
    var rail = document.getElementById("progressRail");
    if (!rail) return;
    var bar = rail.firstElementChild;
    if (!bar) return;
    var ticking = false;
    function update() {
      ticking = false;
      var doc = document.documentElement;
      var max = doc.scrollHeight - doc.clientHeight;
      var p = max > 0 ? window.scrollY / max : 0;
      if (p < 0) p = 0;
      if (p > 1) p = 1;
      bar.style.transform = "scaleX(" + p.toFixed(4) + ")";
    }
    window.addEventListener(
      "scroll",
      function () {
        if (!ticking) {
          ticking = true;
          window.requestAnimationFrame(update);
        }
      },
      { passive: true }
    );
    window.addEventListener("resize", function () {
      window.requestAnimationFrame(update);
    });
    update();
  }

  /* =============================================================
     方向感知悬停：遮罩从鼠标进入的那一侧滑入（西财 hoverdir 思路）
     ============================================================= */
  function initHoverDir() {
    var nodes = document.querySelectorAll(".quick-btn, .acad-item");
    if (!nodes.length) return;
    Array.prototype.forEach.call(nodes, function (el) {
      el.classList.add("hdir");
      el.addEventListener("mouseenter", function (e) {
        var r = el.getBoundingClientRect();
        var w = r.width;
        var h = r.height;
        var x = (e.clientX - r.left - w / 2) * (w > h ? h / w : 1);
        var y = (e.clientY - r.top - h / 2) * (h > w ? w / h : 1);
        var dir =
          Math.abs(x) > Math.abs(y)
            ? x > 0
              ? "right"
              : "left"
            : y > 0
            ? "bottom"
            : "top";
        el.setAttribute("data-dir", dir);
      });
      el.addEventListener("mouseleave", function () {
        el.removeAttribute("data-dir");
      });
    });
  }

  /* =============================================================
     SVG 标识逐笔描边：进入视口后线条依次画出（南大 Vivus 思路）
     —— 用 getTotalLength() 取真实长度，避免写死 dasharray
     ============================================================= */
  function initSvgDraw() {
    var svg = document.querySelector(".notice-svg");
    if (!svg) return;
    var paths = Array.prototype.slice.call(svg.querySelectorAll(".draw"));
    if (!paths.length) return;

    paths.forEach(function (p, i) {
      var len = 400;
      if (typeof p.getTotalLength === "function") {
        try {
          len = Math.ceil(p.getTotalLength());
        } catch (e) {
          len = 400;
        }
      }
      p.style.setProperty("--len", len);
      p.style.animationDelay = Math.min(i * 70, 1200) + "ms";
    });

    var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    function draw() {
      svg.classList.add("drawn");
    }
    if (reduced || !("IntersectionObserver" in window)) {
      draw();
      return;
    }
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) {
            draw();
            io.unobserve(en.target);
          }
        });
      },
      { threshold: 0.25 }
    );
    io.observe(svg);
  }

  /* =============================================================
     轮播可拖拽：按住左右拖动切换（南大 grabCursor 思路）
     ============================================================= */
  function initBannerDrag() {
    var banner = document.querySelector(".banner");
    var prev = document.getElementById("bannerPrev");
    var next = document.getElementById("bannerNext");
    if (!banner || !prev || !next) return;

    var startX = 0;
    var dragging = false;
    var THRESHOLD = 60;

    banner.addEventListener("pointerdown", function (e) {
      // 忽略在按钮 / 链接上的按下
      if (e.target.closest("button, a")) return;
      dragging = true;
      startX = e.clientX;
      banner.classList.add("is-dragging");
    });

    banner.addEventListener("pointerup", function (e) {
      if (!dragging) return;
      dragging = false;
      banner.classList.remove("is-dragging");
      var dx = e.clientX - startX;
      if (Math.abs(dx) < THRESHOLD) return;
      if (dx < 0) {
        next.click();
      } else {
        prev.click();
      }
    });

    banner.addEventListener("pointercancel", function () {
      dragging = false;
      banner.classList.remove("is-dragging");
    });
  }

  /* =============================================================
     统计带底图视差：滚动时背景缓慢位移（南大 parallax 思路）
     —— 用 background-position，避免与 Ken Burns 的 transform 冲突
     ============================================================= */
  function initStatsParallax() {
    var band = document.getElementById("stats");
    var bg = band ? band.querySelector(".stats-bg") : null;
    if (!band || !bg) return;
    var ticking = false;
    function update() {
      ticking = false;
      var r = band.getBoundingClientRect();
      var vh = window.innerHeight || 1;
      // -1（刚进入视口下方） → 1（已滚过）
      var p = (vh - r.top) / (vh + r.height);
      if (p < 0) p = 0;
      if (p > 1) p = 1;
      bg.style.backgroundPosition = "center " + (34 + p * 14).toFixed(2) + "%";
    }
    window.addEventListener(
      "scroll",
      function () {
        if (!ticking) {
          ticking = true;
          window.requestAnimationFrame(update);
        }
      },
      { passive: true }
    );
    update();
  }

  /* =============================================================
     人大式：校训书法水印，滚动视差（固定层缓慢下移）
     ============================================================= */
  function initMottoParallax() {
    var el = document.getElementById("mottoWm");
    if (!el) return;
    var chars = Array.prototype.slice.call(el.querySelectorAll("i"));
    if (!chars.length) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    // 入场：逐字「落笔」，45ms 阶梯
    chars.forEach(function (c, i) {
      c.style.setProperty("--cy", "34px");
      c.style.setProperty("--co", "0");
      c.style.transition =
        "transform 1s cubic-bezier(.22,.61,.36,1) " + i * 45 + "ms, opacity 1s ease " + i * 45 + "ms";
    });
    function release() {
      chars.forEach(function (c, i) {
        c.style.setProperty("--cy", "0px");
        c.style.setProperty("--co", "0.12");
      });
      window.setTimeout(function () {
        chars.forEach(function (c) {
          c.style.transition = "none";
        });
      }, 1400);
      window.removeEventListener("load", release);
    }
    if (document.readyState === "complete") window.setTimeout(release, 200);
    else window.addEventListener("load", release);

    var maxScroll = function () {
      return Math.max(1, document.body.scrollHeight - window.innerHeight);
    };
    var ticking = false;
    var ready = false;

    function update() {
      ticking = false;
      var p = Math.min(1, Math.max(0, window.scrollY / maxScroll()));
      // 整块：整页一次循环的有界漂浮（始终留在视区）
      var ang = p * Math.PI * 2;
      var y = Math.sin(ang) * 62;
      var x = Math.sin(ang * 0.7) * 46;
      el.style.transform =
        "translate3d(" + x.toFixed(1) + "px," + y.toFixed(1) + "px,0)";

      if (!ready) return;
      // 逐字：随滚动在 inclination 上做波浪（位移 / 旋转 / 缩放 / 浓淡）
      for (var i = 0; i < chars.length; i++) {
        var ph = p * Math.PI * 4 + i * 0.55;
        var s = 0.5 + 0.5 * Math.sin(ph);
        chars[i].style.setProperty("--cy", (Math.sin(ph) * 14).toFixed(2) + "px");
        chars[i].style.setProperty("--cx", (Math.cos(ph * 0.6) * 7).toFixed(2) + "px");
        chars[i].style.setProperty("--cr", (Math.sin(ph) * 2.4).toFixed(2) + "deg");
        chars[i].style.setProperty("--cs", (1 + s * 0.07).toFixed(3));
        chars[i].style.setProperty("--co", (0.12 + s * 0.2).toFixed(3));
      }
    }
    function onScroll() {
      if (!ticking) {
        ticking = true;
        window.requestAnimationFrame(update);
      }
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    window.setTimeout(function () {
      ready = true;
      update();
    }, 1200);
    update();
  }

  /* =============================================================
     东南式：统计带全屏换页 —— 底图淡入淡出 + 圆形箭头
     ============================================================= */
  function initStatsSlides() {
    var band = document.getElementById("stats");
    if (!band) return;
    var layers = Array.prototype.slice.call(
      band.querySelectorAll(".stats-bg-layer")
    );
    var prev = document.getElementById("statsPrev");
    var next = document.getElementById("statsNext");
    if (layers.length < 2 || (!prev && !next)) return;

    var current = 0;
    function show(i) {
      current = (i + layers.length) % layers.length;
      layers.forEach(function (layer, li) {
        layer.classList.toggle("is-on", li === current);
      });
    }
    if (prev)
      prev.addEventListener("click", function () {
        show(current - 1);
      });
    if (next)
      next.addEventListener("click", function () {
        show(current + 1);
      });
    show(0);
  }

  /* =============================================================
     东南「东大人物」式：环形头像人物切换（members 页）
     ============================================================= */
  function initPeopleBand() {
    var dots = document.getElementById("peopleDots");
    if (!dots) return;
    var people = [
      { ch: "王", name: "王建国", role: "教授 · 团队负责人", desc: "深耕医学人工智能与生物医学大数据，主持多项省部级科研项目，带领团队贯通\u201c机制解析 — 数据挖掘 — 转化应用\u201d研究链条。" },
      { ch: "李", name: "李文静", role: "副教授", desc: "聚焦医学影像智能处理，致力于把深度学习方法落地到临床辅助诊断场景。" },
      { ch: "张", name: "张志强", role: "副教授", desc: "主攻多组学数据融合分析，探索基因表达调控的交叉研究路径。" },
      { ch: "陈", name: "陈晓东", role: "副教授", desc: "专注机器学习与数据挖掘，支撑团队算法底座与高性能计算平台。" },
      { ch: "刘", name: "刘雅琴", role: "讲师", desc: "从事生物信息学研究，参与疾病分子标志物挖掘与验证工作。" },
      { ch: "赵", name: "赵明辉", role: "讲师", desc: "研究深度学习方法及其在生物医学信号处理中的应用。" }
    ];
    var avatar = document.getElementById("peopleAvatar");
    var nameEl = document.getElementById("peopleName");
    var roleEl = document.getElementById("peopleRole");
    var descEl = document.getElementById("peopleDesc");
    if (!avatar || !nameEl || !roleEl || !descEl) return;

    var current = 0;
    people.forEach(function (p, i) {
      var li = document.createElement("li");
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "people-dot";
      btn.setAttribute("role", "tab");
      btn.setAttribute("aria-label", p.name);
      btn.textContent = p.ch;
      btn.addEventListener("click", function () {
        show(i);
      });
      li.appendChild(btn);
      dots.appendChild(li);
    });
    var dotBtns = Array.prototype.slice.call(
      dots.querySelectorAll(".people-dot")
    );

    function show(i) {
      current = (i + people.length) % people.length;
      var p = people[current];
      var band = avatar.closest(".people-band");
      avatar.textContent = p.ch;
      nameEl.textContent = p.name;
      roleEl.textContent = p.role;
      descEl.textContent = p.desc;
      dotBtns.forEach(function (b, bi) {
        b.classList.toggle("active", bi === current);
        b.setAttribute("aria-selected", bi === current ? "true" : "false");
      });
      if (band) {
        band.classList.remove("is-switching");
        void band.getBoundingClientRect();
        band.classList.add("is-switching");
      }
    }
    var prev = document.getElementById("peoplePrev");
    var next = document.getElementById("peopleNext");
    if (prev)
      prev.addEventListener("click", function () {
        show(current - 1);
      });
    if (next)
      next.addEventListener("click", function () {
        show(current + 1);
      });
    show(0);
  }

  /* =============================================================
     人大式：全景团队地图
     版式：全幅底图 + 左侧浮层（一校多点 / 全球战略）+ 底部通道切换 + 点位卡片
     底图：百度地图 WebGL（与人大官网同款），ak 在 scripts/map-config.js 配置
     未配置 ak 时回退为「真实经纬度投影 + 经纬网」的合规点位图，
     不绘制任何行政边界；切换与卡片交互与底图模式完全一致
     ============================================================= */
  var MAP_SETS = {
    0: {
      center: [107.5022, 31.2096],
      zoom: 7,
      points: [
        {
          n: "莲湖校区 · 主基地", lng: 107.5022, lat: 31.2096, tag: "主基地", main: true,
          img: "assets/gallery/act1.jpg",
          d: "团队实验与数据中枢：课题组织、样本入库、算力调度与成果汇总均在此完成。"
        },
        {
          n: "附属医院 · 临床通道", lng: 107.05, lat: 30.72, tag: "临床",
          img: "assets/gallery/act2.jpg",
          d: "承担样本采集与临床验证，形成「实验—临床」双向反馈闭环。"
        },
        {
          n: "成都 · 联合实验", lng: 104.0665, lat: 30.5728, tag: "协作",
          img: "assets/gallery/act3.jpg",
          d: "共享大型仪器与测序资源，联合开展方法学验证实验。"
        },
        {
          n: "重庆 · 样本协作", lng: 106.5516, lat: 29.563, tag: "协作",
          img: "assets/gallery/act1.jpg",
          d: "区域样本转运与并行检测，显著缩短验证周期。"
        }
      ]
    },
    1: {
      center: [107.5, 30.9],
      zoom: 6,
      points: [
        {
          n: "莲湖校区 · 主基地", lng: 107.5022, lat: 31.2096, tag: "主基地", main: true,
          img: "assets/gallery/act2.jpg",
          d: "统一调度临床协作网络，负责伦理审批、样本编码与数据回收。"
        },
        {
          n: "达州 · 区域医疗中心", lng: 107.05, lat: 30.72, tag: "临床",
          img: "assets/gallery/act3.jpg",
          d: "主要样本来源地，承担入组筛查与随访记录。"
        },
        {
          n: "南充 · 随访站点", lng: 106.1106, lat: 30.8372, tag: "随访",
          img: "assets/gallery/act1.jpg",
          d: "长周期随访与结局指标采集，补齐纵向数据。"
        },
        {
          n: "广安 · 协作采集点", lng: 106.6333, lat: 30.4559, tag: "采集",
          img: "assets/gallery/act2.jpg",
          d: "基层筛查协作，扩大样本覆盖面。"
        },
        {
          n: "重庆 · 三甲协作", lng: 106.5516, lat: 29.563, tag: "临床",
          img: "assets/gallery/act3.jpg",
          d: "疑难病例会诊与多中心验证合作。"
        }
      ]
    },
    2: {
      center: [113.5, 31],
      zoom: 5,
      points: [
        {
          n: "莲湖校区 · 主基地", lng: 107.5022, lat: 31.2096, tag: "主基地", main: true,
          img: "assets/gallery/act1.jpg",
          d: "统一出口：数据上传前的质控、脱敏与元数据整理。"
        },
        {
          n: "北京 · 学术合作", lng: 116.4074, lat: 39.9042, tag: "学术",
          img: "assets/gallery/act2.jpg",
          d: "联合课题与学术互访，共享方法学与评审资源。"
        },
        {
          n: "上海 · 测序服务", lng: 121.4737, lat: 31.2304, tag: "平台",
          img: "assets/gallery/act3.jpg",
          d: "高通量测序外包与联合分析，补齐本地算力缺口。"
        },
        {
          n: "广州 · 转化平台", lng: 113.2644, lat: 23.1291, tag: "转化",
          img: "assets/gallery/act1.jpg",
          d: "成果转化对接，推动方法走向应用场景。"
        },
        {
          n: "深圳 · 算力协作", lng: 114.0579, lat: 22.5431, tag: "算力",
          img: "assets/gallery/act2.jpg",
          d: "弹性算力支撑大规模建模与训练任务。"
        }
      ]
    },
    3: {
      center: [110, 30.5],
      zoom: 6,
      points: [
        {
          n: "莲湖校区 · 主基地", lng: 107.5022, lat: 31.2096, tag: "主基地", main: true,
          img: "assets/gallery/act3.jpg",
          d: "校企联合课题的组织方，负责需求拆解与成果归属约定。"
        },
        {
          n: "成都 · 联合实验室", lng: 104.0665, lat: 30.5728, tag: "共建",
          img: "assets/gallery/act1.jpg",
          d: "共建实验室，联合申报项目与培养工程型人才。"
        },
        {
          n: "重庆 · 中试基地", lng: 106.5516, lat: 29.563, tag: "中试",
          img: "assets/gallery/act2.jpg",
          d: "中试放大与工艺验证，缩短从样品到产品的距离。"
        },
        {
          n: "西安 · 仪器共享", lng: 108.9398, lat: 34.3416, tag: "共享",
          img: "assets/gallery/act3.jpg",
          d: "大型仪器共享预约，降低单次检测成本。"
        },
        {
          n: "武汉 · 试剂供应", lng: 114.3055, lat: 30.5928, tag: "供应",
          img: "assets/gallery/act1.jpg",
          d: "试剂与耗材稳定供应，保障实验连续性。"
        }
      ]
    }
  };

  function initMapBand() {
    var content = document.getElementById("mapContent");
    var canvas = document.getElementById("teamMap");
    if (!content || !canvas) return;
    var pinsBox = document.getElementById("mapPins");
    var links = document.getElementById("mapLinks");
    var grid = document.getElementById("mapGrid");
    var tabs = document.getElementById("mapTabs");
    var views = document.getElementById("mapViews");
    var card = document.getElementById("mapCard");
    var note = document.getElementById("mapNote");
    if (!pinsBox || !links || !grid || !views || !card) return;

    var cfg = window.WB_MAP_CONFIG || {};
    var ak = String(cfg.ak || "").trim();
    var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var state = { idx: 0, mode: "grid", bmap: null, overlays: [] };

    /* ---------- 点位卡片 ---------- */
    function closeCard() {
      card.classList.remove("is-open");
    }
    function openCard(p) {
      var img = document.getElementById("mapCardImg");
      if (img && p.img) img.setAttribute("src", p.img);
      var tagEl = document.getElementById("mapCardTag");
      var titleEl = document.getElementById("mapCardTitle");
      var descEl = document.getElementById("mapCardDesc");
      if (tagEl) tagEl.textContent = p.tag || "协作点";
      if (titleEl) titleEl.textContent = p.n || "";
      if (descEl) descEl.textContent = p.d || "";
      state.last = p;
      card.classList.add("is-open");
    }
    var closeBtn = document.getElementById("mapCardX");
    if (closeBtn) closeBtn.addEventListener("click", closeCard);

    /* ---------- 经纬度投影（回退底图用） ---------- */
    function computeBox(pts, aspect) {
      var minLng = 180, maxLng = -180, minLat = 90, maxLat = -90;
      pts.forEach(function (p) {
        if (p.lng < minLng) minLng = p.lng;
        if (p.lng > maxLng) maxLng = p.lng;
        if (p.lat < minLat) minLat = p.lat;
        if (p.lat > maxLat) maxLat = p.lat;
      });
      var rawLng = maxLng - minLng;
      var rawLat = maxLat - minLat;
      var padLngW = Math.max(4.0, rawLng * 0.55);
      var padLngE = Math.max(2.4, rawLng * 0.22);
      var padLatN = Math.max(1.4, rawLat * 0.28);
      var padLatS = Math.max(1.4, rawLat * 0.28);
      return {
        lngMin: minLng - padLngW,
        latMax: maxLat + padLatN,
        lngSpan: rawLng + padLngW + padLngE,
        latSpan: rawLat + padLatN + padLatS
      };
    }
    function project(lng, lat, box) {
      return {
        x: ((lng - box.lngMin) / box.lngSpan) * 100,
        y: ((box.latMax - lat) / box.latSpan) * 100
      };
    }

    function renderGrid() {
      var set = MAP_SETS[state.idx];
      var rect = content.getBoundingClientRect();
      var aspect = Math.max(0.5, rect.width / Math.max(1, rect.height));
      var box = computeBox(set.points, aspect);
      var lngMin = box.lngMin;
      var latMax = box.latMax;
      var latMin = latMax - box.latSpan;
      var stepLng = box.lngSpan > 24 ? 10 : box.lngSpan > 11 ? 5 : 2;
      var stepLat = box.latSpan > 16 ? 10 : box.latSpan > 8 ? 5 : 2;
      var firstLng = Math.ceil(lngMin / stepLng) * stepLng;
      var firstLat = Math.ceil(latMin / stepLat) * stepLat;
      grid.style.backgroundImage =
        "linear-gradient(90deg, rgba(150,190,230,0.18) 1px, transparent 1px)," +
        "linear-gradient(0deg, rgba(150,190,230,0.18) 1px, transparent 1px)";
      grid.style.backgroundSize =
        (stepLng / box.lngSpan) * 100 + "% " + (stepLat / box.latSpan) * 100 + "%";
      grid.style.backgroundPosition =
        ((firstLng - lngMin) / box.lngSpan) * 100 + "% " +
        ((latMax - firstLat) / box.latSpan) * 100 + "%";

      var olds = Array.prototype.slice.call(grid.querySelectorAll(".map-gl"));
      olds.forEach(function (o) {
        if (o.parentNode === grid) grid.removeChild(o);
      });
      var lg, lt, el;
      for (lg = firstLng; lg <= lngMin + box.lngSpan; lg += stepLng) {
        el = document.createElement("i");
        el.className = "map-gl gl-x";
        el.textContent = lg + "\u00b0E";
        el.style.left = ((lg - lngMin) / box.lngSpan) * 100 + "%";
        grid.appendChild(el);
      }
      for (lt = firstLat; lt <= latMax; lt += stepLat) {
        el = document.createElement("i");
        el.className = "map-gl gl-y";
        el.textContent = lt + "\u00b0N";
        el.style.top = ((latMax - lt) / box.latSpan) * 100 + "%";
        grid.appendChild(el);
      }

      var main = null;
      set.points.forEach(function (p) {
        if (p.main) main = p;
      });
      var d = "";
      set.points.forEach(function (p) {
        if (!main || p === main) return;
        var a = project(main.lng, main.lat, box);
        var b = project(p.lng, p.lat, box);
        var cx = (a.x + b.x) / 2 + (b.y - a.y) * 0.14;
        var cy = (a.y + b.y) / 2 - (b.x - a.x) * 0.14;
        d +=
          '<path vector-effect="non-scaling-stroke" d="M' + a.x.toFixed(2) + " " + a.y.toFixed(2) +
          " Q" + cx.toFixed(2) + " " + cy.toFixed(2) +
          " " + b.x.toFixed(2) + " " + b.y.toFixed(2) + '"/>';
      });
      links.innerHTML = d;

      pinsBox.innerHTML = "";
      set.points.forEach(function (p, i) {
        var pos = project(p.lng, p.lat, box);
        var btn = document.createElement("button");
        btn.type = "button";
        btn.className = "map-pin" + (p.main ? " is-main" : "");
        btn.style.left = pos.x + "%";
        btn.style.top = pos.y + "%";
        if (!reduced) btn.style.animationDelay = (i * 0.09).toFixed(2) + "s";
        btn.innerHTML = "<i></i><span>" + p.n + "</span>";
        btn.addEventListener("mouseenter", function () {
          openCard(p);
        });
        btn.addEventListener("focus", function () {
          openCard(p);
        });
        btn.addEventListener("click", function () {
          var all = pinsBox.querySelectorAll(".map-pin");
          for (var z = 0; z < all.length; z++) all[z].classList.remove("is-act");
          btn.classList.add("is-act");
          openCard(p);
        });
        pinsBox.appendChild(btn);
      });
    }

    /* ---------- 百度地图 WebGL 底图 ---------- */
    function pinIcon(color) {
      var svg =
        '<svg xmlns="http://www.w3.org/2000/svg" width="34" height="44" viewBox="0 0 34 44">' +
        '<path d="M17 43C17 43 33 26.6 33 16.6C33 7.4 25.8 0.3 17 0.3C8.2 0.3 1 7.4 1 16.6C1 26.6 17 43 17 43Z" ' +
        'fill="' + color + '" stroke="#ffffff" stroke-width="2"/>' +
        '<circle cx="17" cy="16.4" r="5.4" fill="#ffffff"/></svg>';
      return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
    }
    function renderBaidu() {
      if (!state.bmap || !window.BMapGL) return;
      var set = MAP_SETS[state.idx];
      state.overlays.forEach(function (o) {
        state.bmap.removeOverlay(o);
      });
      state.overlays = [];
      var main = null;
      set.points.forEach(function (p) {
        if (p.main) main = p;
      });
      var icoMain = pinIcon("#d8352a");
      var icoSub = pinIcon("#2f7fd0");
      set.points.forEach(function (p) {
        var pt = new window.BMapGL.Point(p.lng, p.lat);
        if (main && p !== main) {
          var line = new window.BMapGL.Polyline(
            [new window.BMapGL.Point(main.lng, main.lat), pt],
            {
              strokeColor: "#7fb0e0",
              strokeWeight: 2,
              strokeOpacity: 0.7,
              strokeStyle: "dashed"
            }
          );
          state.bmap.addOverlay(line);
          state.overlays.push(line);
        }
        var mk = new window.BMapGL.Marker(pt);
        try {
          mk.setIcon(
            new window.BMapGL.Icon(p.main ? icoMain : icoSub, new window.BMapGL.Size(34, 44), {
              anchor: new window.BMapGL.Size(17, 44)
            })
          );
        } catch (e) {
          /* 自定义图标不可用时保留默认标注 */
        }
        mk.addEventListener("click", function () {
          openCard(p);
        });
        state.bmap.addOverlay(mk);
        state.overlays.push(mk);
      });
      state.bmap.centerAndZoom(
        new window.BMapGL.Point(set.center[0], set.center[1]),
        set.zoom
      );
    }
    function loadBaidu() {
      var sc = document.createElement("script");
      sc.src = "https://api.map.baidu.com/api?type=webgl&v=3.0&ak=" + encodeURIComponent(ak);
      sc.async = true;
      sc.onerror = function () {
        if (note) note.textContent = "底图加载失败，已回退为经纬度点位图";
      };
      sc.onload = function () {
        if (!window.BMapGL) return;
        try {
          var m = new window.BMapGL.Map("teamMap");
          m.centerAndZoom(
            new window.BMapGL.Point(MAP_SETS[0].center[0], MAP_SETS[0].center[1]),
            MAP_SETS[0].zoom
          );
          m.enableScrollWheelZoom(false);
          if (cfg.styleId) m.setMapStyleV2({ styleId: cfg.styleId });
          if (window.BMapGL.ZoomControl) {
            m.addControl(new window.BMapGL.ZoomControl());
          }
          state.bmap = m;
          state.mode = "baidu";
          content.classList.add("is-baidu");
          if (note) note.textContent = "底图：百度地图 · 点位为团队协同节点示意";
          renderBaidu();
        } catch (e) {
          if (note) note.textContent = "底图初始化失败，已回退为经纬度点位图";
        }
      };
      document.head.appendChild(sc);
    }

    /* ---------- 视图切换（左列大视角 + 底部通道） ---------- */
    function setView(idx) {
      state.idx = idx;
      var lis = views.children;
      for (var i = 0; i < lis.length; i++) {
        var v = Number(lis[i].getAttribute("data-index"));
        lis[i].classList.toggle("is-act", v === (idx === 0 ? 0 : 1));
      }
      if (tabs) {
        tabs.hidden = idx === 0;
        var bs = tabs.children;
        for (var j = 0; j < bs.length; j++) {
          bs[j].classList.toggle("is-act", Number(bs[j].getAttribute("data-index")) === idx);
        }
      }
      closeCard();
      if (state.mode === "baidu") renderBaidu();
      else if (state.mode === "tiles") renderTileView();
      else renderGrid();
    }
    function hit(root, el) {
      while (el && el !== root) {
        if (el.getAttribute && el.getAttribute("data-index") !== null) return el;
        el = el.parentNode;
      }
      return null;
    }
    views.addEventListener("click", function (e) {
      var li = hit(views, e.target);
      if (!li) return;
      var v = Number(li.getAttribute("data-index"));
      setView(v === 0 ? 0 : 1);
    });
    if (tabs) {
      tabs.addEventListener("click", function (e) {
        var b = hit(tabs, e.target);
        if (!b) return;
        setView(Number(b.getAttribute("data-index")));
      });
    }

    var rt = null;
    window.addEventListener("resize", function () {
      if (state.mode === "baidu") return;
      if (rt) window.clearTimeout(rt);
      rt = window.setTimeout(function () {
        if (state.mode === "tiles") renderTiles();
        else renderGrid();
      }, 220);
    });

    /* ---------- 真实瓦片底图（合规数据源：高德地图瓦片） ---------- */
    var TM = null;
    function lonX(lng) {
      return (lng + 180) / 360;
    }
    function latY(lat) {
      var sn = Math.sin((lat * Math.PI) / 180);
      return 0.5 - Math.log((1 + sn) / (1 - sn)) / (4 * Math.PI);
    }
    function yToLat(y) {
      var A = (0.5 - y) * 4 * Math.PI;
      var sn = (Math.exp(A) - 1) / (Math.exp(A) + 1);
      return (Math.asin(sn) * 180) / Math.PI;
    }
    function tileURL(x, y, z) {
      return (
        "https://webrd0" + (((x + y) % 4) + 1) +
        ".is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x=" +
        x + "&y=" + y + "&z=" + z
      );
    }
    function mountTiles() {
      TM = { lng: 107.5022, lat: 31.2096, zoom: 6, layer: null, tiles: {}, w: 0, h: 0, ok: 0, fail: 0 };
      var layer = document.createElement("div");
      layer.className = "map-tiles";
      canvas.appendChild(layer);
      TM.layer = layer;

      var ctrl = document.createElement("div");
      ctrl.className = "map-zoom";
      ctrl.innerHTML =
        '<button type="button" class="map-ctrl-btn" data-z="1" aria-label="放大">+</button>' +
        '<button type="button" class="map-ctrl-btn" data-z="-1" aria-label="缩小">&minus;</button>';
      canvas.appendChild(ctrl);

      var panel = content.querySelector(".map-left");
      var locate = document.createElement("button");
      locate.type = "button";
      locate.className = "map-locate";
      locate.id = "mapLocate";
      locate.innerHTML = '<i aria-hidden="true"></i><span>定位主基地</span>';
      locate.addEventListener("click", locateBase);
      if (panel) panel.appendChild(locate);
      else canvas.appendChild(locate);

      var coord = document.createElement("div");
      coord.className = "map-coord";
      coord.id = "mapCoord";
      if (panel) panel.appendChild(coord);
      else canvas.appendChild(coord);

      var attr = document.createElement("div");
      attr.className = "map-attr";
      attr.textContent = "底图 \u00a9 \u9ad8\u5fb7\u5730\u56fe";
      if (panel) panel.appendChild(attr);
      else canvas.appendChild(attr);

      state.mode = "tiles";
      content.classList.add("is-tiles");
      if (note) note.textContent = "底图：高德地图 · 点位为团队协同节点示意";

      ctrl.addEventListener("click", function (e) {
        var z = null;
        var el = e.target;
        while (el && el !== ctrl) {
          if (el.getAttribute && el.getAttribute("data-z") !== null) { z = el; break; }
          el = el.parentNode;
        }
        if (z) {
          TM.zoom = Math.max(3, Math.min(16, TM.zoom + Number(z.getAttribute("data-z"))));
          renderTiles();
          return;
        }
      });

      var drag = null;
      canvas.addEventListener("pointerdown", function (e) {
        if (state.mode !== "tiles") return;
        var el = e.target;
        while (el && el !== canvas) {
          if (el.tagName === "BUTTON") return;
          el = el.parentNode;
        }
        drag = { x: e.clientX, y: e.clientY, lng: TM.lng, lat: TM.lat, W: 256 * Math.pow(2, TM.zoom) };
        canvas.classList.add("is-drag");
      });
      window.addEventListener("pointermove", function (e) {
        if (!drag) return;
        TM.lng = drag.lng - ((e.clientX - drag.x) / drag.W) * 360;
        if (TM.lng > 180) TM.lng -= 360;
        if (TM.lng < -180) TM.lng += 360;
        var ny = latY(drag.lat) - (e.clientY - drag.y) / drag.W;
        TM.lat = Math.max(-84, Math.min(84, yToLat(ny)));
        renderTiles();
      });
      window.addEventListener("pointerup", function () {
        drag = null;
        canvas.classList.remove("is-drag");
      });
      window.addEventListener("pointercancel", function () {
        drag = null;
        canvas.classList.remove("is-drag");
      });
    }
    function renderTiles() {
      if (!TM) return;
      var w = canvas.clientWidth || content.clientWidth;
      var h = canvas.clientHeight || content.clientHeight;
      TM.w = w;
      TM.h = h;
      var W = 256 * Math.pow(2, TM.zoom);
      var ox = lonX(TM.lng) * W - w / 2;
      var oy = latY(TM.lat) * W - h / 2;
      var x0 = Math.floor(ox / 256);
      var x1 = Math.floor((ox + w) / 256);
      var y0 = Math.floor(oy / 256);
      var y1 = Math.floor((oy + h) / 256);
      var n = Math.pow(2, TM.zoom);
      var need = {};
      var x, y, tx, key, el;
      for (x = x0; x <= x1; x++) {
        for (y = y0; y <= y1; y++) {
          if (y < 0 || y >= n) continue;
          tx = ((x % n) + n) % n;
          key = TM.zoom + "/" + tx + "/" + y;
          need[key] = true;
          el = TM.tiles[key];
          if (!el) {
            el = document.createElement("img");
            el.className = "map-tile";
            el.alt = "";
            el.width = 256;
            el.height = 256;
            el.draggable = false;
            el.onload = function () {
              TM.ok += 1;
              this.style.opacity = 1;
            };
            el.onerror = function () {
              TM.fail += 1;
              if (TM.ok === 0 && TM.fail >= 4) tileFail();
            };
            el.src = tileURL(tx, y, TM.zoom);
            TM.layer.appendChild(el);
            TM.tiles[key] = el;
          }
          el.style.transform =
            "translate3d(" + (x * 256 - ox) + "px," + (y * 256 - oy) + "px,0)";
        }
      }
      Object.keys(TM.tiles).forEach(function (k) {
        if (!need[k]) {
          var e2 = TM.tiles[k];
          if (e2.parentNode) e2.parentNode.removeChild(e2);
          delete TM.tiles[k];
        }
      });
      var cds = document.querySelectorAll(".map-coord");
      var ctext =
        TM.lng.toFixed(4) + "\u00b0E  " + TM.lat.toFixed(4) + "\u00b0N  z" + TM.zoom;
      for (var q = 0; q < cds.length; q++) cds[q].textContent = ctext;
      positionPins();
    }
    function positionPins() {
      if (!TM) return;
      var W = 256 * Math.pow(2, TM.zoom);
      var ox = lonX(TM.lng) * W - TM.w / 2;
      var oy = latY(TM.lat) * W - TM.h / 2;
      var arr = pinsBox.querySelectorAll(".map-pin");
      for (var i = 0; i < arr.length; i++) {
        var el = arr[i];
        var lng = Number(el.getAttribute("data-lng"));
        var lat = Number(el.getAttribute("data-lat"));
        var px = lonX(lng) * W - ox;
        var py = latY(lat) * W - oy;
        el.style.left = Math.round(px) + "px";
        el.style.top = Math.round(py) + "px";
        el.style.display =
          px < -80 || px > TM.w + 80 || py < -80 || py > TM.h + 80 ? "none" : "";
      }
    }
    function tileFail() {
      state.mode = "grid";
      content.classList.remove("is-tiles");
      if (note) note.textContent = "底图瓦片不可用，当前为经纬度投影点位图";
      setView(state.idx);
    }
    function locateBase() {
      var set = MAP_SETS[state.idx];
      var main = null;
      set.points.forEach(function (p) {
        if (p.main) main = p;
      });
      if (!main) main = { lng: 107.5022, lat: 31.2096 };
      if (state.mode !== "tiles") {
        setView(0);
        openCard(main);
        return;
      }
      var s = { lng: TM.lng, lat: TM.lat, z: TM.zoom };
      var t0 = Date.now();
      var dur = 720;
      function step() {
        var k = Math.min(1, (Date.now() - t0) / dur);
        var e = 1 - Math.pow(1 - k, 3);
        TM.lng = s.lng + (main.lng - s.lng) * e;
        TM.lat = s.lat + (main.lat - s.lat) * e;
        TM.zoom = Math.round(s.z + (12 - s.z) * e);
        renderTiles();
        if (k < 1) window.requestAnimationFrame(step);
        else openCard(main);
      }
      step();
    }
    function renderTileView() {
      var set = MAP_SETS[state.idx];
      if (!TM) mountTiles();
      pinsBox.innerHTML = "";
      set.points.forEach(function (p, i) {
        var btn = document.createElement("button");
        btn.type = "button";
        btn.className = "map-pin" + (p.main ? " is-main" : "");
        btn.setAttribute("data-lng", p.lng);
        btn.setAttribute("data-lat", p.lat);
        btn.style.animationDelay = reduced ? "0s" : (i * 0.08).toFixed(2) + "s";
        btn.innerHTML = "<i></i><span>" + p.n + "</span>";
        btn.addEventListener("mouseenter", function () {
          openCard(p);
        });
        btn.addEventListener("focus", function () {
          openCard(p);
        });
        btn.addEventListener("click", function () {
          var all = pinsBox.querySelectorAll(".map-pin");
          for (var z = 0; z < all.length; z++) all[z].classList.remove("is-act");
          btn.classList.add("is-act");
          locateTo(p);
        });
        pinsBox.appendChild(btn);
      });
      TM.lng = set.center[0];
      TM.lat = set.center[1];
      TM.zoom = set.zoom;
      renderTiles();
    }
    function locateTo(p) {
      openCard(p);
      if (state.mode !== "tiles" || !TM) return;
      var s = { lng: TM.lng, lat: TM.lat };
      var t0 = Date.now();
      var dur = 620;
      function step() {
        var k = Math.min(1, (Date.now() - t0) / dur);
        var e = 1 - Math.pow(1 - k, 3);
        TM.lng = s.lng + (p.lng - s.lng) * e;
        TM.lat = s.lat + (p.lat - s.lat) * e;
        renderTiles();
        if (k < 1) window.requestAnimationFrame(step);
      }
      step();
    }

    /* ---------- 点开地图：全屏弹层 ---------- */
    var fsOpen = false;
    function buildFsTabs() {
      var box = document.getElementById("fsTabs");
      if (!box) return;
      if (box.children.length) {
        for (var i = 0; i < box.children.length; i++) {
          box.children[i].classList.toggle(
            "is-act",
            Number(box.children[i].getAttribute("data-i")) === state.idx
          );
        }
        return;
      }
      var LABELS = ["一校多点", "临床协作网络", "公共数据互联", "校企合作伙伴"];
      LABELS.forEach(function (t, i) {
        var b = document.createElement("button");
        b.type = "button";
        b.className = "fs-tab" + (i === state.idx ? " is-act" : "");
        b.setAttribute("data-i", i);
        b.textContent = t;
        box.appendChild(b);
      });
      box.addEventListener("click", function (e) {
        var b = e.target;
        while (b && b !== box) {
          if (b.getAttribute && b.getAttribute("data-i") !== null) {
            setView(Number(b.getAttribute("data-i")));
            buildFsTabs();
            return;
          }
          b = b.parentNode;
        }
      });
    }
    function openFs() {
      var fs = document.getElementById("fsMap");
      var stage = document.getElementById("fsStage");
      if (!fs || !stage || fsOpen) return;
      fsOpen = true;
      fs.hidden = false;
      stage.appendChild(canvas);
      stage.appendChild(pinsBox);
      stage.appendChild(card);
      fs.classList.add("is-open");
      document.body.style.overflow = "hidden";
      buildFsTabs();
      if (state.mode === "tiles") renderTiles();
      else renderGrid();
    }
    function closeFs() {
      var fs = document.getElementById("fsMap");
      if (!fs || !fsOpen) return;
      fsOpen = false;
      fs.classList.remove("is-open");
      fs.hidden = true;
      content.appendChild(canvas);
      content.appendChild(pinsBox);
      content.appendChild(card);
      document.body.style.overflow = "";
      if (state.mode === "tiles") renderTiles();
      else renderGrid();
    }
    var expBtn = document.createElement("button");
    expBtn.type = "button";
    expBtn.className = "map-expand";
    expBtn.innerHTML = '<i aria-hidden="true"></i><span>展开地图</span>';
    expBtn.addEventListener("click", openFs);
    var panel2 = content.querySelector(".map-left");
    if (panel2) panel2.appendChild(expBtn);
    else canvas.appendChild(expBtn);

    var fsBtn = document.createElement("button");
    fsBtn.type = "button";
    fsBtn.className = "map-card-fs";
    fsBtn.textContent = "全屏查看 · 飞到该点";
    fsBtn.addEventListener("click", function () {
      if (state.last) locateTo(state.last);
      openFs();
    });
    card.appendChild(fsBtn);

    canvas.addEventListener("dblclick", openFs);
    var fsClose = document.getElementById("fsClose");
    if (fsClose) fsClose.addEventListener("click", closeFs);
    var fsLoc = document.getElementById("fsLocate");
    if (fsLoc) fsLoc.addEventListener("click", locateBase);
    document.addEventListener("keydown", function (e) {
      if (fsOpen && (e.key === "Escape" || e.key === "Esc")) closeFs();
    });

    if (ak) loadBaidu();
    else mountTiles();
    setView(0);
  }

  /* =============================================================
     人大「今日人大」式：今日团队（头条轮播 + 动态列表 + 专题推荐）
     ============================================================= */
  function initToday() {
    var dots = document.getElementById("todayDots");
    var media = document.querySelector(".today-media");
    var img = document.getElementById("todayImg");
    if (!dots || !img) return;
    var FEAT = [
      {
        img: "assets/gallery/act1.jpg", alt: "实验教学实训", tag: "实验教学",
        t: "2026 级新成员完成首批上机操作",
        d: "实训周内完成移液、离心与测序上机的全流程考核，正式进入课题组轮转。",
        date: "2026-10-15"
      },
      {
        img: "assets/gallery/act2.jpg", alt: "教学研讨现场", tag: "教学研讨",
        t: "教学研讨：课程共建与实验方案评审",
        d: "围绕实验课程大纲与联合培养方案开展研讨，确定下学期共建课程清单。",
        date: "2026-10-10"
      },
      {
        img: "assets/gallery/act3.jpg", alt: "实验操作指导", tag: "实验指导",
        t: "一对一带教：规范操作从第一支移液枪开始",
        d: "高年级成员带教新成员完成标准操作规程训练，统一实验记录与样本编号规范。",
        date: "2026-10-04"
      }
    ];
    var TOPIC = [
      { t: "2026 年大学生创新训练计划申报", d: "面向全校本科生开放，团队提供课题、算力与一对一指导。" },
      { t: "医工交叉青年学者论坛", d: "每学期一期，邀请高校与医院学者交流交叉学科最新进展。" },
      { t: "组学数据分析训练营", d: "四周集中训练：从原始数据到可复现的完整分析流程。" }
    ];
    var cur = 0;
    var timer = null;
    var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    function paint(f) {
      if (media) media.classList.add("is-swap");
      window.setTimeout(function () {
        img.setAttribute("src", f.img);
        img.setAttribute("alt", f.alt);
        var tag = document.getElementById("todayTag");
        var t2 = document.getElementById("todayTitle2");
        var ds = document.getElementById("todayDesc");
        var dt = document.getElementById("todayDate");
        if (tag) tag.textContent = f.tag;
        if (t2) t2.textContent = f.t;
        if (ds) ds.textContent = f.d;
        if (dt) { dt.textContent = f.date; dt.setAttribute("datetime", f.date); }
        if (media) media.classList.remove("is-swap");
      }, reduced ? 0 : 220);
    }
    function show(i) {
      cur = (i + FEAT.length) % FEAT.length;
      var bs = dots.children;
      for (var k = 0; k < bs.length; k++) bs[k].classList.toggle("is-on", k === cur);
      paint(FEAT[cur]);
    }
    function start() {
      if (!timer && !reduced) timer = window.setInterval(function () { show(cur + 1); }, 5600);
    }
    function stop() {
      if (timer) { window.clearInterval(timer); timer = null; }
    }
    dots.addEventListener("click", function (e) {
      var b = e.target;
      while (b && b !== dots) {
        if (b.getAttribute && b.getAttribute("data-i") !== null) {
          show(Number(b.getAttribute("data-i")));
          return;
        }
        b = b.parentNode;
      }
    });
    var feature = document.querySelector(".today-feature");
    if (feature) {
      feature.addEventListener("mouseenter", stop);
      feature.addEventListener("mouseleave", start);
    }

    var topicI = 0;
    var tTitle = document.getElementById("topicTitle");
    var tDesc = document.getElementById("topicDesc");
    function paintTopic() {
      if (tTitle) tTitle.textContent = TOPIC[topicI].t;
      if (tDesc) tDesc.textContent = TOPIC[topicI].d;
    }
    var arrows = document.querySelectorAll(".today-arrow");
    for (var a = 0; a < arrows.length; a++) {
      arrows[a].addEventListener("click", function () {
        var dir = Number(this.getAttribute("data-dir"));
        topicI = (topicI + dir + TOPIC.length) % TOPIC.length;
        paintTopic();
      });
    }
    var band = document.getElementById("today");
    if (band && "IntersectionObserver" in window) {
      var io = new IntersectionObserver(function (es) {
        es.forEach(function (en) {
          if (en.isIntersecting) start();
          else stop();
        });
      }, { threshold: 0.15 });
      io.observe(band);
    } else {
      start();
    }
  }

  /* =============================================================
     人大「学术讲座」式：学术日历 + 竖排讲座条 + 详情卡
     ============================================================= */
  function initLectures() {
    var strips = document.getElementById("lecStrips");
    var cal = document.getElementById("lecCal");
    if (!strips) return;
    var LEC = [
      {
        name: "单细胞测序数据降维与聚类方法前沿",
        day: "10·16", md: [10, 16],
        speaker: "生物信息学方向教师 · 合作单位研究员",
        time: "2026年10月16日 14:30",
        place: "莲湖校区 理科楼 B301",
        host: "信息与生物医学交叉创新团队",
        brief: "围绕高维组学数据的降维、批次校正与聚类评估，结合公开数据集现场演示完整分析流程。"
      },
      {
        name: "医学影像深度学习分割技术进展",
        day: "10·23", md: [10, 23],
        speaker: "人工智能方向教师 · 附属医院影像科",
        time: "2026年10月23日 15:00",
        place: "莲湖校区 理科楼 A205",
        host: "团队 · 附属医院放射科",
        brief: "从 U-Net 到通用分割模型的演进脉络，讨论小样本标注下的训练策略与评价指标选择。"
      },
      {
        name: "磁共振波谱定量分析入门",
        day: "10·30", md: [10, 30],
        speaker: "分析测试中心工程师",
        time: "2026年10月30日 14:00",
        place: "实验楼 3-12 波谱实验室",
        host: "分析测试中心",
        brief: "介绍谱图采集参数、基线校正与代谢物定量流程，并演示常见伪影的识别与处理。"
      },
      {
        name: "学术写作与图表规范：从数据到论文",
        day: "11·06", md: [11, 6],
        speaker: "团队指导教师",
        time: "2026年11月6日 15:00",
        place: "莲湖校区 图书馆报告厅",
        host: "团队 · 图书馆",
        brief: "以已发表论文为例，拆解结果呈现、图表排版与投稿信写作中的常见误区。"
      },
      {
        name: "保结构算法在生物力学仿真中的应用",
        day: "11·13", md: [11, 13],
        speaker: "计算力学方向教师",
        time: "2026年11月13日 14:30",
        place: "莲湖校区 理科楼 B301",
        host: "信息与生物医学交叉创新团队",
        brief: "讨论长时间仿真中的能量守恒与数值稳定性问题，对比多种保结构积分方案。"
      }
    ];
    var marks = [];
    LEC.forEach(function (l) {
      if (l.md[0] === 10) marks.push(l.md[1]);
    });
    if (cal) {
      var y = 2026, m = 10;
      var first = new Date(y, m - 1, 1).getDay();
      var days = new Date(y, m, 0).getDate();
      var now = new Date();
      var html = "";
      var i;
      for (i = 0; i < first; i++) html += '<span class="lec-cal-day is-empty"></span>';
      for (i = 1; i <= days; i++) {
        var cls = "lec-cal-day";
        if (marks.indexOf(i) >= 0) cls += " is-mark";
        if (now.getFullYear() === y && now.getMonth() + 1 === m && now.getDate() === i) cls += " is-today";
        html += '<span class="' + cls + '">' + i + "</span>";
      }
      cal.innerHTML = html;
    }
    function select(i) {
      var bs = strips.children;
      for (var k = 0; k < bs.length; k++) bs[k].classList.toggle("is-act", k === i);
      var d = LEC[i];
      var set = function (id, v) {
        var el = document.getElementById(id);
        if (el) el.textContent = v;
      };
      set("lecName", d.name);
      set("lecSpeaker", d.speaker);
      set("lecTime", d.time);
      set("lecPlace", d.place);
      set("lecHost", d.host);
      set("lecBrief", d.brief);
    }
    strips.addEventListener("click", function (e) {
      var b = e.target;
      while (b && b !== strips) {
        if (b.getAttribute && b.getAttribute("data-i") !== null) {
          select(Number(b.getAttribute("data-i")));
          return;
        }
        b = b.parentNode;
      }
    });
    select(0);
  }

  /* =============================================================
     南大式：作品/条目交错上浮入场（stagger 组）
     ============================================================= */
  function initStagger() {
    var groups = Array.prototype.slice.call(
      document.querySelectorAll(".stagger-group")
    );
    if (!groups.length) return;
    if (
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      !("IntersectionObserver" in window)
    ) {
      groups.forEach(function (g) {
        g.classList.add("stagger-done");
      });
      return;
    }
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("stagger-done");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.18 }
    );
    groups.forEach(function (g) {
      io.observe(g);
    });
  }

  /* =============================================================
     板块标题入场：文字上浮 + 底线自左展开（呼吸感）
     ============================================================= */
  function initHeadReveal() {
    var heads = Array.prototype.slice.call(
      document.querySelectorAll(
        ".block-head, .notice-head, .map-copy, .plat-head, .mile-head, .achv-head"
      )
    );
    if (!heads.length) return;
    if (
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      !("IntersectionObserver" in window)
    ) {
      heads.forEach(function (h) {
        h.classList.add("head-in");
      });
      return;
    }
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("head-in");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.4 }
    );
    heads.forEach(function (h) {
      io.observe(h);
    });
  }

  /* =============================================================
     十四轮：滚动换页引擎
     板块随滚动做「由下浮入 → 居中 → 上推移出」的连续过渡，
     配合幕布收起、章节题签与整页底色平滑切换，形成翻页观感。
     ============================================================= */
  var TONE_MAP = {
    "stats-band": "#0b2540",
    "typewriter-band": "#13365c",
    "join-band": "#0b2540",
    "quick-band": "#113055",
    "focus-band": "#f7fafd",
    "dir-band": "#fffdf7",
    "plat-band": "#f2f7fc",
    "notice-band": "#e6eff8",
    "main-col": "#fbfaf5",
    "mile-band": "#f4f8fc",
    "achv-band": "#fdfbf5",
    "map-band": "#0b2540",
    "exch-band": "#fbfaf6",
    "gallery-band": "#ffffff",
    "today-band": "#fbfaf6",
    "lec-band": "#f7f4ec",
  };

  function initSceneSwap() {
    var host = document.querySelector("main");
    if (!host) return;
    var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced || window.innerWidth < 900) return;

    var scenes = Array.prototype.slice
      .call(host.children)
      .filter(function (el) {
        return (
          el.tagName === "SECTION" ||
          el.classList.contains("main-col")
        ) && !el.classList.contains("banner") &&
          !el.classList.contains("breadcrumb");
      });
    if (!scenes.length) return;
    document.documentElement.classList.add("js-scene");

    var bg = document.getElementById("pageBg");

    scenes.forEach(function (sc, i) {
      sc.classList.add("scene");

      // 幕布：未进入时覆盖，进入后由下往上收起
      var cur = document.createElement("i");
      cur.className = "scene-curtain";
      cur.setAttribute("aria-hidden", "true");
      sc.insertBefore(cur, sc.firstChild);

      // 章节题签：序号 + 板块名
      var tag = document.createElement("span");
      tag.className = "scene-tag";
      tag.setAttribute("aria-hidden", "true");
      var no = i + 1;
      tag.innerHTML =
        "<b>" + (no < 10 ? "0" + no : no) + "</b><i>" + sceneLabel(sc) + "</i>";
      sc.appendChild(tag);
    });

    function sceneLabel(sc) {
      var t =
        sc.querySelector(".plat-title") ||
        sc.querySelector(".block-title") ||
        sc.querySelector(".map-title") ||
        sc.querySelector(".notice-title") ||
        sc.querySelector("h2") ||
        sc.querySelector("h3");
      if (t) return t.textContent.trim().replace(/\s+/g, "");
      var aria = sc.getAttribute("aria-label") || sc.getAttribute("aria-labelledby");
      return aria ? aria.trim() : "";
    }

    var ticking = false;
    function update() {
      ticking = false;
      var vh = window.innerHeight;
      var lead = null;

      for (var i = 0; i < scenes.length; i++) {
        var sc = scenes[i];
        var r = sc.getBoundingClientRect();
        if (r.bottom < -200 || r.top > vh + 200) continue;

        // 进入：板块顶部进入视口下沿算起
        var enter = (vh - r.top) / Math.min(vh * 0.66, Math.max(r.height * 0.45, 300));
        enter = enter < 0 ? 0 : enter > 1 ? 1 : enter;

        // 移出：已滚过视口中线之后逐步淡出上移
        var leave = (-r.top - r.height * 0.5) / (vh * 0.72);
        leave = leave < 0 ? 0 : leave > 1 ? 1 : leave;

        var ty = -30 * (1 - enter) - 26 * leave;
        var s = 1 - 0.018 * (1 - enter) - 0.026 * leave;
        var o = 1 - 0.42 * (1 - enter) - 0.5 * leave;

        var st = sc.style;
        st.setProperty("--sc-y", ty.toFixed(2) + "px");
        st.setProperty("--sc-s", s.toFixed(4));
        st.setProperty("--sc-o", o.toFixed(3));
        st.setProperty("--sc-cur", (1 - enter).toFixed(3));
        st.setProperty("--sc-tag", (enter > 0.55 && leave < 0.4 ? 1 : 0).toFixed(0));

        // 视口 38% 处的板块决定整页底色
        if (r.top <= vh * 0.38 && r.bottom >= vh * 0.38) lead = sc;
      }

      if (bg && lead) {
        var key = lead.classList[0];
        var tone = lead.getAttribute("data-tone") || TONE_MAP[key] || "#ffffff";
        if (tone !== bg.getAttribute("data-cur")) {
          bg.setAttribute("data-cur", tone);
          bg.style.background = tone;
        }
      }
    }

    function onScroll() {
      if (!ticking) {
        ticking = true;
        window.requestAnimationFrame(update);
      }
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    update();
  }

  /* =============================================================
     十四轮：大事记时间轴（轴线随滚动生长 + 节点逐个点亮）
     ============================================================= */
  function initMilestone() {
    var list = document.getElementById("mileList");
    if (!list) return;
    var items = Array.prototype.slice.call(list.querySelectorAll(".mile-item"));
    if (!items.length) return;

    if ("IntersectionObserver" in window) {
      var io = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (en) {
            if (en.isIntersecting) {
              en.target.classList.add("lit");
              io.unobserve(en.target);
            }
          });
        },
        { threshold: 0.35, rootMargin: "0px 0px -8% 0px" }
      );
      items.forEach(function (it) {
        io.observe(it);
      });
    } else {
      items.forEach(function (it) {
        it.classList.add("lit");
      });
    }

    var ticking = false;
    function update() {
      ticking = false;
      var r = list.getBoundingClientRect();
      var p = (window.innerHeight * 0.62 - r.top) / Math.max(r.height, 1);
      p = p < 0 ? 0 : p > 1 ? 1 : p;
      list.style.setProperty("--axis", p.toFixed(3));
    }
    function onScroll() {
      if (!ticking) {
        ticking = true;
        window.requestAnimationFrame(update);
      }
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    update();
  }

  /* =============================================================
     十四轮：科研成果分类切换
     ============================================================= */
  function initAchvTabs() {
    var tabs = Array.prototype.slice.call(document.querySelectorAll(".achv-tab"));
    if (!tabs.length) return;
    var panels = Array.prototype.slice.call(
      document.querySelectorAll(".achv-panel")
    );
    tabs.forEach(function (tab) {
      tab.addEventListener("click", function () {
        var key = tab.getAttribute("data-tab");
        tabs.forEach(function (t) {
          var on = t === tab;
          t.classList.toggle("active", on);
          t.setAttribute("aria-selected", on ? "true" : "false");
        });
        panels.forEach(function (p) {
          var on = p.getAttribute("data-panel") === key;
          p.hidden = !on;
          p.classList.remove("active");
          if (on) {
            void p.offsetWidth;
            p.classList.add("active");
          }
        });
      });
    });
  }

  /* =============================================================
     十八轮：动效增强驱动
     ① 卡片 3D 倾斜 + 高光跟随  ② 板块鼠标光斑  ③ 图片滚动视差
     ============================================================= */
  function initTiltGloss() {
    var sel =
      ".plat-card, .exch-card, .dir-card3, .mile-card, .achv-list li, .notice-card, .acad-item, .quick-btn";
    var cards = Array.prototype.slice.call(document.querySelectorAll(sel));
    if (!cards.length) return;
    if (
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      window.matchMedia("(hover: none)").matches
    )
      return;

    cards.forEach(function (card) {
      card.classList.add("tilt");
      var raf = 0;
      function move(e) {
        if (raf) return;
        raf = window.requestAnimationFrame(function () {
          raf = 0;
          var r = card.getBoundingClientRect();
          var px = (e.clientX - r.left) / r.width;
          var py = (e.clientY - r.top) / r.height;
          card.style.setProperty("--mx", (px * 100).toFixed(1) + "%");
          card.style.setProperty("--my", (py * 100).toFixed(1) + "%");
          var ry = (px - 0.5) * 7;
          var rx = (0.5 - py) * 7;
          card.classList.add("is-live");
          card.style.transform =
            "perspective(900px) rotateX(" +
            rx.toFixed(2) +
            "deg) rotateY(" +
            ry.toFixed(2) +
            "deg) translateY(-7px) scale(1.015)";
        });
      }
      function leave() {
        card.classList.remove("is-live");
        card.style.transform = "";
      }
      card.addEventListener("mousemove", move);
      card.addEventListener("mouseleave", leave);
    });
  }

  function initSpotlight() {
    var bands = Array.prototype.slice.call(
      document.querySelectorAll(
        ".plat-band, .mile-band, .achv-band, .exch-band, .dir-band, .map-band, .join-band"
      )
    );
    if (!bands.length) return;
    if (
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      window.matchMedia("(hover: none)").matches
    )
      return;

    bands.forEach(function (b) {
      b.classList.add("spotlight");
      var raf = 0;
      b.addEventListener("mousemove", function (e) {
        if (raf) return;
        raf = window.requestAnimationFrame(function () {
          raf = 0;
          var r = b.getBoundingClientRect();
          b.style.setProperty("--mx", (e.clientX - r.left).toFixed(0) + "px");
          b.style.setProperty("--my", (e.clientY - r.top).toFixed(0) + "px");
          b.classList.add("is-lit");
        });
      });
      b.addEventListener("mouseleave", function () {
        b.classList.remove("is-lit");
      });
    });
  }

  function initMediaParallax() {
    var boxes = Array.prototype.slice.call(
      document.querySelectorAll(".dir-media3, .nf-stage")
    );
    if (!boxes.length) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (window.innerWidth < 900) return;

    boxes.forEach(function (box) {
      box.classList.add("pmedia");
    });

    var ticking = false;
    function update() {
      ticking = false;
      var vh = window.innerHeight;
      for (var i = 0; i < boxes.length; i++) {
        var box = boxes[i];
        var r = box.getBoundingClientRect();
        if (r.bottom < -120 || r.top > vh + 120) continue;
        // -1（在视口下方）→ 1（滚过上方），映射到 ±7% 位移
        var p = (vh / 2 - (r.top + r.height / 2)) / (vh / 2 + r.height / 2);
        p = p < -1 ? -1 : p > 1 ? 1 : p;
        box.style.setProperty("--py", (p * -14).toFixed(1) + "px");
      }
    }
    function onScroll() {
      if (!ticking) {
        ticking = true;
        window.requestAnimationFrame(update);
      }
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    update();
  }

  /* =============================================================
     初始化（DOM 就绪后执行）
     ============================================================= */
  function init() {
    initBanner();
    initNewsFeature();
    initFocusPanels();
    initSidebar();
    initMoreLinks();
    initPlaceholderActions();
    initScrollHighlight();
    initBackTop();
    initScrollRail();
    initStickyHeader();
    initScrollProgress();
    initHoverDir();
    initSvgDraw();
    initBannerDrag();
    initStatsParallax();
    initMottoParallax();
    initStatsSlides();
    initPeopleBand();
    initMapBand();
    initToday();
    initLectures();
    initStagger();
    initHeadReveal();
    initSceneSwap();
    initMilestone();
    initAchvTabs();
    initTiltGloss();
    initSpotlight();
    initMediaParallax();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();