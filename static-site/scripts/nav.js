/* ============================================================
   site-nav 组件脚本 — 自包含页面共享的抽屉导航
   行为与 scripts/app.js 的 drawer 一致（开关 / 遮罩 / Esc / 左滑 70px 关闭）。
   供自包含页面（gratitude-design / nt-flow-progression / 募捐 / 报名 / 钱包）使用。
   需要全站导航闭环更新时，改这里，5 个页面自动生效。
   用法：<link rel="stylesheet" href="styles/nav.css">
        <script src="scripts/nav.js" defer></script>
   ============================================================ */

import { navItems } from "./site-data.js";

(function () {
  function currentPageKey() {
    var file = location.pathname.split("/").pop() || "index.html";
    for (var i = 0; i < navItems.length; i++) {
      if (navItems[i].href === file) return navItems[i].key;
    }
    if (file === "index.html") return "home";
    return "home";
  }

  function esc(text) {
    return String(text)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function init() {
    if (document.querySelector("[data-site-nav]")) return;
    var pageKey = currentPageKey();
    // SPA 页（首页/分期/纪事）的顶栏已自带菜单按钮：只注入抽屉，不再叠一个固定按钮
    var hasPageToggle = !!document.querySelector("[data-drawer-toggle]");
    var lastOpener = null;

    var root = document.createElement("div");
    root.className = "site-nav";
    root.setAttribute("data-site-nav", "");

    var links = navItems
      .map(function (item) {
        var active = item.key === pageKey;
        return (
          '<a class="drawer-link' + (active ? " is-active" : "") + '" href="' + esc(item.href) + '" data-nav-key="' + esc(item.key) + '"' + (active ? ' aria-current="page"' : "") + ">" +
          '<span class="drawer-link__index">' + esc(item.index) + "</span>" +
          '<span class="drawer-link__copy">' +
          '<span class="drawer-link__title">' + esc(item.title) + "</span>" +
          '<span class="drawer-link__subtitle">' + esc(item.subtitle) + "</span>" +
          "</span>" +
          '<span class="drawer-link__arrow">&gt;</span>' +
          "</a>"
        );
      })
      .join("");

    root.innerHTML =
      (hasPageToggle ? "" :
      '<button class="menu-button" type="button" aria-label="打开侧边栏" data-drawer-toggle>' +
      "<span></span><span></span><span></span>" +
      "</button>") +
      '<button class="drawer-backdrop" type="button" aria-label="关闭侧边栏"></button>' +
      '<aside class="drawer" aria-hidden="true" inert>' +
      '<div class="drawer__header">' +
      '<button class="menu-button" type="button" aria-label="关闭侧边栏" data-drawer-toggle>' +
      "<span></span><span></span><span></span>" +
      "</button>" +
      '<div class="drawer__brand"><h2 class="drawer__brand-title">艺术共创营</h2></div>' +
      "</div>" +
      '<nav class="drawer__nav" aria-label="页面导航">' + links + "</nav>" +
      '<div class="drawer__footer">' +
      '<div class="drawer__footer-rule"></div>' +
      "<p>点击右侧留白或再次点击左上角按钮关闭</p>" +
      "</div>" +
      '<img class="drawer__bird" src="assets/images/feature-bird-cutout.png" alt="">' +
      "</aside>";

    document.body.appendChild(root);

    var drawer = root.querySelector(".drawer");
    var backdrop = root.querySelector(".drawer-backdrop");
    var state = { startX: 0, currentX: 0, tracking: false };

    function openDrawer() {
      lastOpener = document.activeElement;
      root.setAttribute("data-open", "true");
      document.body.classList.add("site-nav-open");
      drawer.removeAttribute("inert");
      drawer.setAttribute("aria-hidden", "false");
      var target = drawer.querySelector(".drawer-link.is-active") || drawer.querySelector("[data-drawer-toggle]");
      if (target) target.focus();
    }

    function closeDrawer() {
      var focusInside = drawer.contains(document.activeElement);
      root.setAttribute("data-open", "false");
      document.body.classList.remove("site-nav-open");
      drawer.setAttribute("inert", "");
      drawer.setAttribute("aria-hidden", "true");
      drawer.style.transform = "";
      state.startX = 0;
      state.currentX = 0;
      state.tracking = false;
      if (focusInside && lastOpener && document.contains(lastOpener)) lastOpener.focus();
      lastOpener = null;
    }

    function toggleDrawer() {
      if (root.getAttribute("data-open") === "true") {
        closeDrawer();
      } else {
        openDrawer();
      }
    }

    drawer.addEventListener("touchstart", function (event) {
      if (root.getAttribute("data-open") !== "true") return;
      state.tracking = true;
      state.startX = event.touches[0].clientX;
      state.currentX = state.startX;
    }, { passive: true });

    drawer.addEventListener("touchmove", function (event) {
      if (!state.tracking) return;
      state.currentX = event.touches[0].clientX;
      var delta = Math.min(0, state.currentX - state.startX);
      drawer.style.transform = "translateX(" + delta + "px)";
    }, { passive: true });

    drawer.addEventListener("touchend", function () {
      if (!state.tracking) return;
      var delta = state.currentX - state.startX;
      if (delta < -70) {
        closeDrawer();
      } else {
        drawer.style.transform = "";
        state.startX = 0;
        state.currentX = 0;
        state.tracking = false;
      }
    });

    document.querySelectorAll("[data-drawer-toggle]").forEach(function (button) {
      button.addEventListener("click", toggleDrawer);
    });
    backdrop.addEventListener("click", closeDrawer);

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && root.getAttribute("data-open") === "true") {
        closeDrawer();
      }
    });

    window.openDrawer = openDrawer;
    window.closeDrawer = closeDrawer;
    window.toggleDrawer = toggleDrawer;
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
