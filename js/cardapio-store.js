(() => {
  const STORAGE_KEY = "oni-cardapio-v1";
  const SESSION_KEY = "oni-gestao";
  const PIN_SHA256 = "aa103cffe379e166d39705b46f88127b3d40f3dac9851fefb96a6fe50259bfff";
  const BUNDLED_URL = "data/cardapio.json";
  /* Optional live backend. Empty = this site's JSON + this browser. */
  const REMOTE_URL = "";

  const TAG_TEAL = new Set(["vegano"]);

  function esc(value) {
    return String(value ?? "").replace(/[&<>"']/g, (char) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    }[char]));
  }

  function brl(value) {
    const amount = Number(value);
    if (!Number.isFinite(amount)) return "R$ —";
    const formatted = amount % 1
      ? amount.toFixed(2).replace(".", ",")
      : String(Math.round(amount));
    return `R$ ${formatted}`;
  }

  function uid(prefix) {
    return `${prefix}-${Math.random().toString(36).slice(2, 8)}`;
  }

  function tagClass(label) {
    return TAG_TEAL.has(String(label).toLowerCase()) ? "tag tag--teal" : "tag";
  }

  function isValid(data) {
    return Boolean(data && data.stores && data.stores.sudoeste && data.stores["asa-norte"]);
  }

  function stamp(data) {
    data.updatedAt = new Date().toISOString();
    return data;
  }

  async function sha256Hex(text) {
    const bytes = new TextEncoder().encode(text);
    const hash = await crypto.subtle.digest("SHA-256", bytes);
    return [...new Uint8Array(hash)].map((b) => b.toString(16).padStart(2, "0")).join("");
  }

  async function fetchJson(url, options, timeoutMs) {
    const controller = new AbortController();
    const timer = window.setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await fetch(url, {
        cache: "no-store",
        ...options,
        signal: controller.signal,
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } finally {
      window.clearTimeout(timer);
    }
  }

  function readLocal() {
    try {
      const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
      return isValid(parsed) ? parsed : null;
    } catch {
      return null;
    }
  }

  function writeLocal(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  async function loadBundled() {
    return fetchJson(BUNDLED_URL, {}, 8000);
  }

  async function loadRemote() {
    if (!REMOTE_URL) return null;
    return fetchJson(REMOTE_URL, { headers: { Accept: "application/json" } }, 5000);
  }

  async function saveRemote(data) {
    if (!REMOTE_URL) return false;
    await fetchJson(
      REMOTE_URL,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(data),
      },
      8000
    );
    return true;
  }

  function newest(candidates) {
    return candidates
      .filter(isValid)
      .sort((a, b) => String(b.updatedAt || "").localeCompare(String(a.updatedAt || "")))[0] || null;
  }

  async function load() {
    const bundled = await loadBundled();
    const local = readLocal();
    let remote = null;
    try {
      remote = await loadRemote();
    } catch {
      remote = null;
    }
    const data = newest([remote, local, bundled]);
    if (!data) throw new Error("Não foi possível carregar o cardápio.");
    return {
      data,
      source: remote && newest([remote, local, bundled]) === remote
        ? "online"
        : local && newest([remote, local, bundled]) === local
          ? "local"
          : "arquivo",
    };
  }

  async function save(data) {
    stamp(data);
    writeLocal(data);
    if (!REMOTE_URL) return { data, online: true, localOnly: true };
    let online = false;
    try {
      online = await saveRemote(data);
    } catch {
      online = false;
    }
    return { data, online, localOnly: false };
  }

  window.OniCardapio = {
    STORAGE_KEY,
    SESSION_KEY,
    PIN_SHA256,
    REMOTE_URL,
    esc,
    brl,
    uid,
    tagClass,
    isValid,
    sha256Hex,
    load,
    save,
    readLocal,
    writeLocal,
  };
})();
