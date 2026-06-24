import { navItems, pages } from "./site-data.js?v=2";

const pageKey = document.body.dataset.page || "home";
const page = pages[pageKey];

const state = {
  startX: 0,
  currentX: 0,
  tracking: false,
};

const app = document.getElementById("app");

function esc(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function nlToBr(value) {
  return esc(value).replaceAll("\n", "<br>");
}

function renderMenuButton() {
  return `
    <button class="menu-button" type="button" aria-label="打开侧边栏" data-drawer-toggle>
      <span></span><span></span><span></span>
    </button>
  `;
}

function renderTopNav() {
  return `
    <header class="top-nav">
      <div class="top-nav__left">
        ${renderMenuButton()}
        <div class="top-nav__label">
          <p class="top-nav__en">${esc(page.navLabelEn)}</p>
          <p class="top-nav__zh">${esc(page.navLabelZh)}</p>
        </div>
      </div>
      <div class="top-nav__identity">${esc(page.topbarIdentity || "")}</div>
    </header>
  `;
}

function renderBanner() {
  const note = page.banner.noteTitle && page.banner.noteText ? `
      <section class="hero-note">
        <h2 class="hero-note__title">${esc(page.banner.noteTitle)}</h2>
        <p class="hero-note__text">${esc(page.banner.noteText)}</p>
      </section>
  ` : "";

  return `
    <section class="hero-card${note ? "" : " hero-card--compact"}">
      <div class="hero-card__mist"></div>
      <div class="hero-card__sun"></div>
      <div class="hero-card__curve hero-card__curve--one"></div>
      <div class="hero-card__curve hero-card__curve--two"></div>
      <p class="eyebrow eyebrow--hero">${esc(page.banner.kicker)}</p>
      <p class="hero-card__hand">${esc(page.banner.handline)}</p>
      <h1 class="hero-card__title">${nlToBr(page.banner.title)}</h1>
      <p class="hero-card__intro">${esc(page.banner.intro)}</p>
      <div class="status-pill">${esc(page.banner.status)}</div>
      ${note}
    </section>
  `;
}

function renderTextCard(section) {
  return `
    <section class="section-card">
      <p class="eyebrow">${esc(section.eyebrow)}</p>
      <h2 class="section-title">${esc(section.title)}</h2>
      <div class="copy-stack">
        ${section.paragraphs.map((text) => `<p class="body-copy">${esc(text)}</p>`).join("")}
      </div>
      <div class="section-rule"></div>
      <p class="section-note">${esc(section.note)}</p>
    </section>
  `;
}

function renderArchiveItem(item) {
  return `
    <a class="archive-card${item.reverse ? " archive-card--reverse" : ""}" href="${esc(item.href)}">
      <div class="archive-card__media-row">
        ${item.reverse ? renderArchiveRail(item) + renderArchiveImage(item) : renderArchiveImage(item) + renderArchiveRail(item)}
      </div>
      <div class="archive-card__detail">
        <p class="archive-card__tag">${esc(item.tag)}</p>
        <h3 class="archive-card__title">${esc(item.title)}</h3>
        <p class="archive-card__body">${esc(item.body)}</p>
      </div>
    </a>
  `;
}

function renderArchiveImage(item) {
  if (item && item.image) {
    return `<img class="archive-image" src="${esc(item.image)}" alt="${esc(item.tag)}" loading="lazy">`;
  }
  return `<div class="placeholder-media placeholder-media--archive" aria-hidden="true"></div>`;
}

function renderArchiveRail(item) {
  return `
    <div class="archive-rail">
      <div class="archive-rail__index">${esc(item.index)}</div>
      <div>
        <p class="archive-rail__tag">${esc(item.tag)}</p>
        <p class="archive-rail__line">${esc(item.line)}</p>
      </div>
      <p class="archive-rail__cta">点击查看 →</p>
    </div>
  `;
}

function renderArchive(section) {
  return `
    <section class="archive-section">
      <p class="eyebrow">${esc(section.eyebrow)}</p>
      <h2 class="section-title">${esc(section.title)}</h2>
      <p class="body-copy body-copy--compact">${esc(section.intro)}</p>
      <div class="archive-next">
        <p class="eyebrow eyebrow--small">${esc(section.after.eyebrow)}</p>
        <p class="body-copy body-copy--compact">${esc(section.after.text)}</p>
      </div>
      <div class="archive-list">
        ${section.items.map(renderArchiveItem).join("")}
      </div>
    </section>
  `;
}

function renderCredits(section) {
  return `
    <section class="credits-section">
      <p class="eyebrow eyebrow--small">${esc(section.eyebrow)}</p>
      <h2 class="section-title section-title--small">${esc(section.title)}</h2>
      <div class="credits-grid">
        ${section.people.map((person) => `
          <article class="credit-card">
            ${person.image ? `<img class="credit-card__avatar credit-card__avatar--photo" src="${encodeURI(person.image)}" alt="${esc(person.name)}" loading="lazy">` : `<div class="credit-card__avatar" aria-hidden="true"></div>`}
            <h3 class="credit-card__name">${esc(person.name)}</h3>
            <p class="credit-card__role">${esc(person.role)}</p>
          </article>
        `).join("")}
      </div>
    </section>
  `;
}

function renderSideProject(section) {
  return `
    <section class="side-project-section">
      <div class="side-project-head">
        <div>
          <p class="eyebrow">${esc(section.eyebrow)}</p>
          <h2 class="section-title">${esc(section.title)}</h2>
        </div>
        <span class="side-status">${esc(section.statusLabel)}</span>
      </div>
      <p class="body-copy body-copy--compact">${esc(section.intro)}</p>
      <div class="side-map" aria-label="${esc(section.title)}">
        ${section.lanes.map((lane) => `
          <article class="side-lane-card">
            <p class="side-lane-card__label">${esc(lane.label)}</p>
            ${lane.title ? `<h3 class="side-lane-card__title">${esc(lane.title)}</h3>` : ""}
            ${lane.meta ? `<p class="side-lane-card__meta">${esc(lane.meta)}</p>` : ""}
            ${lane.body ? `<p class="side-lane-card__body">${esc(lane.body)}</p>` : ""}
            ${lane.names ? `<div class="side-lane-card__names">${lane.names.map((name) => `<span>${esc(name)}</span>`).join("")}</div>` : ""}
            ${lane.groups ? `
              <div class="side-lane-card__groups">
                ${lane.groups.map((group) => `
                  <div class="side-lane-card__group">
                    <p class="side-lane-card__group-label">${esc(group.label)}</p>
                    <div class="side-lane-card__names">
                      ${group.items.map((item) => `<span>${esc(item)}</span>`).join("")}
                    </div>
                  </div>
                `).join("")}
              </div>
            ` : ""}
            ${lane.chips && lane.chips.length ? `
              <div class="side-lane-card__chips">
                ${lane.chips.map((chip) => `<span>${esc(chip)}</span>`).join("")}
              </div>
            ` : ""}
          </article>
        `).join("")}
      </div>
      ${section.groups ? `
        <div class="side-groups">
          ${section.groups.map((group) => `
            <div class="side-group">
              <p class="side-group__label">${esc(group.label)}</p>
              <p class="side-group__text">${esc(group.items.join("、"))}${group.suffix ? esc(group.suffix) : ""}</p>
            </div>
          `).join("")}
        </div>
      ` : ""}
      <div class="side-contract">
        <p>
          ${section.contract.before ? `${esc(section.contract.before)}<a href="${esc(section.contract.href)}">${esc(section.contract.linkLabel)}</a>${esc(section.contract.after)}` : `${esc(section.contract.text)} <a href="${esc(section.contract.href)}">${esc(section.contract.linkLabel)}</a>`}
        </p>
      </div>
      ${section.caption ? `<p class="side-project-caption">${esc(section.caption)}</p>` : ""}
    </section>
  `;
}

function renderWorks(section) {
  return `
    <section class="works-section">
      <p class="eyebrow">${esc(section.eyebrow)}</p>
      <h2 class="section-title">${esc(section.title)}</h2>
      <p class="body-copy body-copy--compact">${esc(section.intro)}</p>
      <div class="works-list">
        ${section.items.map((item, index) => `
          <article class="work-card">
            <div class="work-card__top${item.reverse ? " work-card__top--reverse" : ""}">
              ${item.reverse ? renderWorkRail(item) + renderWorkImage(item) : renderWorkImage(item) + renderWorkRail(item)}
            </div>
            <div class="work-card__detail">
              <p class="work-card__meta">作品 ${String(index + 1).padStart(2, "0")}</p>
              <p class="work-card__body">${esc(item.body)}</p>
            </div>
          </article>
        `).join("")}
      </div>
    </section>
  `;
}

function renderWorkImage(item) {
  if (item && item.image) {
    return `<img class="work-image" src="${esc(item.image)}" alt="${esc(item.sideTitle)}" loading="lazy">`;
  }
  return `<div class="placeholder-media placeholder-media--work" aria-hidden="true"></div>`;
}

function renderWorkRail(item) {
  return `
    <div class="work-rail">
      <h3 class="work-rail__title">${esc(item.sideTitle)}</h3>
      <p class="work-rail__meta">${esc(item.meta)}</p>
      <p class="work-rail__line">${esc(item.sideLine)}</p>
    </div>
  `;
}

function renderCoCreators(section) {
  return `
    <section class="people-section">
      <p class="eyebrow">${esc(section.eyebrow)}</p>
      <h2 class="section-title">${esc(section.title)}</h2>
      <p class="body-copy body-copy--compact">${esc(section.intro)}</p>
      <div class="people-list">
        ${section.items.map((item) => `
          <article class="person-card${item.reverse ? " person-card--reverse" : ""}">
            ${item.reverse ? renderPersonInfo(item) + renderPersonAvatar(item.image) : renderPersonAvatar(item.image) + renderPersonInfo(item)}
          </article>
        `).join("")}
      </div>
    </section>
  `;
}

function renderPersonAvatar(imageSrc) {
  if (imageSrc) {
    return `<img class="person-image" src="${esc(imageSrc)}" alt="" loading="lazy">`;
  }
  return `<div class="placeholder-media placeholder-media--person" aria-hidden="true"></div>`;
}

function renderPersonInfo(item) {
  return `
    <div class="person-card__info">
      <p class="eyebrow eyebrow--small">${esc(item.label)}</p>
      <h3 class="person-card__name">${esc(item.name)}</h3>
      <p class="person-card__role">${esc(item.role)}</p>
      <p class="person-card__bio">${esc(item.bio)}</p>
    </div>
  `;
}

function renderTimeline(section) {
  return `
    <section class="timeline-section">
      <p class="eyebrow">${esc(section.eyebrow)}</p>
      <h2 class="section-title">${esc(section.title)}</h2>
      <p class="body-copy body-copy--compact">${esc(section.intro)}</p>
      <div class="timeline-list">
        ${section.items.map((item, index) => `
          <article class="timeline-item">
            <div class="timeline-item__axis">
              <p class="timeline-item__date">${esc(item.date)}</p>
              <span class="timeline-item__dot"></span>
              ${index < section.items.length - 1 ? '<span class="timeline-item__line"></span>' : ""}
            </div>
            <div class="timeline-item__card">
              <p class="eyebrow eyebrow--small">${esc(item.phase)}</p>
              <h3 class="timeline-item__title">${esc(item.title)}</h3>
              <p class="timeline-item__body">${esc(item.body)}</p>
              ${item.image ? (typeof item.image === "string" ? `<img class="timeline-item__image" src="${item.image}" alt="">` : `<div class="timeline-item__image" aria-hidden="true"></div>`) : ""}
            </div>
          </article>
        `).join("")}
      </div>
    </section>
  `;
}

function renderSection(section) {
  switch (section.type) {
    case "text-card":
      return renderTextCard(section);
    case "archive":
      return renderArchive(section);
    case "credits":
      return renderCredits(section);
    case "side-project":
      return renderSideProject(section);
    case "works":
      return renderWorks(section);
    case "cocreators":
      return renderCoCreators(section);
    case "timeline":
      return renderTimeline(section);
    default:
      return "";
  }
}

function renderDrawer() {
  const links = navItems.map((item) => `
    <a class="drawer-link${item.key === pageKey ? " is-active" : ""}" href="${esc(item.href)}" data-nav-key="${esc(item.key)}">
      <span class="drawer-link__index">${esc(item.index)}</span>
      <span class="drawer-link__copy">
        <span class="drawer-link__title">${esc(item.title)}</span>
        <span class="drawer-link__subtitle">${esc(item.subtitle)}</span>
      </span>
      <span class="drawer-link__arrow">&gt;</span>
    </a>
  `).join("");

  return `
    <button class="drawer-backdrop" type="button" aria-label="关闭侧边栏"></button>
    <aside class="drawer" aria-hidden="true">
      <div class="drawer__header">
        ${renderMenuButton()}
        <div class="drawer__brand">
          <h2 class="drawer__brand-title">南塘艺术共创营</h2>
        </div>
      </div>
      <nav class="drawer__nav" aria-label="页面导航">${links}</nav>
      <div class="drawer__footer">
        <div class="drawer__footer-rule"></div>
        <p>点击右侧留白或再次点击左上角按钮关闭</p>
      </div>
      <img class="drawer__bird" src="assets/images/feature-bird-cutout.png" alt="">
    </aside>
  `;
}

function renderLightbox() {
  return `
    <div class="lightbox" id="lightbox" aria-hidden="true">
      <button class="lightbox__close" type="button" aria-label="关闭">&times;</button>
      <img class="lightbox__img" src="" alt="">
    </div>
  `;
}

function initLightbox() {
  const lightbox = document.getElementById("lightbox");
  const img = lightbox.querySelector(".lightbox__img");
  let isOpen = false;

  function open(src) {
    img.src = src;
    lightbox.setAttribute("aria-hidden", "false");
    document.body.classList.add("lightbox-open");
    isOpen = true;
  }

  function close() {
    lightbox.setAttribute("aria-hidden", "true");
    document.body.classList.remove("lightbox-open");
    img.src = "";
    isOpen = false;
  }

  document.addEventListener("click", function(e) {
    const target = e.target.closest(".work-image, .archive-image");
    if (target) { e.preventDefault(); open(target.src); }
  });

  lightbox.addEventListener("click", function(e) {
    if (e.target === lightbox || e.target.closest(".lightbox__close")) { close(); }
  });

  document.addEventListener("keydown", function(e) {
    if (e.key === "Escape" && isOpen) { close(); }
  });

  window.closeLightbox = close;
}

function renderPage() {
  app.innerHTML = `
    <main class="page-shell">
      <section class="app-screen" style="--screen-width:${page.width}px">
        <div class="screen-topbar">
          ${renderTopNav()}
        </div>
        <div class="screen-surface">
          ${renderBanner()}
          ${page.sections.map(renderSection).join("")}
        </div>
        <section class="screen-extension" aria-hidden="true">
          <img class="screen-extension__bird" src="assets/images/feature-bird-cutout.png" alt="">
        </section>
      </section>
      ${renderLightbox()}
    </main>
    ${renderDrawer()}
  `;
}

renderPage();

const drawer = document.querySelector(".drawer");
const backdrop = document.querySelector(".drawer-backdrop");

function openDrawer() {
  document.body.classList.add("drawer-open");
  drawer.setAttribute("aria-hidden", "false");
}

function closeDrawer() {
  document.body.classList.remove("drawer-open");
  drawer.setAttribute("aria-hidden", "true");
  drawer.style.transform = "";
  state.startX = 0;
  state.currentX = 0;
  state.tracking = false;
}

function toggleDrawer() {
  if (document.body.classList.contains("drawer-open")) {
    closeDrawer();
  } else {
    openDrawer();
  }
}

function setActiveNav() {
  document.querySelectorAll("[data-nav-key]").forEach((node) => {
    const active = node.getAttribute("data-nav-key") === pageKey;
    node.classList.toggle("is-active", active);
    if (active) {
      node.setAttribute("aria-current", "page");
    } else {
      node.removeAttribute("aria-current");
    }
  });
}

function bindSwipeToClose() {

  drawer.addEventListener("touchstart", (event) => {
    if (!document.body.classList.contains("drawer-open")) {
      return;
    }
    state.tracking = true;
    state.startX = event.touches[0].clientX;
    state.currentX = state.startX;
  }, { passive: true });

  drawer.addEventListener("touchmove", (event) => {
    if (!state.tracking) {
      return;
    }
    state.currentX = event.touches[0].clientX;
    const delta = Math.min(0, state.currentX - state.startX);
    drawer.style.transform = `translateX(${delta}px)`;
  }, { passive: true });

  drawer.addEventListener("touchend", () => {
    if (!state.tracking) {
      return;
    }
    const delta = state.currentX - state.startX;
    if (delta < -70) {
      closeDrawer();
    } else {
      drawer.style.transform = "";
      state.startX = 0;
      state.currentX = 0;
      state.tracking = false;
    }
  });
}

document.querySelectorAll("[data-drawer-toggle]").forEach((button) => {
  button.addEventListener("click", toggleDrawer);
});

backdrop.addEventListener("click", closeDrawer);
drawer.querySelectorAll("[data-drawer-toggle]").forEach((button) => {
  button.addEventListener("click", closeDrawer);
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && document.body.classList.contains("drawer-open")) {
    closeDrawer();
  }
});

setActiveNav();
bindSwipeToClose();

initLightbox();

window.openDrawer = openDrawer;
window.closeDrawer = closeDrawer;
window.toggleDrawer = toggleDrawer;
window.setActiveNav = setActiveNav;
window.bindSwipeToClose = bindSwipeToClose;
