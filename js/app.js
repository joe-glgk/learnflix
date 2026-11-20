/* ============ STATE ============ */
const KEY = "learnflix_kn_v1";
let S = { level: null, done: {}, quiz: {}, list: [], xp: 0, recent: [], fin: {}, name: "", size: 0, hideAnn: [] };
try { const r = localStorage.getItem(KEY); if (r) S = Object.assign(S, JSON.parse(r)); } catch (e) {}
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} };

COURSES.forEach(c => { c.id = c.level + "-" + c.code; c.quiz = c.quiz || []; c.chapters = c.chapters || []; });
const C = id => COURSES.find(c => c.id === id);
const $ = s => document.querySelector(s);
const esc = s => String(s ?? "").replace(/[&<>"']/g, m => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m]));
const TYPES = ["บังคับ", "เลือกบังคับ", "เลือกเสรี"];
const strand = c => STRANDS[c.code.slice(0, 2)] || { name: "รายวิชาอื่น ๆ", g: ["#444", "#111"] };
const mine = () => COURSES.filter(c => c.level === S.level);
const hasQuiz = c => c.quiz.length || c.quizUrl;
const today = () => new Date().toISOString().slice(0, 10);

/* ============ LINK → EMBED ============ */
function canvaEmbed(u) { return u.split("?")[0].split("#")[0].replace(/\/+$/, "") + "?embed"; }
function driveEmbed(u) { const m = u.match(/\/d\/([^/?#]+)/) || u.match(/[?&]id=([^&]+)/); return m ? "https://drive.google.com/file/d/" + m[1] + "/preview" : u; }
function ytEmbed(u) { const m = u.match(/(?:youtu\.be\/|v=|embed\/|shorts\/)([\w-]{11})/); return m ? "https://www.youtube.com/embed/" + m[1] + "?rel=0" : u; }
function formEmbed(u) { if (/docs\.google\.com\/forms/.test(u)) { const b = u.split("?")[0].replace(/\/(edit|viewform)?\/?$/, "/viewform"); return b + "?embedded=true"; } return u; }
const SRC = {
  video: { lbl: "วิดีโอ", ic: "▶️", f: ytEmbed },
  canva: { lbl: "สื่อการสอน", ic: "🎬", f: canvaEmbed },
  doc: { lbl: "เอกสาร", ic: "📄", f: driveEmbed }
};
function srcs(o) { return ["video", "canva", "doc"].filter(k => o[k]).map(k => ({ k, lbl: SRC[k].lbl, ic: SRC[k].ic, url: o[k], embed: SRC[k].f(o[k]) })); }

/* ============ ITEMS (ตอน/บทในแต่ละวิชา) ============ */
function items(c) {
  const a = [];
  if (c.chapters.length) {
    c.chapters.forEach((ch, i) => { const s = srcs(ch); if (s.length) a.push({ k: "ch" + i, t: ch.t || "บทที่ " + (i + 1), s: ch.s || s.map(x => x.ic + " " + x.lbl).join(" · "), ic: s[0].ic, srcs: s }); });
  } else {
    if (c.canva) a.push({ k: "media", t: "สื่อการสอน", s: "สไลด์/สื่อนำเสนอจาก Canva", ic: "🎬", srcs: srcs({ canva: c.canva }) });
    if (c.doc) a.push({ k: "doc", t: "เอกสารประกอบการเรียน", s: "หนังสือเรียน/เอกสาร PDF", ic: "📄", srcs: srcs({ doc: c.doc }) });
  }
  if (hasQuiz(c)) a.push({ k: "quiz", t: "แบบทดสอบ", s: c.quiz.length ? c.quiz.length + " ข้อ · เกณฑ์ผ่าน 70%" : "แบบทดสอบออนไลน์ (Google Form)", ic: "📝" });
  return a;
}
const isDone = (c, k) => k === "quiz" ? (c.quiz.length ? (S.quiz[c.id] ?? -1) >= 70 : !!S.done[c.id + "_quiz"]) : !!S.done[c.id + "_" + k];
function pct(c) { const it = items(c); if (!it.length) return 0; return Math.round(it.filter(i => isDone(c, i.k)).length / it.length * 100); }
function checkFinish(c) { if (pct(c) === 100 && !S.fin[c.id]) { S.fin[c.id] = today(); S.xp += 50; save(); updXP(); setTimeout(() => toast("🏅 เรียนครบวิชาแล้ว! +50 XP รับใบประกาศได้ในหน้ารายวิชา"), 900); return true; } return false; }

function toast(t) { const el = $("#toast"); el.textContent = t; el.classList.add("show"); clearTimeout(el._t); el._t = setTimeout(() => el.classList.remove("show"), 2600); }
function updXP() { $("#xp").textContent = "⭐ " + S.xp + " XP"; const L = LEVELS[S.level]; if (L) { const b = $("#lvl"); b.innerHTML = L.ic + " " + L.short + " ▾"; b.style.background = `linear-gradient(135deg,${L.g[0]},${L.g[1]})`; } }

/* ============ ตัวหนังสือใหญ่ ============ */
const SIZES = [{ z: 1, n: "ปกติ" }, { z: 1.15, n: "ใหญ่" }, { z: 1.3, n: "ใหญ่มาก" }];
function applySize() { document.body.classList.remove("z1", "z2"); if (S.size) document.body.classList.add("z" + S.size); }
function setSize(i) { S.size = i; save(); applySize(); openSettings(); }

/* ============ PROFILE (เลือกระดับชั้น) ============ */
function showProfiles() {
  closeSheet();
  const p = $("#profiles");
  p.innerHTML = `<div class="logo" style="font-size:38px">LEARN<span>FLIX</span></div><h1>ใครกำลังเรียนอยู่?</h1><p>เลือกระดับชั้นของคุณ</p>
  <div class="pf">${Object.entries(LEVELS).map(([k, L]) => `<button onclick="pickLevel('${k}')"><div class="face" style="background:linear-gradient(135deg,${L.g[0]},${L.g[1]})">${L.ic}<small>${COURSES.filter(c => c.level === k).length} รายวิชา</small></div>${esc(L.name)}</button>`).join("")}</div>`;
  p.classList.add("show"); document.body.style.overflow = "hidden";
}
function pickLevel(k) { S.level = k; save(); updXP(); $("#profiles").classList.remove("show"); document.body.style.overflow = ""; $("#q").value = ""; heroI = 0; render("home"); }

/* ============ CARDS ============ */
function deco(c, i = 0) {
  const seed = c.code.charCodeAt(4) % 9 + i;
  return `<svg class="deco" viewBox="0 0 200 200"><circle cx="${110 + seed * 4}" cy="70" r="70" fill="none" stroke="#fff" stroke-width="2"/><circle cx="150" cy="${110 - seed * 2}" r="40" fill="#fff" opacity=".25"/><path d="M20 180 Q100 ${100 + seed * 6} 200 160" stroke="#fff" stroke-width="3" fill="none"/></svg>
  <div style="position:absolute;right:14px;top:10px;font-size:44px;filter:drop-shadow(0 4px 10px #0006)">${c.ic || "📘"}</div>`;
}
function poster(c, extra = "") {
  const g = strand(c).g;
  return `<div class="poster" style="background:linear-gradient(135deg,${g[0]},${g[1]})">${deco(c)}<div class="code">${esc(c.code)}</div><div class="sub">${esc(strand(c).name.replace("สาระ", ""))}</div><div class="tt">${esc(c.name)}</div>${extra}</div>`;
}
function chips(c) { return `<div class="chips">${c.chapters.length ? `<span class="chip">📑 ${c.chapters.length} บท</span>` : ''}${c.canva ? '<span class="chip">🎬 สื่อ</span>' : ''}${c.doc ? '<span class="chip">📄 เอกสาร</span>' : ''}${hasQuiz(c) ? '<span class="chip">📝 แบบทดสอบ</span>' : ''}</div>`; }
function card(c) {
  const p = pct(c), inList = S.list.includes(c.id);
  return `<div class="card" onclick="openCourse('${c.id}')">${poster(c)}${S.fin[c.id] ? '<div class="medal" title="เรียนครบแล้ว">🏅</div>' : ''}
  ${p > 0 ? `<div class="prog"><i style="width:${p}%"></i></div>` : ''}
  <div class="hov"><div class="ic"><span class="circ w" onclick="event.stopPropagation();resume('${c.id}')">▶</span><span class="circ" onclick="event.stopPropagation();toggleList('${c.id}')">${inList ? '✓' : '+'}</span></div>
  <div style="font-weight:600;font-size:14px">${esc(c.name)}</div>
  <div class="m">${esc(c.code)} · วิชา${esc(c.type)}${p ? ` · <span class="match">${p}%</span>` : ''}</div>${chips(c)}</div></div>`;
}
let rowN = 0;
function row(title, list, sub = "") {
  if (!list.length) return "";
  const id = "t" + (rowN++);
  return `<section class="row"><h2>${title}${sub ? `<small>${sub}</small>` : ''}</h2><div class="track-wrap"><button class="arrow l" onclick="sc('${id}',-1)">‹</button><div class="track" id="${id}">${list.map(card).join("")}</div><button class="arrow r" onclick="sc('${id}',1)">›</button></div></section>`;
}
function sc(id, d) { const t = document.getElementById(id); t.scrollBy({ left: d * t.clientWidth * .85 }); }

/* ============ ประกาศจากครู ============ */
function annList() { const t = today(); return (typeof ANNOUNCEMENTS !== "undefined" ? ANNOUNCEMENTS : []).filter(a => a && a.text && (!a.level || a.level === "all" || a.level === S.level) && (!a.until || a.until >= t) && !S.hideAnn.includes(a.id || a.text)); }
function annBox() {
  const l = annList(); if (!l.length) return "";
  return `<section class="ann">${l.map(a => `<div class="ann-i"><span class="ann-ic">📢</span><div class="ann-t">${esc(a.text)}${a.link ? ` <a href="${esc(a.link)}" target="_blank" rel="noopener">รายละเอียด ↗</a>` : ''}${a.until ? `<small>ถึง ${thaiDate(a.until)}</small>` : ''}</div><button class="ann-x" onclick="hideAnn('${esc(a.id || a.text).replace(/'/g, "")}')" title="ซ่อน">✕</button></div>`).join("")}</section>`;
}
function hideAnn(id) { const a = (ANNOUNCEMENTS || []).find(x => (x.id || x.text).replace(/'/g, "") === id); S.hideAnn.push(a ? (a.id || a.text) : id); save(); render(); }
function thaiDate(iso) { try { return new Date(iso + "T00:00:00").toLocaleDateString("th-TH", { day: "numeric", month: "long", year: "numeric" }); } catch (e) { return iso; } }

/* ============ HERO ============ */
let heroI = 0, heroTimer;
const heroList = () => { const m = mine(); const f = m.filter(c => c.canva || c.chapters.length); return (f.length ? f : m).slice(0, 5); };
function hero() {
  const hl = heroList(); if (!hl.length) return ""; const c = hl[heroI % hl.length], g = strand(c).g, p = pct(c);
  return `<header class="hero"><div class="hero-bg" style="background:radial-gradient(ellipse at 75% 40%,${g[0]} 0%,${g[1]} 45%,#0b0b0f 80%)"></div>
  <svg class="hero-art" viewBox="0 0 400 300"><g fill="none" stroke="#fff" opacity=".22"><circle cx="250" cy="140" r="120" stroke-width="2"/><circle cx="250" cy="140" r="80"/><circle cx="250" cy="140" r="160" stroke-dasharray="4 8"/></g><text x="250" y="175" font-size="110" text-anchor="middle">${c.ic || "📘"}</text></svg>
  <div class="hero-c"><div class="tag"><b>L</b> ${esc(LEVELS[c.level].name)} · วิชา${esc(c.type)}</div><h1>${esc(c.name)}</h1>
  <div class="meta"><span class="pill">${esc(c.code)}</span><span>${esc(strand(c).name)}</span>${c.canva ? '<span>🎬 สื่อการสอน</span>' : ''}${c.doc ? '<span>📄 เอกสาร</span>' : ''}${p ? `<span class="match">เรียนแล้ว ${p}%</span>` : ''}</div>
  <p>เรียนรู้ด้วยตนเองได้ทุกที่ทุกเวลา ผ่านสื่อการสอนและเอกสารประกอบการเรียนรายวิชา${esc(c.name)}</p>
  <div class="btns"><button class="btn btn-w" onclick="resume('${c.id}')">▶ ${p > 0 && p < 100 ? 'เรียนต่อ' : 'เริ่มเรียน'}</button><button class="btn btn-g" onclick="openCourse('${c.id}')">ⓘ ข้อมูลรายวิชา</button></div></div>
  <div class="dots">${hl.map((_, i) => `<i class="${i === heroI % hl.length ? 'on' : ''}" onclick="setHero(${i})"></i>`).join("")}</div></header>`;
}
function setHero(i) { heroI = i; const h = document.querySelector(".hero"); if (h) h.outerHTML = hero(); restartHero(); }
function busy() { return $("#q").value || ["#ov", "#player", "#profiles", "#sheet"].some(s => $(s).classList.contains("show")); }
function restartHero() { clearInterval(heroTimer); heroTimer = setInterval(() => { if (cur === "home" && !busy()) setHero((heroI + 1) % heroList().length); }, 8000); }

/* ============ VIEWS ============ */
let cur = "home";
function go(v) { $("#q").value = ""; render(v); }
function render(v = cur) {
  cur = v; rowN = 0;
  document.querySelectorAll("[data-v]").forEach(b => b.classList.toggle("on", b.dataset.v === v));
  const L = LEVELS[S.level], M = mine();
  const q = $("#q").value.trim().toLowerCase();
  let h = "";
  if (q) {
    const r = COURSES.filter(c => (c.name + c.code + strand(c).name + c.type + c.chapters.map(x => x.t).join(" ")).toLowerCase().includes(q));
    h = `<div class="grid"><div class="ttl">ผลการค้นหา “${esc(q)}” (ทุกระดับชั้น)</div>${r.map(card).join("") || '<p style="color:var(--muted)">ไม่พบรายวิชาที่ตรงกับคำค้น</p>'}</div>`;
  } else if (v === "home") {
    const cont = S.recent.map(C).filter(c => c && c.level === S.level && pct(c) < 100);
    const strands = [...new Set(M.map(c => strand(c).name))];
    h = hero() + `<main>${annBox()}${row("▶ เรียนต่อจากที่ค้างไว้", cont, "สำหรับคุณ")}
     ${TYPES.map(t => row(`${t === "บังคับ" ? "📚" : t === "เลือกบังคับ" ? "🧩" : "🌈"} วิชา${t}`, M.filter(c => c.type === t), L.short)).join("")}
     ${row("❤️ รายการของฉัน", S.list.map(C).filter(c => c && c.level === S.level))}
     ${row("🏅 เรียนครบแล้ว", M.filter(c => S.fin[c.id]), "ดูใบประกาศได้")}
     ${strands.map(s => row(s, M.filter(c => strand(c).name === s))).join("")}</main>`;
    restartHero();
  } else if (v === "courses") {
    h = `<div class="grid"><div class="ttl">รายวิชาทั้งหมด · ${esc(L.name)} (${M.length})</div>${TYPES.map(t => { const l = M.filter(c => c.type === t); return l.length ? `<div class="sec-t">วิชา${t} (${l.length})</div>${l.map(card).join("")}` : "" }).join("")}</div>`;
  } else if (v === "mylist") {
    const l = S.list.map(C).filter(Boolean);
    h = `<div class="grid"><div class="ttl">รายการของฉัน</div>${l.map(card).join("") || '<p style="color:var(--muted)">ยังไม่มีรายวิชาในรายการ กดปุ่ม + บนการ์ดเพื่อเพิ่ม</p>'}</div>`;
  } else if (v === "quiz") {
    const l = M.filter(hasQuiz);
    h = `<div class="grid"><div class="ttl">แบบทดสอบ · ${esc(L.name)}</div>${l.map(c => { const s = S.quiz[c.id], d = isDone(c, "quiz"); return `<div class="card" onclick="startQuiz('${c.id}')">${poster(c, `<div style="position:relative;font-size:13px;margin-top:4px">${c.quiz.length ? c.quiz.length + ' ข้อ · ' + (s != null ? 'คะแนนสูงสุด ' + s + '%' : 'ยังไม่เคยทำ') : 'Google Form · ' + (d ? 'ส่งแล้ว' : 'ยังไม่ได้ทำ')}</div>`)}${s != null || d ? `<div class="badge-n" style="left:auto;right:10px;background:${d ? 'var(--ok)' : 'var(--warn)'}">${d ? (c.quiz.length ? 'ผ่าน' : 'ส่งแล้ว') : 'ลองใหม่'}</div>` : ''}</div>` }).join("") || '<p style="color:var(--muted)">ยังไม่มีแบบทดสอบในระดับชั้นนี้</p>'}</div>`;
  } else if (v === "progress") {
    const all = M.flatMap(c => items(c).map(i => isDone(c, i.k))), doneN = all.filter(Boolean).length;
    const qs = M.map(c => S.quiz[c.id]).filter(x => x != null), avg = qs.length ? Math.round(qs.reduce((a, b) => a + b, 0) / qs.length) : 0;
    const fin = M.filter(c => S.fin[c.id]);
    h = `<div class="stats"><div class="stat"><b>⭐ ${S.xp}</b><span>XP สะสม</span></div><div class="stat"><b>${doneN}/${all.length}</b><span>บทเรียน/เอกสารที่ศึกษาแล้ว</span></div><div class="stat"><b>🏅 ${fin.length}/${M.length}</b><span>รายวิชาที่เรียนครบ</span></div><div class="stat"><b>${qs.length ? avg + '%' : '—'}</b><span>คะแนนแบบทดสอบเฉลี่ย</span></div></div>
    ${fin.length ? `<div style="padding:10px 4vw 0"><h3 style="margin-bottom:10px">🏅 เหรียญของฉัน</h3><div class="medals">${fin.map(c => `<button class="mdl" onclick="cert('${c.id}')"><span>🏅</span><b>${esc(c.name)}</b><small>${thaiDate(S.fin[c.id])}</small></button>`).join("")}</div></div>` : ''}
    <div style="padding:20px 4vw 60px"><h3 style="margin-bottom:6px">${esc(L.name)}</h3>${M.map(c => { const p = pct(c); return `<div class="ep" onclick="openCourse('${c.id}')"><div class="th" style="background:linear-gradient(135deg,${strand(c).g[0]},${strand(c).g[1]})">${S.fin[c.id] ? '🏅' : c.ic || "📘"}</div><div class="info"><h4>${esc(c.name)} <span>${esc(c.code)} · ${p}%</span></h4><div class="bar" style="margin:8px 0"><i style="width:${p}%"></i></div><p>วิชา${esc(c.type)}${S.quiz[c.id] != null ? ' · แบบทดสอบ ' + S.quiz[c.id] + '%' : ''}</p></div></div>` }).join("")}
    <button class="btn btn-g" style="margin-top:20px" onclick="resetAll()">↺ ล้างความก้าวหน้าทั้งหมด</button></div>`;
  }
  $("#view").innerHTML = h + `<footer>LearnFlix · คลังสื่อการเรียนรู้ด้วยตนเอง · ${esc(L.name)}</footer>`;
  window.scrollTo(0, 0);
}
let resetArm = 0;
function resetAll() { if (Date.now() - resetArm > 3000) { resetArm = Date.now(); toast("กดอีกครั้งเพื่อยืนยันการล้างข้อมูล"); return; } S = Object.assign(S, { done: {}, quiz: {}, list: [], xp: 0, recent: [], fin: {} }); save(); updXP(); render(); toast("ล้างข้อมูลแล้ว"); }

/* ============ COURSE MODAL ============ */
function openCourse(id) {
  const c = C(id), p = pct(c), inList = S.list.includes(id), it = items(c), fin = S.fin[id];
  $("#modal").innerHTML = `<div class="m-hero">${poster(c, `<div class="btns">${it.length ? `<button class="btn btn-w" onclick="resume('${id}')">▶ ${p > 0 && p < 100 ? 'เรียนต่อ' : p === 100 ? 'ทบทวน' : 'เริ่มเรียน'}</button>` : ''}${fin ? `<button class="btn btn-gold" onclick="cert('${id}')">🏅 ใบประกาศ</button>` : ''}<button class="circ" style="width:44px;height:44px;font-size:18px" onclick="toggleList('${id}');openCourse('${id}')">${inList ? '✓' : '+'}</button></div>`)}<button class="x" onclick="closeOv()">✕</button></div>
  <div class="m-body"><div class="m-grid"><div><div class="meta"><span class="pill">${esc(c.code)}</span><span>วิชา${esc(c.type)}</span>${c.chapters.length ? `<span>📑 ${c.chapters.length} บท</span>` : ''}${p ? `<span class="match">ศึกษาแล้ว ${p}%</span>` : ''}</div>
  <p>รายวิชา${esc(c.name)} (${esc(c.code)}) ${esc(LEVELS[c.level].name)} เลือกศึกษาเนื้อหาได้ตามลำดับ เมื่อศึกษาจบแล้วกด “ศึกษาจบแล้ว” เพื่อบันทึกความก้าวหน้า เรียนครบทุกรายการจะได้รับใบประกาศ 🏅</p>
  ${c.chapters.length && (c.canva || c.doc) ? `<div class="btns" style="margin-top:12px">${c.canva ? `<button class="btn btn-g sm" onclick="viewWhole('${id}','canva')">🎬 สื่อทั้งเล่ม</button>` : ''}${c.doc ? `<button class="btn btn-g sm" onclick="viewWhole('${id}','doc')">📄 หนังสือเรียนฉบับเต็ม</button>` : ''}</div>` : ''}</div>
  <div class="m-side"><div><b>ระดับชั้น:</b> ${esc(LEVELS[c.level].name)}</div><div><b>ประเภท:</b> วิชา${esc(c.type)}</div><div><b>สาระ:</b> ${esc(strand(c).name)}</div><div><b>แบบทดสอบ:</b> ${S.quiz[id] != null ? S.quiz[id] + '%' : isDone(c, "quiz") ? 'ส่งแล้ว' : hasQuiz(c) ? 'ยังไม่ได้ทำ' : 'ยังไม่มี'}</div>${fin ? `<div><b>เรียนครบเมื่อ:</b> ${thaiDate(fin)}</div>` : ''}</div></div>
  <div class="tabs"><button class="on">${c.chapters.length ? 'บทเรียน' : 'เนื้อหาในรายวิชา'}</button></div>
  ${it.map((x, i) => { const d = isDone(c, x.k); return `<div class="ep" onclick="${x.k === 'quiz' ? `startQuiz('${id}')` : `view('${id}','${x.k}')`}"><div class="n">${i + 1}</div><div class="th" style="background:linear-gradient(135deg,${strand(c).g[0]},${strand(c).g[1]})">${d ? '✅' : x.ic}</div><div class="info"><h4>${esc(x.t)}<span>${d ? '<span class="done">ศึกษาแล้ว</span>' : ''}</span></h4><p>${esc(x.s)}</p></div></div>` }).join("")}
  ${!hasQuiz(c) ? `<div class="ep dis"><div class="n">${it.length + 1}</div><div class="th" style="background:#2b2b36">📝</div><div class="info"><h4>แบบทดสอบ</h4><p>ผู้สอนกำลังจัดเตรียม เร็ว ๆ นี้</p></div></div>` : ''}
  ${fin ? `<div class="quizbox" style="margin-top:16px"><div class="big">🏅</div><div style="flex:1;min-width:200px"><h4>เรียนครบรายวิชาแล้ว!</h4><p>บันทึกใบประกาศความสำเร็จเป็นรูปภาพเก็บไว้หรือแชร์ได้</p></div><button class="btn btn-gold" onclick="cert('${id}')">ดูใบประกาศ</button></div>` : ''}
  </div>`;
  $("#ov").classList.add("show"); document.body.style.overflow = "hidden";
}
function closeOv() { $("#ov").classList.remove("show"); document.body.style.overflow = ""; render(); }
$("#ov").addEventListener("click", e => { if (e.target.id === "ov") closeOv(); });
function toggleList(id) { const i = S.list.indexOf(id); if (i >= 0) { S.list.splice(i, 1); toast("นำออกจากรายการแล้ว"); } else { S.list.push(id); toast("เพิ่มในรายการของฉันแล้ว ❤️"); } save(); if (!$("#ov").classList.contains("show")) render(); }
function resume(id) { const c = C(id), it = items(c); if (!it.length) return openCourse(id); const n = it.find(x => !isDone(c, x.k)) || it[0]; n.k === "quiz" ? startQuiz(id) : view(id, n.k); }
function openPlayer(html) { $("#player").innerHTML = html; $("#player").classList.add("show"); document.body.style.overflow = "hidden"; }

/* ============ VIEWER (Canva / Drive / YouTube / Google Form) ============ */
let P = {};
function frame(s) {
  return `<div class="viewer" style="padding-top:14px"><iframe src="${esc(s.embed)}" allow="fullscreen; autoplay; encrypted-media" allowfullscreen loading="lazy" title="${esc(s.lbl)}"></iframe>
   <div class="vhint">ถ้าเนื้อหาไม่แสดง กด <a href="${esc(s.url)}" target="_blank" rel="noopener">เปิดในแท็บใหม่</a></div></div>`;
}
function view(id, k, si = 0) {
  const c = C(id), it = items(c), x = it.find(i => i.k === k); if (!x) return;
  P = { id, k }; Q = {};
  S.recent = [id, ...S.recent.filter(r => r !== id)].slice(0, 10); save();
  const idx = it.indexOf(x), next = it[idx + 1], prev = it[idx - 1], d = isDone(c, k), s = x.srcs[si] || x.srcs[0];
  openPlayer(`<div class="p-top"><button class="circ" onclick="closePlayer()">←</button><h3>${x.ic} ${esc(x.t)}<small>${esc(c.code)} ${esc(c.name)} · ${idx + 1}/${it.length}</small></h3>
   <a class="btn btn-g btn-l top-open" href="${esc(s.url)}" target="_blank" rel="noopener">เปิดในแท็บใหม่ ↗</a></div>
  ${x.srcs.length > 1 ? `<div class="vtabs">${x.srcs.map((z, j) => `<button class="${j === si ? 'on' : ''}" onclick="view('${id}','${k}',${j})">${z.ic} ${z.lbl}</button>`).join("")}</div>` : ''}
  ${frame(s)}
  <div class="p-foot">${prev && prev.k !== "quiz" ? `<button class="btn btn-g" onclick="view('${id}','${prev.k}')">‹</button>` : ''}<button class="btn ${d ? 'btn-g' : 'btn-r'}" style="margin-right:auto" onclick="markDone()">${d ? '✓ ศึกษาจบแล้ว' : '✓ ศึกษาจบแล้ว (+20 XP)'}</button>
   ${next ? `<button class="btn btn-w" onclick="${next.k === 'quiz' ? `startQuiz('${id}')` : `view('${id}','${next.k}')`}">ถัดไป: ${esc(next.t.length > 22 ? next.t.slice(0, 22) + '…' : next.t)} ›</button>` : ''}</div>`);
}
function viewWhole(id, k) {
  const c = C(id), s = srcs({ [k]: c[k] })[0]; P = { id }; Q = {};
  openPlayer(`<div class="p-top"><button class="circ" onclick="closePlayer()">←</button><h3>${s.ic} ${k === 'doc' ? 'หนังสือเรียนฉบับเต็ม' : 'สื่อการสอนทั้งเล่ม'}<small>${esc(c.code)} ${esc(c.name)}</small></h3><a class="btn btn-g btn-l top-open" href="${esc(s.url)}" target="_blank" rel="noopener">เปิดในแท็บใหม่ ↗</a></div>${frame(s)}<div class="p-foot"><button class="btn btn-g" onclick="closePlayer()">‹ กลับ</button></div>`);
}
function markDone() {
  const { id, k } = P, key = id + "_" + k;
  if (!S.done[key]) { S.done[key] = 1; S.xp += 20; save(); updXP(); toast("+20 XP บันทึกความก้าวหน้าแล้ว 🎉"); checkFinish(C(id)); }
  if (k === "quiz") formQuiz(id); else view(id, k);
}
function closePlayer() { const id = P.id || Q.id; $("#player").innerHTML = ""; $("#player").classList.remove("show"); document.body.style.overflow = ""; P = {}; Q = {}; if ($("#ov").classList.contains("show") && id) openCourse(id); else render(); }
document.addEventListener("keydown", e => { if (e.key !== "Escape") return; if ($("#sheet").classList.contains("show")) closeSheet(); else if ($("#player").classList.contains("show")) closePlayer(); else if ($("#ov").classList.contains("show")) closeOv(); });

/* ============ QUIZ ============ */
let Q = {};
function formQuiz(id) {
  const c = C(id), d = isDone(c, "quiz"); P = { id, k: "quiz" }; Q = {};
  S.recent = [id, ...S.recent.filter(r => r !== id)].slice(0, 10); save();
  const s = { lbl: "แบบทดสอบ", url: c.quizUrl, embed: formEmbed(c.quizUrl) };
  openPlayer(`<div class="p-top"><button class="circ" onclick="closePlayer()">←</button><h3>📝 แบบทดสอบ<small>${esc(c.code)} ${esc(c.name)}</small></h3><a class="btn btn-g btn-l top-open" href="${esc(c.quizUrl)}" target="_blank" rel="noopener">เปิดในแท็บใหม่ ↗</a></div>
  ${frame(s).replace('class="viewer"', 'class="viewer form"')}
  <div class="p-foot"><span class="fhint">ทำแบบทดสอบและกด “ส่ง” ในฟอร์มให้เรียบร้อย แล้วกดปุ่มนี้</span><button class="btn ${d ? 'btn-g' : 'btn-r'}" onclick="markDone()">${d ? '✓ ส่งแบบทดสอบแล้ว' : '✓ ส่งแบบทดสอบแล้ว (+20 XP)'}</button></div>`);
}
function startQuiz(id) {
  const c = C(id);
  if (!c.quiz.length && c.quizUrl) return formQuiz(id);
  if (!c.quiz.length) return toast("วิชานี้ยังไม่มีแบบทดสอบ");
  Q = { id, n: 0, score: 0, ans: null }; P = {}; S.recent = [id, ...S.recent.filter(r => r !== id)].slice(0, 10); save(); drawQ();
}
function drawQ() {
  const c = C(Q.id), it = c.quiz[Q.n];
  openPlayer(`<div class="p-top"><button class="circ" onclick="closePlayer()">✕</button><h3>แบบทดสอบ: ${esc(c.name)}<small>${esc(c.code)} · ข้อ ${Q.n + 1} จาก ${c.quiz.length}</small></h3></div>
  <div class="p-main"><div class="q-card"><div class="bar" style="margin-bottom:20px"><i style="width:${(Q.n / c.quiz.length) * 100}%"></i></div>
  <div class="q-head"><span>คำถามที่ ${Q.n + 1}</span><span>ถูก ${Q.score} ข้อ</span></div><h2>${esc(it.q)}</h2>
  ${it.o.map((o, k) => { let cls = ""; if (Q.ans != null) { if (k === it.a) cls = "right"; else if (k === Q.ans) cls = "wrong"; } return `<button class="opt ${cls}" ${Q.ans != null ? 'disabled' : ''} onclick="pick(${k})"><span class="k">${"กขคงจ"[k]}</span>${esc(o)}</button>` }).join("")}
  ${Q.ans != null ? `<div class="exp"><b>${Q.ans === it.a ? '✅ ถูกต้อง!' : '❌ ยังไม่ถูก'}</b> ${esc(it.e || "")}</div><button class="btn btn-r" onclick="nextQ()">${Q.n < c.quiz.length - 1 ? 'ข้อถัดไป ›' : 'ดูผลคะแนน'}</button>` : ''}
  </div></div>`);
}
function pick(k) { if (Q.ans != null) return; Q.ans = k; if (k === C(Q.id).quiz[Q.n].a) Q.score++; drawQ(); }
function nextQ() { const c = C(Q.id); Q.ans = null; if (Q.n < c.quiz.length - 1) { Q.n++; drawQ(); } else showResult(); }
function showResult() {
  const c = C(Q.id), p = Math.round(Q.score / c.quiz.length * 100), pass = p >= 70, gain = Q.score * 10;
  const best = S.quiz[Q.id]; S.quiz[Q.id] = Math.max(best ?? 0, p); S.xp += gain; save(); updXP();
  const justFin = checkFinish(c);
  const r = 70, cir = 2 * Math.PI * r;
  openPlayer(`<div class="p-top"><button class="circ" onclick="closePlayer()">✕</button><h3>ผลการทดสอบ<small>${esc(c.code)} ${esc(c.name)}</small></h3></div>
  <div class="p-main"><div class="result"><div class="ring"><svg width="170" height="170"><circle cx="85" cy="85" r="${r}" stroke="#2b2b36" stroke-width="12" fill="none"/><circle cx="85" cy="85" r="${r}" stroke="${pass ? '#22c55e' : '#f59e0b'}" stroke-width="12" fill="none" stroke-linecap="round" stroke-dasharray="${cir}" stroke-dashoffset="${cir}" id="rg" style="transition:stroke-dashoffset 1.2s ease"/></svg><b>${p}%</b></div>
  <h2>${pass ? '🎉 ยอดเยี่ยม! ผ่านแล้ว' : '💪 เกือบแล้ว ลองอีกครั้ง'}</h2><p>ตอบถูก ${Q.score} จาก ${c.quiz.length} ข้อ · ได้รับ +${gain} XP${best != null ? ` · คะแนนสูงสุดเดิม ${best}%` : ''}</p>
  <div class="btns" style="justify-content:center">${S.fin[c.id] ? `<button class="btn btn-gold" onclick="cert('${c.id}')">🏅 ${justFin ? 'รับใบประกาศ' : 'ใบประกาศ'}</button>` : ''}<button class="btn btn-r" onclick="startQuiz('${c.id}')">↺ ทำใหม่</button><button class="btn btn-g" onclick="closePlayer();openCourse('${c.id}')">กลับไปที่รายวิชา</button></div></div></div>`);
  requestAnimationFrame(() => setTimeout(() => { const g = document.getElementById("rg"); if (g) g.style.strokeDashoffset = cir * (1 - p / 100); }, 50));
}

/* ============ ใบประกาศ ============ */
function cert(id) {
  const c = C(id); P = { id }; Q = {};
  if (!S.fin[id]) return toast("ต้องเรียนให้ครบทุกรายการก่อน");
  if (!S.name) return askName(id);
  openPlayer(`<div class="p-top"><button class="circ" onclick="closePlayer()">←</button><h3>🏅 ใบประกาศความสำเร็จ<small>${esc(c.code)} ${esc(c.name)}</small></h3></div>
  <div class="p-main"><div class="certwrap"><div class="certload" id="certimg">กำลังสร้างใบประกาศ...</div>
  <div class="btns" style="justify-content:center;margin-top:18px"><a class="btn btn-gold btn-l" id="certdl" download="ใบประกาศ-${esc(c.code)}.png">⬇ บันทึกรูปภาพ</a><button class="btn btn-g" onclick="askName('${id}')">✏️ แก้ชื่อ</button></div>
  <p class="vhint">บนมือถือ: กดค้างที่รูปแล้วเลือก “บันทึกรูปภาพ”</p></div></div>`);
  drawCert(c).then(url => { const box = $("#certimg"); if (!box) return; box.outerHTML = `<img id="certimg" class="certimg" src="${url}" alt="ใบประกาศ">`; $("#certdl").href = url; }).catch(() => { const b = $("#certimg"); if (b) b.textContent = "สร้างใบประกาศไม่สำเร็จ ลองใหม่อีกครั้ง"; });
}
function askName(id) {
  const c = C(id); P = { id }; Q = {};
  openPlayer(`<div class="p-top"><button class="circ" onclick="closePlayer()">←</button><h3>🏅 ใบประกาศความสำเร็จ<small>${esc(c.code)} ${esc(c.name)}</small></h3></div>
  <div class="p-main"><form class="result" onsubmit="event.preventDefault();saveName('${id}')"><div style="font-size:70px">🏅</div><h2>ชื่อที่จะแสดงบนใบประกาศ</h2><p>พิมพ์ชื่อ–นามสกุลของคุณ (ใช้กับใบประกาศทุกวิชา)</p>
  <input id="nm" class="inp" maxlength="60" value="${esc(S.name)}" placeholder="เช่น นายสมชาย ใจดี" autocomplete="name" required>
  <div class="btns" style="justify-content:center;margin-top:16px"><button class="btn btn-gold" type="submit">สร้างใบประกาศ</button></div></form></div>`);
  setTimeout(() => { const i = $("#nm"); if (i) i.focus(); }, 50);
}
function saveName(id) { const v = ($("#nm").value || "").trim(); if (!v) return; S.name = v; save(); cert(id); }
async function drawCert(c) {
  try { await Promise.all(["400", "600", "800"].map(w => document.fonts.load(`${w} 40px Prompt, sans-serif`))); } catch (e) {}
  const W = 1600, H = 1131, cv = document.createElement("canvas"); cv.width = W; cv.height = H; const x = cv.getContext("2d");
  const g = strand(c).g;
  x.fillStyle = "#0f0f14"; x.fillRect(0, 0, W, H);
  const rg = x.createRadialGradient(W * .8, H * .2, 50, W * .8, H * .2, 900); rg.addColorStop(0, g[0]); rg.addColorStop(1, "rgba(15,15,20,0)"); x.fillStyle = rg; x.fillRect(0, 0, W, H);
  x.strokeStyle = "#d4af37"; x.lineWidth = 6; x.strokeRect(40, 40, W - 80, H - 80); x.lineWidth = 2; x.strokeRect(58, 58, W - 116, H - 116);
  x.textAlign = "center";
  x.font = "800 54px Prompt, sans-serif"; x.fillStyle = "#e50914"; x.fillText("LEARN", W / 2 - 75, 170); x.fillStyle = "#fff"; x.fillText("FLIX", W / 2 + 95, 170);
  x.fillStyle = "#d4af37"; x.font = "600 64px Prompt, sans-serif"; x.fillText("ใบประกาศความสำเร็จ", W / 2, 285);
  x.fillStyle = "#c9c9d4"; x.font = "400 34px Prompt, sans-serif"; x.fillText("ขอมอบให้ไว้เพื่อแสดงว่า", W / 2, 375);
  x.fillStyle = "#fff"; let fs = 78; x.font = `700 ${fs}px Prompt, sans-serif`; while (x.measureText(S.name).width > W - 300 && fs > 40) { fs -= 4; x.font = `700 ${fs}px Prompt, sans-serif`; } x.fillText(S.name, W / 2, 485);
  x.strokeStyle = "#d4af3780"; x.lineWidth = 2; x.beginPath(); x.moveTo(W / 2 - 380, 520); x.lineTo(W / 2 + 380, 520); x.stroke();
  x.fillStyle = "#c9c9d4"; x.font = "400 34px Prompt, sans-serif"; x.fillText("ได้ศึกษาเนื้อหาครบถ้วนในรายวิชา", W / 2, 595);
  x.fillStyle = "#fff"; fs = 56; x.font = `600 ${fs}px Prompt, sans-serif`; while (x.measureText(c.name).width > W - 300 && fs > 34) { fs -= 3; x.font = `600 ${fs}px Prompt, sans-serif`; } x.fillText(c.name, W / 2, 680);
  x.fillStyle = "#c9c9d4"; x.font = "400 32px Prompt, sans-serif"; x.fillText(`รหัสวิชา ${c.code} · ${LEVELS[c.level].name}`, W / 2, 740);
  x.font = "400 30px Prompt, sans-serif"; x.fillText(`ณ วันที่ ${thaiDate(S.fin[c.id])}`, W / 2, 800);
  x.font = "120px serif"; x.fillText("🏅", W / 2, 960);
  x.fillStyle = "#8a8a99"; x.font = "400 22px Prompt, sans-serif"; x.fillText("ใบประกาศนี้ออกโดยระบบ LearnFlix เพื่อเป็นกำลังใจในการเรียนรู้ด้วยตนเอง", W / 2, 1040);
  return cv.toDataURL("image/png");
}

/* ============ SETTINGS / INSTALL (PWA) ============ */
let deferredPrompt = null;
window.addEventListener("beforeinstallprompt", e => { e.preventDefault(); deferredPrompt = e; });
window.addEventListener("appinstalled", () => { deferredPrompt = null; toast("ติดตั้งแอปเรียบร้อย 🎉"); });
const isStandalone = () => window.matchMedia("(display-mode: standalone)").matches || navigator.standalone;
const isIOS = () => /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
function openSettings() {
  const sh = $("#sheet");
  sh.innerHTML = `<div class="sheet-in"><div class="sheet-h"><b>⚙️ ตั้งค่า</b><button class="circ" onclick="closeSheet()">✕</button></div>
  <div class="set"><div><b>ขนาดตัวหนังสือ</b><small>ปรับให้อ่านง่ายบนมือถือ</small></div><div class="seg">${SIZES.map((z, i) => `<button class="${(S.size || 0) === i ? 'on' : ''}" style="font-size:${13 + i * 3}px" onclick="setSize(${i})">ก ${z.n}</button>`).join("")}</div></div>
  <div class="set"><div><b>📲 ติดตั้งเป็นแอป</b><small>${isStandalone() ? 'ติดตั้งแล้ว ✓' : 'เพิ่มไอคอน LearnFlix บนหน้าจอหลัก'}</small></div>${isStandalone() ? '' : '<button class="btn btn-r sm" onclick="installApp()">ติดตั้ง</button>'}</div>
  <div class="set"><div><b>🏅 ชื่อบนใบประกาศ</b><small>${S.name ? esc(S.name) : 'ยังไม่ได้ตั้ง'}</small></div><button class="btn btn-g sm" onclick="editName()">แก้ไข</button></div>
  <div class="set"><div><b>🎓 ระดับชั้น</b><small>${esc(LEVELS[S.level].name)}</small></div><button class="btn btn-g sm" onclick="showProfiles()">เปลี่ยน</button></div>
  <div id="ins"></div></div>`;
  sh.classList.add("show");
}
function closeSheet() { $("#sheet").classList.remove("show"); }
$("#sheet").addEventListener("click", e => { if (e.target.id === "sheet") closeSheet(); });
function editName() {
  $("#ins").innerHTML = `<form class="set" onsubmit="event.preventDefault();S.name=$('#nm2').value.trim();save();openSettings();toast('บันทึกชื่อแล้ว')"><input id="nm2" class="inp" style="margin:0" maxlength="60" value="${esc(S.name)}" placeholder="ชื่อ–นามสกุล"><button class="btn btn-r sm" type="submit">บันทึก</button></form>`;
  $("#nm2").focus();
}
async function installApp() {
  if (deferredPrompt) { deferredPrompt.prompt(); try { await deferredPrompt.userChoice; } catch (e) {} deferredPrompt = null; return; }
  $("#ins").innerHTML = `<div class="howto">${isIOS()
    ? '<b>iPhone / iPad (Safari)</b><ol><li>กดปุ่ม <b>แชร์</b> (สี่เหลี่ยมมีลูกศรขึ้น) ด้านล่าง</li><li>เลื่อนหา <b>“เพิ่มไปยังหน้าจอโฮม”</b></li><li>กด <b>เพิ่ม</b></li></ol>'
    : '<b>Android (Chrome)</b><ol><li>กดเมนู <b>⋮</b> มุมขวาบน</li><li>เลือก <b>“ติดตั้งแอป”</b> หรือ <b>“เพิ่มลงในหน้าจอหลัก”</b></li></ol><b>คอมพิวเตอร์ (Chrome/Edge)</b><ol><li>กดไอคอน <b>ติดตั้ง</b> ท้ายช่องที่อยู่เว็บ</li></ol>'}</div>`;
}
if ("serviceWorker" in navigator && location.protocol === "https:" && !/claude|anthropic/.test(location.host)) {
  window.addEventListener("load", () => { navigator.serviceWorker.register("sw.js").catch(() => {}); });
}

/* ============ INIT ============ */
document.querySelectorAll("[data-v]").forEach(b => b.onclick = () => go(b.dataset.v));
$("#q").addEventListener("input", () => render(cur));
window.addEventListener("scroll", () => $("#nav").classList.toggle("solid", scrollY > 40));
applySize();
if (!LEVELS[S.level]) { S.level = "m3"; updXP(); render("home"); showProfiles(); }
else { updXP(); render("home"); }
