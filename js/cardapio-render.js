(() => {
  const { esc, brl, tagClass } = window.OniCardapio;

  function tagsHtml(tags) {
    return (tags || [])
      .filter(Boolean)
      .map((tag) => `<span class="${tagClass(tag)}">${esc(tag)}</span>`)
      .join("");
  }

  function flavorHtml(flavor) {
    const desc = flavor.desc ? `<p>${esc(flavor.desc)}</p>` : "";
    return `<article class="flavor">
      <h3>${esc(flavor.name)}</h3>
      ${desc}
      ${tagsHtml(flavor.tags)}
    </article>`;
  }

  function flavorsSection(store) {
    const groups = (store.flavorGroups || [])
      .map((group) => {
        const flavors = (group.flavors || []).filter((flavor) => flavor.inVitrine);
        if (!flavors.length) return "";
        const compact = group.compact ? " flavor-grid--compact" : "";
        return `
          <h3 class="menu-group">${esc(group.title)}</h3>
          ${group.lead ? `<p class="menu-group__lead">${esc(group.lead)}</p>` : ""}
          <div class="flavor-grid${compact}">
            ${flavors.map(flavorHtml).join("")}
          </div>`;
      })
      .join("");

    const body = groups.trim()
      ? groups
      : `<p class="menu-empty">A vitrine desta loja está sendo montada. Volte em instantes.</p>`;

    return `<section class="menu-block" id="sabores">
      <div class="section-head">
        <p class="eyebrow">Na vitrine hoje</p>
        <h2>Sabores</h2>
        <p>Natural de verdade — conservado apenas pelo frio. Sujeitos à disponibilidade do dia.</p>
      </div>
      ${body}
    </section>`;
  }

  function itemHtml(item) {
    const name = esc(item.name);
    const note = item.note ? `<small>${esc(item.note)}</small>` : "";
    const label = note ? `<div><span>${name}</span>${note}</div>` : `<span>${name}</span>`;
    return `<li>${label}<strong>${esc(brl(item.price))}</strong></li>`;
  }

  function cardHtml(card, single) {
    const extraClass = single ? " size-card--single" : "";
    const desc = card.desc ? `<p>${esc(card.desc)}</p>` : "";
    const img = card.image
      ? `<img src="${esc(card.image)}" alt="${esc(card.alt || card.name)}" />`
      : "";
    const items = (card.items || []).map(itemHtml).join("");
    const tags = tagsHtml(card.tags);
    return `<article class="size-card${extraClass}">
      ${img}
      <div>
        <h3>${esc(card.name)}</h3>
        ${desc}
        <ul>${items}</ul>
        ${tags ? `<p class="size-tags">${tags}</p>` : ""}
      </div>
    </article>`;
  }

  function categorySection(category) {
    const cards = category.cards || [];
    const single = cards.length === 1;
    const extraClass = category.id === "cafeteria" || category.id === "tamanhos" ? " tamanhos" : "";
    return `<section class="menu-block${extraClass}" id="${esc(category.id)}">
      <div class="section-head">
        ${category.eyebrow ? `<p class="eyebrow">${esc(category.eyebrow)}</p>` : ""}
        <h2>${esc(category.title)}</h2>
      </div>
      <div class="size-grid">
        ${cards.map((card) => cardHtml(card, single)).join("")}
      </div>
    </section>`;
  }

  function storeSection(store) {
    const hours = (store.hours || [])
      .map((row) => `<li><span>${esc(row.label)}</span><span>${esc(row.value)}</span></li>`)
      .join("");
    return `<section class="menu-block" id="loja">
      <div class="section-head">
        <p class="eyebrow">Visite</p>
        <h2>${esc(store.name)}</h2>
      </div>
      <p class="menu-hero__addr">${esc(store.address)}</p>
      <ul class="store__hours menu-hero__hours">${hours}</ul>
      <div class="store__actions">
        <a class="btn btn--solid" href="${esc(store.maps)}" target="_blank" rel="noopener">Como chegar</a>
        <a class="btn btn--ifood" href="${esc(store.ifood)}" target="_blank" rel="noopener">Pedir no iFood</a>
      </div>
    </section>`;
  }

  function renderStore(store) {
    const categories = (store.categories || []).map(categorySection).join("");
    return `${flavorsSection(store)}${categories}${storeSection(store)}`;
  }

  async function boot() {
    const root = document.getElementById("cardapio-root");
    const storeId = document.body.dataset.store;
    if (!root || !storeId) return;

    try {
      const { data } = await window.OniCardapio.load();
      const store = data.stores[storeId];
      if (!store) throw new Error("Loja não encontrada.");
      root.innerHTML = renderStore(store);
    } catch (error) {
      root.innerHTML = `<section class="menu-block"><p class="menu-empty">Não foi possível carregar o cardápio agora. Atualize a página.</p></section>`;
      console.error(error);
    }
  }

  boot();
  window.addEventListener("storage", (event) => {
    if (event.key === window.OniCardapio.STORAGE_KEY) boot();
  });
})();
