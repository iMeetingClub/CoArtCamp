/* NT 的流通手风琴（排他式）：点击期数卡，展开对应期并收起其他期；再点同一期则收起 */
/* 渐进增强：HTML 默认全部可见，JS 加载后才收起面板并接管展开状态 */
(function () {
  var triggers = document.querySelectorAll("[data-nt-trigger]");

  /* 初始化：统一隐藏面板、初始化 aria-expanded */
  triggers.forEach(function (card) {
    var key = card.getAttribute("data-nt-trigger");
    var panel = document.querySelector('[data-nt-panel="' + key + '"]');
    if (!panel) return;
    panel.hidden = true;
    card.setAttribute("aria-expanded", "false");
  });

  triggers.forEach(function (card) {
    card.addEventListener("click", function () {
      var key = card.getAttribute("data-nt-trigger");
      var panel = document.querySelector('[data-nt-panel="' + key + '"]');
      if (!panel) return;
      var opening = panel.hidden;
      /* 排他式：先收起全部面板、复位全部触发器；再点同一期即全部收起（toggle 语义保留） */
      triggers.forEach(function (other) {
        var otherKey = other.getAttribute("data-nt-trigger");
        var otherPanel = document.querySelector('[data-nt-panel="' + otherKey + '"]');
        if (otherPanel) otherPanel.hidden = true;
        other.classList.remove("is-active");
        other.setAttribute("aria-expanded", "false");
      });
      if (opening) {
        panel.hidden = false;
        card.classList.add("is-active");
        card.setAttribute("aria-expanded", "true");
        var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        panel.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
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
