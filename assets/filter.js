(function () {
  const STEP = window.FILTER_STEP || 6;
  const SAMPLE = [
    ["學校", "學程", "國家", "領域", "語言", "獎學金", "需要資工背景", "學費", "截止日期", "官網", "已查證"],
    ["範例大學（假名）", "範例學程・機器學習", "日本", "技術", "英語", "有", "不要", "", "", "https://example.edu/ml", "否"],
    ["範例治理學院（假名）", "範例學程・AI 與公共政策", "歐洲", "治理人文", "英語", "無", "不要", "", "", "https://example.edu/gov", "否"],
    ["範例商學院（假名）", "範例學程・商業分析", "英國", "商管", "英語", "有", "要", "", "", "https://example.edu/ba", "否"],
    ["範例西岸大學（假名）", "範例學程・人工智慧", "美國", "技術", "英語", "無", "要", "", "", "https://example.edu/ai", "否"],
    ["範例島嶼大學（假名）", "範例學程・資訊社會", "台灣", "治理人文", "中文", "有", "不要", "", "", "https://example.edu/tw", "否"],
    ["範例阿爾卑斯學院（假名）", "範例學程・人機互動", "歐洲", "技術", "英語", "有", "不要", "", "", "https://example.edu/hci", "否"],
    ["範例港區商科（假名）", "範例學程・金融科技", "亞洲", "商管", "英語", "無", "不要", "", "", "https://example.edu/fin", "否"],
    ["範例關東情報（假名）", "範例學程・社會情報", "日本", "治理人文", "日語", "有", "不要", "", "", "https://example.edu/si", "否"]
  ];
  const FLAGS = {
    "台灣": "🇹🇼", "臺灣": "🇹🇼", "日本": "🇯🇵", "英國": "🇬🇧", "美國": "🇺🇸",
    "歐洲": "🇪🇺", "亞洲": "🌏", "德國": "🇩🇪", "法國": "🇫🇷", "荷蘭": "🇳🇱",
    "瑞士": "🇨🇭", "新加坡": "🇸🇬", "香港": "🇭🇰", "韓國": "🇰🇷", "加拿大": "🇨🇦",
    "澳洲": "🇦🇺", "瑞典": "🇸🇪", "丹麥": "🇩🇰", "愛爾蘭": "🇮🇪"
  };
  const LS = "nccu-ai-filter-v1";
  const $ = (s) => document.querySelector(s);
  const gate = $("#gate");
  const app = $("#app");
  const status = $("#status");
  const list = $("#list");
  const countEl = $("#count");
  const countryBox = $("#countries");
  const langBox = $("#languages");
  const compareBar = $("#compare-bar");
  const compareView = $("#compare");
  const targetView = $("#target-view");

  let rows = [];
  let sampleMode = false;
  const filters = {
    countries: new Set(),
    fields: new Set(),
    langs: new Set(),
    scholarship: false,
    noCs: false,
    hidePast: false,
    tuitionMax: 2000000
  };
  let compareIds = [];
  let shortlist = new Set();
  let targetId = "";
  let targetNote = "";

  function sampleCsv() {
    return SAMPLE.map((r) => r.map(csvCell).join(",")).join("\n");
  }
  function csvCell(v) {
    const s = String(v ?? "");
    return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
  }
  function parseCSV(text) {
    text = String(text || "").replace(/^\uFEFF/, "").replace(/\r\n/g, "\n").replace(/\r/g, "\n").trim();
    if (!text) return [];
    const rows = [];
    let row = [], cur = "", q = false;
    for (let i = 0; i < text.length; i++) {
      const c = text[i];
      if (q) {
        if (c === '"') {
          if (text[i + 1] === '"') { cur += '"'; i++; }
          else q = false;
        } else cur += c;
      } else if (c === '"') q = true;
      else if (c === ",") { row.push(cur); cur = ""; }
      else if (c === "\n") { row.push(cur); rows.push(row); row = []; cur = ""; }
      else cur += c;
    }
    if (cur.length || row.length) { row.push(cur); rows.push(row); }
    return rows.filter((r) => r.some((x) => String(x).trim()));
  }
  function normHeader(h) {
    return String(h || "").trim().toLowerCase().replace(/\s+/g, "");
  }
  function fieldOf(h) {
    const n = normHeader(h);
    const map = [
      ["school", ["學校", "校名", "school", "university"]],
      ["program", ["學程", "節目", "program", "programme", "programname"]],
      ["country", ["國家", "地區", "country", "region"]],
      ["field", ["領域", "field", "類型"]],
      ["language", ["語言", "授課語言", "language"]],
      ["scholarship", ["獎學金", "scholarship"]],
      ["cs", ["需要資工背景", "資工背景", "cs"]],
      ["tuition", ["學費", "tuition"]],
      ["deadline", ["截止日期", "截止日", "deadline", "截止"]],
      ["url", ["官網", "網址", "url", "link"]],
      ["verified", ["已查證", "查證", "verified"]]
    ];
    for (const [key, names] of map) {
      if (names.some((name) => n === normHeader(name))) return key;
    }
    return "";
  }
  function toRecords(text) {
    const table = parseCSV(text);
    if (table.length < 2) throw new Error("這份 CSV 至少要有一列表頭、一列資料。");
    const idx = {};
    table[0].forEach((h, i) => { const f = fieldOf(h); if (f) idx[f] = i; });
    if (idx.school == null || idx.program == null) {
      throw new Error("找不到「學校」或「學程」欄。請用這個表頭：學校,學程,國家,領域,語言,獎學金,需要資工背景,學費,截止日期,官網,已查證");
    }
    return table.slice(1).map((r, n) => {
      const get = (k) => (idx[k] == null ? "" : String(r[idx[k]] || "").trim());
      const rec = {
        id: n + "-" + get("school") + "|" + get("program"),
        school: get("school"),
        program: get("program"),
        country: get("country") || "未填",
        field: normField(get("field")),
        language: get("language") || "未填",
        scholarship: normYes(get("scholarship")),
        cs: normCs(get("cs")),
        tuitionText: get("tuition"),
        tuitionNum: money(get("tuition")),
        deadlineText: get("deadline"),
        deadline: parseDate(get("deadline")),
        url: get("url"),
        verified: normYes(get("verified")) === "有"
      };
      return rec;
    }).filter((r) => r.school || r.program);
  }
  function normField(v) {
    if (/商|管|business/i.test(v)) return "商管";
    if (/治理|人文|社會|法律|政策|gov|human/i.test(v)) return "治理人文";
    if (/技|資工|資訊|tech|cs/i.test(v)) return "技術";
    return v || "未填";
  }
  function normYes(v) {
    if (/不要|無|否|no|n$/i.test(v)) return "無";
    if (/有|是|要|yes|y$/i.test(v)) return "有";
    return "未填";
  }
  function normCs(v) {
    if (/不要|不需|無|否|no/i.test(v)) return "不要";
    if (/^要|需要|是|yes/i.test(v)) return "要";
    return "未填";
  }
  function money(v) {
    const digits = String(v || "").replace(/,/g, "").match(/\d+(\.\d+)?/);
    return digits ? Number(digits[0]) : null;
  }
  function parseDate(v) {
    const m = String(v || "").trim().match(/^(\d{4})[./-](\d{1,2})[./-](\d{1,2})/);
    if (!m) return null;
    const d = new Date(Date.UTC(+m[1], +m[2] - 1, +m[3]));
    return Number.isNaN(d.getTime()) ? null : d;
  }
  function taipeiToday() {
    const fmt = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Taipei", year: "numeric", month: "2-digit", day: "2-digit" });
    const [y, m, d] = fmt.format(new Date()).split("-").map(Number);
    return Date.UTC(y, m - 1, d);
  }
  function countdown(rec) {
    if (!rec.deadline) return { text: "截止日未填", cls: "empty" };
    const diff = Math.round((rec.deadline.getTime() - taipeiToday()) / 86400000);
    if (diff < 0) return { text: "已過 " + (-diff) + " 天", cls: "past" };
    if (diff === 0) return { text: "今天截止", cls: "soon" };
    if (diff <= 21) return { text: "還有 " + diff + " 天", cls: "soon" };
    return { text: "還有 " + diff + " 天", cls: "" };
  }
  function flag(country) { return FLAGS[country] || "🌐"; }
  function say(html, kind) {
    status.className = kind === "error" ? "error" : "banner";
    status.hidden = false;
    status.innerHTML = html;
  }
  function clearStatus() { status.hidden = true; status.innerHTML = ""; }

  function visible() {
    return rows.filter((r) => {
      if (filters.countries.size && !filters.countries.has(r.country)) return false;
      if (filters.fields.size && !filters.fields.has(r.field)) return false;
      if (filters.langs.size && !filters.langs.has(r.language)) return false;
      if (filters.scholarship && r.scholarship !== "有") return false;
      if (filters.noCs && r.cs === "要") return false;
      if (filters.hidePast && r.deadline && r.deadline.getTime() < taipeiToday()) return false;
      if (r.tuitionNum != null && r.tuitionNum > filters.tuitionMax) return false;
      return true;
    });
  }

  function chip(box, label, pressed, onClick) {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "chip";
    b.textContent = label;
    b.setAttribute("aria-pressed", pressed ? "true" : "false");
    b.addEventListener("click", onClick);
    box.appendChild(b);
    return b;
  }
  function renderChips() {
    if (STEP < 3) return;
    countryBox.innerHTML = "";
    langBox.innerHTML = "";
    const countries = [...new Set(rows.map((r) => r.country))];
    const langs = [...new Set(rows.map((r) => r.language))];
    chip(countryBox, "全部國家", filters.countries.size === 0, () => { filters.countries.clear(); render(); });
    countries.forEach((c) => chip(countryBox, flag(c) + " " + c, filters.countries.has(c), () => {
      filters.countries.has(c) ? filters.countries.delete(c) : filters.countries.add(c);
      render();
    }));
    chip(langBox, "全部語言", filters.langs.size === 0, () => { filters.langs.clear(); render(); });
    langs.forEach((c) => chip(langBox, c, filters.langs.has(c), () => {
      filters.langs.has(c) ? filters.langs.delete(c) : filters.langs.add(c);
      render();
    }));
    document.querySelectorAll("[data-field]").forEach((b) => {
      b.setAttribute("aria-pressed", filters.fields.has(b.dataset.field) ? "true" : "false");
    });
    $("#f-scholarship").setAttribute("aria-pressed", filters.scholarship ? "true" : "false");
    $("#f-nocs").setAttribute("aria-pressed", filters.noCs ? "true" : "false");
    $("#f-deadline").setAttribute("aria-pressed", filters.hidePast ? "true" : "false");
    const slider = $("#tuition");
    slider.value = String(filters.tuitionMax);
    $("#tuition-label").textContent = filters.tuitionMax >= 2000000 ? "不限" : "不高於 " + filters.tuitionMax.toLocaleString("zh-Hant");
  }

  function renderList() {
    const items = visible();
    countEl.innerHTML = items.length + " <small>/ " + rows.length + " 個學程</small>";
    list.innerHTML = "";
    if (!rows.length) {
      list.innerHTML = '<p class="placeholder">還沒有資料。貼上試算表網址、貼上 CSV，或按「載入範例資料」。</p>';
      return;
    }
    if (!items.length) {
      list.innerHTML = '<p class="placeholder">沒有符合的學程。試著關掉一些條件。<br><button type="button" class="ghost" id="clear-filters">清除篩選</button></p>';
      const c = $("#clear-filters");
      if (c) c.onclick = resetFilters;
      return;
    }
    if (STEP < 4) {
      const ul = document.createElement("ul");
      ul.className = "plain-list";
      items.forEach((r) => {
        const li = document.createElement("li");
        li.textContent = flag(r.country) + " " + r.school + " · " + r.program + " · " + r.country + " · " + r.field;
        ul.appendChild(li);
      });
      list.appendChild(ul);
      return;
    }
    const grid = document.createElement("div");
    grid.className = "cards";
    items.forEach((r) => grid.appendChild(card(r)));
    list.appendChild(grid);
  }
  function card(r) {
    const el = document.createElement("article");
    el.className = "card";
    const cd = countdown(r);
    const tuition = r.tuitionText ? r.tuitionText : "學費未填";
    el.innerHTML =
      '<header><div><p class="school">' + flag(r.country) + " " + esc(r.school) + "</p><h3>" + esc(r.program) + "</h3></div>" +
      '<span class="badge ' + (r.verified ? "ok" : "no") + '">' + (r.verified ? "已查證" : "尚未查證") + "</span></header>" +
      '<div class="tags">' +
      [r.country, r.field, r.language, r.scholarship === "有" ? "有獎學金" : r.scholarship === "無" ? "未寫獎學金" : "獎學金未填", r.cs === "要" ? "要資工背景" : r.cs === "不要" ? "不限資工" : "資工條件未填"]
        .map((t) => '<span class="tag">' + esc(t) + "</span>").join("") +
      "</div>" +
      '<p class="deadline ' + cd.cls + '">截止 ' + esc(cd.text) + (r.deadlineText ? "（" + esc(r.deadlineText) + "）" : "") + " · " + esc(tuition) + "</p>" +
      '<div class="actions"></div>';
    const actions = el.querySelector(".actions");
    if (r.url) {
      const a = document.createElement("a");
      a.className = "btn";
      a.href = r.url;
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      a.textContent = "官網";
      actions.appendChild(a);
    } else {
      const s = document.createElement("span");
      s.className = "tag";
      s.textContent = "官網未填";
      actions.appendChild(s);
    }
    if (STEP >= 5) {
      const b = document.createElement("button");
      b.type = "button";
      b.textContent = compareIds.includes(r.id) ? "已加入比較" : "加入比較";
      b.setAttribute("aria-pressed", compareIds.includes(r.id) ? "true" : "false");
      b.onclick = () => toggleCompare(r.id);
      actions.appendChild(b);
    }
    if (STEP >= 6) {
      const star = document.createElement("button");
      star.type = "button";
      star.textContent = targetId === r.id ? "⭐ 目前目標" : "⭐ 設為我的目標";
      star.setAttribute("aria-pressed", targetId === r.id ? "true" : "false");
      star.onclick = () => setTarget(r.id);
      actions.appendChild(star);
      const pin = document.createElement("button");
      pin.type = "button";
      pin.textContent = shortlist.has(r.id) ? "已在短名單" : "加入短名單";
      pin.setAttribute("aria-pressed", shortlist.has(r.id) ? "true" : "false");
      pin.onclick = () => {
        shortlist.has(r.id) ? shortlist.delete(r.id) : shortlist.add(r.id);
        save();
        render();
      };
      actions.appendChild(pin);
    }
    return el;
  }
  function esc(s) {
    return String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  }
  function toggleCompare(id) {
    if (compareIds.includes(id)) compareIds = compareIds.filter((x) => x !== id);
    else if (compareIds.length >= 3) {
      say("最多比較 3 個。先拿掉一個，再加入新的。", "error");
      return;
    } else compareIds.push(id);
    clearStatus();
    save();
    render();
  }
  function setTarget(id) {
    targetId = id;
    if (!shortlist.has(id)) shortlist.add(id);
    save();
    render();
    openTarget(true);
  }
  function renderCompareBar() {
    if (STEP < 5) return;
    compareBar.hidden = !compareView.hidden || compareIds.length === 0;
    $("#compare-count").textContent = compareIds.length + " / 3";
  }
  function openCompare() {
    const picked = compareIds.map((id) => rows.find((r) => r.id === id)).filter(Boolean);
    compareView.hidden = false;
    app.hidden = true;
    compareBar.hidden = true;
    const grid = $("#compare-grid");
    grid.innerHTML = "";
    grid.style.gridTemplateColumns = "";
    picked.forEach((r) => {
      const col = document.createElement("div");
      col.className = "compare-col";
      const cd = countdown(r);
      const lines = [
        ["國家", flag(r.country) + " " + r.country],
        ["領域", r.field],
        ["語言", r.language],
        ["獎學金", r.scholarship],
        ["資工背景", r.cs],
        ["學費", r.tuitionText || "未填"],
        ["截止", cd.text],
        ["查證", r.verified ? "已查證" : "尚未查證"]
      ];
      col.innerHTML = "<h3>" + esc(r.school) + "</h3><p>" + esc(r.program) + "</p><div class='kv'>" +
        lines.map((kv) => "<b>" + kv[0] + "</b><span>" + esc(kv[1]) + "</span>").join("") +
        "</div>";
      grid.appendChild(col);
    });
    compareView.scrollIntoView({ behavior: "smooth", block: "start" });
  }
  function openTarget(scroll) {
    if (STEP < 6) return;
    const r = rows.find((x) => x.id === targetId);
    targetView.hidden = !r;
    if (!r) return;
    const cd = countdown(r);
    $("#target-body").innerHTML =
      '<p class="kicker">我的目標</p>' +
      '<p class="school">' + flag(r.country) + " " + esc(r.school) + " · " + esc(r.country) + "</p>" +
      "<h2>" + esc(r.program) + "</h2>" +
      '<div class="tags">' + [r.field, r.language, r.scholarship === "有" ? "有獎學金" : "獎學金未寫明", r.verified ? "已查證" : "尚未查證"]
        .map((t) => '<span class="tag">' + esc(t) + "</span>").join("") + "</div>" +
      '<p class="deadline ' + cd.cls + '">截止 ' + esc(cd.text) + " · 學費 " + esc(r.tuitionText || "未填") + "</p>" +
      (r.url ? '<p><a href="' + esc(r.url) + '" target="_blank" rel="noopener">官網</a></p>' : "") +
      '<p class="help">政大 · 2026/11/24 · 海內外 AI 研究所與獎學金探索工作坊</p>';
    $("#target-note").value = targetNote;
    if (scroll) targetView.scrollIntoView({ behavior: "smooth", block: "start" });
  }
  function render() {
    renderChips();
    renderList();
    renderCompareBar();
    if (!targetView.hidden) openTarget(false);
  }
  function resetFilters() {
    filters.countries.clear();
    filters.fields.clear();
    filters.langs.clear();
    filters.scholarship = false;
    filters.noCs = false;
    filters.hidePast = false;
    filters.tuitionMax = 2000000;
    render();
  }
  function useText(text, isSample) {
    rows = toRecords(text);
    sampleMode = isSample;
    compareIds = compareIds.filter((id) => rows.some((r) => r.id === id));
    if (targetId && !rows.some((r) => r.id === targetId)) targetId = "";
    shortlist = new Set([...shortlist].filter((id) => rows.some((r) => r.id === id)));
    saveRaw(text);
    if (isSample) {
      say("現在是<strong>範例</strong>資料。學校是假名，學費和截止日故意留白。請改貼你們組查過的表，不要把範例寫進比較表。");
    } else clearStatus();
    $("#zone-results").hidden = false;
    render();
    const results = $("#zone-results");
    if (results && !app.hidden) results.scrollIntoView({ block: "start" });
  }
  function saveRaw(text) {
    const prev = loadState();
    prev.csv = text;
    prev.sample = sampleMode;
    localStorage.setItem(LS, JSON.stringify(prev));
  }
  function loadState() {
    try { return JSON.parse(localStorage.getItem(LS) || "{}"); }
    catch (e) { return {}; }
  }
  function save() {
    const prev = loadState();
    prev.filters = {
      countries: [...filters.countries],
      fields: [...filters.fields],
      langs: [...filters.langs],
      scholarship: filters.scholarship,
      noCs: filters.noCs,
      hidePast: filters.hidePast,
      tuitionMax: filters.tuitionMax
    };
    prev.compareIds = compareIds;
    prev.shortlist = [...shortlist];
    prev.targetId = targetId;
    prev.targetNote = targetNote;
    localStorage.setItem(LS, JSON.stringify(prev));
  }
  function restore() {
    const s = loadState();
    if (s.filters) {
      filters.countries = new Set(s.filters.countries || []);
      filters.fields = new Set(s.filters.fields || []);
      filters.langs = new Set(s.filters.langs || []);
      filters.scholarship = !!s.filters.scholarship;
      filters.noCs = !!s.filters.noCs;
      filters.hidePast = !!s.filters.hidePast;
      filters.tuitionMax = s.filters.tuitionMax || 2000000;
    }
    compareIds = s.compareIds || [];
    shortlist = new Set(s.shortlist || []);
    targetId = s.targetId || "";
    targetNote = s.targetNote || "";
    if (s.csv && STEP >= 2) {
      try { useText(s.csv, !!s.sample); } catch (e) { /* ignore broken cache */ }
      $("#resume").hidden = false;
    }
  }
  function showApp() {
    gate.hidden = true;
    app.hidden = false;
    if (STEP >= 2) $("#url").focus();
  }
  function exportShortlist() {
    const ids = shortlist.size ? [...shortlist] : (targetId ? [targetId] : []);
    const picked = ids.map((id) => rows.find((r) => r.id === id)).filter(Boolean);
    if (!picked.length) {
      say("短名單還是空的。先在卡片上按「加入短名單」，或設一顆星星。", "error");
      return;
    }
    const header = ["學校", "學程", "國家", "領域", "語言", "獎學金", "需要資工背景", "學費", "截止日期", "官網", "已查證", "是我的目標"];
    const lines = [header.join(",")].concat(picked.map((r) => [
      r.school, r.program, r.country, r.field, r.language, r.scholarship, r.cs,
      r.tuitionText, r.deadlineText, r.url, r.verified ? "是" : "否", r.id === targetId ? "是" : ""
    ].map(csvCell).join(",")));
    const blob = new Blob(["\uFEFF" + lines.join("\n")], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "我的短名單.csv";
    a.click();
    URL.revokeObjectURL(a.href);
  }
  function copyTarget() {
    const r = rows.find((x) => x.id === targetId);
    if (!r) return;
    const cd = countdown(r);
    const text = [
      "我的目標",
      r.school + " · " + r.program,
      r.country + " / " + r.field + " / " + r.language,
      "截止 " + cd.text,
      "學費 " + (r.tuitionText || "未填"),
      r.url || "",
      targetNote ? "為什麼是它：" + targetNote : "",
      "政大 · 2026/11/24 · 海內外 AI 研究所與獎學金探索工作坊"
    ].filter(Boolean).join("\n");
    navigator.clipboard.writeText(text).then(() => say("已複製目標卡文字，可以貼到群組。")).catch(() => say("複製失敗，請直接選取卡片上的文字。", "error"));
  }

  document.querySelectorAll("[data-field]").forEach((b) => {
    b.addEventListener("click", () => {
      const f = b.dataset.field;
      filters.fields.has(f) ? filters.fields.delete(f) : filters.fields.add(f);
      render();
    });
  });
  $("#f-scholarship").onclick = () => { filters.scholarship = !filters.scholarship; render(); };
  $("#f-nocs").onclick = () => { filters.noCs = !filters.noCs; render(); };
  $("#f-deadline").onclick = () => { filters.hidePast = !filters.hidePast; render(); };
  $("#tuition").oninput = (e) => { filters.tuitionMax = Number(e.target.value); save(); render(); };
  $("#start").onclick = showApp;
  $("#resume-btn").onclick = showApp;
  $("#load-url").onclick = async () => {
    if (STEP < 2) { say("這一步只先把位置留好。下一步才會真的讀資料。"); return; }
    const url = $("#url").value.trim();
    if (!url) { say("請先貼上已發佈的 CSV 網址。", "error"); return; }
    $("#load-url").disabled = true;
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error("網址回應 " + res.status + "。請確認試算表已發佈成 CSV。");
      const text = await res.text();
      if (!text || /<html/i.test(text)) throw new Error("這不是 CSV。發佈時請選「逗號分隔值」。");
      useText(text, false);
    } catch (e) {
      say("讀不到這個網址（瀏覽器常會擋住跨網域）。請改走「檔案 → 下載 → 逗號分隔值」，再把內容貼到下面。 " + esc(e.message), "error");
    } finally {
      $("#load-url").disabled = false;
    }
  };
  $("#load-paste").onclick = () => {
    if (STEP < 2) { say("這一步只先把位置留好。下一步才會真的讀資料。"); return; }
    const text = $("#paste").value.trim();
    if (!text) { say("請先貼上 CSV 內容。", "error"); return; }
    try { useText(text, false); }
    catch (err) { say(esc(err.message), "error"); }
  };
  $("#load-sample").onclick = () => {
    if (STEP < 2) { say("範例按鈕在這裡。下一步按下去才會載入，而且學費、截止日會是空的。"); return; }
    try { useText(sampleCsv(), true); }
    catch (err) { say(esc(err.message), "error"); }
  };
  $("#open-compare").onclick = openCompare;
  $("#close-compare").onclick = () => { compareView.hidden = true; app.hidden = false; render(); };
  $("#clear-compare").onclick = () => { compareIds = []; save(); render(); compareView.hidden = true; app.hidden = false; };
  $("#export").onclick = exportShortlist;
  $("#copy-target").onclick = copyTarget;
  $("#shot-target").onclick = () => { document.body.classList.add("shot-mode"); };
  $("#close-shot").onclick = () => { document.body.classList.remove("shot-mode"); };
  $("#target-note").oninput = (e) => { targetNote = e.target.value; save(); };
  $("#back-list").onclick = () => { targetView.hidden = true; app.hidden = false; };

  const params = new URLSearchParams(location.search);
  const demo = params.get("demo");
    if (demo && STEP >= 2) {
    useText(sampleCsv(), true);
    showApp();
    const results = $("#zone-results");
    if (results && demo === "results") results.scrollIntoView({ block: "start" });
    if (demo === "compare" && STEP >= 5) {
      compareIds = rows.slice(0, 3).map((r) => r.id);
      openCompare();
    }
    if (demo === "target" && STEP >= 6) {
      setTarget(rows[0].id);
      document.body.classList.add("shot-mode");
    }
  } else {
    restore();
  }
  render();
})();
