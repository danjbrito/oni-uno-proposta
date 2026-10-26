(() => {
  const storeApi = window.OniCardapio;
  const IMAGES = [
    "images/copinho.jpg",
    "images/casquinha.jpg",
    "images/para-levar.jpg",
    "images/picoles.jpg",
    "images/sobremesas.jpg",
    "images/cafeteria.jpg",
  ];

  const loginScreen = document.getElementById("admin-login");
  const appScreen = document.getElementById("admin-app");
  const loginForm = document.getElementById("login-form");
  const loginError = document.getElementById("login-error");
  const board = document.getElementById("admin-board");
  const statusEl = document.getElementById("admin-status");
  const saveBtn = document.getElementById("save-btn");
  const previewLink = document.getElementById("preview-link");
  const copyBtn = document.getElementById("copy-btn");

  let catalog = null;
  let storeId = "sudoeste";
  let panel = "vitrine";
  let dirty = false;

  function currentStore() {
    return catalog.stores[storeId];
  }

  function setDirty(value) {
    dirty = value;
    saveBtn.classList.toggle("is-dirty", dirty);
  }

  function setStatus(message, kind) {
    statusEl.textContent = message;
    statusEl.dataset.kind = kind || "";
  }

  function updatePreview() {
    const store = currentStore();
    previewLink.href = store.file;
    copyBtn.textContent = storeId === "sudoeste" ? "Copiar Asa Norte" : "Copiar Sudoeste";
  }

  function optionList(selected) {
    const values = new Set(IMAGES);
    if (selected) values.add(selected);
    return [...values]
      .map((src) => `<option value="${storeApi.esc(src)}" ${src === selected ? "selected" : ""}>${storeApi.esc(src.replace("images/", ""))}</option>`)
      .join("");
  }

  function renderVitrine(store) {
    return store.flavorGroups.map((group, groupIndex) => {
      const onCount = (group.flavors || []).filter((flavor) => flavor.inVitrine).length;
      const rows = (group.flavors || []).map((flavor, flavorIndex) => `
        <article class="admin-flavor ${flavor.inVitrine ? "is-on" : ""}" data-g="${groupIndex}" data-f="${flavorIndex}">
          <label class="switch">
            <input type="checkbox" data-act="toggle" ${flavor.inVitrine ? "checked" : ""} />
            <span>Na vitrine</span>
          </label>
          <div class="admin-flavor__fields">
            <input type="text" data-field="name" value="${storeApi.esc(flavor.name)}" placeholder="Nome do sabor" />
            <textarea data-field="desc" rows="2" placeholder="Descrição">${storeApi.esc(flavor.desc || "")}</textarea>
            <input type="text" data-field="tags" value="${storeApi.esc((flavor.tags || []).join(", "))}" placeholder="Tags: vegano, glúten, castanhas" />
          </div>
          <button type="button" class="admin-icon" data-act="remove-flavor" aria-label="Remover sabor">×</button>
        </article>
      `).join("");

      return `<section class="admin-card">
        <header class="admin-card__head">
          <div>
            <h3>${storeApi.esc(group.title)}</h3>
            <p>${onCount} na vitrine</p>
          </div>
          <div class="admin-card__tools">
            <button type="button" class="btn btn--ghost" data-act="all-on" data-g="${groupIndex}">Todos</button>
            <button type="button" class="btn btn--ghost" data-act="all-off" data-g="${groupIndex}">Nenhum</button>
          </div>
        </header>
        <div class="admin-flavors">${rows}</div>
        <button type="button" class="btn btn--ghost admin-add" data-act="add-flavor" data-g="${groupIndex}">+ Sabor</button>
      </section>`;
    }).join("");
  }

  function renderItems(store) {
    return store.categories.map((category, categoryIndex) => {
      const cards = (category.cards || []).map((card, cardIndex) => {
        const items = (card.items || []).map((item, itemIndex) => `
          <div class="admin-item" data-c="${categoryIndex}" data-k="${cardIndex}" data-i="${itemIndex}">
            <input type="text" data-field="name" value="${storeApi.esc(item.name)}" placeholder="Item" />
            <input type="text" data-field="note" value="${storeApi.esc(item.note || "")}" placeholder="Observação" />
            <input type="number" data-field="price" min="0" step="0.5" value="${storeApi.esc(item.price)}" placeholder="Preço" />
            <button type="button" class="admin-icon" data-act="remove-item" aria-label="Remover item">×</button>
          </div>
        `).join("");

        return `<article class="admin-product" data-c="${categoryIndex}" data-k="${cardIndex}">
          <div class="admin-product__meta">
            <input type="text" data-field="name" value="${storeApi.esc(card.name)}" placeholder="Nome" />
            <textarea data-field="desc" rows="2" placeholder="Descrição">${storeApi.esc(card.desc || "")}</textarea>
            <input type="text" data-field="tags" value="${storeApi.esc((card.tags || []).join(", "))}" placeholder="Tags" />
            <label class="admin-select">
              Foto
              <select data-field="image">${optionList(card.image)}</select>
            </label>
          </div>
          <div class="admin-items">${items}</div>
          <button type="button" class="btn btn--ghost admin-add" data-act="add-item">+ Item</button>
        </article>`;
      }).join("");

      return `<section class="admin-card">
        <header class="admin-card__head">
          <div>
            <h3>${storeApi.esc(category.title)}</h3>
            <p>${storeApi.esc(category.eyebrow || "")}</p>
          </div>
        </header>
        ${cards}
      </section>`;
    }).join("");
  }

  function render() {
    if (!catalog) return;
    const store = currentStore();
    updatePreview();
    const body = panel === "vitrine" ? renderVitrine(store) : renderItems(store);
    board.innerHTML = body;
    document.querySelectorAll("[data-store-tab]").forEach((btn) => {
      btn.classList.toggle("is-active", btn.dataset.storeTab === storeId);
    });
    document.querySelectorAll("[data-panel]").forEach((btn) => {
      btn.classList.toggle("is-active", btn.dataset.panel === panel);
    });
  }

  function parseTags(value) {
    return value.split(",").map((tag) => tag.trim()).filter(Boolean);
  }

  function onBoardClick(event) {
    const button = event.target.closest("[data-act]");
    if (!button) return;
    const store = currentStore();
    const action = button.dataset.act;
    const flavorRow = event.target.closest(".admin-flavor");
    const product = event.target.closest(".admin-product");
    const itemRow = event.target.closest(".admin-item");

    if (action === "toggle" && flavorRow) {
      const group = store.flavorGroups[Number(flavorRow.dataset.g)];
      const flavor = group.flavors[Number(flavorRow.dataset.f)];
      flavor.inVitrine = event.target.checked;
      flavorRow.classList.toggle("is-on", flavor.inVitrine);
      setDirty(true);
      return;
    }

    if (action === "all-on" || action === "all-off") {
      const group = store.flavorGroups[Number(button.dataset.g)];
      const on = action === "all-on";
      group.flavors.forEach((flavor) => {
        flavor.inVitrine = on;
      });
      setDirty(true);
      render();
      return;
    }

    if (action === "add-flavor") {
      const group = store.flavorGroups[Number(button.dataset.g)];
      group.flavors.push({
        id: storeApi.uid("sabor"),
        name: "Novo sabor",
        desc: "",
        tags: group.id === "agua" ? ["vegano"] : [],
        inVitrine: true,
      });
      setDirty(true);
      render();
      return;
    }

    if (action === "remove-flavor" && flavorRow) {
      const group = store.flavorGroups[Number(flavorRow.dataset.g)];
      group.flavors.splice(Number(flavorRow.dataset.f), 1);
      setDirty(true);
      render();
      return;
    }

    if (action === "add-item" && product) {
      const card = store.categories[Number(product.dataset.c)].cards[Number(product.dataset.k)];
      card.items.push({
        id: storeApi.uid("item"),
        name: "Novo item",
        note: "",
        price: 0,
      });
      setDirty(true);
      render();
      return;
    }

    if (action === "remove-item" && itemRow) {
      const card = store.categories[Number(itemRow.dataset.c)].cards[Number(itemRow.dataset.k)];
      card.items.splice(Number(itemRow.dataset.i), 1);
      setDirty(true);
      render();
    }
  }

  function onBoardInput(event) {
    const field = event.target.dataset.field;
    if (!field) return;
    const store = currentStore();
    const flavorRow = event.target.closest(".admin-flavor");
    const itemRow = event.target.closest(".admin-item");
    const product = event.target.closest(".admin-product");

    if (flavorRow) {
      const flavor = store.flavorGroups[Number(flavorRow.dataset.g)].flavors[Number(flavorRow.dataset.f)];
      flavor[field] = field === "tags" ? parseTags(event.target.value) : event.target.value;
      setDirty(true);
      return;
    }

    if (itemRow) {
      const item = store.categories[Number(itemRow.dataset.c)].cards[Number(itemRow.dataset.k)].items[Number(itemRow.dataset.i)];
      item[field] = field === "price" ? Number(event.target.value) : event.target.value;
      setDirty(true);
      return;
    }

    if (product) {
      const card = store.categories[Number(product.dataset.c)].cards[Number(product.dataset.k)];
      card[field] = field === "tags" ? parseTags(event.target.value) : event.target.value;
      setDirty(true);
    }
  }

  async function persist() {
    saveBtn.disabled = true;
    setStatus("Salvando…");
    try {
      const result = await storeApi.save(catalog);
      catalog = result.data;
      setDirty(false);
      if (result.online) {
        setStatus("Salvo. Abra o cardápio da loja para conferir.", "ok");
      } else {
        setStatus("Salvo neste aparelho. A publicação online não respondeu.", "warn");
      }
    } catch (error) {
      setStatus("Não foi possível salvar. Tente de novo.", "err");
      console.error(error);
    } finally {
      saveBtn.disabled = false;
    }
  }

  async function enterApp() {
    loginScreen.hidden = true;
    appScreen.hidden = false;
    setStatus("Carregando cardápio…");
    const loaded = await storeApi.load();
    catalog = loaded.data;
    setDirty(false);
    const label = loaded.source === "online" ? "Cardápio online carregado." : "Cardápio carregado.";
    setStatus(label, "ok");
    render();
  }

  loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    loginError.hidden = true;
    const pin = document.getElementById("pin").value.trim();
    const hash = await storeApi.sha256Hex(pin);
    if (hash !== storeApi.PIN_SHA256) {
      loginError.hidden = false;
      return;
    }
    sessionStorage.setItem(storeApi.SESSION_KEY, "1");
    enterApp();
  });

  document.querySelectorAll("[data-store-tab]").forEach((btn) => {
    btn.addEventListener("click", () => {
      storeId = btn.dataset.storeTab;
      render();
    });
  });

  document.querySelectorAll("[data-panel]").forEach((btn) => {
    btn.addEventListener("click", () => {
      panel = btn.dataset.panel;
      render();
    });
  });

  copyBtn.addEventListener("click", () => {
    const otherId = storeId === "sudoeste" ? "asa-norte" : "sudoeste";
    const other = catalog.stores[otherId];
    if (!window.confirm(`Substituir o cardápio de ${currentStore().name} pelo de ${other.name}?`)) return;
    currentStore().flavorGroups = structuredClone(other.flavorGroups);
    currentStore().categories = structuredClone(other.categories);
    setDirty(true);
    render();
  });

  saveBtn.addEventListener("click", persist);
  board.addEventListener("click", onBoardClick);
  board.addEventListener("input", onBoardInput);
  board.addEventListener("change", onBoardInput);

  window.addEventListener("beforeunload", (event) => {
    if (!dirty) return;
    event.preventDefault();
    event.returnValue = "";
  });

  if (sessionStorage.getItem(storeApi.SESSION_KEY) === "1") {
    enterApp();
  }
})();
