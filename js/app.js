"use strict";
// =====================================================
// 胸きゅん彼氏彼女シリーズ プロトタイプ本体
// 検証したいこと: 「名前を呼ばれる＋関係が進む」だけで胸きゅんするか
// =====================================================

const SAVE_KEY = "munekyun_save_v1";
const STAGES = [
  { id: "meet",   label: "知り合い", min: 0 },
  { id: "friend", label: "友達",     min: 20 },
  { id: "crush",  label: "両想い？", min: 50 },
  { id: "lover",  label: "恋人",     min: 90 },
];
const SPECIAL_EVERY = 7; // 7通ごとにスペシャル（製品版は週1ログボ想定）

let save = null;
let busy = false;

// ---------- セーブ ----------
function loadSave() {
  try { return JSON.parse(localStorage.getItem(SAVE_KEY)); } catch (_) { return null; }
}
function persist() { localStorage.setItem(SAVE_KEY, JSON.stringify(save)); }

function stageOf(aff) {
  let cur = STAGES[0];
  for (const s of STAGES) if (aff >= s.min) cur = s;
  return cur;
}

// ---------- 画面遷移 ----------
function show(id) {
  document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
  document.getElementById(id).classList.add("active");
}

// ---------- 入口 ----------
document.getElementById("btn-start").addEventListener("click", () => {
  save = loadSave();
  if (save && save.charId) { enterMain(); } else { renderSelect(); show("screen-select"); }
});

// ---------- キャラ選択 ----------
function renderSelect() {
  const wrap = document.getElementById("char-cards");
  wrap.innerHTML = "";
  Object.values(CHARACTERS).forEach(c => {
    const card = document.createElement("button");
    card.className = `char-card ${c.theme}`;
    card.innerHTML = `<span class="cc-label">${c.label}</span><span class="cc-avatar">${c.name}</span><span class="cc-name">${c.name}（${c.yomi}）</span><span class="cc-desc">${c.desc.replace("{call}", "きみ")}</span>`;
    card.addEventListener("click", () => {
      save = { charId: c.id, name: "", suffix: "", aff: 0, count: 0, lastDate: "" };
      renderNameScreen();
      show("screen-name");
    });
    wrap.appendChild(card);
  });
}

// ---------- 名前・呼ばれ方 ----------
function renderNameScreen() {
  const c = CHARACTERS[save.charId];
  document.body.className = c.theme;
  const input = document.getElementById("input-name");
  const chips = document.getElementById("suffix-chips");
  const ok = document.getElementById("btn-name-ok");
  input.value = "";
  chips.innerHTML = "";
  c.suffixOptions.forEach((suf, i) => {
    const chip = document.createElement("button");
    chip.className = "chip" + (i === 0 ? " sel" : "");
    chip.textContent = suf === "" ? "呼び捨て" : `〜${suf}`;
    chip.addEventListener("click", () => {
      chips.querySelectorAll(".chip").forEach(x => x.classList.remove("sel"));
      chip.classList.add("sel");
      save.suffix = suf;
      preview();
    });
    chips.appendChild(chip);
  });
  save.suffix = c.suffixOptions[0];
  const preview = () => {
    const name = input.value.trim();
    document.getElementById("call-preview").textContent = name ? `「${name}${save.suffix}」って呼ぶね` : "";
    ok.disabled = !name;
  };
  input.addEventListener("input", preview);
  ok.onclick = () => {
    save.name = input.value.trim();
    persist();
    enterMain(true);
  };
}

function callName() { return save.name + save.suffix; }
function fill(text) { return text.replaceAll("{call}", callName()); }

// ---------- メイン ----------
function enterMain(first = false) {
  const c = CHARACTERS[save.charId];
  document.body.className = c.theme;
  document.getElementById("char-name").textContent = `${c.name}（${c.yomi}）`;
  setupAvatar(c);
  refreshHud();
  document.getElementById("talk-text").textContent = first
    ? fill("来てくれた。……じゃあ早速、最初の一通いい？")
    : fill("おかえり、{call}。待ってた");
  document.getElementById("replies").innerHTML = "";
  updateLetterButtons();
  show("screen-main");
}

// assets/<id>.png があれば自動差し替え（zigokuと同じ流儀）
function setupAvatar(c) {
  const av = document.getElementById("avatar");
  av.textContent = c.name;
  av.style.backgroundImage = "";
  const img = new Image();
  img.onload = () => {
    av.textContent = "";
    av.style.backgroundImage = `url(assets/${c.id}.png)`;
  };
  img.src = `assets/${c.id}.png`;
}

function refreshHud() {
  const st = stageOf(save.aff);
  document.getElementById("stage-badge").textContent = `関係：${st.label}`;
  const next = STAGES[STAGES.indexOf(st) + 1];
  const pct = next ? Math.min(100, ((save.aff - st.min) / (next.min - st.min)) * 100) : 100;
  document.getElementById("aff-bar").style.width = pct + "%";
}

function todayStr() { return new Date().toISOString().slice(0, 10); }

function updateLetterButtons() {
  const letterBtn = document.getElementById("btn-letter");
  const moreBtn = document.getElementById("btn-more");
  const got = save.lastDate === todayStr();
  letterBtn.style.display = got ? "none" : "block";
  moreBtn.style.display = got ? "block" : "none";
}

// ---------- セリフ抽選 ----------
function timeSlot() {
  const h = new Date().getHours();
  if (h >= 5 && h < 11) return "morning";
  if (h >= 19 || h < 5) return "night";
  return "anytime";
}

function pickLine() {
  const data = LINES[save.charId];
  const isSpecial = save.count > 0 && (save.count + 1) % SPECIAL_EVERY === 0;
  if (isSpecial) {
    return { line: data.special[Math.floor(Math.random() * data.special.length)], special: true };
  }
  const stagePool = data[stageOf(save.aff).id];
  const pool = stagePool[timeSlot()] && stagePool[timeSlot()].length ? stagePool[timeSlot()] : stagePool.anytime;
  return { line: pool[Math.floor(Math.random() * pool.length)], special: false };
}

// ---------- 再生 ----------
function deliver() {
  if (busy) return;
  busy = true;
  const { line, special } = pickLine();
  save.count += 1;
  save.lastDate = todayStr();
  persist();
  updateLetterButtons();
  document.getElementById("btn-letter").style.display = "none";
  document.getElementById("btn-more").style.display = "none";
  document.getElementById("replies").innerHTML = "";
  if (special) flashSpecial();
  typeText(fill(line.text), () => {
    renderReplies(line);
    busy = false;
  });
}

function typeText(text, done) {
  const el = document.getElementById("talk-text");
  el.textContent = "";
  let i = 0;
  const tick = () => {
    el.textContent = text.slice(0, ++i);
    if (i < text.length) setTimeout(tick, text[i - 1] === "…" ? 120 : 45);
    else done();
  };
  tick();
}

function renderReplies(line) {
  const wrap = document.getElementById("replies");
  wrap.innerHTML = "";
  line.replies.forEach(r => {
    const btn = document.createElement("button");
    btn.className = "reply";
    btn.textContent = r.label;
    btn.addEventListener("click", () => {
      if (busy) return;
      busy = true;
      wrap.innerHTML = "";
      const before = stageOf(save.aff).id;
      save.aff += r.delta;
      persist();
      heartBurst();
      typeText(fill(r.reaction), () => {
        refreshHud();
        const after = stageOf(save.aff).id;
        if (after !== before) celebrateStage(after);
        updateLetterButtons();
        busy = false;
      });
    });
    wrap.appendChild(btn);
  });
}

// ---------- 演出 ----------
function heartBurst() {
  const layer = document.getElementById("fx-layer");
  for (let i = 0; i < 8; i++) {
    const h = document.createElement("span");
    h.className = "heart";
    h.textContent = "♥";
    h.style.left = 35 + Math.random() * 30 + "%";
    h.style.animationDelay = Math.random() * 0.4 + "s";
    h.style.fontSize = 14 + Math.random() * 18 + "px";
    layer.appendChild(h);
    setTimeout(() => h.remove(), 2200);
  }
}

function flashSpecial() {
  const layer = document.getElementById("fx-layer");
  const f = document.createElement("div");
  f.className = "special-flash";
  f.textContent = "💌 SPECIAL 💌";
  layer.appendChild(f);
  setTimeout(() => f.remove(), 2400);
}

function celebrateStage(stageId) {
  const st = STAGES.find(s => s.id === stageId);
  const layer = document.getElementById("fx-layer");
  const f = document.createElement("div");
  f.className = "stage-up";
  f.textContent = `関係が「${st.label}」になった`;
  layer.appendChild(f);
  for (let i = 0; i < 16; i++) heartBurst();
  setTimeout(() => f.remove(), 3000);
}

// ---------- ボタン ----------
document.getElementById("btn-letter").addEventListener("click", deliver);
document.getElementById("btn-more").addEventListener("click", deliver);
document.getElementById("btn-reset").addEventListener("click", () => {
  if (confirm("関係も好感度も最初からになります。やり直す？")) {
    localStorage.removeItem(SAVE_KEY);
    location.reload();
  }
});
