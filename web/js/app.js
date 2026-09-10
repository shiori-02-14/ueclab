const GROUP_TONE = { "Ⅰ類（情報系）": "g-Ⅰ", "Ⅱ類（融合系）": "g-Ⅱ", "Ⅲ類（理工系）": "g-Ⅲ" };
const GROUP_ORDER = ["Ⅰ類（情報系）", "Ⅱ類（融合系）", "Ⅲ類（理工系）"];
const PROGRAM_ORDER = [
  "メディア情報学プログラム",
  "経営・社会情報学プログラム",
  "情報数理工学プログラム",
  "コンピュータサイエンスプログラム",
  "デザイン思考・データサイエンスプログラム",
  "セキュリティ情報学プログラム",
  "情報通信工学プログラム",
  "電子情報学プログラム",
  "計測・制御システムプログラム",
  "先端ロボティクスプログラム",
  "機械システムプログラム",
  "電子工学プログラム",
  "光工学プログラム",
  "物理工学プログラム",
  "化学生命工学プログラム",
];
const MAJOR_ORDER = [
  "情報学専攻",
  "情報・ネットワーク工学専攻",
  "機械知能システム学専攻",
  "基盤理工学専攻",
  "共同サステイナビリティ研究専攻",
];
const FIELD_ORDER = [
  "物理学",
  "化学",
  "生物学・生命科学",
  "地学・環境科学",
  "地学・環境化学",
  "数学",
  "情報科学",
  "機械工学",
  "電気・電子工学",
  "通信工学",
  "情報工学",
  "応用物理学",
  "応用化学",
  "生物・生命工学",
  "資源工学",
  "材料工学",
  "経営・管理工学",
  "航空・宇宙工学",
  "映像・光工学",
  "医用・生体工学",
];

const STORE_KEY = "uec-lab:v1";
const STAR =
  '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3.6 14.5 9l6 .9-4.3 4.2 1 5.9L12 17.2 6.8 20l1-5.9L3.5 9.9l6-.9z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg>';
const THEMES = [
  "人工知能",
  "機械学習",
  "ロボット",
  "データサイエンス",
  "セキュリティ",
  "IoT",
  "バーチャルリアリティ",
  "画像認識",
  "レーザー",
  "ナノテクノロジー",
  "脳",
  "シミュレーション",
];

const SYN_GROUPS = [
  ["AI", "人工知能", "機械学習", "深層学習", "ディープラーニング", "ニューラル", "生成AI", "ChatGPT", "LLM"],
  ["ロボット", "robot", "ロボティクス", "robotics", "ヒューマノイド", "ソフトロボット"],
  ["VR", "バーチャルリアリティ", "仮想現実", "AR", "MR", "XR", "メタバース"],
  ["セキュリティ", "security", "情報セキュリティ", "暗号", "サイバー"],
  ["IoT", "センサネットワーク", "センサー"],
  ["データサイエンス", "ビッグデータ", "データマイニング", "データ分析"],
  ["画像認識", "画像処理", "コンピュータビジョン", "映像"],
  ["音声認識", "音声処理", "音声"],
  ["自然言語処理", "NLP", "言語処理", "翻訳"],
  ["脳", "脳科学", "神経", "認知科学", "認知"],
  ["無線通信", "5G", "電波", "ワイヤレス"],
  ["量子", "量子コンピュータ", "量子情報", "量子力学"],
  ["レーザー", "光学", "フォトニクス", "光工学"],
  ["ナノテクノロジー", "ナノテク", "ナノ材料"],
  [
    "ダイエット",
    "体重",
    "食生活",
    "身体活動",
    "エネルギーバランス",
    "栄養",
    "肥満",
    "カロリー",
    "フィットネス",
    "食事",
    "生活習慣",
    "体重コントロール",
    "基礎代謝",
  ],
  ["医療", "医用", "生体計測", "医用工学"],
  ["宇宙", "航空", "衛星", "ロケット"],
  ["教育", "学習支援", "eラーニング"],
  ["プログラミング", "ソフトウェア", "コード"],
  ["HCI", "インタフェース", "インタラクション", "UX"],
  ["ゲーム", "エンタメ"],
  ["超伝導", "超電導"],
  ["シミュレーション", "数値計算", "HPC", "並列計算"],
];

function normSearch(text) {
  return String(text || "")
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[\u3041-\u3096]/g, (ch) => String.fromCharCode(ch.charCodeAt(0) + 0x60))
    .replace(/[ 　・、。,./／]/g, "");
}

function hasTerm(blob, term) {
  if (!term) return false;
  if (term.length >= 4 || /[^a-z0-9]/.test(term)) return blob.includes(term);
  const safe = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`(^|[^a-z0-9])${safe}([^a-z0-9]|$)`).test(blob);
}

const SYN_LOOKUP = (() => {
  const map = new Map();
  for (const group of SYN_GROUPS) {
    const terms = [...new Set(group.map(normSearch).filter((t) => t.length >= 2))];
    for (const term of terms) {
      const cur = map.get(term) || [];
      cur.push(terms);
      map.set(term, cur);
    }
  }
  return map;
})();

function tokenMatches(blob, token) {
  const t = normSearch(token);
  if (!t) return true;
  if (hasTerm(blob, t)) return true;
  const groups = SYN_LOOKUP.get(t);
  if (!groups) return false;
  return groups.some((aliases) => aliases.some((alias) => hasTerm(blob, alias)));
}

const state = {
  labs: [],
  saved: new Map(),
  q: "",
  groups: new Set(),
  programs: new Set(),
  majors: new Set(),
  fields: new Set(),
  buildings: new Set(),
  hometowns: new Set(),
  hasHp: false,
  hasVideo: false,
  onlySaved: false,
  view: "list",
  sort: "guide",
  sortDir: 1,
  selectedId: null,
};

let lastFocus = null;

const $ = (id) => document.getElementById(id);
const byId = (id) => state.labs.find((l) => l.id === Number(id));

function loadStore() {
  try {
    const data = JSON.parse(localStorage.getItem(STORE_KEY) || "null");
    const items = data && data.items ? data.items : {};
    for (const [id, row] of Object.entries(items)) {
      const n = Number(id);
      if (!n || !row) continue;
      const on = !!row.on;
      const memo = String(row.memo || "");
      if (on || memo) state.saved.set(n, { on, memo });
    }
    if (data && (data.view === "list" || data.view === "cards" || data.view === "building" || data.view === "hometown")) {
      state.view = data.view;
    }
    if (data && ["guide", "name", "room", "updated", "saved", "hometown"].includes(data.sort)) {
      state.sort = data.sort;
    }
    if (data && (data.sortDir === 1 || data.sortDir === -1)) {
      state.sortDir = data.sortDir;
    }
    if (data && Array.isArray(data.groups)) {
      state.groups = new Set(data.groups.filter((g) => GROUP_ORDER.includes(g)));
    }
  } catch (err) {
    console.warn(err);
  }
}

function persist() {
  const items = {};
  for (const [id, row] of state.saved) {
    if (!row.on && !row.memo) continue;
    items[id] = { on: !!row.on, memo: row.memo || "" };
  }
  try {
    localStorage.setItem(
      STORE_KEY,
      JSON.stringify({
        v: 1,
        items,
        view: state.view,
        sort: state.sort,
        sortDir: state.sortDir,
        groups: [...state.groups],
      })
    );
  } catch (err) {
    console.warn(err);
  }
}

function entry(id) {
  const n = Number(id);
  if (!state.saved.has(n)) state.saved.set(n, { on: false, memo: "" });
  return state.saved.get(n);
}

function isSaved(id) {
  return !!(state.saved.get(Number(id)) || {}).on;
}

function savedCount() {
  let n = 0;
  for (const row of state.saved.values()) if (row.on) n += 1;
  return n;
}

function toggleSaved(id) {
  const e = entry(id);
  e.on = !e.on;
  persist();
}

function orderIndex(order, name) {
  const i = order.indexOf(name);
  return i === -1 ? 1000 : i;
}

function buildingRank(name) {
  const m = String(name).match(/^([東西])(\d+)号館$/);
  if (!m) return [2, 999, name];
  return [m[1] === "西" ? 0 : 1, Number(m[2]), name];
}

const HOMETOWN_NONE = "出身地の掲載なし";
const REGION_ORDER = [
  "北海道・東北地方",
  "関東地方",
  "中部地方",
  "近畿地方",
  "中国地方",
  "四国地方",
  "九州・沖縄地方",
  "日本国外・その他",
];
const REGION_CODE = {
  "北海道・東北地方": 51,
  関東地方: 52,
  中部地方: 53,
  近畿地方: 54,
  中国地方: 55,
  四国地方: 56,
  "九州・沖縄地方": 57,
  "日本国外・その他": 58,
};
const PREF_TO_REGION = {
  1: 0,
  2: 0,
  3: 0,
  4: 0,
  5: 0,
  6: 0,
  7: 0,
  8: 1,
  9: 1,
  10: 1,
  11: 1,
  12: 1,
  13: 1,
  14: 1,
  15: 2,
  16: 2,
  17: 2,
  18: 2,
  19: 2,
  20: 2,
  21: 2,
  22: 2,
  23: 2,
  24: 3,
  25: 3,
  26: 3,
  27: 3,
  28: 3,
  29: 3,
  30: 3,
  31: 4,
  32: 4,
  33: 4,
  34: 4,
  35: 4,
  36: 5,
  37: 5,
  38: 5,
  39: 5,
  40: 6,
  41: 6,
  42: 6,
  43: 6,
  44: 6,
  45: 6,
  46: 6,
  47: 6,
};

function hometownPlaces(lab) {
  const places = lab && lab.birthplaces ? lab.birthplaces : [];
  const prefs = places.filter((p) => p && p.code > 0 && p.code <= 47 && p.name);
  return prefs.length ? prefs : places.filter((p) => p && p.name);
}

function regionNameForPlace(place) {
  if (!place || !place.name) return "";
  if (place.code >= 51 && place.code <= 58) return place.name;
  const idx = PREF_TO_REGION[place.code];
  return idx == null ? "" : REGION_ORDER[idx];
}

function hometownRegions(lab) {
  const names = new Set();
  for (const place of lab && lab.birthplaces ? lab.birthplaces : []) {
    const name = regionNameForPlace(place);
    if (name) names.add(name);
  }
  return [...names];
}

function hometownLabel(lab) {
  return hometownPlaces(lab)
    .map((p) => p.name)
    .join("・");
}

function hometownBlob(lab) {
  return [hometownLabel(lab), ...hometownRegions(lab)].filter(Boolean).join(" ");
}

function hometownRank(lab) {
  const regions = hometownRegions(lab);
  if (!regions.length) return [999, 999, ""];
  const region = Math.min(...regions.map((name) => REGION_CODE[name] || 500));
  const prefs = hometownPlaces(lab).filter((p) => p.code > 0 && p.code <= 47);
  if (!prefs.length) return [region, 99, hometownLabel(lab)];
  const best = [...prefs].sort(
    (a, b) => a.code - b.code || String(a.name).localeCompare(String(b.name), "ja")
  )[0];
  return [region, best.code, best.name || ""];
}

function hometownGroupKeys(lab) {
  let regions = hometownRegions(lab);
  if (state.hometowns.size) {
    regions = regions.filter((name) => state.hometowns.has(name));
  }
  return regions.length ? regions : [HOMETOWN_NONE];
}

function hometownCodeForName(name) {
  if (name === HOMETOWN_NONE) return 999;
  return REGION_CODE[name] || 500;
}

function countsFor(list, keyFn, order) {
  const map = new Map();
  for (const lab of list) {
    const keys = keyFn(lab);
    for (const key of Array.isArray(keys) ? keys : [keys]) {
      if (!key) continue;
      map.set(key, (map.get(key) || 0) + 1);
    }
  }
  const rows = [...map.entries()];
  if (order === "building") {
    return rows.sort((a, b) => {
      const aa = buildingRank(a[0]);
      const bb = buildingRank(b[0]);
      return aa[0] - bb[0] || aa[1] - bb[1] || aa[2].localeCompare(bb[2], "ja");
    });
  }
  if (Array.isArray(order)) {
    return rows.sort(
      (a, b) => orderIndex(order, a[0]) - orderIndex(order, b[0]) || a[0].localeCompare(b[0], "ja")
    );
  }
  return rows.sort((a, b) => a[0].localeCompare(b[0], "ja"));
}

function matches(lab) {
  if (state.onlySaved && !isSaved(lab.id)) return false;
  if (state.groups.size && !state.groups.has(lab.group)) return false;
  if (state.programs.size && !state.programs.has(lab.program)) return false;
  if (state.majors.size && !lab.majors.some((m) => state.majors.has(m))) return false;
  if (state.fields.size && !lab.fields.some((f) => state.fields.has(f))) return false;
  if (state.buildings.size && !lab.buildings.some((b) => state.buildings.has(b))) return false;
  if (state.hometowns.size) {
    const regions = hometownRegions(lab);
    if (!regions.some((r) => state.hometowns.has(r))) return false;
  }
  if (state.hasHp && !lab.urls.length) return false;
  if (state.hasVideo && !lab.videos.length) return false;
  const q = state.q.trim();
  if (!q) return true;
  const note = (state.saved.get(lab.id) || {}).memo || "";
  const blob = normSearch(
    [
      lab.name,
      lab.faculty,
      lab.program,
      lab.group,
      lab.title,
      lab.guidebook,
      lab.room,
      hometownBlob(lab),
      note,
      ...(lab.emails || []),
      ...(lab.keywords || []),
      ...(lab.fields || []),
      ...(lab.majors || []),
    ].join("\n")
  );
  return q.split(/\s+/).every((token) => tokenMatches(blob, token));
}

function filtered() {
  const rows = state.labs.filter(matches);
  const sorters = {
    guide: (a, b) => a.id - b.id,
    name: (a, b) => a.name.localeCompare(b.name, "ja") || a.id - b.id,
    updated: (a, b) => (b.updatedAt || "").localeCompare(a.updatedAt || "") || a.id - b.id,
    room: (a, b) => {
      const aa = buildingRank(a.buildings[0] || a.room || "");
      const bb = buildingRank(b.buildings[0] || b.room || "");
      return aa[0] - bb[0] || aa[1] - bb[1] || (a.room || "").localeCompare(b.room || "", "ja") || a.id - b.id;
    },
    saved: (a, b) => Number(isSaved(b.id)) - Number(isSaved(a.id)) || a.id - b.id,
    hometown: (a, b) => {
      const aa = hometownRank(a);
      const bb = hometownRank(b);
      return aa[0] - bb[0] || aa[1] - bb[1] || aa[2].localeCompare(bb[2], "ja") || a.id - b.id;
    },
  };
  const cmp = sorters[state.sort] || sorters.guide;
  const dir = state.sortDir < 0 ? -1 : 1;
  return rows.sort((a, b) => {
    if (state.sort === "hometown" || state.view === "hometown") {
      const ae = !hometownRegions(a).length;
      const be = !hometownRegions(b).length;
      if (ae !== be) return ae ? 1 : -1;
    }
    return cmp(a, b) * dir;
  });
}

function activeFilterCount() {
  return (
    state.groups.size +
    state.programs.size +
    state.majors.size +
    state.fields.size +
    state.buildings.size +
    state.hometowns.size +
    (state.hasHp ? 1 : 0) +
    (state.hasVideo ? 1 : 0) +
    (state.onlySaved ? 1 : 0) +
    (state.q.trim() ? 1 : 0)
  );
}

function clearFilters() {
  state.groups.clear();
  state.programs.clear();
  state.majors.clear();
  state.fields.clear();
  state.buildings.clear();
  state.hometowns.clear();
  state.hasHp = false;
  state.hasVideo = false;
  state.onlySaved = false;
  state.q = "";
  $("q").value = "";
  syncSearchClear();
  closeFilters();
  renderFilters();
  paint();
}

function syncSearchClear() {
  $("q-clear").hidden = !state.q.trim();
}

function syncFilterChrome() {
  const clear = document.querySelector("#filters > button.ghost");
  if (clear) clear.disabled = !activeFilterCount();
}

function isCompact() {
  return window.matchMedia("(max-width: 720px)").matches;
}

function scrollResultsTop() {
  $("main").scrollTop = 0;
  if (window.matchMedia("(max-width: 1100px)").matches) {
    window.scrollTo(0, 0);
  }
}

function syncSearchChrome() {
  const input = $("q");
  if (!input) return;
  input.placeholder = isCompact()
    ? "号館、先生の名前、キーワード"
    : "例　西10号館、AI、先生の名前";
}

function syncTopOffset() {
  const top = document.querySelector(".top");
  if (top) document.documentElement.style.setProperty("--top-h", `${top.offsetHeight}px`);
  const nav = document.querySelector(".site-nav");
  const search = document.querySelector(".top .search");
  const toolbar = $("toolbar");
  let sticky = 0;
  if (nav) sticky += nav.offsetHeight;
  if (search) sticky += search.offsetHeight;
  if (isCompact() && toolbar) sticky += toolbar.offsetHeight;
  document.documentElement.style.setProperty("--compact-sticky", `${sticky}px`);
}

function closeFilters() {
  document.body.classList.remove("filters-open");
  $("filter-scrim").hidden = true;
}

function openFilters() {
  document.body.classList.add("filters-open");
  $("filter-scrim").hidden = false;
  $("q").blur();
  $("filters").scrollTop = 0;
}

function setSearch(value, { scroll } = { scroll: true }) {
  state.q = value;
  $("q").value = value;
  syncSearchClear();
  paint();
  if (scroll) scrollResultsTop();
}

function renderStats() {
  const n = savedCount();
  const box = $("top-stats");
  box.replaceChildren();
  const total = document.createElement("div");
  total.className = "stat";
  total.innerHTML = `<b>${state.labs.length}</b>研究室`;
  box.appendChild(total);
  if (n || state.onlySaved) {
    const fav = document.createElement("button");
    fav.type = "button";
    fav.className = "stat btn" + (state.onlySaved ? " on" : "");
    fav.innerHTML = `<b>${n}</b>気になる`;
    fav.title = "気になる研究室だけ見る";
    fav.addEventListener("click", () => {
      state.onlySaved = !state.onlySaved;
      paint();
    });
    box.appendChild(fav);
  }
}

function filterBlock(title, items, selected, onToggle, startOpen = false, display) {
  const wrap = document.createElement("details");
  wrap.className = "filter-block";
  if (startOpen || selected.size) wrap.open = true;
  const h = document.createElement("summary");
  h.append(document.createTextNode(title));
  if (selected.size) {
    const n = document.createElement("span");
    n.className = "n-sel";
    n.textContent = `${selected.size}`;
    h.appendChild(n);
  }
  wrap.appendChild(h);
  const list = document.createElement("div");
  list.className = "filter-list";
  for (const [label, n] of items) {
    const lab = document.createElement("label");
    const input = document.createElement("input");
    input.type = "checkbox";
    input.checked = selected.has(label);
    input.addEventListener("change", () => onToggle(label, input.checked));
    const span = document.createElement("span");
    span.textContent = display ? display(label) : label;
    span.title = label;
    const count = document.createElement("span");
    count.className = "n";
    count.textContent = n;
    lab.append(input, span, count);
    list.appendChild(lab);
  }
  wrap.appendChild(list);
  return wrap;
}

function pruneFilters() {
  const inGroup = state.labs.filter((lab) => !state.groups.size || state.groups.has(lab.group));
  if (state.groups.size) {
    const programs = new Set(inGroup.map((lab) => lab.program));
    for (const program of [...state.programs]) {
      if (!programs.has(program)) state.programs.delete(program);
    }
  }
  const inProg = inGroup.filter((lab) => !state.programs.size || state.programs.has(lab.program));
  const majors = new Set(inProg.flatMap((lab) => lab.majors || []));
  const fields = new Set(inProg.flatMap((lab) => lab.fields || []));
  const buildings = new Set(inProg.flatMap((lab) => lab.buildings || []));
  const hometowns = new Set(inProg.flatMap((lab) => hometownRegions(lab)));
  for (const major of [...state.majors]) if (!majors.has(major)) state.majors.delete(major);
  for (const field of [...state.fields]) if (!fields.has(field)) state.fields.delete(field);
  for (const building of [...state.buildings]) if (!buildings.has(building)) state.buildings.delete(building);
  for (const hometown of [...state.hometowns]) if (!hometowns.has(hometown)) state.hometowns.delete(hometown);
}

function renderFilters() {
  pruneFilters();
  const box = $("filters");
  box.replaceChildren();
  const all = state.labs;
  const inGroup = all.filter((lab) => !state.groups.size || state.groups.has(lab.group));
  const inProg = inGroup.filter((lab) => !state.programs.size || state.programs.has(lab.program));

  const head = document.createElement("div");
  head.className = "filters-head";
  const handle = document.createElement("div");
  handle.className = "filters-handle";
  handle.setAttribute("aria-hidden", "true");
  const title = document.createElement("p");
  title.className = "filters-title";
  title.textContent = "絞り込み";
  const done = document.createElement("button");
  done.type = "button";
  done.className = "filters-done";
  done.textContent = "完了";
  done.addEventListener("click", () => {
    closeFilters();
    renderToolbar(filtered().length);
  });
  head.append(handle, title, done);
  box.appendChild(head);

  const intro = document.createElement("p");
  intro.className = "hint";
  intro.textContent = "オープンラボやオープンキャンパスでは、号館から探すと居室が見つけやすいです。まずは自分の類からでも絞れます。";
  box.appendChild(intro);

  const groupBlock = filterBlock(
    "自分の類",
    countsFor(all, (l) => l.group, GROUP_ORDER),
    state.groups,
    (v, on) => {
      on ? state.groups.add(v) : state.groups.delete(v);
      persist();
      renderFilters();
      paint();
    },
    true
  );
  const programBlock = filterBlock(
    "プログラム",
    countsFor(inGroup, (l) => l.program, PROGRAM_ORDER),
    state.programs,
    (v, on) => {
      on ? state.programs.add(v) : state.programs.delete(v);
      renderFilters();
      paint();
    },
    state.programs.size > 0 || (!isCompact() && state.groups.size > 0),
    shortProgram
  );
  const majorBlock = filterBlock(
    "大学院（進学する人）",
    countsFor(inProg, (l) => l.majors, MAJOR_ORDER),
    state.majors,
    (v, on) => {
      on ? state.majors.add(v) : state.majors.delete(v);
      renderFilters();
      paint();
    },
    false,
    shortMajor
  );
  const fieldBlock = filterBlock(
    "興味のある分野",
    countsFor(inProg, (l) => l.fields, FIELD_ORDER),
    state.fields,
    (v, on) => {
      on ? state.fields.add(v) : state.fields.delete(v);
      renderFilters();
      paint();
    }
  );
  const buildingBlock = filterBlock(
    "号館（見学）",
    countsFor(inProg, (l) => l.buildings, "building"),
    state.buildings,
    (v, on) => {
      on ? state.buildings.add(v) : state.buildings.delete(v);
      renderFilters();
      paint();
    }
  );
  const hometownBlock = filterBlock(
    "出身地・ゆかりの地",
    countsFor(inProg, (l) => hometownRegions(l), REGION_ORDER),
    state.hometowns,
    (v, on) => {
      on ? state.hometowns.add(v) : state.hometowns.delete(v);
      renderFilters();
      paint();
    }
  );
  if (isCompact()) {
    box.append(groupBlock, buildingBlock, programBlock, fieldBlock, majorBlock, hometownBlock);
  } else {
    box.append(groupBlock, programBlock, majorBlock, fieldBlock, buildingBlock, hometownBlock);
  }

  const extraWrap = document.createElement("details");
  extraWrap.className = "filter-block";
  extraWrap.open = state.hasHp || state.hasVideo;
  const extra = document.createElement("summary");
  extra.textContent = "HP・動画";
  extraWrap.appendChild(extra);
  const extras = document.createElement("div");
  extras.className = "chip-row";
  extras.append(
    check("HPあり", state.hasHp, (v) => {
      state.hasHp = v;
      renderFilters();
      paint();
    }),
    check("動画あり", state.hasVideo, (v) => {
      state.hasVideo = v;
      renderFilters();
      paint();
    })
  );
  extraWrap.appendChild(extras);
  box.appendChild(extraWrap);

  const clear = document.createElement("button");
  clear.type = "button";
  clear.className = "ghost";
  clear.textContent = "絞り込みをクリア";
  clear.disabled = !activeFilterCount();
  clear.addEventListener("click", clearFilters);
  box.appendChild(clear);
}

function check(label, on, fn) {
  const el = document.createElement("label");
  el.className = "check";
  const input = document.createElement("input");
  input.type = "checkbox";
  input.checked = on;
  input.addEventListener("change", () => fn(input.checked));
  el.append(input, document.createTextNode(label));
  return el;
}

function shortGroup(name) {
  return String(name || "").split("（")[0] || name;
}

function shortProgram(name) {
  return String(name || "").replace(/プログラム$/, "");
}

function shortMajor(name) {
  return String(name || "").replace(/専攻$/, "");
}

function groupLabel(lab) {
  const name = shortGroup(lab && lab.group) || (lab && lab.group) || "";
  return String(name).replace(/[-−]\d+.*$/, "").trim();
}

function renderToolbar(n) {
  const bar = $("toolbar");
  bar.replaceChildren();
  const filterBtn = document.createElement("button");
  filterBtn.type = "button";
  filterBtn.className = "filter-toggle" + (document.body.classList.contains("filters-open") ? " on" : "");
  const extra =
    state.programs.size +
    state.majors.size +
    state.fields.size +
    state.buildings.size +
    state.hometowns.size +
    (state.hasHp ? 1 : 0) +
    (state.hasVideo ? 1 : 0);
  const nFilters = extra + state.groups.size + (state.onlySaved ? 1 : 0);
  filterBtn.textContent = nFilters ? `絞り込み ${nFilters}` : "絞り込み";
  filterBtn.setAttribute("aria-expanded", document.body.classList.contains("filters-open") ? "true" : "false");
  filterBtn.addEventListener("click", () => {
    if (document.body.classList.contains("filters-open")) closeFilters();
    else openFilters();
    renderToolbar(n);
  });
  bar.appendChild(filterBtn);

  const groups = document.createElement("div");
  groups.className = "group-chips";
  for (const g of GROUP_ORDER) {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "chip" + (state.groups.has(g) ? " on" : "");
    b.textContent = shortGroup(g);
    b.title = g;
    b.setAttribute("aria-pressed", state.groups.has(g) ? "true" : "false");
    b.addEventListener("click", () => {
      state.groups.has(g) ? state.groups.delete(g) : state.groups.add(g);
      persist();
      renderFilters();
      paint();
    });
    groups.appendChild(b);
  }
  const fav = document.createElement("button");
  fav.type = "button";
  fav.className = "chip fav" + (state.onlySaved ? " on" : "");
  const nSaved = savedCount();
  fav.textContent = nSaved ? `気になる ${nSaved}` : "気になる";
  fav.setAttribute("aria-pressed", state.onlySaved ? "true" : "false");
  fav.addEventListener("click", () => {
    state.onlySaved = !state.onlySaved;
    paint();
  });
  groups.appendChild(fav);
  bar.appendChild(groups);

  const count = document.createElement("div");
  count.className = "count";
  count.setAttribute("aria-live", "polite");
  count.textContent = isCompact()
    ? `${n}件`
    : n === state.labs.length && !activeFilterCount()
      ? `${n}件`
      : `${state.labs.length}件中 ${n}件`;

  const view = document.createElement("div");
  view.className = "seg";
  view.setAttribute("role", "group");
  view.setAttribute("aria-label", "表示切替");
  const viewItems = [
    ["list", "リスト"],
    ["cards", "カード"],
    ["building", "号館"],
    ["hometown", "出身地"],
  ].filter(([id]) => !isCompact() || id !== "hometown" || state.view === "hometown");
  for (const [id, label] of viewItems) {
    const b = document.createElement("button");
    b.type = "button";
    b.className = state.view === id ? "on" : "";
    b.dataset.view = id;
    b.textContent = label;
    b.setAttribute("aria-pressed", state.view === id ? "true" : "false");
    b.addEventListener("click", () => {
      state.view = id;
      persist();
      paint();
    });
    view.appendChild(b);
  }

  const sortWrap = document.createElement("div");
  sortWrap.className = "sort-field";
  const sortLabel = document.createElement("span");
  sortLabel.className = "sort-label";
  sortLabel.textContent = "並び替え";
  const sort = document.createElement("select");
  sort.className = "sort";
  sort.setAttribute("aria-label", "並び替え");
  for (const [v, t] of [
    ["guide", "掲載順"],
    ["name", "研究室の名前"],
    ["room", "号館・部屋"],
    ["hometown", "出身地"],
    ["updated", "更新が新しい"],
    ["saved", "気になるを上に"],
  ]) {
    const o = document.createElement("option");
    o.value = v;
    o.textContent = t;
    if (state.sort === v) o.selected = true;
    sort.appendChild(o);
  }
  sort.addEventListener("change", () => {
    state.sort = sort.value;
    state.sortDir = 1;
    persist();
    paint();
  });
  const dir = document.createElement("button");
  dir.type = "button";
  dir.className = "sort-dir" + (state.sortDir < 0 ? " on" : "");
  dir.setAttribute("aria-pressed", state.sortDir < 0 ? "true" : "false");
  dir.setAttribute("aria-label", state.sortDir < 0 ? "逆順を解除" : "逆順にする");
  dir.title = state.sortDir < 0 ? "いま逆順です。押すと元に戻します" : "逆順にする";
  dir.textContent = "逆順";
  dir.addEventListener("click", () => {
    state.sortDir = state.sortDir < 0 ? 1 : -1;
    persist();
    paint();
  });
  sortWrap.append(sortLabel, sort, dir);

  const tools = document.createElement("div");
  tools.className = "toolbar-end";
  tools.append(count, view, sortWrap);
  bar.appendChild(tools);
  syncTopOffset();
}

function renderInterest() {
  const box = $("interest");
  if (!box) return;
  if (isCompact()) {
    box.hidden = true;
    box.replaceChildren();
    return;
  }
  box.hidden = false;
  box.replaceChildren();
  const label = document.createElement("span");
  label.className = "label";
  label.textContent = "テーマから探す";
  box.appendChild(label);
  const q = state.q.trim();
  for (const theme of THEMES) {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "chip" + (q === theme ? " on" : "");
    b.textContent = theme;
    b.setAttribute("aria-pressed", q === theme ? "true" : "false");
    b.addEventListener("click", () => {
      if (state.selectedId) closeDetail();
      setSearch(q === theme ? "" : theme);
    });
    box.appendChild(b);
  }
}

function renderViewHint() {
  const el = $("view-hint");
  if (!el) return;
  const compact = isCompact();
  if (state.view === "building" && !compact) {
    el.hidden = false;
    el.textContent =
      "オープンラボやオープンキャンパスで回るときの目安です。部屋は変わっていることがあるので、行く前にHPで確認してください。";
  } else if (state.view === "hometown" || state.sort === "hometown") {
    el.hidden = false;
    el.textContent = compact
      ? "公式ラボガイドの出身地・ゆかりの地を、地方ごとにまとめています。"
      : "公式ラボガイドの出身地・ゆかりの地を、地方ごとにまとめています。都道府県だけの記載も、その地方に含めています。未掲載の研究室は最後です。";
  } else {
    el.hidden = true;
    el.textContent = "";
  }
}

function renderActiveFilters() {
  const box = $("active-filters");
  const items = [];
  for (const g of state.groups) items.push({ key: "groups", value: g, label: shortGroup(g) });
  for (const p of state.programs) items.push({ key: "programs", value: p, label: shortProgram(p) });
  for (const m of state.majors) items.push({ key: "majors", value: m, label: m });
  for (const f of state.fields) items.push({ key: "fields", value: f, label: f });
  for (const b of state.buildings) items.push({ key: "buildings", value: b, label: b });
  for (const h of state.hometowns) items.push({ key: "hometowns", value: h, label: h });
  if (state.hasHp) items.push({ key: "hasHp", label: "HPあり" });
  if (state.hasVideo) items.push({ key: "hasVideo", label: "動画あり" });
  if (state.onlySaved) items.push({ key: "onlySaved", label: "気になる" });
  if (state.q.trim()) items.push({ key: "q", label: `検索「${state.q.trim()}」` });

  const extras = items.filter((x) => x.key !== "groups" && x.key !== "onlySaved");
  if (!extras.length) {
    box.hidden = true;
    box.replaceChildren();
    return;
  }
  box.hidden = false;
  box.replaceChildren();
  for (const item of extras) {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "chip on";
    b.innerHTML = "";
    b.append(document.createTextNode(item.label));
    const x = document.createElement("span");
    x.className = "x";
    x.textContent = "×";
    b.appendChild(x);
    b.title = "この条件を外す";
    b.addEventListener("click", () => {
      if (item.key === "q") setSearch("");
      else if (item.key === "hasHp") state.hasHp = false;
      else if (item.key === "hasVideo") state.hasVideo = false;
      else if (item.key === "onlySaved") state.onlySaved = false;
      else state[item.key].delete(item.value);
      renderFilters();
      paint();
    });
    box.appendChild(b);
  }
  if (extras.length > 1) {
    const all = document.createElement("button");
    all.type = "button";
    all.className = "chip";
    all.textContent = "すべて解除";
    all.addEventListener("click", clearFilters);
    box.appendChild(all);
  }
}

function thumbEl(lab) {
  if (!lab.image) {
    const ph = document.createElement("div");
    ph.className = "thumb-ph";
    ph.setAttribute("aria-hidden", "true");
    ph.textContent = (lab.faculty || lab.name || "?").trim().charAt(0);
    return ph;
  }
  const img = document.createElement("img");
  img.className = "thumb";
  img.alt = "";
  img.loading = "lazy";
  img.decoding = "async";
  img.referrerPolicy = "no-referrer";
  img.src = lab.image;
  img.addEventListener("error", () => {
    const ph = document.createElement("div");
    ph.className = "thumb-ph";
    ph.setAttribute("aria-hidden", "true");
    ph.textContent = (lab.faculty || lab.name || "?").trim().charAt(0);
    img.replaceWith(ph);
  });
  return img;
}

function alsoLabel(lab) {
  if (!lab.alsoIds.length) return "";
  const others = lab.alsoIds.map(byId).filter(Boolean);
  const groups = [...new Set(others.map((o) => shortGroup(o.group)))];
  if (groups.length && !groups.every((g) => g === shortGroup(lab.group))) {
    return groups.map((g) => `${g}でも募集`).join(" · ");
  }
  return "ほかのプログラムでも募集";
}

function cardEl(lab, opts = {}) {
  const saved = isSaved(lab.id);
  const card = document.createElement("article");
  card.className = "card" + (state.selectedId === lab.id ? " active" : "") + (saved ? " saved" : "");
  card.dataset.id = String(lab.id);
  card.addEventListener("click", (ev) => {
    if (ev.target.closest(".save-btn, .tag")) return;
    openLab(lab.id);
  });
  card.addEventListener("keydown", (ev) => {
    if (ev.target.closest(".save-btn")) return;
    if (ev.key === "Enter" || ev.key === " ") {
      ev.preventDefault();
      openLab(lab.id);
    }
  });
  card.tabIndex = 0;
  card.setAttribute("aria-pressed", state.selectedId === lab.id ? "true" : "false");

  const meta = document.createElement("div");
  meta.className = "meta";
  const kicker = document.createElement("div");
  kicker.className = "kicker";
  const g = document.createElement("span");
  g.className = GROUP_TONE[lab.group] || "";
  g.textContent = groupLabel(lab);
  kicker.append(g);
  if (!opts.hideProgram) {
    const p = document.createElement("span");
    p.textContent = shortProgram(lab.program);
    kicker.append(p);
  }
  const also = alsoLabel(lab);
  if (also) {
    const more = document.createElement("span");
    more.textContent = also;
    kicker.append(more);
  }
  const name = document.createElement("h3");
  name.className = "name";
  name.textContent = lab.name;
  const title = document.createElement("p");
  title.className = "title";
  title.textContent = lab.title;
  const tags = document.createElement("div");
  tags.className = "tags";
  for (const kw of (lab.keywords || []).slice(0, 3)) {
    const t = document.createElement("span");
    t.className = "tag";
    t.textContent = kw;
    t.title = `「${kw}」で検索`;
    t.addEventListener("click", (ev) => {
      ev.stopPropagation();
      setSearch(kw);
    });
    tags.appendChild(t);
  }
  const room = document.createElement("div");
  room.className = "room";
  if (lab.room) {
    const loc = document.createElement("span");
    loc.className = "room-id";
    loc.textContent = lab.room;
    room.appendChild(loc);
  }
  const home = hometownLabel(lab);
  if (home) {
    const place = document.createElement("span");
    place.className = "hometown";
    place.textContent = home;
    room.appendChild(place);
  }
  if (lab.urls.length) {
    const b = document.createElement("span");
    b.className = "badge";
    b.textContent = "HP";
    room.appendChild(b);
  }
  if (lab.videos.length) {
    const b = document.createElement("span");
    b.className = "badge";
    b.textContent = "動画";
    room.appendChild(b);
  }
  meta.append(kicker, name, title, tags, room);

  const save = document.createElement("button");
  save.type = "button";
  save.className = "save-btn" + (saved ? " on" : "");
  save.innerHTML = STAR;
  save.setAttribute("aria-label", saved ? "気になるから外す" : "気になるに追加");
  save.setAttribute("aria-pressed", saved ? "true" : "false");
  save.title = saved ? "気になるから外す" : "気になるに追加";
  save.addEventListener("click", (ev) => {
    ev.stopPropagation();
    toggleSaved(lab.id);
    paint();
    if (state.selectedId === lab.id) renderDetail(byId(lab.id));
  });

  card.append(thumbEl(lab), meta, save);
  return card;
}

function renderResults() {
  const rows = filtered();
  renderToolbar(rows.length);
  renderActiveFilters();
  renderViewHint();
  const box = $("results");
  box.className = "results " + (state.view === "cards" ? "cards" : "list");
  box.replaceChildren();
  if (!rows.length) {
    const empty = document.createElement("div");
    empty.className = "empty";
    const p = document.createElement("p");
    p.textContent = state.onlySaved
      ? "気になる研究室はまだありません。一覧の星を押すと保存できます。"
      : isCompact()
        ? "条件に合う研究室がありません。類や号館、検索を変えてみてください。"
        : "条件に合う研究室がありません。テーマや類を変えてみてください。";
    empty.appendChild(p);
    if (activeFilterCount()) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "ghost";
      btn.textContent = "条件をクリア";
      btn.addEventListener("click", clearFilters);
      empty.appendChild(btn);
    }
    box.appendChild(empty);
    return;
  }

  const groupedDefault =
    state.view !== "building" &&
    state.view !== "hometown" &&
    state.sort === "guide" &&
    !state.q &&
    !state.programs.size &&
    !state.onlySaved;
  const groups = new Map();
  if (state.view === "building") {
    for (const lab of rows) {
      const keys = lab.buildings.length ? lab.buildings : ["号館不明"];
      for (const key of keys) {
        if (!groups.has(key)) groups.set(key, []);
        groups.get(key).push(lab);
      }
    }
    const unknown = "号館不明";
    const dir = state.sortDir < 0 ? -1 : 1;
    const ordered = [...groups.keys()].sort((a, b) => {
      if (a === unknown && b !== unknown) return 1;
      if (b === unknown && a !== unknown) return -1;
      const aa = buildingRank(a);
      const bb = buildingRank(b);
      return (aa[0] - bb[0] || aa[1] - bb[1] || aa[2].localeCompare(bb[2], "ja")) * dir;
    });
    const sorted = new Map();
    for (const key of ordered) sorted.set(key, groups.get(key));
    groups.clear();
    for (const [key, labs] of sorted) groups.set(key, labs);
  } else if (state.view === "hometown" || state.sort === "hometown") {
    for (const lab of rows) {
      for (const key of hometownGroupKeys(lab)) {
        if (!groups.has(key)) groups.set(key, []);
        groups.get(key).push(lab);
      }
    }
    const dir = state.sortDir < 0 ? -1 : 1;
    const ordered = [...groups.keys()].sort((a, b) => {
      const ac = hometownCodeForName(a);
      const bc = hometownCodeForName(b);
      if (ac === 999 && bc !== 999) return 1;
      if (bc === 999 && ac !== 999) return -1;
      return (ac - bc || a.localeCompare(b, "ja")) * dir;
    });
    const sorted = new Map();
    for (const key of ordered) sorted.set(key, groups.get(key));
    groups.clear();
    for (const [key, labs] of sorted) groups.set(key, labs);
  } else if (groupedDefault) {
    for (const lab of rows) {
      const key = `${shortGroup(lab.group)} · ${shortProgram(lab.program)}`;
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(lab);
    }
  } else {
    groups.set("", rows);
  }

  for (const [title, labs] of groups) {
    if (title) {
      const h = document.createElement("h2");
      h.className = "group-h";
      h.append(document.createTextNode(title));
      const n = document.createElement("span");
      n.className = "n";
      n.textContent = `${labs.length}`;
      h.appendChild(n);
      box.appendChild(h);
    }
    for (const lab of labs) box.appendChild(cardEl(lab, { hideProgram: groupedDefault }));
  }
}

function markActiveCard(id) {
  for (const el of document.querySelectorAll(".card.active")) {
    el.classList.remove("active");
    el.setAttribute("aria-pressed", "false");
  }
  const card = document.querySelector(`.card[data-id="${id}"]`);
  if (card) {
    card.classList.add("active");
    card.setAttribute("aria-pressed", "true");
  }
  return card;
}

function openLab(id, { fromHash } = {}) {
  const lab = byId(id);
  if (!lab) return;
  closeFilters();
  lastFocus = document.activeElement;
  state.selectedId = lab.id;
  document.body.classList.add("detail-open");
  location.hash = String(lab.id);
  renderDetail(lab, { focusClose: !isCompact() });
  const card = markActiveCard(lab.id);
  if (fromHash && card) card.scrollIntoView({ block: "nearest" });
}

function closeDetail() {
  state.selectedId = null;
  document.body.classList.remove("detail-open");
  $("detail-root").hidden = true;
  markActiveCard(-1);
  if (location.hash) history.replaceState(null, "", location.pathname);
  if (lastFocus && typeof lastFocus.focus === "function" && !isCompact()) {
    try {
      lastFocus.focus();
    } catch (err) {
      /* ignore */
    }
  }
}

function linkBtn(href, label) {
  const a = document.createElement("a");
  a.href = href;
  a.target = "_blank";
  a.rel = "noopener noreferrer";
  a.textContent = label;
  return a;
}

function mailLink(email, label) {
  const a = document.createElement("a");
  const params = new URLSearchParams({ view: "cm", fs: "1", to: email });
  a.href = "https://mail.google.com/mail/?" + params.toString();
  a.target = "_blank";
  a.rel = "noopener noreferrer";
  a.textContent = label || email;
  return a;
}

function section(title) {
  const wrap = document.createElement("section");
  wrap.className = "detail-sec";
  const h = document.createElement("h3");
  h.textContent = title;
  wrap.appendChild(h);
  return wrap;
}

function renderDetail(lab, { focusClose } = {}) {
  const root = $("detail-root");
  const el = $("detail");
  root.hidden = false;
  el.replaceChildren();

  const bar = document.createElement("div");
  bar.className = "detail-bar";
  const barName = document.createElement("div");
  barName.className = "detail-bar-name";
  barName.textContent = lab.name;
  const close = document.createElement("button");
  close.type = "button";
  close.className = "close";
  close.textContent = "閉じる";
  close.addEventListener("click", closeDetail);
  bar.append(barName, close);

  const hero = document.createElement("div");
  hero.className = "detail-hero";
  if (lab.image) {
    const img = document.createElement("img");
    img.className = "hero";
    img.alt = lab.faculty || "";
    img.loading = "lazy";
    img.decoding = "async";
    img.referrerPolicy = "no-referrer";
    img.src = lab.image;
    hero.appendChild(img);
  }
  const heroText = document.createElement("div");
  heroText.className = "detail-hero-text";
  const kicker = document.createElement("div");
  kicker.className = "kicker";
  kicker.textContent = [groupLabel(lab), shortProgram(lab.program)].filter(Boolean).join(" · ");
  const h = document.createElement("h2");
  h.id = "detail-title";
  h.textContent = lab.name;
  const lead = document.createElement("p");
  lead.className = "lead";
  lead.textContent = lab.title;
  heroText.append(kicker, h, lead);
  if (lab.room) {
    const roomLine = document.createElement("p");
    roomLine.className = "detail-room";
    roomLine.textContent = lab.room;
    heroText.appendChild(roomLine);
  }
  hero.appendChild(heroText);

  const bodyWrap = document.createElement("div");
  bodyWrap.className = "detail-body";

  const e = entry(lab.id);
  const fav = document.createElement("button");
  fav.type = "button";
  fav.className = "fav-btn" + (e.on ? " on" : "");
  fav.textContent = e.on ? "気になる（保存済）" : "気になるに追加";
  fav.addEventListener("click", () => {
    toggleSaved(lab.id);
    paint();
    renderDetail(lab, { focusClose: false });
  });

  if (lab.keywords?.length) {
    const sec = section("キーワード");
    const tags = document.createElement("div");
    tags.className = "tags";
    for (const kw of lab.keywords) {
      const t = document.createElement("button");
      t.type = "button";
      t.className = "tag";
      t.textContent = kw;
      t.title = `「${kw}」の研究室を見る`;
      t.addEventListener("click", () => {
        closeDetail();
        setSearch(kw);
      });
      tags.appendChild(t);
    }
    sec.appendChild(tags);
    bodyWrap.appendChild(sec);
  }

  const next = section("見学・連絡");
  const links = document.createElement("div");
  links.className = "links";
  lab.urls.forEach((u, i) => {
    const a = linkBtn(u, lab.urls.length > 1 ? `研究室HP ${i + 1}` : "研究室HPを見る");
    if (i === 0) a.classList.add("primary");
    links.appendChild(a);
  });
  (lab.emails || []).forEach((addr, i) => {
    const a = mailLink(addr, (lab.emails || []).length > 1 ? addr : "メールを送る");
    if (!lab.urls.length && i === 0) a.classList.add("primary");
    links.appendChild(a);
  });
  const officialBtn = linkBtn("https://www.uec.ac.jp/arc/laboguide.html", "公式ラボガイドで見る");
  if (!lab.urls.length && !(lab.emails || []).length) officialBtn.classList.add("primary");
  links.appendChild(officialBtn);
  lab.videos.forEach((u, i) => links.appendChild(linkBtn(u, lab.videos.length > 1 ? `動画 ${i + 1}` : "紹介動画を見る")));
  lab.extraUrls.forEach((u) => links.appendChild(linkBtn(u, "追加リンク")));
  lab.yumenabi.forEach((u) => links.appendChild(linkBtn(u, "夢ナビ")));
  lab.visitingUrls.forEach((u) => links.appendChild(linkBtn(u, "出張講義")));
  next.appendChild(links);
  if (lab.room) {
    const room = document.createElement("p");
    room.className = "save-hint";
    room.textContent = "居室 " + lab.room + "（行く前にHPで確認を）";
    next.appendChild(room);
  }
  const contactHint = document.createElement("p");
  contactHint.className = "save-hint";
  contactHint.textContent = (lab.emails || []).length
    ? "ラボガイドの本文は載せていません。写真は公式ラボガイドの公開画像です。連絡の前に、研究室HPか公式ラボガイドも確認してください。"
    : "この研究室の公開メールはまだ載せていません。ラボガイドの本文は載せていません。写真は公式ラボガイドの公開画像です。連絡方法は研究室HPか公式ラボガイドを見てください。";
  next.appendChild(contactHint);
  const official = document.createElement("p");
  official.className = "save-hint";
  official.append("このページは非公式です。 ");
  const about = document.createElement("a");
  about.href = "about.html";
  about.textContent = "このサイトについて";
  official.appendChild(about);
  next.appendChild(official);
  bodyWrap.appendChild(next);

  const kv = document.createElement("dl");
  kv.className = "kv";
  const rows = [
    ["教員", lab.faculty],
    ["専攻", lab.majors.join("、")],
    ["分野", lab.fields.join("、")],
    ["居室", lab.room || "—"],
    ["出身地", hometownLabel(lab) || "—"],
    ["更新", lab.updatedAt || "—"],
  ];
  for (const [k, v] of rows) {
    const dt = document.createElement("dt");
    dt.textContent = k;
    const dd = document.createElement("dd");
    dd.textContent = v || "—";
    kv.append(dt, dd);
    if (k === "教員" && (lab.emails || []).length) {
      const mailDt = document.createElement("dt");
      mailDt.textContent = "メール";
      const mailDd = document.createElement("dd");
      lab.emails.forEach((addr, i) => {
        if (i) mailDd.append(document.createTextNode("、"));
        mailDd.appendChild(mailLink(addr, addr));
      });
      kv.append(mailDt, mailDd);
    }
  }
  if (lab.alsoIds.length) {
    const dt = document.createElement("dt");
    dt.textContent = "ほかの募集";
    const dd = document.createElement("dd");
    lab.alsoIds.forEach((id, i) => {
      const other = byId(id);
      if (!other) return;
      if (i) dd.append(document.createTextNode("、"));
      const b = document.createElement("button");
      b.type = "button";
      b.className = "linkish";
      b.textContent = shortProgram(other.program);
      b.addEventListener("click", () => openLab(other.id));
      dd.appendChild(b);
    });
    kv.append(dt, dd);
  }
  const info = section("基本情報");
  info.appendChild(kv);
  bodyWrap.appendChild(info);

  const saveSec = section("自分用メモ");
  const memo = document.createElement("textarea");
  memo.className = "memo";
  memo.placeholder = "見学で聞いたこと、雰囲気、先輩の話など";
  memo.value = e.memo || "";
  memo.addEventListener("input", () => {
    const wasOn = e.on;
    e.memo = memo.value;
    if (e.memo.trim()) e.on = true;
    persist();
    if (e.on !== wasOn) {
      fav.classList.toggle("on", e.on);
      fav.textContent = e.on ? "気になる（保存済）" : "気になるに追加";
      const card = document.querySelector(`.card[data-id="${lab.id}"]`);
      if (card) {
        card.classList.toggle("saved", e.on);
        const save = card.querySelector(".save-btn");
        if (save) {
          save.classList.toggle("on", e.on);
          save.setAttribute("aria-pressed", e.on ? "true" : "false");
          save.setAttribute("aria-label", e.on ? "気になるから外す" : "気になるに追加");
          save.title = e.on ? "気になるから外す" : "気になるに追加";
        }
      }
      renderStats();
      renderToolbar(filtered().length);
    }
  });
  const hint = document.createElement("p");
  hint.className = "save-hint";
  hint.textContent = "気になる研究室とメモは、この端末のブラウザにだけ残ります。";
  saveSec.append(memo, hint);
  bodyWrap.appendChild(saveSec);

  const scroll = document.createElement("div");
  scroll.className = "detail-scroll";
  scroll.append(hero, bodyWrap);

  const foot = document.createElement("div");
  foot.className = "detail-foot";
  foot.append(fav);

  el.append(bar, scroll, foot);
  if (focusClose) close.focus();
}

function paint() {
  persist();
  renderStats();
  renderInterest();
  renderResults();
  if (state.selectedId) markActiveCard(state.selectedId);
  syncFilterChrome();
}

function bind() {
  $("q").addEventListener("input", (ev) => {
    state.q = ev.target.value;
    syncSearchClear();
    paint();
    scrollResultsTop();
  });
  $("q").addEventListener("keydown", (ev) => {
    if (ev.key === "Enter") {
      ev.preventDefault();
      ev.target.blur();
    }
  });
  $("q-clear").addEventListener("click", () => setSearch(""));
  $("filter-scrim").addEventListener("click", () => {
    closeFilters();
    renderToolbar(filtered().length);
  });
  document.addEventListener("click", (ev) => {
    if (ev.target.closest("[data-close-detail]")) closeDetail();
  });
  document.addEventListener("keydown", (ev) => {
    if (ev.key === "Escape") {
      if (!$("detail-root").hidden) closeDetail();
      else if (document.body.classList.contains("filters-open")) {
        closeFilters();
        renderToolbar(filtered().length);
      }
    }
    if (ev.key === "/" && document.activeElement !== $("q") && ev.target.tagName !== "TEXTAREA" && ev.target.tagName !== "INPUT") {
      ev.preventDefault();
      $("q").focus();
    }
  });
  window.addEventListener("hashchange", () => {
    const id = Number(location.hash.replace("#", ""));
    if (id) openLab(id, { fromHash: true });
    else closeDetail();
  });
  syncSearchChrome();
  syncTopOffset();
  let compact = isCompact();
  window.addEventListener("resize", () => {
    syncSearchChrome();
    syncTopOffset();
    const now = isCompact();
    if (now !== compact) {
      compact = now;
      renderFilters();
      renderInterest();
      renderViewHint();
      renderToolbar(filtered().length);
    }
  });
  const top = document.querySelector(".top");
  if (typeof ResizeObserver !== "undefined") {
    if (top) new ResizeObserver(syncTopOffset).observe(top);
    const toolbar = $("toolbar");
    if (toolbar) new ResizeObserver(syncTopOffset).observe(toolbar);
  }
}

function boot() {
  bind();
  const data = window.__LABS_DATA__;
  if (!data || !Array.isArray(data.labs) || !data.labs.length) {
    $("results").innerHTML =
      "<div class='empty'><p>研究室データがありません。<code>python3 scripts/server.py --build</code> で <code>web/js/labs-data.js</code> を生成してください。</p></div>";
    return;
  }
  state.labs = data.labs;
  loadStore();
  syncSearchClear();
  renderFilters();
  paint();
  const hashId = Number(location.hash.replace("#", ""));
  if (hashId) openLab(hashId, { fromHash: true });
}

boot();
