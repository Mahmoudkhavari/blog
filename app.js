// =============================================================
// دفتر خاطرات — منطق مشترک همه‌ی صفحات
// =============================================================

const THEMES = [
  { id: "kraft", name: "کاغذ کاهی" },
  { id: "night", name: "شب مهتابی" },
  { id: "autumn", name: "برگ پاییز" },
  { id: "sea", name: "دریای شمال" },
  { id: "petal", name: "گلبرگ صورتی" },
];

const STORAGE_KEY = "diary-theme";

/* ---------------------- تم فعال را همین اول اعمال کن ---------------------- */
(function initTheme() {
  const saved = localStorage.getItem(STORAGE_KEY);
  const theme = THEMES.some(t => t.id === saved) ? saved : "kraft";
  document.documentElement.setAttribute("data-theme", theme);
})();

document.addEventListener("DOMContentLoaded", () => {
  setupThemePicker();
  setupBackToTop();
  setupCategoryFilter();
  setupScrollReveal();
  setupPWAInstall();
  registerServiceWorker();
});

/* ---------------------------- تم‌پیکر ---------------------------- */
function setupThemePicker() {
  const btn = document.getElementById("themePickerBtn");
  const panel = document.getElementById("themePanel");
  if (!btn || !panel) return;

  const current = document.documentElement.getAttribute("data-theme") || "kraft";
  const currentThemeName = document.getElementById("currentThemeName");
  const activeTheme = THEMES.find(t => t.id === current);
  if (currentThemeName && activeTheme) currentThemeName.textContent = activeTheme.name;

  panel.querySelectorAll(".theme-option").forEach(opt => {
    opt.classList.toggle("is-active", opt.dataset.theme === current);
    opt.addEventListener("click", () => {
      const themeId = opt.dataset.theme;
      document.documentElement.setAttribute("data-theme", themeId);
      localStorage.setItem(STORAGE_KEY, themeId);
      panel.querySelectorAll(".theme-option").forEach(o => o.classList.toggle("is-active", o === opt));
      const t = THEMES.find(t => t.id === themeId);
      if (currentThemeName && t) currentThemeName.textContent = t.name;
      closePanel();
    });
  });

  function openPanel() {
    panel.classList.add("open");
    btn.setAttribute("aria-expanded", "true");
  }
  function closePanel() {
    panel.classList.remove("open");
    btn.setAttribute("aria-expanded", "false");
  }

  btn.addEventListener("click", e => {
    e.stopPropagation();
    panel.classList.contains("open") ? closePanel() : openPanel();
  });

  document.addEventListener("click", e => {
    if (!panel.contains(e.target) && e.target !== btn) closePanel();
  });

  document.addEventListener("keydown", e => {
    if (e.key === "Escape") closePanel();
  });
}

/* -------------------------- بازگشت به بالا -------------------------- */
function setupBackToTop() {
  const backBtn = document.getElementById("backToTop");
  if (!backBtn) return;
  window.addEventListener("scroll", () => {
    backBtn.classList.toggle("show", window.scrollY > 300);
  });
  backBtn.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
}

/* --------------------------- فیلتر دسته‌بندی --------------------------- */
function setupCategoryFilter() {
  const buttons = document.querySelectorAll(".category-btn");
  if (!buttons.length) return;
  const posts = document.querySelectorAll(".post");
  const emptyState = document.getElementById("emptyState");

  buttons.forEach(btn => {
    btn.addEventListener("click", () => {
      const filter = btn.dataset.filter;
      buttons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");

      let visibleCount = 0;
      posts.forEach(post => {
        const show = filter === "all" || post.dataset.category === filter;
        post.classList.toggle("hidden-by-filter", !show);
        if (show) visibleCount++;
      });
      if (emptyState) emptyState.style.display = visibleCount === 0 ? "block" : "none";
    });
  });
}

/* --------------------------- انیمیشن ورود پست‌ها --------------------------- */
function setupScrollReveal() {
  const posts = document.querySelectorAll(".post");
  if (!posts.length) return;

  if (!("IntersectionObserver" in window)) {
    posts.forEach(p => p.classList.add("in-view"));
    return;
  }

  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.08, rootMargin: "0px 0px -40px 0px" }
  );

  posts.forEach(p => observer.observe(p));
}

/* ------------------------------ نصب PWA ------------------------------ */
function setupPWAInstall() {
  let deferredPrompt;
  window.addEventListener("beforeinstallprompt", e => {
    e.preventDefault();
    deferredPrompt = e;

    const btn = document.createElement("button");
    btn.className = "install-btn";
    btn.innerHTML = `<svg class="icon" viewBox="0 0 24 24"><use href="#icon-download"></use></svg><span class="label">نصب اپ</span>`;
    document.body.appendChild(btn);

    btn.addEventListener("click", () => {
      btn.remove();
      deferredPrompt.prompt();
      deferredPrompt.userChoice.finally(() => (deferredPrompt = null));
    });
  });
}

function registerServiceWorker() {
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("sw.js").catch(() => {});
    });
  }
}

/* ------------------------- جستجوی آرشیو (در صورت وجود) ------------------------- */
function setupArchiveSearch() {
  const input = document.getElementById("archiveSearch");
  const items = document.querySelectorAll(".archive-item");
  const countLabel = document.getElementById("archiveCount");
  if (!input) return;

  input.addEventListener("input", () => {
    const q = input.value.trim();
    let visible = 0;
    items.forEach(item => {
      const match = item.dataset.search.includes(q);
      item.style.display = match ? "" : "none";
      if (match) visible++;
    });
    if (countLabel) countLabel.textContent = `${visible} نوشته`;
  });
}

document.addEventListener("DOMContentLoaded", setupArchiveSearch);
