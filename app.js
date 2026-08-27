(() => {
  "use strict";

  const STORAGE_KEY = "coffeebid_state_v1";
  const LAUNCH_KEY = "coffeebid_launch_v1";
  const PAGE_SIZE = 50;

  const LONDON_REGIONS = [
    "Clerkenwell & Farringdon",
    "Soho & Fitzrovia",
    "Shoreditch & Hackney",
    "Borough & South Bank",
    "Covent Garden & Holborn",
    "Notting Hill & Chelsea",
    "Camden & Kentish Town",
    "Peckham & Brixton",
    "Canary Wharf",
    "Whitechapel & Wapping",
    "Tower Bridge & Tower Hill",
    "Other London",
  ];

  const UK_CITY_REGIONS = [
    "Manchester",
    "Birmingham",
    "Edinburgh",
    "Glasgow",
    "Bristol",
    "Leeds",
    "Liverpool",
    "Cardiff",
  ];

  const NATIONAL_REGION = "Nationwide";

  const REGION_GROUPS = [
    { label: "London", regions: LONDON_REGIONS },
    { label: "Other UK Cities", regions: UK_CITY_REGIONS },
    { label: "National", regions: [NATIONAL_REGION] },
  ];

  const CATEGORIES = [...LONDON_REGIONS, ...UK_CITY_REGIONS, NATIONAL_REGION];

  const ALL_ICON = `<svg class="cat-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>`;
  const PIN_ICON = `<svg class="cat-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 21s7-6.4 7-12a7 7 0 1 0-14 0c0 5.6 7 12 7 12z"/><circle cx="12" cy="9" r="2.4"/></svg>`;
  const NATIONAL_ICON = `<svg class="cat-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M5 21V4"/><path d="M5 4h13l-3 4 3 4H5"/></svg>`;

  function faviconFor(host) {
    return `https://www.google.com/s2/favicons?sz=64&domain=${encodeURIComponent(host)}`;
  }

  const SEED_LISTINGS = [
    { url: "https://prufrockcoffee.com", title: "Prufrock Coffee", desc: "Wanted for: turning Leather Lane into a laptop-bag queue every single morning.", category: "Clerkenwell & Farringdon", amount: 4200, clicks: 18230, hoursAgo: 40 },
    { url: "https://kaffeine.co.uk", title: "Kaffeine", desc: "Wanted for: flat whites so smooth they should be illegal on Great Titchfield Street.", category: "Soho & Fitzrovia", amount: 3100, clicks: 9120, hoursAgo: 60 },
    { url: "https://climpsonandsons.com", title: "Climpson & Sons", desc: "Wanted for: roasting so good it starts a stampede at Broadway Market.", category: "Shoreditch & Hackney", amount: 2650, clicks: 14310, hoursAgo: 20 },
    { url: "https://monmouthcoffee.co.uk", title: "Monmouth Coffee", desc: "Wanted for: causing a Saturday-morning pile-up outside Borough Market.", category: "Borough & South Bank", amount: 1800, clicks: 5230, hoursAgo: 80 },
    { url: "https://notescoffee.com", title: "Notes Coffee Roasters", desc: "Wanted for: making a basement off Trafalgar feel like a proper hideout.", category: "Covent Garden & Holborn", amount: 1200, clicks: 7010, hoursAgo: 30 },
    { url: "https://farmgirluk.com", title: "Farm Girl", desc: "Wanted for: acai bowls that out-influence the influencers.", category: "Notting Hill & Chelsea", amount: 640, clicks: 3110, hoursAgo: 12 },
    { url: "https://departmentofcoffee.com", title: "Department of Coffee and Social Affairs", desc: "Wanted for: opening a new branch every time you turn around.", category: "Camden & Kentish Town", amount: 510, clicks: 2870, hoursAgo: 5 },
    { url: "https://federationcoffee.com", title: "Federation Coffee", desc: "Wanted for: a Brixton Village queue that blocks the whole arcade.", category: "Peckham & Brixton", amount: 260, clicks: 1590, hoursAgo: 3 },
    { url: "https://associationcoffee.co.uk", title: "Association Coffee", desc: "Wanted for: keeping the trading floor awake through back-to-back meetings.", category: "Canary Wharf", amount: 480, clicks: 2210, hoursAgo: 22 },
    { url: "https://wappingcoffeeco.com", title: "Wapping Coffee Co.", desc: "Wanted for: turning a Wapping warehouse into a flat-white pilgrimage.", category: "Whitechapel & Wapping", amount: 340, clicks: 1740, hoursAgo: 14 },
    { url: "https://bridgecoffeehouse.co.uk", title: "Bridge Coffee House", desc: "Wanted for: out-queuing the Tower Bridge tourists.", category: "Tower Bridge & Tower Hill", amount: 390, clicks: 1980, hoursAgo: 10 },
    { url: "https://ancoatscoffee.co.uk", title: "Ancoats Coffee Co.", desc: "Wanted for: turning a former mill town into flat white territory.", category: "Manchester", amount: 1500, clicks: 6210, hoursAgo: 26 },
    { url: "https://quarterhorsecoffee.com", title: "Quarter Horse Coffee", desc: "Wanted for: out-brewing the Bullring one pour-over at a time.", category: "Birmingham", amount: 950, clicks: 4020, hoursAgo: 45 },
    { url: "https://artisanroast.co.uk", title: "Artisan Roast", desc: "Wanted for: fuelling the Fringe on nothing but flat whites.", category: "Edinburgh", amount: 1350, clicks: 5480, hoursAgo: 18 },
    { url: "https://laboratoriocoffee.com", title: "Laboratorio Coffee", desc: "Wanted for: running a coffee lab that never sleeps.", category: "Glasgow", amount: 800, clicks: 3340, hoursAgo: 55 },
    { url: "https://smallstreetespresso.co.uk", title: "Small Street Espresso", desc: "Wanted for: hiding the city's best espresso down an alley.", category: "Bristol", amount: 1100, clicks: 4670, hoursAgo: 33 },
    { url: "https://laynesespresso.co.uk", title: "Laynes Espresso", desc: "Wanted for: a bar so small the queue forms outside.", category: "Leeds", amount: 700, clicks: 2980, hoursAgo: 9 },
    { url: "https://boldstreetcoffee.co.uk", title: "Bold Street Coffee", desc: "Wanted for: keeping the whole street caffeinated since dawn.", category: "Liverpool", amount: 600, clicks: 2510, hoursAgo: 15 },
    { url: "https://waterlootea.com", title: "Waterloo Tea", desc: "Wanted for: proving Cardiff can out-brew London.", category: "Cardiff", amount: 450, clicks: 1980, hoursAgo: 7 },
    { url: "https://grind.co.uk", title: "Grind", desc: "Wanted for: showing up in every city at once.", category: "Nationwide", amount: 2200, clicks: 11400, hoursAgo: 50 },
  ].map((s) => ({ ...s, logo: faviconFor(slug(s.url)) }));

  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => Array.from(document.querySelectorAll(sel));

  function fmtMoney(n) {
    return "£" + Math.round(n).toLocaleString("en-GB");
  }

  function timeAgo(ts) {
    const s = Math.max(1, Math.floor((Date.now() - ts) / 1000));
    if (s < 60) return "just now";
    const m = Math.floor(s / 60);
    if (m < 60) return `${m} minute${m === 1 ? "" : "s"} ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h} hour${h === 1 ? "" : "s"} ago`;
    const d = Math.floor(h / 24);
    return `${d} day${d === 1 ? "" : "s"} ago`;
  }

  function slug(url) {
    try {
      return new URL(/^https?:\/\//.test(url) ? url : "https://" + url).hostname.replace(/^www\./, "");
    } catch {
      return url.replace(/^@/, "");
    }
  }

  const LINK_TYPE_PLACEHOLDERS = {
    website: "Coffeeshop website (yourcafe.co.uk)",
    instagram: "@yourhandle",
    app: "App Store or Play Store link",
  };

  function mapsUrlFor(l) {
    let query;
    if (l.category === NATIONAL_REGION) query = `${l.title} UK`;
    else if (LONDON_REGIONS.includes(l.category)) query = `${l.title}, ${l.category}, London`;
    else query = `${l.title}, ${l.category}, UK`;
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
  }

  function resolveUrl(rawValue, type) {
    const handle = rawValue.trim().replace(/^@/, "");
    if (type === "instagram") return "https://instagram.com/" + handle;
    return /^https?:\/\//.test(rawValue) ? rawValue : "https://" + rawValue.replace(/^@/, "");
  }

  // ---- state ----
  let state = load();
  let backendAvailable = false;
  let stripeConfigured = false;

  async function tryLoadBackend() {
    try {
      const res = await fetch("/api/state");
      if (!res.ok) return;
      const data = await res.json();
      state = {
        listings: data.listings,
        activity: data.activity,
        totalEarned: data.totalEarned,
        visitors: data.visitors,
      };
      backendAvailable = true;
      stripeConfigured = !!data.stripeConfigured;
      renderAll();
    } catch {
      // no backend running here — stay in local demo mode
    }
  }

  function load() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try { return JSON.parse(raw); } catch { /* fall through to seed */ }
    }
    const now = Date.now();
    const listings = SEED_LISTINGS.map((s, i) => ({
      id: "seed-" + i,
      url: s.url,
      title: s.title,
      desc: s.desc,
      category: s.category,
      amount: s.amount,
      clicks: s.clicks,
      claimedAt: now - s.hoursAgo * 3600 * 1000,
      logo: s.logo,
    }));
    const activity = listings
      .slice()
      .sort((a, b) => a.claimedAt - b.claimedAt)
      .map((l) => ({ id: l.id, title: l.title, url: l.url, amount: l.amount, ts: l.claimedAt, logo: l.logo }));
    const fresh = {
      listings,
      activity,
      totalEarned: listings.reduce((sum, l) => sum + l.amount, 0),
      visitors: 68412 + Math.floor(Math.random() * 500),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(fresh));
    return fresh;
  }

  function save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  function getLaunch() {
    let t = localStorage.getItem(LAUNCH_KEY);
    if (!t) {
      t = String(Date.now() - 169 * 3600 * 1000); // pretend it's been running a while, like the original
      localStorage.setItem(LAUNCH_KEY, t);
    }
    return parseInt(t, 10);
  }

  // ---- derived views ----
  function rankedListings({ today = false, category = null } = {}) {
    let list = state.listings.slice();
    if (today) {
      const cutoff = Date.now() - 24 * 3600 * 1000;
      list = list.filter((l) => l.claimedAt >= cutoff);
    }
    if (category) list = list.filter((l) => l.category === category);
    list.sort((a, b) => b.amount - a.amount || a.claimedAt - b.claimedAt);
    return list;
  }

  function categoryTotals() {
    const totals = {};
    for (const c of CATEGORIES) totals[c] = 0;
    for (const l of state.listings) {
      totals[l.category] = Math.max(totals[l.category] || 0, l.amount);
    }
    return totals;
  }

  // ---- UI state ----
  let activeTab = "all";
  let activeCategory = null;
  let boardPage = 1;
  let linkType = "website";

  // ---- render ----
  function renderAll() {
    renderHero();
    renderBidWidget();
    renderCategories();
    renderFilterStatus();
    renderBoard();
    renderTodayTop();
    renderActivity();
    renderAbout();
  }

  function renderAbout() {
    const launch = getLaunch();
    const dateStr = new Date(launch).toLocaleString("en-GB", {
      day: "numeric", month: "long", year: "numeric", hour: "numeric", minute: "2-digit",
    });
    $("#aboutLaunchDate").textContent = dateStr;
    $("#aboutVisitors").textContent = state.visitors.toLocaleString("en-GB");
    $("#aboutRevenue").textContent = fmtMoney(state.totalEarned);
    const highest = state.listings.reduce((max, l) => Math.max(max, l.amount), 0);
    $("#aboutHighest").textContent = fmtMoney(highest);
  }

  function renderHero() {
    $("#totalEarned").textContent = fmtMoney(state.totalEarned);
    $("#visitorCount").textContent = state.visitors.toLocaleString("en-GB");
  }

  function currentTopAmount() {
    const list = rankedListings({ category: activeCategory });
    return list.length ? list[0].amount : 4;
  }

  function sizeAmountInput(el) {
    el.size = Math.max(2, el.value.length);
  }

  function renderBidWidget() {
    $("#claimLabel").textContent = activeCategory ? `Claim #1 Most Wanted Coffeeshop in ${activeCategory} for` : "Claim #1 Most Wanted Coffeeshop for";
    const top = currentTopAmount();
    const amountEl = $("#bidAmount");
    if (!amountEl.dataset.userEdited) {
      amountEl.value = top + 1;
    }
    sizeAmountInput(amountEl);
    const catSel = $("#bidCategory");
    if (!catSel.dataset.built) {
      for (const c of CATEGORIES) {
        const opt = document.createElement("option");
        opt.value = c;
        opt.textContent = c;
        catSel.appendChild(opt);
      }
      catSel.dataset.built = "1";
    }
  }

  function renderCategories() {
    const totals = categoryTotals();
    const ul = $("#categoryList");
    ul.innerHTML = "";
    const allLi = document.createElement("li");
    allLi.className = activeCategory === null ? "active" : "";
    allLi.innerHTML = `<a href="#board" data-cat="">${ALL_ICON}<span>All</span><span class="cat-amt">${fmtMoney(currentTopAmountFor(null))}</span></a>`;
    ul.appendChild(allLi);
    for (const group of REGION_GROUPS) {
      const groupLi = document.createElement("li");
      groupLi.className = "group-label";
      groupLi.textContent = group.label;
      ul.appendChild(groupLi);
      const icon = group.label === "National" ? NATIONAL_ICON : PIN_ICON;
      for (const c of group.regions) {
        const li = document.createElement("li");
        li.className = activeCategory === c ? "active" : "";
        li.innerHTML = `<a href="#board" data-cat="${c}">${icon}<span>${c}</span><span class="cat-amt">${fmtMoney(totals[c] || 0)}</span></a>`;
        ul.appendChild(li);
      }
    }
    ul.querySelectorAll("a").forEach((a) => {
      a.addEventListener("click", (e) => {
        e.preventDefault();
        activeCategory = a.dataset.cat || null;
        boardPage = 1;
        renderCategories();
        renderBoard();
        renderBidWidget();
        renderFilterStatus();
      });
    });
  }

  function currentTopAmountFor(cat) {
    const list = rankedListings({ category: cat });
    return list.length ? list[0].amount : 0;
  }

  function renderFilterStatus() {
    const el = $("#filterStatus");
    if (!activeCategory) {
      el.hidden = true;
      el.innerHTML = "";
      return;
    }
    const top = currentTopAmountFor(activeCategory);
    el.hidden = false;
    el.innerHTML = `<span>${escapeHtml(activeCategory)} — top bounty right now: <strong class="money">${top ? fmtMoney(top) : "no bounties yet"}</strong></span><button type="button" id="clearFilter">Clear filter</button>`;
    $("#clearFilter").addEventListener("click", () => {
      activeCategory = null;
      boardPage = 1;
      renderCategories();
      renderBoard();
      renderBidWidget();
      renderFilterStatus();
    });
  }

  function listingCard(l, rank) {
    const li = document.createElement("li");
    li.className = "listing-card" + (rank <= 3 ? ` rank-${rank}` : "");
    li.innerHTML = `
      <div class="rank-num">#${rank}</div>
      <div class="listing-main">
        <a class="listing-title" href="${safeHref(l.url)}" target="_blank" rel="noopener noreferrer"><img class="fav" src="${l.logo || faviconFor(slug(l.url))}" alt="" onerror="this.style.visibility='hidden'">${escapeHtml(l.title)}</a>
        <div class="listing-desc">${escapeHtml(l.desc || slug(l.url))}</div>
        <div class="listing-meta">
          <span class="badge">${escapeHtml(l.category)}</span>
          <span>${timeAgo(l.claimedAt)}</span>
          <span>${l.clicks.toLocaleString("en-GB")} sightings</span>
          <a class="directions-link" href="${mapsUrlFor(l)}" target="_blank" rel="noopener noreferrer">📍 Directions</a>
        </div>
      </div>
      <div class="listing-side">
        <span class="money">${fmtMoney(l.amount)}</span>
        <button type="button" data-claim="${l.id}">post ${fmtMoney(l.amount + 1)} bounty</button>
      </div>
    `;
    return li;
  }

  function paginationRange(current, total) {
    const delta = 1;
    const range = [];
    for (let i = 1; i <= total; i++) {
      if (i === 1 || i === total || (i >= current - delta && i <= current + delta)) {
        range.push(i);
      }
    }
    const withDots = [];
    let prev = null;
    for (const i of range) {
      if (prev !== null && i - prev > 1) withDots.push("...");
      withDots.push(i);
      prev = i;
    }
    return withDots;
  }

  function renderPagination(total) {
    const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
    if (boardPage > totalPages) boardPage = totalPages;
    const nav = $("#boardPagination");
    const numbersEl = $("#pageNumbers");
    numbersEl.innerHTML = "";
    nav.hidden = totalPages <= 1;
    if (totalPages > 1) {
      paginationRange(boardPage, totalPages).forEach((p) => {
        if (p === "...") {
          const span = document.createElement("span");
          span.className = "page-ellipsis";
          span.textContent = "…";
          numbersEl.appendChild(span);
        } else {
          const btn = document.createElement("button");
          btn.type = "button";
          btn.className = "page-num" + (p === boardPage ? " active" : "");
          btn.textContent = p;
          btn.addEventListener("click", () => {
            boardPage = p;
            renderBoard();
            $("#board").scrollIntoView({ behavior: "smooth", block: "start" });
          });
          numbersEl.appendChild(btn);
        }
      });
      $("#pagePrev").disabled = boardPage === 1;
      $("#pageNext").disabled = boardPage === totalPages;
    }
    const summary = $("#pageSummary");
    if (!total) {
      summary.textContent = "";
    } else {
      const start = (boardPage - 1) * PAGE_SIZE + 1;
      const end = Math.min(total, boardPage * PAGE_SIZE);
      summary.textContent = `${start.toLocaleString("en-GB")} – ${end.toLocaleString("en-GB")} of ${total.toLocaleString("en-GB")}`;
    }
  }

  function renderBoard() {
    const list = rankedListings({ today: activeTab === "today", category: activeCategory });
    const olTop = $("#listingListTop");
    const olRest = $("#listingListRest");
    olTop.innerHTML = "";
    olRest.innerHTML = "";
    const totalPages = Math.max(1, Math.ceil(list.length / PAGE_SIZE));
    if (boardPage > totalPages) boardPage = totalPages;
    const start = (boardPage - 1) * PAGE_SIZE;
    const shown = list.slice(start, start + PAGE_SIZE);

    const showInterstitial = boardPage === 1 && shown.length > 3;
    $("#todaySection").hidden = !showInterstitial;
    $("#activitySection").hidden = !showInterstitial;

    const topSlice = showInterstitial ? shown.slice(0, 3) : shown;
    const restSlice = showInterstitial ? shown.slice(3) : [];
    topSlice.forEach((l, i) => olTop.appendChild(listingCard(l, start + i + 1)));
    restSlice.forEach((l, i) => olRest.appendChild(listingCard(l, start + 3 + i + 1)));

    if (!shown.length) {
      const empty = document.createElement("li");
      empty.style.color = "var(--text-dim)";
      empty.style.fontSize = "13px";
      empty.style.padding = "20px";
      empty.textContent = "No one's wanted here yet. Be the first to post a bounty.";
      olTop.appendChild(empty);
    }
    [...olTop.querySelectorAll("[data-claim]"), ...olRest.querySelectorAll("[data-claim]")].forEach((btn) => {
      btn.addEventListener("click", () => claimRank(btn.dataset.claim));
    });
    renderPagination(list.length);
  }

  function renderTodayTop() {
    const list = rankedListings({ today: true }).slice(0, 3);
    const row = $("#todayTop");
    row.innerHTML = "";
    if (!list.length) {
      row.innerHTML = `<span class="today-empty">No bounties posted today yet.</span>`;
      return;
    }
    list.forEach((l, i) => {
      const card = document.createElement("a");
      card.className = "today-card";
      card.href = safeHref(l.url);
      card.target = "_blank";
      card.rel = "noopener noreferrer";
      card.innerHTML = `
        <div class="today-card-top">
          <span class="today-rank">#${i + 1}</span>
          <img class="fav" src="${l.logo || faviconFor(slug(l.url))}" alt="" onerror="this.style.visibility='hidden'">
          <span class="today-title">${escapeHtml(l.title)}</span>
        </div>
        <div class="today-desc">${escapeHtml(l.desc || slug(l.url))}</div>
        <div class="today-amt money">${fmtMoney(l.amount)}</div>
      `;
      row.appendChild(card);
    });
  }

  function renderActivity() {
    const items = state.activity.slice().sort((a, b) => b.ts - a.ts).slice(0, 12);
    const row = $("#activityList");
    row.innerHTML = "";
    items.forEach((a) => {
      const chip = document.createElement("a");
      chip.className = "activity-chip";
      chip.href = safeHref(a.url);
      chip.target = "_blank";
      chip.rel = "noopener noreferrer";
      chip.innerHTML = `
        <img class="fav" src="${a.logo || faviconFor(slug(a.url))}" alt="" onerror="this.style.visibility='hidden'">
        <span class="activity-chip-title">${escapeHtml(a.title)}</span>
        <span class="activity-chip-when">${timeAgo(a.ts)}</span>
      `;
      row.appendChild(chip);
    });
  }

  function safeHref(url) {
    const withProto = /^https?:\/\//.test(url) ? url : "https://" + url.replace(/^@/, "");
    try {
      const u = new URL(withProto);
      if (u.protocol === "http:" || u.protocol === "https:") return u.href;
    } catch { /* fall through */ }
    return "#";
  }

  function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  // ---- actions ----
  // URL preview / auto-fetch state
  let previewTimer = null;
  let fetchedMeta = null; // { forUrl, title, desc, logo }

  function schedulePreview(rawValue) {
    clearTimeout(previewTimer);
    const value = rawValue.trim();
    const box = $("#urlPreview");
    if (!value || value.length < 2) {
      box.hidden = true;
      fetchedMeta = null;
      return;
    }
    if (linkType === "instagram") {
      // Instagram blocks unauthenticated scraping, so there's no reliable way
      // to fetch the real profile photo — fall back to the app icon.
      fetchedMeta = { forUrl: value, title: value.replace(/^@/, ""), desc: "", logo: faviconFor("instagram.com") };
      box.hidden = false;
      box.innerHTML = `<img src="${fetchedMeta.logo}" alt="" onerror="this.style.display='none'"><span class="preview-title">${escapeHtml(fetchedMeta.title)}</span>`;
      return;
    }
    box.hidden = false;
    box.innerHTML = `<span class="preview-loading">fetching site info…</span>`;
    previewTimer = setTimeout(() => fetchPreview(value, linkType), 600);
  }

  async function fetchPreview(rawValue, type) {
    const href = resolveUrl(rawValue, type);
    const host = slug(href);
    const fallback = { forUrl: rawValue, title: host, desc: "", logo: faviconFor(host) };
    try {
      const res = await fetch(`https://api.microlink.io/?url=${encodeURIComponent(href)}&palette=false`);
      const json = await res.json();
      const d = json && json.data;
      if (json.status === "success" && d) {
        const logo = (d.logo && d.logo.url) || (d.image && d.image.url) || fallback.logo;
        fetchedMeta = {
          forUrl: rawValue,
          title: d.title || host,
          desc: d.description || "",
          logo,
        };
      } else {
        fetchedMeta = fallback;
      }
    } catch {
      fetchedMeta = fallback;
    }
    renderPreview(fetchedMeta);
  }

  function renderPreview(meta) {
    const box = $("#urlPreview");
    box.hidden = false;
    box.innerHTML = `<img src="${meta.logo}" alt="" onerror="this.style.display='none'"><span class="preview-title">${escapeHtml(meta.title)}</span>`;
  }

  function placeBid({ url, rawUrl, title, category, desc, amount }) {
    amount = Math.max(5, Math.round(amount));
    const id = "u-" + Date.now() + "-" + Math.random().toString(36).slice(2, 7);
    const host = slug(url);
    const meta = fetchedMeta && fetchedMeta.forUrl === rawUrl ? fetchedMeta : null;
    const logo = (meta && meta.logo) || faviconFor(host);
    const listing = {
      id,
      url,
      title,
      desc: desc || "",
      category,
      amount,
      clicks: 0,
      claimedAt: Date.now(),
      logo,
    };
    state.listings.push(listing);
    state.activity.push({ id, title: listing.title, url, amount, ts: listing.claimedAt, logo });
    state.totalEarned += amount;
    save();
    renderAll();
  }

  function claimRank(id) {
    const target = state.listings.find((l) => l.id === id);
    if (!target) return;
    const amount = target.amount + 1;
    $("#bidAmount").value = amount;
    $("#bidAmount").dataset.userEdited = "1";
    if (target.category) $("#bidCategory").value = target.category;
    $("#bidWidget").scrollIntoView({ behavior: "smooth", block: "center" });
    $("#bidUrl").focus();
  }

  // ---- wire up ----
  function init() {
    // theme
    const savedTheme = localStorage.getItem("coffeebid_theme") || "light";
    document.documentElement.dataset.theme = savedTheme;
    $("#themeToggle").textContent = savedTheme === "dark" ? "☀️" : "🌙";
    $("#themeToggle").addEventListener("click", () => {
      const cur = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
      document.documentElement.dataset.theme = cur;
      localStorage.setItem("coffeebid_theme", cur);
      $("#themeToggle").textContent = cur === "dark" ? "☀️" : "🌙";
    });

    // tabs
    $$(".tab").forEach((tab) => {
      tab.addEventListener("click", () => {
        $$(".tab").forEach((t) => {
          t.classList.remove("active");
          t.setAttribute("aria-selected", "false");
        });
        tab.classList.add("active");
        tab.setAttribute("aria-selected", "true");
        activeTab = tab.dataset.tab;
        boardPage = 1;
        renderBoard();
      });
    });

    // stepper
    $("#stepDown").addEventListener("click", () => {
      const el = $("#bidAmount");
      el.dataset.userEdited = "1";
      el.value = Math.max(5, (parseInt(el.value, 10) || 5) - 1);
      sizeAmountInput(el);
    });
    $("#stepUp").addEventListener("click", () => {
      const el = $("#bidAmount");
      el.dataset.userEdited = "1";
      el.value = (parseInt(el.value, 10) || 5) + 1;
      sizeAmountInput(el);
    });
    $("#bidAmount").addEventListener("input", (e) => {
      e.target.dataset.userEdited = "1";
      e.target.value = e.target.value.replace(/[^0-9]/g, "");
      sizeAmountInput(e.target);
    });

    // link type toggle (Website / X / Instagram / App)
    $$(".link-type").forEach((btn) => {
      btn.addEventListener("click", () => {
        $$(".link-type").forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        linkType = btn.dataset.type;
        $("#bidUrl").placeholder = LINK_TYPE_PLACEHOLDERS[linkType] || "";
        $("#urlPreview").hidden = true;
        fetchedMeta = null;
      });
    });

    // auto-fetch logo/title as the URL is typed
    $("#bidUrl").addEventListener("input", (e) => schedulePreview(e.target.value));

    // form
    $("#bidForm").addEventListener("submit", async (e) => {
      e.preventDefault();
      const name = $("#bidName").value.trim();
      const rawUrl = $("#bidUrl").value.trim();
      const category = $("#bidCategory").value;
      const desc = $("#bidDesc").value.trim();
      const amount = parseInt($("#bidAmount").value, 10);
      const msg = $("#formMsg");

      if (!name) { msg.textContent = "Enter the coffeeshop's name."; msg.className = "form-msg error"; return; }
      if (!rawUrl) { msg.textContent = "Enter a link."; msg.className = "form-msg error"; return; }
      if (!category) { msg.textContent = "Choose a region."; msg.className = "form-msg error"; return; }
      if (!amount || amount < 5) { msg.textContent = "Minimum bounty is £5."; msg.className = "form-msg error"; return; }

      const url = resolveUrl(rawUrl, linkType);

      if (backendAvailable && stripeConfigured) {
        const submitBtn = $("#bidForm button[type=submit]");
        submitBtn.disabled = true;
        msg.textContent = "Taking you to checkout…";
        msg.className = "form-msg";
        try {
          const res = await fetch("/api/checkout", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, url, category, desc, amount }),
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error || "Something went wrong.");
          window.location.href = data.url;
        } catch (err) {
          msg.textContent = err.message || "Couldn't start checkout. Try again.";
          msg.className = "form-msg error";
          submitBtn.disabled = false;
        }
        return;
      }

      // No payment backend running — fall back to the local-only demo.
      placeBid({ url, rawUrl, title: name, category, desc, amount });
      msg.textContent = `You posted a ${fmtMoney(amount)} bounty! (demo mode — no backend running, so no real payment was taken)`;
      msg.className = "form-msg success";
      $("#bidForm").reset();
      $("#bidAmount").dataset.userEdited = "";
      $("#bidCategory").value = "";
      $("#urlPreview").hidden = true;
      fetchedMeta = null;
      linkType = "website";
      $$(".link-type").forEach((b) => b.classList.toggle("active", b.dataset.type === "website"));
      $("#bidUrl").placeholder = LINK_TYPE_PLACEHOLDERS.website;
    });

    // pagination
    $("#pagePrev").addEventListener("click", () => {
      if (boardPage > 1) { boardPage -= 1; renderBoard(); $("#board").scrollIntoView({ behavior: "smooth", block: "start" }); }
    });
    $("#pageNext").addEventListener("click", () => {
      boardPage += 1;
      renderBoard();
      $("#board").scrollIntoView({ behavior: "smooth", block: "start" });
    });

    // fake online counter flavor
    $("#onlineCount").textContent = String(60 + Math.floor(Math.random() * 140));
    setInterval(() => {
      const el = $("#onlineCount");
      const cur = parseInt(el.textContent, 10) || 100;
      const next = Math.max(20, cur + Math.floor(Math.random() * 11) - 5);
      el.textContent = String(next);
    }, 4000);

    renderAll();
    setInterval(renderAll, 30000); // keep relative timestamps + launch hours fresh

    // real payments, if a backend happens to be running behind this page
    tryLoadBackend().then(() => {
      const params = new URLSearchParams(window.location.search);
      const msg = $("#formMsg");
      if (params.get("bounty") === "success") {
        msg.textContent = "Bounty paid — you're on the board!";
        msg.className = "form-msg success";
        tryLoadBackend();
      } else if (params.get("bounty") === "cancelled") {
        msg.textContent = "Checkout cancelled — no charge was made.";
        msg.className = "form-msg error";
      }
      if (params.has("bounty")) {
        params.delete("bounty");
        const qs = params.toString();
        window.history.replaceState({}, "", window.location.pathname + (qs ? `?${qs}` : ""));
      }
    });
  }

  document.addEventListener("DOMContentLoaded", init);
})();
