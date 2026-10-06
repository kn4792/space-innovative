// Space Innovative — shared behaviour (vanilla JS, no dependencies)
(() => {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

  $$("[data-year]").forEach((el) => (el.textContent = new Date().getFullYear()));

  // ---- Nav: transparent over the hero, solid once it has scrolled past ----
  const nav = $("[data-nav]");
  const hero = $("[data-hero]");
  const solidAlways = !hero || hero.classList.contains("is-contained");
  const syncNav = () => {
    const limit = hero ? hero.offsetHeight - nav.offsetHeight : 0;
    nav.classList.toggle("is-solid", solidAlways || window.scrollY > limit);
  };
  let ticking = false;
  addEventListener("scroll", () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => { syncNav(); ticking = false; });
  }, { passive: true });
  addEventListener("resize", syncNav);
  syncNav();

  // ---- Menu panel ----
  const panel = $("#menu");
  const openBtn = $("[data-menu-open]");
  let lastFocus = null;

  const openMenu = () => {
    lastFocus = document.activeElement;
    panel.classList.add("is-open");
    openBtn.setAttribute("aria-expanded", "true");
    document.body.style.overflow = "hidden";
    $(".panel-close", panel).focus();
  };
  const closeMenu = () => {
    if (!panel.classList.contains("is-open")) return;
    panel.classList.remove("is-open");
    openBtn.setAttribute("aria-expanded", "false");
    document.body.style.overflow = "";
    if (lastFocus) lastFocus.focus();
  };
  openBtn.addEventListener("click", openMenu);
  $$("[data-menu-close]").forEach((el) => el.addEventListener("click", closeMenu));
  $$(".panel-links a, .panel-sub a", panel).forEach((a) => a.addEventListener("click", closeMenu));

  document.addEventListener("keydown", (e) => {
    if (!panel.classList.contains("is-open")) return;
    if (e.key === "Escape") return closeMenu();
    if (e.key !== "Tab") return;
    const f = $$("a[href], button", panel);
    const first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  });

  // ---- Hero slideshow (home) ----
  const slides = $$(".slide");
  if (slides.length > 1) {
    const dots = $$(".dots button");
    const caption = $("[data-caption]");
    let index = 0, timer = null;

    const show = (n) => {
      index = (n + slides.length) % slides.length;
      slides.forEach((s, i) => s.classList.toggle("is-active", i === index));
      dots.forEach((d, i) => {
        d.classList.toggle("is-active", i === index);
        d.setAttribute("aria-current", i === index ? "true" : "false");
      });
      const s = slides[index];
      if (caption) {
        caption.textContent = s.dataset.title + " · " + s.dataset.meta;
        caption.href = s.dataset.href;
      }
    };
    const stop = () => { clearInterval(timer); timer = null; };
    const play = () => { if (!reduceMotion && !timer) timer = setInterval(() => show(index + 1), 6500); };

    dots.forEach((d, i) => d.addEventListener("click", () => { stop(); show(i); play(); }));
    document.addEventListener("visibilitychange", () => (document.hidden ? stop() : play()));
    show(0);
    play();
  }

  // ---- Scroll reveal ----
  const items = $$(".reveal");
  if (!("IntersectionObserver" in window) || reduceMotion) {
    items.forEach((el) => el.classList.add("is-in"));
  } else {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (!en.isIntersecting) return;
        en.target.classList.add("is-in");
        io.unobserve(en.target);
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.06 });
    items.forEach((el) => io.observe(el));
  }
})();
