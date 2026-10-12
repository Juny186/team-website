/* =============================================================
   四川文理学院 信息与生物医学交叉创新团队
   原生 JS：轮播 + 移动端侧边抽屉 + 导航高亮 + MORE 占位跳转
   ============================================================= */
(function () {
  "use strict";

  /* ---------- 轮播图 ---------- */
  var bannerViewport = document.getElementById("bannerViewport");
  var dotsWrap = document.getElementById("bannerDots");

  if (bannerViewport && dotsWrap) {
    var slides = Array.prototype.slice.call(
      bannerViewport.querySelectorAll(".banner-slide")
    );
    var slideCount = slides.length;
    var index = 0;
    var timer = null;
    var INTERVAL = 4000; // 自动轮播间隔 4s

    slides.forEach(function (_, i) {
      var dot = document.createElement("button");
      dot.type = "button";
      dot.setAttribute("role", "tab");
      dot.setAttribute("aria-label", "第 " + (i + 1) + " 张");
      dot.addEventListener("click", function () {
        goTo(i);
        restart();
      });
      dotsWrap.appendChild(dot);
    });

    var dots = Array.prototype.slice.call(dotsWrap.querySelectorAll("button"));

    function goTo(i) {
      index = (i + slideCount) % slideCount;
      slides.forEach(function (slide, si) {
        var on = si === index;
        slide.classList.toggle("active", on);
        dots[si].classList.toggle("active", on);
        dots[si].setAttribute("aria-selected", on ? "true" : "false");
      });
    }

    function next() {
      goTo(index + 1);
    }

    function restart() {
      stop();
      timer = setInterval(next, INTERVAL);
    }

    function stop() {
      if (timer) {
        clearInterval(timer);
        timer = null;
      }
    }

    bannerViewport.addEventListener("mouseenter", stop);
    bannerViewport.addEventListener("mouseleave", restart);

    goTo(0);
    restart();
  }

  /* ---------- 移动端侧边抽屉导航 ---------- */
  var sidebar = document.getElementById("sidebar");
  var sidebarOverlay = document.getElementById("sidebarOverlay");
  var sidebarToggle = document.getElementById("sidebarToggle");
  var sidebarClose = document.getElementById("sidebarClose");

  if (sidebar && sidebarOverlay) {
    function openSidebar() {
      sidebar.classList.add("open");
      sidebarOverlay.classList.add("show");
      document.body.classList.add("menu-open");
      if (sidebarToggle) sidebarToggle.setAttribute("aria-expanded", "true");
    }

    function closeSidebar() {
      sidebar.classList.remove("open");
      sidebarOverlay.classList.remove("show");
      document.body.classList.remove("menu-open");
      if (sidebarToggle) sidebarToggle.setAttribute("aria-expanded", "false");
    }

    if (sidebarToggle) sidebarToggle.addEventListener("click", openSidebar);
    if (sidebarClose) sidebarClose.addEventListener("click", closeSidebar);
    sidebarOverlay.addEventListener("click", closeSidebar);

    // 点击任一侧边链接后自动收起（首页类锚点跳转）
    sidebar.querySelectorAll('a[href^="#"]').forEach(function (a) {
      a.addEventListener("click", closeSidebar);
    });

    /* 子菜单展开/收起 */
    sidebar.querySelectorAll(".side-toggle").forEach(function (btn) {
      btn.addEventListener("click", function (e) {
        e.preventDefault();
        var sub = btn.closest(".side-item").querySelector(".side-sub");
        var expanded = btn.getAttribute("aria-expanded") === "true";
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

  /* ---------- MORE + 跳转占位 ---------- */
  document.querySelectorAll(".js-more").forEach(function (el) {
    el.addEventListener("click", function (e) {
      e.preventDefault();
      var target = el.getAttribute("data-target");
      // 占位：根据板块滚动到对应区块；后续替换为真实列表页地址
      if (target && document.getElementById(target)) {
        document.getElementById(target).scrollIntoView({ behavior: "smooth" });
      }
    });
  });

  /* ---------- 当前区块导航高亮 ---------- */
  var sections = ["home", "about", "research", "members", "achievements", "frontier", "news", "contact", "links"];
  var navAnchors = Array.prototype.slice.call(
    document.querySelectorAll('#navList a[href^="#"]')
  );

  function onScroll() {
    var scrollY = window.pageYOffset || document.documentElement.scrollTop;
    var current = "home";

    sections.forEach(function (id) {
      var el = document.getElementById(id);
      if (!el) return;
      var rect = el.getBoundingClientRect();
      if (rect.top <= 160) current = id;
    });

    navAnchors.forEach(function (a) {
      var match = a.getAttribute("href") === "#" + current;
      a.parentElement.classList.toggle("active", match);
    });

    // 同步侧边菜单高亮
    sidebar &&
      sidebar.querySelectorAll(".side-item").forEach(function (item) {
        var link = item.querySelector("a[href^='#']");
        var href = link ? link.getAttribute("href") : "";
        item.classList.toggle("active", href === "#" + current);
      });
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
})();