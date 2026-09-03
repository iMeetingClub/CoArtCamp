/* 合作丰碑手风琴：点击期数卡，展开/收起对应碑面 */
/* 渐进增强：HTML 默认全部可见，JS 加载后才收起面板并接管展开状态 */
(function () {
  var triggers = document.querySelectorAll("[data-gratitude-trigger]");

  /* 初始化：统一隐藏面板、初始化 aria-expanded */
  triggers.forEach(function (card) {
    var key = card.getAttribute("data-gratitude-trigger");
    var panel = document.querySelector('[data-gratitude-panel="' + key + '"]');
    if (!panel) return;
    panel.hidden = true;
    card.setAttribute("aria-expanded", "false");
  });

  triggers.forEach(function (card) {
    card.addEventListener("click", function () {
      var key = card.getAttribute("data-gratitude-trigger");
      var panel = document.querySelector('[data-gratitude-panel="' + key + '"]');
      if (!panel) return;
      var opening = panel.hidden;
      panel.hidden = !opening;
      card.classList.toggle("is-active", opening);
      card.setAttribute("aria-expanded", opening ? "true" : "false");
      if (opening) {
        panel.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
    card.addEventListener("keydown", function (event) {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        card.click();
      }
    });
  });
})();
