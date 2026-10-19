(() => {
  const shell = document.querySelector(".viewport-shell");
  const viewportButtons = document.querySelectorAll(".proposal-bar__btn");
  const navToggle = document.querySelector(".nav-toggle");
  const mobileNav = document.querySelector(".mobile-nav");
  const flavorTabs = document.querySelectorAll(".flavor-tab");
  const flavorPanels = document.querySelectorAll(".flavor-panel");
  const reveals = document.querySelectorAll(".reveal");

  viewportButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const mode = btn.dataset.viewport;
      if (!shell || !mode) return;

      shell.dataset.viewport = mode;
      viewportButtons.forEach((b) => b.classList.toggle("is-active", b === btn));

      if (mode === "desktop" && mobileNav) {
        mobileNav.hidden = true;
        mobileNav.classList.remove("is-open");
        navToggle?.setAttribute("aria-expanded", "false");
      }

      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  });

  navToggle?.addEventListener("click", () => {
    if (!mobileNav) return;
    const open = mobileNav.classList.toggle("is-open");
    mobileNav.hidden = !open;
    navToggle.setAttribute("aria-expanded", String(open));
  });

  mobileNav?.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      mobileNav.classList.remove("is-open");
      mobileNav.hidden = true;
      navToggle?.setAttribute("aria-expanded", "false");
    });
  });

  flavorTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const panelId = tab.dataset.panel;
      flavorTabs.forEach((t) => {
        const active = t === tab;
        t.classList.toggle("is-active", active);
        t.setAttribute("aria-selected", String(active));
      });
      flavorPanels.forEach((panel) => {
        const match = panel.id === `panel-${panelId}`;
        panel.classList.toggle("is-active", match);
        panel.hidden = !match;
      });
    });
  });

  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.16, rootMargin: "0px 0px -40px 0px" }
    );
    reveals.forEach((el) => io.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add("is-visible"));
  }
})();
