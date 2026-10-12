/* =============================================================
   四川文理学院 信息与生物医学交叉创新团队
   原生 JS：轮播 + 汉堡菜单 + 导航高亮
   ============================================================= */
(function () {
  "use strict";

  /* ---------- 轮播图 ---------- */
  var bannerViewport = document.querySelector(".banner-viewport");
  var prevBtn = document.getElementById("bannerPrev");
  var nextBtn = document.getElementById("bannerNext");
  var dotsWrap = document.getElementById("bannerDots");

  if (bannerViewport && dotsWrap) {
    var slides = Array.prototype.slice.call(
      bannerViewport.querySelectorAll(".banner-slide")
    );
    var slideCount = slides.length;
    var index = 0;
    var timer = null;
    var INTERVAL = 4000; // 自动轮播间隔 4s

    // 动态生成页码指示器
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

    function prev() {
      goTo(index - 1);
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

    if (prevBtn) prevBtn.addEventListener("click", function () { prev(); restart(); });
    if (nextBtn) nextBtn.addEventListener("click", function () { next(); restart(); });

    // 鼠标悬停暂停自动播放
    bannerViewport.addEventListener("mouseenter", stop);
    bannerViewport.addEventListener("mouseleave", restart);

    goTo(0);
    restart();
  }

  /* ---------- 手机端汉堡菜单 ---------- */
  var navToggle = document.getElementById("navToggle");
  var navList = document.getElementById("navList");

  if (navToggle && navList) {
    navToggle.addEventListener("click", function () {
      var open = navList.classList.toggle("open");
      navToggle.setAttribute("aria-expanded", open ? "true" : "false");
      navToggle.setAttribute("aria-label", open ? "关闭菜单" : "打开菜单");
    });

    // 点击菜单项后自动收起
    navList.addEventListener("click", function (e) {
      if (e.target.closest(".nav-item a") && navList.classList.contains("open")) {
        navList.classList.remove("open");
        navToggle.setAttribute("aria-expanded", "false");
        navToggle.setAttribute("aria-label", "打开菜单");
      }
    });
  }

  /* ---------- 当前区块导航高亮 ---------- */
  var sections = [
    { id: "home", link: null },
    { id: "about", link: null },
    { id: "research", link: null },
    { id: "members", link: null },
    { id: "achievements", link: null },
    { id: "frontier", link: null },
    { id: "contact", link: null }
  ];

  var navAnchors = Array.prototype.slice.call(
    document.querySelectorAll('.nav-item a[href^="#"]')
  );
  navAnchors.forEach(function (a) {
    var map = sections.filter(function (s) {
      return a.getAttribute("href") === "#" + s.id;
    });
    if (map.length) map[0].link = a.parentElement;
  });

  function onScroll() {
    var scrollY = window.pageYOffset || document.documentElement.scrollTop;
    var current = sections[0].id;

    sections.forEach(function (s) {
      var el = document.getElementById(s.id);
      if (!el) return;
      var rect = el.getBoundingClientRect();
      // 距离顶部较近的区块视为当前
      if (rect.top <= 160) {
        current = s.id;
      }
    });

    navAnchors.forEach(function (a) {
      a.parentElement.classList.remove("active");
    });
    var matched = sections.filter(function (s) {
      return s.id === current;
    });
    if (matched.length && matched[0].link) {
      matched[0].link.classList.add("active");
    }
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
})();