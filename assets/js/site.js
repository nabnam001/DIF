/* Dansk-Israelsk Forening Aarhus — site interactions */
(function () {
  "use strict";

  const root = document.documentElement;
  const body = document.body;
  const lang = root.lang || "da";
  const isEN = lang.startsWith("en");

  /* ---------- Theme ---------- */
  const KEY = "dif-theme";
  const stored = localStorage.getItem(KEY);
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)");
  const setTheme = (t) => {
    root.setAttribute("data-theme", t);
    document.querySelectorAll("[data-theme-toggle]").forEach((b) => {
      b.setAttribute("aria-pressed", t === "dark");
      b.title = t === "dark"
        ? (isEN ? "Switch to light mode" : "Skift til lyst tema")
        : (isEN ? "Switch to dark mode" : "Skift til mørkt tema");
    });
  };
  setTheme(stored || (prefersDark.matches ? "dark" : "light"));

  document.addEventListener("click", (e) => {
    const b = e.target.closest("[data-theme-toggle]");
    if (!b) return;
    const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
    setTheme(next);
    localStorage.setItem(KEY, next);
  });
  prefersDark.addEventListener("change", (e) => {
    if (!localStorage.getItem(KEY)) setTheme(e.matches ? "dark" : "light");
  });

  /* ---------- Sticky header ---------- */
  const header = document.querySelector(".site-header");
  if (header) {
    const onScroll = () => header.classList.toggle("is-scrolled", window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* ---------- Mobile menu with backdrop and focus trap ---------- */
  const menuBtn = document.querySelector("[data-menu-toggle]");
  const navLinks = document.querySelector(".nav__links");
  if (menuBtn && navLinks) {
    // Inject backdrop
    if (!document.querySelector(".menu-backdrop")) {
      const bd = document.createElement("div");
      bd.className = "menu-backdrop";
      bd.setAttribute("aria-hidden", "true");
      document.body.appendChild(bd);
      bd.addEventListener("click", close);
    }
    function close() {
      body.classList.remove("menu-open");
      menuBtn.setAttribute("aria-expanded", "false");
    }
    menuBtn.addEventListener("click", () => {
      const open = body.classList.toggle("menu-open");
      menuBtn.setAttribute("aria-expanded", String(open));
      if (open) {
        const first = navLinks.querySelector("a");
        if (first) first.focus();
      }
    });
    navLinks.addEventListener("click", (e) => {
      if (e.target.tagName === "A") close();
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && body.classList.contains("menu-open")) close();
    });
  }

  /* ---------- Reveal on scroll ---------- */
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const targets = document.querySelectorAll(".reveal, .reveal-stagger");
  if (!reduced && "IntersectionObserver" in window && targets.length) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-in");
            io.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.05 }
    );
    targets.forEach((el) => io.observe(el));
  } else {
    targets.forEach((el) => el.classList.add("is-in"));
  }

  /* ---------- Contact form (mailto) ---------- */
  const form = document.querySelector("[data-contact-form]");
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const data = new FormData(form);
      const name = (data.get("name") || "").toString().trim();
      const email = (data.get("email") || "").toString().trim();
      const subject = (data.get("subject") || (isEN ? "Enquiry from dif-aarhus.dk" : "Henvendelse fra dif-aarhus.dk")).toString().trim();
      const message = (data.get("message") || "").toString().trim();
      const status = form.querySelector(".form__status");

      if (!name || !email || !message) {
        if (status) {
          status.hidden = false;
          status.dataset.state = "error";
          status.textContent = isEN
            ? "Please complete name, email and message."
            : "Udfyld venligst navn, e-mail og besked.";
        }
        return;
      }

      const to = form.dataset.to || "dif_webmaster@yahoo.dk";
      const bodyTxt = `${message}\n\n— ${name}\n${email}`;
      const href = `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(bodyTxt)}`;
      window.location.href = href;

      if (status) {
        status.hidden = false;
        status.dataset.state = "success";
        status.textContent = isEN
          ? "Thanks — your email client should now open with the message ready to send."
          : "Tak — dit e-mailprogram bør nu åbne en færdigskrevet besked klar til afsendelse.";
      }
      form.reset();
    });
  }

  /* ---------- Year stamp ---------- */
  document.querySelectorAll("[data-year]").forEach((el) => {
    el.textContent = new Date().getFullYear();
  });

  /* ---------- Back to top ---------- */
  if (!document.querySelector(".to-top")) {
    const btn = document.createElement("button");
    btn.className = "to-top";
    btn.type = "button";
    btn.setAttribute("aria-label", isEN ? "Back to top" : "Til toppen");
    btn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="18 15 12 9 6 15"/></svg>';
    document.body.appendChild(btn);
    const togg = () => btn.classList.toggle("is-shown", window.scrollY > 600);
    togg();
    window.addEventListener("scroll", togg, { passive: true });
    btn.addEventListener("click", () => window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" }));
  }

  /* ---------- Search ---------- */
  const SEARCH_INDEX = isEN ? "/assets/search-en.json" : "/assets/search.json";
  const searchTrigger = document.querySelector("[data-search-open]");
  let searchData = null;
  let searchModal = null;
  let activeIdx = -1;

  function openSearch() {
    if (!searchModal) buildSearchModal();
    searchModal.classList.add("is-open");
    setTimeout(() => searchModal.querySelector("input").focus(), 50);
    if (!searchData) loadIndex();
  }
  function closeSearch() {
    if (searchModal) searchModal.classList.remove("is-open");
  }
  function buildSearchModal() {
    searchModal = document.createElement("div");
    searchModal.className = "search-modal";
    searchModal.setAttribute("role", "dialog");
    searchModal.setAttribute("aria-modal", "true");
    searchModal.innerHTML = `
      <div class="search-modal__panel">
        <input type="search" class="search-modal__input"
          placeholder="${isEN ? "Search the site…" : "Søg på siden…"}"
          autocomplete="off" spellcheck="false">
        <div class="search-modal__results" role="listbox"></div>
      </div>`;
    document.body.appendChild(searchModal);
    searchModal.addEventListener("click", (e) => {
      if (e.target === searchModal) closeSearch();
    });
    const input = searchModal.querySelector("input");
    const results = searchModal.querySelector(".search-modal__results");
    input.addEventListener("input", () => render(input.value, results));
    input.addEventListener("keydown", (e) => {
      const items = results.querySelectorAll(".search-modal__result");
      if (e.key === "ArrowDown") {
        e.preventDefault();
        activeIdx = Math.min(items.length - 1, activeIdx + 1);
        updateActive(items);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        activeIdx = Math.max(0, activeIdx - 1);
        updateActive(items);
      } else if (e.key === "Enter") {
        const it = items[activeIdx] || items[0];
        if (it) location.href = it.href;
      } else if (e.key === "Escape") {
        closeSearch();
      }
    });
  }
  function updateActive(items) {
    items.forEach((el, i) => el.classList.toggle("is-active", i === activeIdx));
    if (items[activeIdx]) items[activeIdx].scrollIntoView({ block: "nearest" });
  }
  function loadIndex() {
    fetch(SEARCH_INDEX).then(r => r.ok ? r.json() : []).then(d => { searchData = d; })
      .catch(() => { searchData = []; });
  }
  function render(q, container) {
    activeIdx = 0;
    if (!q || !q.trim()) {
      container.innerHTML = `<p class="search-modal__empty">${isEN ? "Type to search the site." : "Skriv for at søge."}</p>`;
      return;
    }
    if (!searchData) {
      container.innerHTML = `<p class="search-modal__empty">${isEN ? "Loading…" : "Henter…"}</p>`;
      return;
    }
    const terms = q.trim().toLowerCase().split(/\s+/);
    const scored = searchData.map(item => {
      const hay = (item.title + " " + item.body + " " + (item.tags || "")).toLowerCase();
      let score = 0;
      terms.forEach(t => {
        if (item.title.toLowerCase().includes(t)) score += 5;
        const occ = (hay.match(new RegExp(escapeRegex(t), "g")) || []).length;
        score += occ;
      });
      return { item, score };
    }).filter(s => s.score > 0).sort((a,b) => b.score - a.score).slice(0, 12);

    if (!scored.length) {
      container.innerHTML = `<p class="search-modal__empty">${isEN ? "No matches." : "Ingen resultater."}</p>`;
      return;
    }
    container.innerHTML = scored.map((s, i) => {
      const snippet = makeSnippet(s.item.body, terms);
      return `<a class="search-modal__result ${i === 0 ? "is-active" : ""}" href="${s.item.url}" role="option">
        <strong>${highlight(s.item.title, terms)}</strong>
        <small>${snippet}</small>
      </a>`;
    }).join("");
  }
  function makeSnippet(body, terms) {
    const lc = body.toLowerCase();
    let pos = -1;
    for (const t of terms) { pos = lc.indexOf(t); if (pos !== -1) break; }
    if (pos === -1) pos = 0;
    const start = Math.max(0, pos - 50);
    const end = Math.min(body.length, pos + 130);
    let s = (start > 0 ? "…" : "") + body.slice(start, end) + (end < body.length ? "…" : "");
    return highlight(s, terms);
  }
  function highlight(s, terms) {
    let out = s;
    terms.forEach(t => {
      out = out.replace(new RegExp("(" + escapeRegex(t) + ")", "gi"), "<mark>$1</mark>");
    });
    return out;
  }
  function escapeRegex(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); }

  if (searchTrigger) searchTrigger.addEventListener("click", openSearch);
  document.addEventListener("keydown", (e) => {
    if ((e.key === "/" || (e.key === "k" && (e.metaKey || e.ctrlKey))) && !e.target.matches("input, textarea")) {
      e.preventDefault();
      openSearch();
    }
  });

  /* ---------- Hatikva audio ---------- */
  document.querySelectorAll("[data-hatikva-audio]").forEach((btn) => {
    let audio = null;
    btn.addEventListener("click", () => {
      if (!audio) {
        audio = new Audio(btn.dataset.hatikvaAudio || "/assets/audio/hatikva.mp3");
        audio.addEventListener("ended", () => btn.classList.remove("is-playing"));
        audio.addEventListener("error", () => {
          btn.classList.remove("is-playing");
          btn.disabled = true;
          btn.textContent = isEN ? "Audio unavailable" : "Lyd ikke tilgængelig";
        });
      }
      if (audio.paused) {
        audio.play().then(() => btn.classList.add("is-playing"))
          .catch(() => { btn.classList.remove("is-playing"); });
      } else {
        audio.pause();
        btn.classList.remove("is-playing");
      }
    });
  });

  /* ---------- Service worker (PWA) ---------- */
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    });
  }
})();


/* =========================================================================
   Detail modal (maps, organisations, biographies)
   ========================================================================= */
(function () {
  "use strict";
  const isEN = (document.documentElement.lang || "da").startsWith("en");
  const closeLabel = isEN ? "Close" : "Luk";

  let modal = null;
  let lastFocus = null;

  function ensureModal() {
    if (modal) return modal;
    modal = document.createElement("div");
    modal.className = "detail-modal";
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-modal", "true");
    modal.innerHTML =
      '<div class="detail-modal__panel">' +
        '<button class="detail-modal__close" type="button" aria-label="' + closeLabel + '">' +
          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><line x1="6" y1="6" x2="18" y2="18"/><line x1="18" y1="6" x2="6" y2="18"/></svg>' +
        '</button>' +
        '<div class="detail-modal__body">' +
          '<div class="detail-modal__media"></div>' +
          '<div class="detail-modal__content"></div>' +
        '</div>' +
      '</div>';
    document.body.appendChild(modal);

    modal.addEventListener("click", (e) => {
      if (e.target === modal) close();
    });
    modal.querySelector(".detail-modal__close").addEventListener("click", close);
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && modal.classList.contains("is-open")) close();
    });
    return modal;
  }

  function open(data) {
    const m = ensureModal();
    const media = m.querySelector(".detail-modal__media");
    const content = m.querySelector(".detail-modal__content");

    media.className = "detail-modal__media" + (data.darkMedia ? " detail-modal__media--dark" : "");
    if (data.image) {
      media.innerHTML = '<img src="' + data.image + '" alt="' + (data.imageAlt || data.title || "") + '">';
    } else if (data.mediaHtml) {
      media.innerHTML = data.mediaHtml;
    } else {
      media.innerHTML = "";
    }

    let html = "";
    if (data.eyebrow) html += '<span class="eyebrow">' + data.eyebrow + '</span>';
    if (data.title) html += '<h2>' + data.title + '</h2>';
    if (data.subtitle) html += '<p style="font-family: var(--font-display); font-style: italic; color: var(--accent); font-size: 1.15rem; margin: -.25rem 0 1rem;">' + data.subtitle + '</p>';
    if (data.body) html += data.body;
    if (data.facts) {
      html += '<dl>';
      for (const [dt, dd] of data.facts) html += '<dt>' + dt + '</dt><dd>' + dd + '</dd>';
      html += '</dl>';
    }
    if (data.actions) {
      html += '<div class="detail-modal__actions">';
      for (const a of data.actions) {
        html += '<a class="btn ' + (a.cls || "btn--ghost") + '" href="' + a.href + '"' + (a.external ? ' target="_blank" rel="noopener"' : "") + '>' + a.label + '</a>';
      }
      html += '</div>';
    }
    content.innerHTML = html;
    content.scrollTop = 0;

    lastFocus = document.activeElement;
    m.classList.add("is-open");
    document.body.style.overflow = "hidden";
    setTimeout(() => m.querySelector(".detail-modal__close").focus(), 50);
  }

  function close() {
    if (!modal) return;
    modal.classList.remove("is-open");
    document.body.style.overflow = "";
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  // Discover data via DOM data attributes or window.DIF_MODAL_DATA registries
  document.addEventListener("click", (e) => {
    const trigger = e.target.closest("[data-modal]");
    if (!trigger) return;
    e.preventDefault();
    const key = trigger.dataset.modal;
    let data = null;
    if (key && window.DIF_MODAL_DATA && window.DIF_MODAL_DATA[key]) {
      data = window.DIF_MODAL_DATA[key];
    } else {
      // Fallback: read from data-* attributes
      data = {
        title: trigger.dataset.modalTitle,
        eyebrow: trigger.dataset.modalEyebrow,
        body: trigger.dataset.modalBody ? "<p>" + trigger.dataset.modalBody + "</p>" : "",
        image: trigger.dataset.modalImage,
        imageAlt: trigger.dataset.modalImageAlt,
      };
    }
    if (data) open(data);
  });

  // Keyboard: enter/space on focused tappable card
  document.addEventListener("keydown", (e) => {
    if (e.key !== "Enter" && e.key !== " ") return;
    const t = document.activeElement;
    if (!t || !t.matches("[data-modal]")) return;
    e.preventDefault();
    t.click();
  });

  // Mark all tappable cards with role/tabindex
  document.querySelectorAll("[data-modal]").forEach((el) => {
    if (!el.hasAttribute("tabindex")) el.setAttribute("tabindex", "0");
    if (!el.hasAttribute("role")) el.setAttribute("role", "button");
    if (!el.querySelector(".tap-hint")) {
      const hint = document.createElement("span");
      hint.className = "tap-hint";
      hint.setAttribute("aria-hidden", "true");
      hint.innerHTML = '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M21 14v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5"/></svg>';
      el.style.position = el.style.position || "relative";
      el.appendChild(hint);
    }
  });

  // Expose for external callers
  window.DIFModal = { open, close };
})();


/* =========================================================================
   Hero video — graceful fade-in, off-screen pause, mobile-data respect
   ========================================================================= */
(function () {
  "use strict";
  const videos = document.querySelectorAll(".hero__video");
  if (!videos.length) return;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const saveData = navigator.connection && (navigator.connection.saveData || /^(slow-2g|2g|3g)$/.test(navigator.connection.effectiveType || ""));

  videos.forEach((v) => {
    if (reduced || saveData) {
      v.removeAttribute("autoplay");
      v.preload = "none";
      return;
    }
    const reveal = () => v.classList.add("is-loaded");
    if (v.readyState >= 3) reveal();
    else v.addEventListener("canplay", reveal, { once: true });
    v.addEventListener("loadeddata", reveal, { once: true });

    // Pause when off-screen
    if ("IntersectionObserver" in window) {
      const io = new IntersectionObserver((entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) v.play().catch(() => {});
          else v.pause();
        });
      }, { threshold: 0.1 });
      io.observe(v);
    }
  });
})();
