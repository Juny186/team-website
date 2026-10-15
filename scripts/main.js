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
    const INTERVAL = 4000; // 自动轮播间隔 4s

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
            72 /* 页头高度补偿 */,
          behavior: reduced ? "auto" : "smooth",
        });
      });
    });
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
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();