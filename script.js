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

  const showReveal = (el) => el.classList.add("is-visible");

  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            showReveal(entry.target);
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -10% 0px" }
    );
    reveals.forEach((el) => {
      const rect = el.getBoundingClientRect();
      const inView = rect.top < window.innerHeight * 0.92 && rect.bottom > 40;
      if (inView) showReveal(el);
      else io.observe(el);
    });
    // Fallback: nunca deixar conteúdo preso invisível
    window.setTimeout(() => {
      reveals.forEach((el) => {
        if (!el.classList.contains("is-visible")) showReveal(el);
      });
    }, 1800);
  } else {
    reveals.forEach(showReveal);
  }

  const CONTACT_EMAIL = "contato@oni-Uno.com.br";
  const dialog = document.getElementById("contato-dialog");
  const form = document.getElementById("contato-form");
  const statusEl = document.getElementById("contato-status");
  const submitBtn = document.getElementById("contato-submit");

  const setStatus = (message, kind) => {
    if (!statusEl) return;
    statusEl.hidden = !message;
    statusEl.textContent = message || "";
    statusEl.dataset.kind = kind || "";
  };

  const openContato = () => {
    if (!dialog || !form) return;
    setStatus("");
    form.reset();
    dialog.hidden = false;
    document.body.classList.add("contact-open");
    window.setTimeout(() => form.elements.nome?.focus(), 20);
  };

  const closeContato = () => {
    if (!dialog) return;
    dialog.hidden = true;
    document.body.classList.remove("contact-open");
  };

  document.addEventListener("click", (event) => {
    const opener = event.target.closest("[data-open-contato]");
    if (opener) {
      event.preventDefault();
      openContato();
      return;
    }
    if (event.target.closest("[data-close-contato]")) {
      event.preventDefault();
      closeContato();
    }
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && dialog && !dialog.hidden) closeContato();
  });

  form?.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    if (form.elements._honey?.value) return;

    const payload = {
      Nome: form.elements.nome.value.trim(),
      Telefone: form.elements.telefone.value.trim(),
      "Nome da empresa": form.elements.empresa.value.trim(),
      Email: form.elements.email.value.trim(),
      Mensagem: form.elements.mensagem.value.trim(),
      _subject: "Clientes / parceria — ONI UNO",
      _template: "table",
      _captcha: "false",
      _replyto: form.elements.email.value.trim(),
    };

    submitBtn.disabled = true;
    setStatus("Enviando…");
    try {
      const response = await fetch(`https://formsubmit.co/ajax/${CONTACT_EMAIL}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || data.success === "false" || data.success === false) {
        throw new Error(data.message || `HTTP ${response.status}`);
      }
      const needsConfirm = String(data.message || "").toLowerCase().includes("activate");
      if (needsConfirm) {
        setStatus("Quase lá: confirme o primeiro envio no e-mail contato@oni-Uno.com.br.", "warn");
      } else {
        setStatus("Mensagem enviada. Em breve a equipe entra em contato.", "ok");
        form.reset();
      }
    } catch (error) {
      const body = [
        `Nome: ${payload.Nome}`,
        `Telefone: ${payload.Telefone}`,
        `Empresa: ${payload["Nome da empresa"]}`,
        `Email: ${payload.Email}`,
        "",
        payload.Mensagem,
      ].join("\n");
      window.location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(payload._subject)}&body=${encodeURIComponent(body)}`;
      setStatus("Não foi possível enviar por aqui. Abrimos o seu e-mail para concluir o envio.", "warn");
      console.error(error);
    } finally {
      submitBtn.disabled = false;
    }
  });
})();
