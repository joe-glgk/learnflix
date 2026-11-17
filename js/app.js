/* ============ STATE ============ */
const KEY = "learnflix_kn_v1";
let S = { level: null, done: {}, quiz: {}, list: [], xp: 0, recent: [] };
try { const r = localStorage.getItem(KEY); if (r) S = Object.assign(S, JSON.parse(r)); } catch (e) {}
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} };

COURSES.forEach(c => { c.id = c.level + "-" + c.code; c.quiz = c.quiz || []; });
const C = id => COURSES.find(c => c.id === id);
const $ = s => document.querySelector(s);
const esc = s => String(s ?? "").replace(/[&<>"']/g, m => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m]));
const TYPES = ["บังคับ", "เลือกบังคับ", "เลือกเสรี"];
const strand = c => STRANDS[c.code.slice(0, 2)] || { name: "รายวิชาอื่น ๆ", g: ["#444", "#111"] };
const mine = () => COURSES.filter(c => c.level === S.level);

/* แปลงลิงก์เป็นแบบฝังในหน้าเว็บ */
function canvaEmbed(u) { return u.split("?")[0].replace(/\/+$/, "") + "?embed"; }
function driveEmbed(u) { const m = u.match(/\/d\/([^/?#]+)/) || u.match(/[?&]id=([^&]+)/); return m ? "https://drive.google.com/file/d/" + m[1] + "/preview" : u; }

/* สิ่งที่ต้องศึกษาในแต่ละวิชา */
function items(c) {
  const a = [];
  if (c.canva) a.push({ k: "media", t: "สื่อการสอน", s: "สไลด์/สื่อนำเสนอจาก Canva", ic: "🎬", url: c.canva, embed: canvaEmbed(c.canva) });
  if (c.doc) a.push({ k: "doc", t: "เอกสารประกอบการเรียน", s: "หนังสือเรียน/เอกสาร PDF", ic: "📄", url: c.doc, embed: driveEmbed(c.doc) });
  if (c.quiz.length || c.quizUrl) a.push({ k: "quiz", t: "แบบทดสอบ", s: c.quiz.length ? c.quiz.length + " ข้อ · เกณฑ์ผ่าน 70%" : "แบบทดสอบออนไลน์", ic: "📝" });
  return a;
}
const isDone = (c, k) => k === "quiz" ? (c.quiz.length ? (S.quiz[c.id] ?? -1) >= 70 : !!S.done[c.id + "_quiz"]) : !!S.done[c.id + "_" + k];
function pct(c) { const it = items(c); if (!it.length) return 0; return Math.round(it.filter(i => isDone(c, i.k)).length / it.length * 100); }

function toast(t) { const el = $("#toast"); el.textContent = t; el.classList.add("show"); clearTimeout(el._t); el._t = setTimeout(() => el.classList.remove("show"), 2200); }
function updXP() { $("#xp").textContent = "⭐ " + S.xp + " XP"; const L = LEVELS[S.level]; if (L) { const b = $("#lvl"); b.innerHTML = L.ic + " " + L.short + " ▾"; b.style.background = `linear-gradient(135deg,${L.g[0]},${L.g[1]})`; } }

/* ============ PROFILE (เลือกระดับชั้น) ============ */
function showProfiles() {
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
function chips(c) { return `<div class="chips">${c.canva ? '<span class="chip">🎬 สื่อ</span>' : ''}${c.doc ? '<span class="chip">📄 เอกสาร</span>' : ''}${(c.quiz.length || c.quizUrl) ? '<span class="chip">📝 แบบทดสอบ</span>' : ''}</div>`; }
function card(c) {
  const p = pct(c), inList = S.list.includes(c.id);
  return `<div class="card" onclick="openCourse('${c.id}')">${poster(c)}
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

/* ============ HERO ============ */
let heroI = 0, heroTimer;
const heroList = () => { const m = mine(); const f = m.filter(c => c.canva); return (f.length ? f : m).slice(0, 5); };
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
function restartHero() { clearInterval(heroTimer); heroTimer = setInterval(() => { if (cur === "home" && !$("#q").value && !$("#ov").classList.contains("show") && !$("#player").classList.contains("show") && !$("#profiles").classList.contains("show")) setHero((heroI + 1) % heroList().length); }, 8000); }

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
    const r = COURSES.filter(c => (c.name + c.code + strand(c).name + c.type).toLowerCase().includes(q));
    h = `<div class="grid"><div class="ttl">ผลการค้นหา “${esc(q)}” (ทุกระดับชั้น)</div>${r.map(card).join("") || '<p style="color:var(--muted)">ไม่พบรายวิชาที่ตรงกับคำค้น</p>'}</div>`;
  } else if (v === "home") {
    const cont = S.recent.map(C).filter(c => c && c.level === S.level && pct(c) < 100);
    const strands = [...new Set(M.map(c => strand(c).name))];
    h = hero() + `<main>${row("▶ เรียนต่อจากที่ค้างไว้", cont, "สำหรับคุณ")}
     ${TYPES.map(t => row(`${t === "บังคับ" ? "📚" : t === "เลือกบังคับ" ? "🧩" : "🌈"} วิชา${t}`, M.filter(c => c.type === t), L.short)).join("")}
     ${row("❤️ รายการของฉัน", S.list.map(C).filter(c => c && c.level === S.level))}
     ${strands.map(s => row(s, M.filter(c => strand(c).name === s))).join("")}</main>`;
    restartHero();
  } else if (v === "courses") {
    h = `<div class="grid"><div class="ttl">รายวิชาทั้งหมด · ${esc(L.name)} (${M.length})</div>${TYPES.map(t => { const l = M.filter(c => c.type === t); return l.length ? `<div class="sec-t">วิชา${t} (${l.length})</div>${l.map(card).join("")}` : "" }).join("")}</div>`;
  } else if (v === "mylist") {
    const l = S.list.map(C).filter(Boolean);
    h = `<div class="grid"><div class="ttl">รายการของฉัน</div>${l.map(card).join("") || '<p style="color:var(--muted)">ยังไม่มีรายวิชาในรายการ กดปุ่ม + บนการ์ดเพื่อเพิ่ม</p>'}</div>`;
  } else if (v === "quiz") {
    const l = M.filter(c => c.quiz.length || c.quizUrl);
    h = `<div class="grid"><div class="ttl">แบบทดสอบ · ${esc(L.name)}</div>${l.map(c => { const s = S.quiz[c.id]; return `<div class="card" onclick="startQuiz('${c.id}')">${poster(c, `<div style="position:relative;font-size:13px;margin-top:4px">${c.quiz.length ? c.quiz.length + ' ข้อ · ' + (s != null ? 'คะแนนสูงสุด ' + s + '%' : 'ยังไม่เคยทำ') : 'แบบทดสอบออนไลน์'}</div>`)}${s != null ? `<div class="badge-n" style="left:auto;right:10px;background:${s >= 70 ? 'var(--ok)' : 'var(--warn)'}">${s >= 70 ? 'ผ่าน' : 'ลองใหม่'}</div>` : ''}</div>` }).join("") || '<p style="color:var(--muted)">ยังไม่มีแบบทดสอบในระดับชั้นนี้</p>'}</div>`;
  } else if (v === "progress") {
    const all = M.flatMap(c => items(c).map(i => isDone(c, i.k))), doneN = all.filter(Boolean).length;
    const qs = M.map(c => S.quiz[c.id]).filter(x => x != null), avg = qs.length ? Math.round(qs.reduce((a, b) => a + b, 0) / qs.length) : 0;
    const fin = M.filter(c => pct(c) === 100).length;
    h = `<div class="stats"><div class="stat"><b>⭐ ${S.xp}</b><span>XP สะสม</span></div><div class="stat"><b>${doneN}/${all.length}</b><span>สื่อ/เอกสารที่ศึกษาแล้ว</span></div><div class="stat"><b>${fin}/${M.length}</b><span>รายวิชาที่ศึกษาครบ</span></div><div class="stat"><b>${qs.length ? avg + '%' : '—'}</b><span>คะแนนแบบทดสอบเฉลี่ย</span></div></div>
    <div style="padding:10px 4vw 60px"><h3 style="margin-bottom:6px">${esc(L.name)}</h3>${M.map(c => { const p = pct(c); return `<div class="ep" onclick="openCourse('${c.id}')"><div class="th" style="background:linear-gradient(135deg,${strand(c).g[0]},${strand(c).g[1]})">${c.ic || "📘"}</div><div class="info"><h4>${esc(c.name)} <span>${esc(c.code)} · ${p}%</span></h4><div class="bar" style="margin:8px 0"><i style="width:${p}%"></i></div><p>วิชา${esc(c.type)}${S.quiz[c.id] != null ? ' · แบบทดสอบ ' + S.quiz[c.id] + '%' : ''}</p></div></div>` }).join("")}
    <button class="btn btn-g" style="margin-top:20px" onclick="resetAll()">↺ ล้างความก้าวหน้าทั้งหมด</button></div>`;
  }
  $("#view").innerHTML = h + `<footer>LearnFlix · คลังสื่อการเรียนรู้ด้วยตนเอง · ${esc(L.name)}</footer>`;
  window.scrollTo(0, 0);
}
let resetArm = 0;
function resetAll() { if (Date.now() - resetArm > 3000) { resetArm = Date.now(); toast("กดอีกครั้งเพื่อยืนยันการล้างข้อมูล"); return; } const lv = S.level; S = { level: lv, done: {}, quiz: {}, list: [], xp: 0, recent: [] }; save(); updXP(); render(); toast("ล้างข้อมูลแล้ว"); }

/* ============ COURSE MODAL ============ */
function openCourse(id) {
  const c = C(id), p = pct(c), inList = S.list.includes(id), it = items(c);
  $("#modal").innerHTML = `<div class="m-hero">${poster(c, `<div class="btns">${it.length ? `<button class="btn btn-w" onclick="resume('${id}')">▶ ${p > 0 && p < 100 ? 'เรียนต่อ' : p === 100 ? 'ทบทวน' : 'เริ่มเรียน'}</button>` : ''}<button class="circ" style="width:44px;height:44px;font-size:18px" onclick="toggleList('${id}');openCourse('${id}')">${inList ? '✓' : '+'}</button></div>`)}<button class="x" onclick="closeOv()">✕</button></div>
  <div class="m-body"><div class="m-grid"><div><div class="meta"><span class="pill">${esc(c.code)}</span><span>วิชา${esc(c.type)}</span>${p ? `<span class="match">ศึกษาแล้ว ${p}%</span>` : ''}</div>
  <p>รายวิชา${esc(c.name)} (${esc(c.code)}) ${esc(LEVELS[c.level].name)} เลือกศึกษาสื่อการสอนและเอกสารประกอบการเรียนได้ตามลำดับ เมื่อศึกษาจบแล้วกด “ศึกษาจบแล้ว” เพื่อบันทึกความก้าวหน้า</p></div>
  <div class="m-side"><div><b>ระดับชั้น:</b> ${esc(LEVELS[c.level].name)}</div><div><b>ประเภท:</b> วิชา${esc(c.type)}</div><div><b>สาระ:</b> ${esc(strand(c).name)}</div><div><b>แบบทดสอบ:</b> ${S.quiz[id] != null ? S.quiz[id] + '%' : (c.quiz.length || c.quizUrl) ? 'ยังไม่ได้ทำ' : 'ยังไม่มี'}</div></div></div>
  <div class="tabs"><button class="on">เนื้อหาในรายวิชา</button></div>
  ${it.map((x, i) => { const d = isDone(c, x.k); return `<div class="ep" onclick="${x.k === 'quiz' ? `startQuiz('${id}')` : `view('${id}','${x.k}')`}"><div class="n">${i + 1}</div><div class="th" style="background:linear-gradient(135deg,${strand(c).g[0]},${strand(c).g[1]})">${d ? '✅' : x.ic}</div><div class="info"><h4>${x.t}<span>${d ? '<span class="done">ศึกษาแล้ว</span>' : ''}</span></h4><p>${x.s}</p></div></div>` }).join("")}
  ${!(c.quiz.length || c.quizUrl) ? `<div class="ep dis"><div class="n">${it.length + 1}</div><div class="th" style="background:#2b2b36">📝</div><div class="info"><h4>แบบทดสอบ</h4><p>ผู้สอนกำลังจัดเตรียม เร็ว ๆ นี้</p></div></div>` : ''}
  </div>`;
  $("#ov").classList.add("show"); document.body.style.overflow = "hidden";
}
function closeOv() { $("#ov").classList.remove("show"); document.body.style.overflow = ""; render(); }
$("#ov").addEventListener("click", e => { if (e.target.id === "ov") closeOv(); });
function toggleList(id) { const i = S.list.indexOf(id); if (i >= 0) { S.list.splice(i, 1); toast("นำออกจากรายการแล้ว"); } else { S.list.push(id); toast("เพิ่มในรายการของฉันแล้ว ❤️"); } save(); if (!$("#ov").classList.contains("show")) render(); }
function resume(id) { const c = C(id), it = items(c); if (!it.length) return openCourse(id); const n = it.find(x => !isDone(c, x.k)) || it[0]; n.k === "quiz" ? startQuiz(id) : view(id, n.k); }

/* ============ VIEWER (สื่อ Canva / เอกสาร Drive) ============ */
let P = {};
function view(id, k) {
  const c = C(id), it = items(c), x = it.find(i => i.k === k); if (!x) return;
  P = { id, k }; Q = {};
  S.recent = [id, ...S.recent.filter(r => r !== id)].slice(0, 10); save();
  const idx = it.indexOf(x), next = it[idx + 1], d = isDone(c, k);
  $("#player").innerHTML = `<div class="p-top"><button class="circ" onclick="closePlayer()">←</button><h3>${x.ic} ${x.t}<small>${esc(c.code)} ${esc(c.name)}</small></h3>
   <a class="btn btn-g btn-l" style="margin-left:auto;font-size:14px;padding:8px 14px" href="${esc(x.url)}" target="_blank" rel="noopener">เปิดในแท็บใหม่ ↗</a></div>
  <div class="viewer" style="padding-top:14px"><iframe src="${esc(x.embed)}" allow="fullscreen; autoplay" allowfullscreen loading="lazy" title="${esc(x.t)}"></iframe>
   <div class="vhint">ถ้าเนื้อหาไม่แสดง กด <a href="${esc(x.url)}" target="_blank" rel="noopener">เปิดในแท็บใหม่</a></div></div>
  <div class="p-foot"><button class="btn ${d ? 'btn-g' : 'btn-r'}" onclick="markDone()">${d ? '✓ ศึกษาจบแล้ว' : '✓ ศึกษาจบแล้ว (+20 XP)'}</button>
   ${next ? `<button class="btn btn-w" onclick="${next.k === 'quiz' ? `startQuiz('${id}')` : `view('${id}','${next.k}')`}">ถัดไป: ${next.t} ›</button>` : ''}</div>`;
  $("#player").classList.add("show"); document.body.style.overflow = "hidden";
}
function markDone() {
  const { id, k } = P, key = id + "_" + k;
  if (!S.done[key]) { S.done[key] = 1; S.xp += 20; save(); updXP(); toast("+20 XP บันทึกความก้าวหน้าแล้ว 🎉"); }
  view(id, k);
}
function closePlayer() { const id = P.id || Q.id; $("#player").innerHTML = ""; $("#player").classList.remove("show"); document.body.style.overflow = ""; P = {}; Q = {}; if ($("#ov").classList.contains("show") && id) openCourse(id); else render(); }
document.addEventListener("keydown", e => { if (e.key !== "Escape") return; if ($("#player").classList.contains("show")) closePlayer(); else if ($("#ov").classList.contains("show")) closeOv(); });

/* ============ QUIZ ============ */
let Q = {};
function startQuiz(id) {
  const c = C(id);
  if (!c.quiz.length && c.quizUrl) {
    P = { id, k: "quiz" };
    $("#player").innerHTML = `<div class="p-top"><button class="circ" onclick="closePlayer()">←</button><h3>📝 แบบทดสอบ<small>${esc(c.code)} ${esc(c.name)}</small></h3></div>
    <div class="p-main"><div class="result"><div style="font-size:70px">📝</div><h2>แบบทดสอบออนไลน์</h2><p>แบบทดสอบของวิชานี้อยู่ในแบบฟอร์มออนไลน์ เมื่อทำเสร็จแล้วกลับมากดบันทึก</p>
    <div class="btns" style="justify-content:center"><a class="btn btn-r btn-l" href="${esc(c.quizUrl)}" target="_blank" rel="noopener">เปิดแบบทดสอบ ↗</a><button class="btn btn-g" onclick="markDone()">✓ ทำเสร็จแล้ว</button></div></div></div>`;
    $("#player").classList.add("show"); document.body.style.overflow = "hidden"; return;
  }
  if (!c.quiz.length) return toast("วิชานี้ยังไม่มีแบบทดสอบ");
  Q = { id, n: 0, score: 0, ans: null }; P = {}; S.recent = [id, ...S.recent.filter(r => r !== id)].slice(0, 10); save(); drawQ();
}
function drawQ() {
  const c = C(Q.id), it = c.quiz[Q.n];
  $("#player").innerHTML = `<div class="p-top"><button class="circ" onclick="closePlayer()">✕</button><h3>แบบทดสอบ: ${esc(c.name)}<small>${esc(c.code)} · ข้อ ${Q.n + 1} จาก ${c.quiz.length}</small></h3></div>
  <div class="p-main"><div class="q-card"><div class="bar" style="margin-bottom:20px"><i style="width:${(Q.n / c.quiz.length) * 100}%"></i></div>
  <div class="q-head"><span>คำถามที่ ${Q.n + 1}</span><span>ถูก ${Q.score} ข้อ</span></div><h2>${esc(it.q)}</h2>
  ${it.o.map((o, k) => { let cls = ""; if (Q.ans != null) { if (k === it.a) cls = "right"; else if (k === Q.ans) cls = "wrong"; } return `<button class="opt ${cls}" ${Q.ans != null ? 'disabled' : ''} onclick="pick(${k})"><span class="k">${"กขคงจ"[k]}</span>${esc(o)}</button>` }).join("")}
  ${Q.ans != null ? `<div class="exp"><b>${Q.ans === it.a ? '✅ ถูกต้อง!' : '❌ ยังไม่ถูก'}</b> ${esc(it.e || "")}</div><button class="btn btn-r" onclick="nextQ()">${Q.n < c.quiz.length - 1 ? 'ข้อถัดไป ›' : 'ดูผลคะแนน'}</button>` : ''}
  </div></div>`;
  $("#player").classList.add("show"); document.body.style.overflow = "hidden";
}
function pick(k) { if (Q.ans != null) return; Q.ans = k; if (k === C(Q.id).quiz[Q.n].a) Q.score++; drawQ(); }
function nextQ() { const c = C(Q.id); Q.ans = null; if (Q.n < c.quiz.length - 1) { Q.n++; drawQ(); } else showResult(); }
function showResult() {
  const c = C(Q.id), p = Math.round(Q.score / c.quiz.length * 100), pass = p >= 70, gain = Q.score * 10;
  const best = S.quiz[Q.id]; S.quiz[Q.id] = Math.max(best ?? 0, p); S.xp += gain; save(); updXP();
  const r = 70, cir = 2 * Math.PI * r;
  $("#player").innerHTML = `<div class="p-top"><button class="circ" onclick="closePlayer()">✕</button><h3>ผลการทดสอบ<small>${esc(c.code)} ${esc(c.name)}</small></h3></div>
  <div class="p-main"><div class="result"><div class="ring"><svg width="170" height="170"><circle cx="85" cy="85" r="${r}" stroke="#2b2b36" stroke-width="12" fill="none"/><circle cx="85" cy="85" r="${r}" stroke="${pass ? '#22c55e' : '#f59e0b'}" stroke-width="12" fill="none" stroke-linecap="round" stroke-dasharray="${cir}" stroke-dashoffset="${cir}" id="rg" style="transition:stroke-dashoffset 1.2s ease"/></svg><b>${p}%</b></div>
  <h2>${pass ? '🎉 ยอดเยี่ยม! ผ่านแล้ว' : '💪 เกือบแล้ว ลองอีกครั้ง'}</h2><p>ตอบถูก ${Q.score} จาก ${c.quiz.length} ข้อ · ได้รับ +${gain} XP${best != null ? ` · คะแนนสูงสุดเดิม ${best}%` : ''}</p>
  <div class="btns" style="justify-content:center"><button class="btn btn-r" onclick="startQuiz('${c.id}')">↺ ทำใหม่</button><button class="btn btn-g" onclick="closePlayer();openCourse('${c.id}')">กลับไปที่รายวิชา</button></div></div></div>`;
  requestAnimationFrame(() => setTimeout(() => { const g = document.getElementById("rg"); if (g) g.style.strokeDashoffset = cir * (1 - p / 100); }, 50));
}

/* ============ INIT ============ */
document.querySelectorAll("[data-v]").forEach(b => b.onclick = () => go(b.dataset.v));
$("#q").addEventListener("input", () => render(cur));
window.addEventListener("scroll", () => $("#nav").classList.toggle("solid", scrollY > 40));
if (!LEVELS[S.level]) { S.level = "m3"; updXP(); render("home"); showProfiles(); }
else { updXP(); render("home"); }
