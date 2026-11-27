// Model 3D fasilitas umum (masjid, lapangan, gym, playground, gerbang). Proporsi dan detail dari foto render
// di assets/renders/. Bagian atas file = perpustakaan detail (tekstur, tanaman, perabot); di bawahnya 7 model.
import * as THREE from "./vendor/three.module.js";
import { canvasTex, litMat, box } from "./house3d.js";
import { mk, car, person, bush } from "./house3d-more.js";

const M = (c, r = .85, o = {}) => new THREE.MeshStandardMaterial({ color: c, roughness: r, ...o });
const glowM = (c, k = 1) => new THREE.MeshStandardMaterial({ color: c, emissive: c, emissiveIntensity: k, roughness: .6 });
const rnd = (() => { let s = 1337; return () => (s = (s * 16807) % 2147483647) / 2147483647; })();
const rep = (t, x, y) => { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(x, y); return t; };

// ---------- tekstur ----------
function grassTex(rx = 20, ry = 20) {
  return rep(canvasTex(256, 256, (c, w, h) => {
    c.fillStyle = "#5f8f45"; c.fillRect(0, 0, w, h);
    for (let i = 0; i < 2600; i++) { c.fillStyle = ["#6da24d", "#527f3b", "#79b055", "#4a7435"][i % 4]; c.fillRect(rnd() * w, rnd() * h, 2, 3 + rnd() * 3); }
  }), rx, ry);
}
function pavTex(rx = 20, ry = 20, a = "#6c6e75", b = "#5c5e66") {          // paving herringbone
  return rep(canvasTex(256, 256, (c, w, h) => {
    c.fillStyle = "#4a4c52"; c.fillRect(0, 0, w, h);
    for (let y = 0; y < h; y += 32) for (let x = 0; x < w; x += 32) {
      const o = ((x + y) / 32) % 2;
      c.fillStyle = (x / 32 + y / 32) % 3 ? a : b;
      if (o) { c.fillRect(x + 1, y + 1, 30, 14); c.fillRect(x + 1, y + 17, 30, 14); } else { c.fillRect(x + 1, y + 1, 14, 30); c.fillRect(x + 17, y + 1, 14, 30); }
    }
  }), rx, ry);
}
function cobbleTex(rx = 4, ry = 4) {
  return rep(canvasTex(256, 256, (c, w, h) => {
    c.fillStyle = "#5a554e"; c.fillRect(0, 0, w, h);
    for (let i = 0; i < 260; i++) { const x = rnd() * w, y = rnd() * h, r = 8 + rnd() * 9; c.fillStyle = ["#9a9488", "#8a8478", "#a39c8f", "#7d776c"][i % 4];
      c.beginPath(); c.ellipse(x, y, r, r * (.65 + rnd() * .3), rnd() * 3, 0, 7); c.fill(); }
  }), rx, ry);
}
function graniteTex(rx = 4, ry = 1, panelW = 64, panelH = 128) {          // panel granit abu dengan alur
  return rep(canvasTex(256, 256, (c, w, h) => {
    c.fillStyle = "#8c8a86"; c.fillRect(0, 0, w, h);
    for (let i = 0; i < 1800; i++) { c.fillStyle = ["#9b9994", "#7b7975", "#a7a5a0"][i % 3]; c.fillRect(rnd() * w, rnd() * h, 2, 2); }
    c.strokeStyle = "#5d5b58"; c.lineWidth = 3;
    for (let x = 0; x <= w; x += panelW) { c.beginPath(); c.moveTo(x, 0); c.lineTo(x, h); c.stroke(); }
    for (let y = 0; y <= h; y += panelH) { c.beginPath(); c.moveTo(0, y); c.lineTo(w, y); c.stroke(); }
    c.strokeStyle = "rgba(60,58,55,.55)"; c.lineWidth = 1.5; for (let x = 8; x < w; x += panelW / 4) { c.beginPath(); c.moveTo(x, 0); c.lineTo(x, h); c.stroke(); }
  }), rx, ry);
}
function travertineTex(rx = 4, ry = 1) {                                 // batu travertin bergaris horizontal
  return rep(canvasTex(256, 256, (c, w, h) => {
    c.fillStyle = "#9a948a"; c.fillRect(0, 0, w, h);
    for (let y = 0; y < h; y += 16) { c.fillStyle = (y / 16) % 3 ? "#8a847a" : "#a8a297"; c.fillRect(0, y, w, 9 + rnd() * 4); }
    c.strokeStyle = "#6e695f"; c.lineWidth = 2; for (let y = 0; y <= h; y += 64) { c.beginPath(); c.moveTo(0, y); c.lineTo(w, y); c.stroke(); }
    for (let x = 0; x <= w; x += 128) { c.beginPath(); c.moveTo(x, 0); c.lineTo(x, h); c.stroke(); }
  }), rx, ry);
}
function woodTex(rx = 6, ry = 1, vertical = true, a = "#6d5646", b = "#5a4638", step = 10) {
  return rep(canvasTex(128, 128, (c, w, h) => {
    for (let i = 0; i < w; i += step) { c.fillStyle = (i / step) % 2 ? b : a; if (vertical) c.fillRect(i, 0, step - 1, h); else c.fillRect(0, i, w, step - 1); }
    for (let i = 0; i < 160; i++) { c.fillStyle = "rgba(40,25,15,.18)"; if (vertical) c.fillRect(rnd() * w, rnd() * h, 1, 8 + rnd() * 18); else c.fillRect(rnd() * w, rnd() * h, 8 + rnd() * 18, 1); }
  }), rx, ry);
}
const matTex = (t, r = .9, o = {}) => new THREE.MeshStandardMaterial({ map: t, roughness: r, ...o });
function frondTex(fan) {
  return canvasTex(128, 256, (c, w, h) => {
    c.clearRect(0, 0, w, h);
    if (fan) { c.fillStyle = "#4f7a35"; for (let i = 0; i < 22; i++) { const a = -Math.PI * .46 + i * (Math.PI * .92 / 21); c.beginPath(); c.moveTo(w / 2, h); c.lineTo(w / 2 + Math.sin(a) * w * .6 - 3, h - Math.cos(a) * h * .96); c.lineTo(w / 2 + Math.sin(a) * w * .6 + 3, h - Math.cos(a) * h * .96); c.closePath(); c.fill(); } }
    else {
      c.strokeStyle = "#3f6a2a"; c.lineWidth = 3; c.beginPath(); c.moveTo(w / 2, h); c.lineTo(w / 2, 0); c.stroke();
      for (let y = 10; y < h; y += 6) { const t = 1 - y / h, ln = w * .48 * (.35 + .65 * Math.sin(Math.PI * (1 - t) * .95 + .12)); c.fillStyle = "#4f8a36"; c.beginPath();
        c.moveTo(w / 2, y); c.lineTo(w / 2 - ln, y + 14); c.lineTo(w / 2 - ln + 2, y + 16); c.lineTo(w / 2, y + 3); c.closePath(); c.fill();
        c.beginPath(); c.moveTo(w / 2, y); c.lineTo(w / 2 + ln, y + 14); c.lineTo(w / 2 + ln - 2, y + 16); c.lineTo(w / 2, y + 3); c.closePath(); c.fill(); }
    }
  });
}
const FROND = { pin: null, fan: null };
function frondMat(fan) { if (!FROND[fan ? "fan" : "pin"]) FROND[fan ? "fan" : "pin"] = new THREE.MeshStandardMaterial({ map: frondTex(fan), alphaTest: .4, side: THREE.DoubleSide, roughness: .8 }); return FROND[fan ? "fan" : "pin"]; }
function frondGeo(len, w, sag, segs = 8) {
  const pos = [], uv = [], idx = [];
  for (let i = 0; i <= segs; i++) { const t = i / segs, z = len * t, y = .5 * Math.sin(Math.PI * t * .6) - sag * t * t, wd = w * (.25 + .75 * Math.sin(Math.PI * Math.min(1, t * .9 + .08)));
    pos.push(-wd, y, z, wd, y, z); uv.push(0, 1 - t, 1, 1 - t); if (i < segs) { const k = i * 2; idx.push(k, k + 1, k + 2, k + 1, k + 3, k + 2); } }
  const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2)); g.setIndex(idx); g.computeVertexNormals(); return g;
}

// ---------- tumbuhan ----------
function groundPlane(g, col = 0x6b8f4a, size = 260) { const p = new THREE.Mesh(new THREE.PlaneGeometry(size, size), matTex(grassTex(size / 6, size / 6), 1)); p.rotation.x = -Math.PI / 2; p.receiveShadow = true; g.add(p); return p; }
function slab(g, w, d, x, z, mat, y = .03, h = .06) { const m = box(w, h, d, mat, x, y, z, false); g.add(m); return m; }
function palm(g, x, z, h = 10, o = {}) {
  const { fan = false, lean = 0 } = o, p = new THREE.Group();
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(fan ? .32 : .17, fan ? .46 : .27, h, 10, 6), matTex(rep(canvasTex(64, 128, (c, w, hh) => { c.fillStyle = fan ? "#7a6a58" : "#8d8070"; c.fillRect(0, 0, w, hh); c.fillStyle = fan ? "#5f5142" : "#6f6355"; for (let y = 0; y < hh; y += 10) c.fillRect(0, y, w, 3); }), 2, h / 1.2), .95));
  trunk.position.y = h / 2; trunk.castShadow = true; p.add(trunk);
  const crown = new THREE.Group(); crown.position.y = h; p.add(crown);
  const n = fan ? 16 : 13;
  for (let i = 0; i < n; i++) {
    const a = i / n * Math.PI * 2 + rnd() * .2, up = i % 3 === 0;
    const fr = fan ? new THREE.Mesh(new THREE.PlaneGeometry(4.2, 3.8).translate(0, 1.9, 0), frondMat(true)) : new THREE.Mesh(frondGeo(4.2 + rnd() * .8, .95, 1.8 + rnd() * 1.2), frondMat(false));
    const pivot = new THREE.Group(); pivot.rotation.y = a;
    if (fan) { fr.rotation.x = Math.PI / 2 + .15 + (i % 3) * .28; fr.position.set(0, -.1 - (i % 3) * .1, .55); }
    else fr.rotation.x = -(up ? .15 : .1) - (i % 3) * .08;
    pivot.add(fr); fr.castShadow = true; crown.add(pivot);
  }
  if (fan) { const sk = new THREE.Mesh(new THREE.CylinderGeometry(.5, .85, 3.4, 12), M(0x735a3a, 1)); sk.position.y = -1.9; crown.add(sk); }
  else for (let k = 0; k < 4; k++) { const cc = new THREE.Mesh(new THREE.SphereGeometry(.18, 8, 6), M(0xc7452a)); cc.position.set(Math.cos(k * 1.6) * .25, -.3, Math.sin(k * 1.6) * .25); crown.add(cc); }
  p.position.set(x, 0, z); p.rotation.z = lean; g.add(p);
}
function leafTree(g, x, z, h = 8, o = {}) {
  const { cols = [0x4f7d36, 0x5f9142, 0x3f6a2e, 0x6fa44a], spread = 2.6 } = o, t = new THREE.Group();
  const tr = new THREE.Mesh(new THREE.CylinderGeometry(.14, .27, h * .62, 8), M(0x5b4a3c, 1)); tr.position.y = h * .31; tr.castShadow = true; t.add(tr);
  for (let k = 0; k < 30; k++) { const a = k * 2.399, r = Math.sqrt(rnd()) * spread, f = new THREE.Mesh(new THREE.IcosahedronGeometry(.7 + rnd() * .8, 1), M(cols[k % cols.length], 1));
    f.position.set(Math.cos(a) * r, h * .58 + rnd() * h * .42 - (r > spread * .6 ? .5 : 0), Math.sin(a) * r); f.scale.y = .78; f.castShadow = true; t.add(f); }
  t.position.set(x, 0, z); g.add(t);
}
function blossom(g, x, z, h = 6, col = 0xb572c9) { leafTree(g, x, z, h, { cols: [col, 0xd49be0, 0xc07ad4, 0xe0b4ec], spread: 2.2 }); }
function leafyBush(g, x, z, r = 1, col = 0x3f8a3a) { for (let k = 0; k < 9; k++) { const b = new THREE.Mesh(new THREE.ConeGeometry(.3, 1.8 * r, 5), M(k % 2 ? col : 0x5aa045, 1)); const a = k * 0.7; b.position.set(x + Math.cos(a) * .4 * r, .8 * r, z + Math.sin(a) * .4 * r); b.rotation.set(Math.sin(a) * .55, 0, -Math.cos(a) * .55); b.castShadow = true; g.add(b); } }
function grassClump(g, x, z, col = 0xc9a0b8, r = .5) { for (let k = 0; k < 6; k++) { const b = new THREE.Mesh(new THREE.ConeGeometry(.09, .7 * r + .2, 4), M(k % 3 ? col : 0x8aa060, 1)); const a = k * 1.05; b.position.set(x + Math.cos(a) * .12 * r, .3, z + Math.sin(a) * .12 * r); b.rotation.set(Math.sin(a) * .35, 0, Math.cos(a) * .35); g.add(b); } }
function flowerBed(g, x, z, w, d, cols) { for (let i = 0; i < w * d * 3; i++) { const b = new THREE.Mesh(new THREE.IcosahedronGeometry(.1 + rnd() * .08, 0), M(cols[i % cols.length], 1)); b.position.set(x + (rnd() - .5) * w, .25 + rnd() * .2, z + (rnd() - .5) * d); g.add(b); }
  for (let i = 0; i < w * d * 1.5; i++) { const b = new THREE.Mesh(new THREE.IcosahedronGeometry(.22, 0), M(0x3f7a35, 1)); b.position.set(x + (rnd() - .5) * w, .12, z + (rnd() - .5) * d); g.add(b); } }
function hedge(g, x, z, w, d = .8, h = .8, col = 0x3f8a3a) { for (let i = 0; i < w / .5; i++) { const b = new THREE.Mesh(new THREE.IcosahedronGeometry(d * .6 + rnd() * .12, 1), M(i % 3 ? col : 0x4f9a42, 1)); b.position.set(x - w / 2 + i * .5, h * .5, z + (rnd() - .5) * .1); b.scale.y = h / (d * 1.2); b.castShadow = true; g.add(b); } }

// ---------- perabot & detail ----------
function lampPost(g, x, z, h = 3.6, glow = 1) { g.add(box(.1, h, .1, M(0x2a2a2e), x, h / 2, z)); const l = new THREE.Mesh(new THREE.SphereGeometry(.22, 12, 10), glowM(0xffe2a0, glow)); l.position.set(x, h + .1, z); g.add(l); }
function bollard(g, x, z, c = 0xe9e9e9) { const b = new THREE.Mesh(new THREE.CylinderGeometry(.09, .09, .6, 8), glowM(c, .5)); b.position.set(x, .3, z); g.add(b); }
function bench(g, x, z, rot = 0, w = 2.2, wood = 0x8a5f3a) { const b = new THREE.Group(); b.add(box(w, .08, .5, M(wood), 0, .46, 0)); b.add(box(w, .35, .06, M(wood), 0, .75, -.24)); [-1, 1].forEach((s) => b.add(box(.08, .46, .45, M(0x2a2a2e), s * (w / 2 - .12), .23, 0))); b.position.set(x, 0, z); b.rotation.y = rot; g.add(b); }
function bicycle(g, x, z, rot = 0, rider = null) {
  const b = new THREE.Group(), fr = M(0x3a86c8, .4), tire = M(0x151515);
  [-.55, .55].forEach((dx) => { const w = new THREE.Mesh(new THREE.TorusGeometry(.34, .03, 8, 20), tire); w.position.set(dx, .36, 0); b.add(w); });
  const bar = (x1, y1, x2, y2) => { const l = Math.hypot(x2 - x1, y2 - y1), m = new THREE.Mesh(new THREE.CylinderGeometry(.025, .025, l, 6), fr); m.position.set((x1 + x2) / 2, (y1 + y2) / 2, 0); m.rotation.z = Math.atan2(x2 - x1, -(y2 - y1)) + Math.PI; b.add(m); };
  bar(-.55, .36, -.1, .62); bar(-.1, .62, .4, .66); bar(.55, .36, .4, .66); bar(-.1, .62, -.05, .36); bar(-.05, .36, -.55, .36); b.add(box(.3, .05, .12, M(0x222222), -.15, .72, 0)); b.add(box(.05, .05, .5, M(0x222222), .45, .78, 0));
  b.position.set(x, 0, z); b.rotation.y = rot; g.add(b);
}
function gableHouse(g, x, z, w = 7, d = 10, h = 5, roof = 0x353c4b, wall = 0xe4e6ee, rotY = 0) {
  const grp = new THREE.Group();
  grp.add(box(w, h, d, M(wall), 0, h / 2, 0));
  const sh = new THREE.Shape(); [[-w / 2, 0], [w / 2, 0], [0, w * .4]].forEach(([a, b], i) => i ? sh.lineTo(a, b) : sh.moveTo(a, b));
  const gb = new THREE.Mesh(new THREE.ExtrudeGeometry(sh, { depth: d, bevelEnabled: false }), M(wall)); gb.position.set(0, h, -d / 2); grp.add(gb);
  const slate = rep(canvasTex(128, 128, (c, ww, hh) => { c.fillStyle = "#4f5768"; c.fillRect(0, 0, ww, hh); c.fillStyle = "#3b4252"; for (let y = 0; y < hh; y += 12) c.fillRect(0, y, ww, 2); }), 3, 3);
  [-1, 1].forEach((s) => { const r = box(Math.hypot(w / 2, w * .4) + .3, .16, d + .4, matTex(slate, .6), s * w / 4, h + w * .2 + .06, 0); r.rotation.z = -s * Math.atan2(w * .4, w / 2); grp.add(r); });
  grp.add(box(w * .35, 1.3, .06, glowM(0xffd896, .9), 0, h * .75, d / 2 + .02));
  grp.position.set(x, 0, z); grp.rotation.y = rotY; g.add(grp);
}
function letters(g, text, w, h, x, y, z, color, glow = 0, font = "bold 300px 'Helvetica Neue', Arial, sans-serif", rotY = 0, depth = 5) {
  const t = canvasTex(2048, Math.round(2048 * h / w), (c, cw, ch) => {
    c.clearRect(0, 0, cw, ch); c.fillStyle = color; let fs = 460; c.font = font.replace(/\d+px/, fs + "px"); c.textAlign = "center"; c.textBaseline = "middle";
    while (c.measureText(text).width > cw * .97 && fs > 20) { fs -= 8; c.font = font.replace(/\d+px/, fs + "px"); }
    c.fillText(text, cw / 2, ch / 2 + fs * .04);
  });
  const mat = new THREE.MeshStandardMaterial({ map: t, transparent: true, alphaTest: .35, side: THREE.DoubleSide, emissive: glow ? new THREE.Color(color) : 0x000000, emissiveMap: glow ? t : null, emissiveIntensity: glow });
  for (let k = 0; k < depth; k++) { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat); m.position.set(x, y, z + (k - depth / 2) * .05); m.rotation.y = rotY; g.add(m); }
}
function windowGlow(g, w, h, x, y, z, frame = 0x2a2c32, glow = 0xffd896, k = .9) { g.add(box(w + .16, h + .16, .08, M(frame), x, y, z)); const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), glowM(glow, k)); m.position.set(x, y, z + .05); g.add(m); }
function terraceTrees(g, z, from, to, step, h) { for (let x = from; x <= to; x += step) leafTree(g, x, z - rnd() * 3, h + rnd() * 3, { spread: 3 }); }

// =====================================================================================
//  MASJID AN-NUR
// =====================================================================================
function buildMasjid() {
  const g = new THREE.Group(); groundPlane(g);
  const road = new THREE.Mesh(new THREE.PlaneGeometry(120, 32), matTex(pavTex(40, 11), .95)); road.rotation.x = -Math.PI / 2; road.position.set(0, .02, 17); g.add(road);
  slab(g, 70, 3, -8, 8.5, M(0xb9b9b6), .08, .16);                                                              // trotoar
  const white = M(0xf2f2f4, .8), cream = M(0xe9e6df, .85), grey = M(0x58595f, .8), dark = M(0x2a2b30, .6);
  // blok A (teras berlengkung)
  const archTex = (glow) => canvasTex(1024, 720, (c, w, h) => {
    const X = (u) => u * w, Y = (v) => (1 - v) * h;
    const arch = (u0, u1, top, v0 = .03) => { const r = (u1 - u0) / 2 * w, cx = X((u0 + u1) / 2); c.beginPath(); c.moveTo(X(u0), Y(v0)); c.lineTo(X(u0), Y(top) + r); c.arc(cx, Y(top) + r, r, Math.PI, 0); c.lineTo(X(u1), Y(v0)); c.closePath(); };
    c.fillStyle = glow ? "#000" : "#f3f3f6"; c.fillRect(0, 0, w, h);
    [[.09, .39], [.50, .81]].forEach(([u0, u1], i) => {
      if (!glow) { arch(u0 - .025, u1 + .025, .74); c.fillStyle = "#6b655e"; c.fill(); }
      arch(u0, u1, .71); const gr = c.createLinearGradient(0, Y(.7), 0, Y(.05)); gr.addColorStop(0, glow ? "#ffe6b0" : "#f9deaa"); gr.addColorStop(1, "#f2b968");
      c.fillStyle = gr; c.fill();
      c.save(); arch(u0, u1, .71); c.clip();
      if (i === 0) { c.fillStyle = glow ? "#e7c07a" : "#d8ae6e"; c.beginPath(); c.moveTo(X(u0), Y(.03)); c.lineTo(X(u0 + .1), Y(.12)); c.lineTo(X(u0 + .1), Y(.62)); c.lineTo(X(u0), Y(.71)); c.fill(); c.fillStyle = glow ? "#3a2a18" : "#6b5a48"; c.fillRect(X(u0 + .1), Y(.62), X(.012), Y(.12) - Y(.62)); }
      else {
        c.fillStyle = glow ? "#8a5a25" : "#7a5a3a"; for (let u = u0; u < u1; u += .016) c.fillRect(X(u), Y(.71), X(.007), Y(.5) - Y(.71));           // langit-langit kisi kayu
        c.fillStyle = glow ? "#1a1a1c" : "#202228"; c.fillRect(X(u0 + .02), Y(.5), X(u1 - u0 - .04), Y(.05) - Y(.5));                          // pintu kaca
        c.fillStyle = glow ? "#ffe3a8" : "#e8e3d8"; c.fillRect(X(u0 + .055), Y(.46), X(.07), Y(.09) - Y(.46)); c.fillRect(X(u0 + .165), Y(.46), X(.07), Y(.09) - Y(.46));
      }
      c.restore();
    });
    c.fillStyle = glow ? "#000" : "#cfcbc3"; for (let i = 0; i < 3; i++) c.fillRect(X(.06 - i * .01), Y(.045 - i * .015), X(.78 + i * .02), Y(.03) - Y(.045));
  });
  const Ab = box(9.6, 6.7, 6, white, -12.2, 3.35, 3); g.add(Ab);
  const A = new THREE.Mesh(new THREE.PlaneGeometry(9.6, 6.7), litMat([archTex(false), archTex(true)])); A.position.set(-12.2, 3.35, 6.02); g.add(A);
  g.add(box(10.2, .22, 6.6, grey, -12.2, 6.8, 3)); g.add(box(10.0, .12, 6.3, cream, -12.2, 6.95, 3));
  [0, 1, 2].forEach((i) => g.add(box(9.5 - i * .5, .16, .55 + i * .3, M(0xcfcbc3), -12.2, .08 + i * .16, 6.35 + (2 - i) * .1, false)));
  [[-15.2, 0.5], [-14.4, .5], [-9.4, .5], [-8.8, .5]].forEach(([x]) => { const l = new THREE.Mesh(new THREE.SphereGeometry(.28, 12, 10), glowM(0xffc15a, 1.6)); l.position.set(x, .5, 6.45); g.add(l); });
  // volume belakang + kisi kayu bergaris LED
  g.add(box(11.8, 8.4, 9, white, -7.9, 4.2, -4.5)); g.add(box(12.1, .3, 9.4, grey, -7.9, 8.5, -4.5));
  g.add(box(8.2, 1.9, .3, grey, -8.4, 7.2, -.1)); const louv = new THREE.Mesh(new THREE.PlaneGeometry(7.8, 1.7), matTex(woodTex(24, 1, true, "#8a6038", "#5e4028", 6), .7, { emissive: 0xff9a3a, emissiveIntensity: .35 })); louv.position.set(-8.4, 7.2, .08); g.add(louv);
  g.add(box(7.9, .08, .14, glowM(0xffc15a, 2), -8.4, 8.12, .1, false));
  // layar kisi-kisi
  const latTex = (glow) => canvasTex(768, 700, (c, w, h) => {
    c.fillStyle = glow ? "#000" : "#575960"; c.fillRect(0, 0, w, h);
    const gr = c.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, "#ffd890"); gr.addColorStop(1, "#d98a35");
    c.fillStyle = glow ? gr : "#c9a36a"; c.fillRect(36, 36, w - 72, h - 72);
    c.strokeStyle = glow ? "#ffeccc" : "#f3f2ef"; c.lineWidth = 11; for (let x = 36; x <= w - 36; x += 36) { c.beginPath(); c.moveTo(x, 36); c.lineTo(x, h - 36); c.stroke(); }
    for (let y = 36; y <= h - 36; y += 36) { c.beginPath(); c.moveTo(36, y); c.lineTo(w - 36, y); c.stroke(); }
    if (glow) { c.fillStyle = "rgba(255,255,255,.35)"; c.fillRect(w * .1, h * .62, w * .8, h * .2); c.fillStyle = "rgba(90,50,20,.45)"; c.fillRect(w * .2, h * .32, w * .12, h * .5); c.fillRect(w * .62, h * .4, w * .1, h * .4); }
  });
  g.add(box(6.5, 5.8, 1.2, grey, -4.25, 2.9, 5.4));
  const L = new THREE.Mesh(new THREE.PlaneGeometry(6.3, 5.7), litMat([latTex(false), latTex(true)])); L.position.set(-4.25, 2.9, 6.03); g.add(L);
  // sayap kanan
  g.add(box(3.7, 8.8, 9, white, .3, 4.4, -.5)); g.add(box(3.9, .25, 9.2, grey, .3, 8.9, -.5));
  g.add(box(1.5, 2.9, .1, dark, .6, 1.5, 4.05)); g.add(box(1.7, .12, .9, grey, .6, 3.05, 4.4)); g.add(box(1.5, .18, .9, cream, .6, .1, 4.5)); g.add(box(1.5, .18, .5, cream, .6, .28, 4.35));
  windowGlow(g, 1.4, 1.8, 1.8, 4.4, 4.06); windowGlow(g, 1.4, 1.8, 1.8, 7.1, 4.06);
  gableHouse(g, 10.5, -3, 5.5, 9, 5.6, 0x353c4b, 0xd8dbe6);                                                     // rumah di sebelah kanan
  // bangunan kecil di kiri
  g.add(box(5, 3.4, 4, M(0x7d7f88), -21, 1.7, 4)); g.add(box(.9, 2.2, .06, dark, -20, 1.1, 6.05)); g.add(box(5.2, .2, 4.2, grey, -21, 3.5, 4));
  // palem + tanaman
  palm(g, -26.5, 6, 11.5, { lean: .04 }); palm(g, 10, 6.5, 14, { lean: -.05 }); palm(g, -29, 1, 9, { lean: .08 });
  [[-25, 7.4], [-22, 8], [-18, 8.2], [-14, 8.4], [-10, 8.6], [-6.4, 8.2], [-3, 8], [3, 8.2], [6, 7.8], [8.5, 8.4]].forEach(([x, z], i) => { hedge(g, x, z, 2.6, .8, .9 + (i % 3) * .2, i % 2 ? 0x3f7a35 : 0x56924a); });
  for (let k = 0; k < 8; k++) leafyBush(g, -24 + k * 1.2, 9.1, .9);
  [-18, -14, -9.5, -5].forEach((x) => { const pot = new THREE.Mesh(new THREE.CylinderGeometry(.35, .3, .5, 10), M(0xb8a990)); pot.position.set(x, .25, 7.3); g.add(pot); bush(g, x, 7.3, 0x4f8a3a, .4); });
  leafTree(g, -34, -6, 11); leafTree(g, -30, -12, 12); leafTree(g, 18, -10, 12); leafTree(g, 24, -4, 10);
  [-20, -8, 4].forEach((x) => lampPost(g, x, 9.2, 3.2, 1.2)); bollard(g, -22, 9.2); bollard(g, -2, 9.2);
  g.add(person(-10, 7.4, 0x2a2a30, 1.7, 0x2a2a30, { hijab: 0x2a2a30, skirt: 0x2a2a30 }), person(-9.2, 7.4, 0xf2efe8, 1.8, 0xf2efe8, { hair: 0x1a1816 }), person(2.6, 7.8, 0x3b3f4a, 1.75, 0x2a2d3a, { walk: true }));
  
  for (let k = 0; k < 6; k++) { const b = new THREE.Mesh(new THREE.IcosahedronGeometry(6 + k % 3, 1), M(0x2f5a35, 1)); b.position.set(-44 + k * 16, 9, -26); g.add(b); }
  return g;
}

// =====================================================================================
//  BASKETBALL COURT
// =====================================================================================
function buildBasket() {
  const g = new THREE.Group(); groundPlane(g);
  const path = new THREE.Mesh(new THREE.PlaneGeometry(6.2, 11), matTex(cobbleTex(3, 5), 1)); path.rotation.x = -Math.PI / 2; path.position.set(-1, .03, 12); g.add(path);
  const court = new THREE.Mesh(new THREE.PlaneGeometry(9.2, 16), M(0xb3364a, .95)); court.rotation.x = -Math.PI / 2; court.position.set(0, .04, 1); g.add(court);
  const key = canvasTex(512, 512, (c, w, h) => { c.fillStyle = "#c5a55b"; c.fillRect(0, 0, w, h); c.strokeStyle = "#f6eccb"; c.lineWidth = 8; c.strokeRect(10, 10, w - 20, h - 20); c.beginPath(); c.arc(w / 2, h - 10, 150, Math.PI, 0); c.stroke(); c.beginPath(); c.arc(w / 2, 10, 90, 0, Math.PI); c.stroke(); c.strokeRect(w / 2 - 60, 10, 120, 200); for (let i = 0; i < 1200; i++) { c.fillStyle = "rgba(120,90,40,.12)"; c.fillRect(Math.random() * w, Math.random() * h, 2, 2); } });
  const kp = new THREE.Mesh(new THREE.PlaneGeometry(6, 6.2), matTex(key, .9)); kp.rotation.x = -Math.PI / 2; kp.position.set(0, .05, -4.9); g.add(kp);
  g.add(box(.35, 7, 23, matTex(woodTex(23, 1, true, "#7b6350", "#5f4a3a", 12), .8), -5.4, 3.5, -1));                    // pagar kayu
  for (let z = -12; z <= 10; z += 3.2) g.add(box(.5, 7.2, .35, M(0x3a2c22), -5.4, 3.6, z));
  g.add(box(.9, 5, 24, matTex(graniteTex(12, 1, 64, 128), .9), -7, 2.5, -1)); g.add(box(1, .25, 24, M(0xa9a7a2), -7, 5.1, -1));
  g.add(box(.7, 5.2, 25, matTex(graniteTex(13, 1, 64, 128), .9), 5.6, 2.6, -2)); g.add(box(.8, .22, 25, M(0xa9a7a2), 5.6, 5.3, -2));
  gableHouse(g, 9.8, -8, 6.5, 10, 8.5, 0x353c4b, 0xd4d7e4); g.add(box(3.8, 9, 7, M(0xc9ccd8), 10, 4.5, 2));
  g.add(box(.2, 5.6, .2, M(0xe8e8ea), 0, 2.8, -6.2)); g.add(box(.15, .15, 1.0, M(0xe8e8ea), 0, 5.5, -5.75));
  g.add(box(3.4, 2.1, .12, M(0x4a5fc4), 0, 5.4, -5.3)); g.add(box(3.5, .09, .13, M(0xf3f3f6), 0, 6.45, -5.3)); g.add(box(3.5, .09, .13, M(0xf3f3f6), 0, 4.35, -5.3)); [-1.7, 1.7].forEach((x) => g.add(box(.09, 2.1, .13, M(0xf3f3f6), x, 5.4, -5.3)));
  g.add(box(1.4, .9, .13, M(0xeeeeee), 0, 5.0, -5.21, false)); g.add(box(1.3, .08, .14, M(0xcc2a2a), 0, 5.46, -5.2, false));
  const rim = new THREE.Mesh(new THREE.TorusGeometry(.4, .03, 8, 24), M(0xf08a2a)); rim.rotation.x = Math.PI / 2; rim.position.set(0, 4.75, -4.9); g.add(rim);
  const net = new THREE.Mesh(new THREE.CylinderGeometry(.4, .24, .6, 12, 1, true), M(0xffffff, 1, { side: THREE.DoubleSide, transparent: true, opacity: .75 })); net.position.set(0, 4.42, -4.9); g.add(net);
  bench(g, 4.3, 1.8, -Math.PI / 2, 4.2, 0x8a5f3a);
  const pl = [[-2.4, 5.4, 0xc83a3a, { walk: true }], [-1.6, 3.8, 0x2c2c32, {}], [-3.2, 3.9, 0xd96b8c, { armUp: true }], [3.5, 5.5, 0x4aa3a8, {}], [3.9, 5.6, 0x8a9a8a, {}], [-.8, 2.6, 0xc8423a, { walk: true }], [-1.6, 1.2, 0xe56a5a, {}]];
  pl.forEach(([x, z, c, o]) => g.add(person(x, z - 2, c, 1.75, 0x2a2d3a, o)));
  [[4.4, 2.8, 0xf2eee6], [4.4, 1.8, 0xd9bdc8], [4.4, .8, 0x7a3a50], [4.4, -.2, 0x7b5a4a], [4.4, -1, 0x3a3a46]].forEach(([x, z, c]) => g.add(person(x - .05, z, c, 1.7, 0x4a4a52, { sit: true, rot: -Math.PI / 2 })));
  [[-1.2, 4], [-.6, 1.5], [2, -2.4], [1.6, 3.5]].forEach(([x, z]) => { const b = new THREE.Mesh(new THREE.SphereGeometry(.24, 16, 12), M(0xe8742a)); b.position.set(x, .27, z); g.add(b); const ln = new THREE.Mesh(new THREE.TorusGeometry(.24, .008, 4, 16), M(0x3a1a08)); ln.position.set(x, .27, z); g.add(ln); });
  for (let k = 0; k < 7; k++) leafyBush(g, -4.6 + (k % 3) * .9, 8.2 - k * 1.1, 1.4 + (k % 2) * .5, 0x2f7a2e);
  flowerBed(g, -3.4, 12.6, 5, 1.3, [0xe6c93a, 0xf0d84a]); flowerBed(g, 4.2, 8.5, 3.5, 4, [0xc78bb8, 0xe6c93a, 0xd9a0d0]);
  for (let k = 0; k < 8; k++) grassClump(g, 3.3 + k * .4, 7 - (k % 4) * 1.1, 0xc9a0c0, 1);
  blossom(g, 2.5, -9, 7.5); blossom(g, -3.5, -11.5, 8.5, 0xd9472b);
  for (let k = 0; k < 7; k++) leafTree(g, -9 - k * 2, -3 + k * 2, 11, { spread: 3 });
  gableHouse(g, 1, -17, 5.5, 8, 5, 0x4a5262, 0xe4d0d6);
  return g;
}

// =====================================================================================
//  OUTDOOR GYM & BARBEQUE PIT
// =====================================================================================
function buildGym() {
  const g = new THREE.Group(); groundPlane(g);
  const cob = new THREE.Mesh(new THREE.PlaneGeometry(6.4, 10), matTex(cobbleTex(3, 5), 1)); cob.rotation.x = -Math.PI / 2; cob.position.set(0, .05, 7); g.add(cob);
  const floor = new THREE.Mesh(new THREE.CylinderGeometry(7.6, 7.6, .1, 40), M(0xb7314a, .95)); floor.position.set(0, .05, -1.5); floor.scale.z = .8; g.add(floor);
  const rd = new THREE.Mesh(new THREE.PlaneGeometry(90, 9), matTex(pavTex(30, 3), .95)); rd.rotation.x = -Math.PI / 2; rd.position.set(0, .02, 17); g.add(rd); slab(g, 90, .8, 0, 12.4, M(0xb9b9b6), .08, .16);
  const gw = matTex(graniteTex(10, 1, 64, 128), .9);
  g.add(box(.6, 5.5, 30, M(0xdadce4), -14, 2.75, -2)); for (let z = -15; z < 13; z += 6) g.add(box(.9, 5.7, .35, M(0xc7c9d2), -14, 2.85, z));
  g.add(box(.6, 3.4, 28, gw, 14.5, 1.7, -2)); g.add(box(29, 3.4, .6, gw, 0, 1.7, -14)); g.add(box(.9, .2, 28.4, M(0xa9a7a2), 14.5, 3.45, -2)); g.add(box(29.4, .2, .9, M(0xa9a7a2), 0, 3.45, -14));
  const panel = matTex(woodTex(8, 1, true, "#a0613a", "#8e5430", 12), .75);
  g.add(box(8, 2.8, .25, panel, -9.5, 1.6, -13.6)); g.add(box(7, 2.8, .25, panel, 7.5, 1.6, -13.6));
  gableHouse(g, 19.5, -3, 8, 12, 5.5, 0x353c4b, 0xe0e2ea); windowGlow(g, 1.6, 1.4, 19.5, 4.1, 3.1);
  g.add(box(.5, 9, 10, M(0xd5d8e2), -16.8, 4.5, 0)); g.add(box(.1, 2, 1.6, M(0xc9a7a0), -16.5, 6, 0));
  const aframe = (x, z, s = 1) => { const gp = new THREE.Group(); [[-1], [1]].forEach(([d]) => { const b = box(.34, 8.4 * s, .75, M(0xf3e8da), d * 1.5 * s, 4.2 * s, 0); b.rotation.z = d * .38; gp.add(b); const b2 = box(.2, 8.4 * s, .78, M(0x7a3a2a), d * 1.5 * s, 4.2 * s, 0); b2.rotation.z = d * .38; gp.add(b2); }); gp.position.set(x, .6, z); g.add(gp); };
  [[-11, 3], [-8.4, 3], [-5.8, 3]].forEach(([x, z], i) => aframe(x, z, .95 - i * .08)); [[8.5, 3.3], [11.1, 3.3], [13.7, 3.3]].forEach(([x, z], i) => aframe(x, z, .75 + i * .1));
  const st = matTex(graniteTex(4, 1, 64, 64), .9);
  g.add(box(13, .7, 3.4, st, -8.3, .35, 3)); g.add(box(9.4, .7, 3.4, st, 11, .35, 3.3));
  [-13, -4].forEach((x) => hedge(g, x + 4.5, 5.2, 9, .7, .7)); hedge(g, 11, 5.4, 9, .7, .7);
  flowerBed(g, -9, 3.2, 10, 2.4, [0x3f8a3a]); flowerBed(g, 11, 3.3, 7, 2.4, [0x3f8a3a]);
  const blue = M(0x2f6fd6, .45), blk = M(0x1d1f24, .6);
  [[-4.7, -1.0], [-3.1, -2.4], [-1.7, -1.3]].forEach(([x, z]) => { g.add(box(.25, 1.7, .25, blue, x, .95, z)); g.add(box(.25, 1.7, .25, blue, x + 1.1, .95, z)); g.add(box(1.4, .15, .2, blue, x + .55, 1.75, z)); g.add(box(1.4, .1, .2, blue, x + .55, 1.35, z)); g.add(box(.6, .12, .6, blk, x + .55, .3, z + .5)); });
  g.add(box(1.6, 2.6, 1.3, blue, 3.6, 1.4, -2)); g.add(box(.3, 3, .3, blue, 4.6, 1.5, -2.3)); g.add(box(1.8, .55, 1.1, blue, 3.5, .35, -.7)); g.add(box(1.2, .2, .4, blk, 3.5, 1.0, -.7)); g.add(box(.2, 1.6, .2, blue, 2.2, .9, -.5)); g.add(box(1.8, .15, .2, blue, 2.2, 1.7, -.5));
  g.add(box(3.8, .5, 1.3, M(0x7a5a3c), -10, .6, -10.6)); g.add(box(3.8, .5, 1.3, M(0x7a5a3c), -7, .6, -9.4)); g.add(box(1.9, .15, 1.9, M(0xcaa27a), -8.6, 1.1, -7.8)); [[-9.4, -8.5], [-7.8, -8.5], [-9.4, -7.1], [-7.8, -7.1]].forEach(([x, z]) => g.add(box(.08, .55, .08, M(0x333333), x, .45, z)));
  const um = new THREE.Mesh(new THREE.ConeGeometry(1.7, .75, 14), M(0xf1f1f1)); um.position.set(-8.6, 3.25, -7.8); g.add(um); g.add(box(.08, 2.3, .08, M(0x555555), -8.6, 1.9, -7.8));
  g.add(box(3.9, .5, 1.3, M(0x7a5a3c), 5.5, .6, -11)); g.add(box(1.5, 1.0, 1.1, M(0x555a63), 8.5, .5, -11.6)); g.add(box(1.2, .12, .9, M(0x2a2c32), 8.5, 1.08, -11.6)); g.add(box(.2, 1.4, .2, M(0x555a63), 9.1, 1.5, -12)); [[6.5, -9.8], [8.5, -9.8]].forEach(([x, z]) => g.add(box(1.6, .45, .5, M(0x7a5a3c), x, .5, z)));
  palm(g, -3, -8, 11.5); palm(g, 3.8, -9, 12.5); blossom(g, -.4, -9.5, 7.5);
  [[-1.8, -1.6, 0xd9473a, {}], [.8, -2.7, 0x4f8a8a, { walk: true }], [2.2, -.6, 0xd96b8c, { armUp: true }], [3.4, -2.2, 0xe8d9d0, {}], [-3, 6.5, 0x3b6ea8, {}]].forEach(([x, z, c, o]) => g.add(person(x, z, c, 1.75, 0x2a2d3a, o)));
  [[-8.9, -9, 0xc7c9d0, { sit: true }], [-6.7, -8.4, 0x2a2a2e, { sit: true }], [6, -10.8, 0x7a8a9a, { sit: true }]].forEach(([x, z, c, o]) => g.add(person(x, z, c, 1.7, 0x3a3a42, o)));
  bicycle(g, -12.5, 14, .1); g.add(person(-12.5, 14, 0x3a7ac8, 1.75, 0x2a2d3a, { sit: true, rot: 0 }));
  g.add(car(16, 12, 0xeef0f2, 4.6, 1.4, Math.PI / 2));
  for (let k = 0; k < 4; k++) leafTree(g, -22 + k * 3, -17 - k, 11);
  for (let k = 0; k < 3; k++) leafTree(g, 6 + k * 5, -19 - k, 12);
  return g;
}

// =====================================================================================
//  KIDS PLAYGROUND
// =====================================================================================
function buildPlay() {
  const g = new THREE.Group(); groundPlane(g);
  const road = new THREE.Mesh(new THREE.PlaneGeometry(100, 14), matTex(pavTex(34, 5), .95)); road.rotation.x = -Math.PI / 2; road.position.set(0, .02, 19); g.add(road);
  slab(g, 100, 1.1, 0, 11.7, M(0xb9b9b6), .08, .16); g.add(box(60, .05, 2.6, M(0xa7a49d), 0, .06, 10.2, false));
  const cob = new THREE.Mesh(new THREE.PlaneGeometry(10.5, 13), matTex(cobbleTex(5, 6), 1)); cob.rotation.x = -Math.PI / 2; cob.position.set(0, .04, 5); g.add(cob);
  g.add(box(48, 5.6, .5, M(0xe3e4ea), 0, 2.8, -8)); g.add(box(48, .25, .7, M(0xc7c9d2), 0, 5.7, -8));
  const poleM = M(0x4a4d56, .55);
  for (let k = 0; k < 34; k++) { const x = -16.5 + k * 1.0, h = 3.0 + ((k * 7) % 6) * .75; const p = new THREE.Mesh(new THREE.CylinderGeometry(.11, .11, h, 10), poleM); p.position.set(x, h / 2, -5 + (k % 2) * .4); p.castShadow = true; g.add(p); const cap = new THREE.Mesh(new THREE.CylinderGeometry(.12, .12, .1, 10), M(0x2a2c32)); cap.position.set(x, h + .02, -5 + (k % 2) * .4); g.add(cap); }
  const swing = new THREE.Group(), pink = M(0xe0457b, .4);
  [0, 1.7, 3.4].forEach((dz, i) => { const t = new THREE.Mesh(new THREE.TorusGeometry(1.55, .1, 10, 28, Math.PI), pink); t.position.set(0, 0, dz - 1.7); swing.add(t); });
  swing.add(box(.14, .14, 3.8, pink, 0, 3.1, 0));
  [[-.6], [.6]].forEach(([dz]) => { [-.25, .25].forEach((o) => swing.add(box(.03, 2.3, .03, M(0x333333), 0 + o * 0, 1.95, dz + o))); swing.add(box(.5, .07, .3, M(0x25272c), 0, .78, dz)); });
  swing.position.set(3.2, .1, -2); swing.rotation.y = Math.PI / 2; g.add(swing);
  g.add(box(3.4, .4, 2.6, M(0xb08a58), -3, .2, -1)); g.add(box(3.0, .12, 2.2, M(0xd7b97a), -3, .42, -1, false));
  const mr = new THREE.Mesh(new THREE.CylinderGeometry(1.05, 1.05, .22, 20), M(0xb0703c)); mr.position.set(-3, .5, -1); g.add(mr); [0, 1, 2].forEach((i) => { const b = box(2.0, .1, .1, M(0x3a3a3e), -3, .66, -1); b.rotation.y = i * Math.PI / 3; g.add(b); });
  g.add(box(.2, .9, 3.1, M(0x7a5a3c), -6, .6, -1.6)); g.add(box(.9, .12, .4, M(0xd96b8c), -6, 1.05, -2.9)); g.add(box(.9, .12, .4, M(0x2f6fd6), -6, 1.05, -.3));
  g.add(box(1.6, .5, 1.1, M(0xc7a56c), -1, .25, 2.5)); g.add(box(.9, 1.4, .06, M(0x3a8ac8), 6, .7, 0));
  [-13, 8].forEach((x) => { hedge(g, x + 2.5, 9.6, 7, .75, .75); });
  g.add(box(10, .08, 4.2, M(0x7fb04a, 1), -11, .04, 7.5)); g.add(box(10, .08, 4.2, M(0x7fb04a, 1), 11, .04, 7.5));
  flowerBed(g, -12, 8.6, 6, 1.2, [0xe86a8a, 0xf0a8c0, 0xffffff]); flowerBed(g, 11, 8.6, 6, 1.2, [0xe86a8a, 0xf0a8c0]);
  [[-5.5, -9.5], [-1, -12], [5.5, -10.5], [10.5, -9.5], [-12, -10]].forEach(([x, z], i) => blossom(g, x, z, 7.5 + (i % 2), i % 2 ? 0xc084d6 : 0xb06bc4));
  palm(g, -7, -9, 13, { lean: .02 }); palm(g, 1.5, -10, 14);
  gableHouse(g, 19.5, -3, 7, 12, 5.5, 0x353c4b, 0xe6e8f0); gableHouse(g, -19.5, -3, 6, 12, 5.5, 0x353c4b, 0xd9dbe3); g.add(box(.2, 1.3, .1, M(0x111111), 19.6, .65, 3.3));
  for (let k = 0; k < 9; k++) g.add(box(.05, 1.4, .05, M(0x1c1c20), 14.2 + k * .55, .7, 3.6, false)); g.add(box(4.8, .05, .05, M(0x1c1c20), 16.6, 1.4, 3.6, false)); g.add(box(4.8, .05, .05, M(0x1c1c20), 16.6, .2, 3.6, false));
  g.add(car(20, 5.5, 0x6a3a36, 4.4, 1.4, Math.PI / 2));
  g.add(person(-3.4, 1.4, 0x6a7ea6, 1.1, 0x3a3a46, { sit: true }), person(-3.1, -2.6, 0xd96b8c, 1.1), person(-.4, 1.6, 0xd9a6b0, 1.1, 0x4a4a52, { armUp: true }), person(2.2, 1.2, 0xf1f1f1, 1.0, 0xd9a0b0));
  g.add(person(-2.0, -3.2, 0x2a2a2e, 1.7, 0x3a3a46, { sit: true }), person(-5.4, -3.1, 0x4a3a2a, 1.7, 0x2a2d3a), person(12.8, 9, 0xf2eee6, 1.7, 0x4a8fb5, { walk: true }), person(13.7, 8.9, 0xffffff, 1.1, 0xf2f2f2, { skirt: 0xf8f8f8 }));
  return g;
}

// =====================================================================================
//  GERBANG: dasar bersama
// =====================================================================================
function gateBase(g) {
  groundPlane(g);
  const rd = new THREE.Mesh(new THREE.PlaneGeometry(140, 34), matTex(pavTex(46, 11), .95)); rd.rotation.x = -Math.PI / 2; rd.position.set(0, .02, 13); g.add(rd);
  const pat = canvasTex(512, 256, (c, w, h) => { c.fillStyle = "#d8cfc0"; c.fillRect(0, 0, w, h); for (let x = 0; x < w; x += 32) { c.fillStyle = (x / 32) % 3 === 0 ? "#a8452f" : (x / 32) % 3 === 1 ? "#c9a28a" : "#7a6a5a"; c.fillRect(x + 2, 24, 28, h - 48); } c.strokeStyle = "#cfc6b8"; c.lineWidth = 14; c.strokeRect(7, 7, w - 14, h - 14); c.strokeStyle = "#8b8478"; c.lineWidth = 4; c.strokeRect(22, 22, w - 44, h - 44); });
  const dp = new THREE.Mesh(new THREE.BoxGeometry(20, .08, 6.5), new THREE.MeshStandardMaterial({ map: pat, roughness: .8 })); dp.position.set(7, .07, 6.4); g.add(dp);
  const curb = new THREE.Mesh(new THREE.BoxGeometry(60, .2, .35), M(0xb9b9b6)); curb.position.set(-2, .1, 3); g.add(curb);
}
function signWall(g, text, mode) {
  const sc = new THREE.Group(); sc.position.set(-14, 0, 0);
  const stone = matTex(travertineTex(8, 3), .9);
  sc.add(box(18, 6, 1.5, stone, 0, 3, 0)); sc.add(box(18.2, .2, 1.7, M(0x6e695f), 0, 6.1, 0)); sc.add(box(18.2, .35, 1.7, M(0x6e695f), 0, .18, 0));
  if (mode === "sierra") {
    sc.add(box(12.5, 3.8, .22, matTex(woodTex(26, 1, true, "#9a6a42", "#7e5434", 6), .7, { emissive: 0xff9a3a, emissiveIntensity: .25 }), -1.5, 2.6, .8));
    const wedge = new THREE.Shape(); wedge.moveTo(-7.7, 4.5); wedge.lineTo(4.7, 4.5); wedge.lineTo(4.7, 2.9); wedge.lineTo(-7.7, .7); wedge.closePath();
    const wm = new THREE.Mesh(new THREE.ShapeGeometry(wedge), glowM(0xfaf3e6, .55)); wm.position.set(0, 0, .93); sc.add(wm);
    const edge = new THREE.Mesh(new THREE.BoxGeometry(12.7, .09, .1), glowM(0xffc15a, 2)); edge.position.set(-1.5, 3.7, .96); edge.rotation.z = Math.atan2(1.6, 12.4) * -1 + 0; sc.add(edge);
    sc.add(box(12.6, .1, .12, glowM(0xffc15a, 2), -1.5, 4.55, .95, false));
  } else {
    sc.add(box(14.2, 2.9, .22, M(0x2b2420, .7), 0, 2.7, .8)); sc.add(box(14.4, .14, .14, glowM(0xffc15a, 2), 0, 4.2, .93, false)); sc.add(box(14.4, .14, .14, glowM(0xffc15a, 2), 0, 1.2, .93, false));
    sc.add(box(14, 2.8, .1, glowM(0xffb04a, .35), 0, 2.7, .72, false));
  }
  g.add(sc);
}
function guardPavilion(g, x, z, style) {
  const gh = new THREE.Group(); gh.position.set(x, 0, z);
  if (style === "sierra") {
    gh.add(box(6, 7.4, 6.4, M(0xf2f3f7), 0, 3.7, 0)); gh.add(box(6.3, .3, 6.7, M(0x5a5d65), 0, 7.5, 0));
    const sh = new THREE.Shape(); [[-3, 0], [3, 0], [3, 1.6], [0, 4.8], [-3, 1.6]].forEach(([a, b], i) => i ? sh.lineTo(a, b) : sh.moveTo(a, b));
    const gb = new THREE.Mesh(new THREE.ExtrudeGeometry(sh, { depth: 6.4, bevelEnabled: false }), M(0xdcdee6)); gb.position.set(0, 7.5, -3.2); gh.add(gb);
    const slate = rep(canvasTex(128, 128, (c, ww, hh) => { c.fillStyle = "#585e6c"; c.fillRect(0, 0, ww, hh); c.fillStyle = "#42485a"; for (let y = 0; y < hh; y += 12) c.fillRect(0, y, ww, 2); }), 3, 3);
    [-1, 1].forEach((s) => { const r = box(Math.hypot(3, 3.2) + .3, .18, 6.8, matTex(slate, .6), s * 1.5, 7.5 + 2.4 + .8, 0); r.rotation.z = -s * Math.atan2(3.2, 3); gh.add(r); });
    gh.add(box(2.4, 6.2, .14, matTex(woodTex(8, 1, true, "#9a6a42", "#7e5434", 6), .7), 1.0, 9.4, 3.25)); gh.add(box(1.9, 5.4, .14, M(0xe3e5ee), -1.6, 9.4, 3.26));
    gh.add(box(2.6, 3.8, .12, M(0x24262c), 0, 2.2, 3.22)); const dm = new THREE.Mesh(new THREE.PlaneGeometry(2.3, 3.5), glowM(0xffd896, .9)); dm.position.set(0, 2.2, 3.3); gh.add(dm); gh.add(box(.07, 3.5, .06, M(0x24262c), 0, 2.2, 3.34));
    gh.add(box(6.8, .3, 2, M(0x5a5d65), 0, 4.2, 4)); gh.add(box(.18, 4.2, .18, M(0x5a5d65), -3.2, 2.1, 4.8)); gh.add(box(.18, 4.2, .18, M(0x5a5d65), 3.2, 2.1, 4.8));
    windowGlow(gh, 1.3, 1.6, 2.2, 6.0, 3.25);
  } else {
    gh.add(box(5.2, 6.4, 5.8, M(0xf2f3f7), 0, 3.2, 0));
    const sh = new THREE.Shape(); [[-2.6, 0], [2.6, 0], [0, 4.8]].forEach(([a, b], i) => i ? sh.lineTo(a, b) : sh.moveTo(a, b));
    const gb = new THREE.Mesh(new THREE.ExtrudeGeometry(sh, { depth: 5.8, bevelEnabled: false }), M(0xe9eaf0)); gb.position.set(0, 6.4, -2.9); gh.add(gb);
    const slate = rep(canvasTex(128, 128, (c, ww, hh) => { c.fillStyle = "#4a5160"; c.fillRect(0, 0, ww, hh); c.fillStyle = "#383e4c"; for (let y = 0; y < hh; y += 12) c.fillRect(0, y, ww, 2); }), 3, 3);
    [-1, 1].forEach((s) => { const r = box(Math.hypot(2.6, 4.8) + .35, .2, 6.2, matTex(slate, .6), s * 1.3, 6.4 + 2.4 + .1, 0); r.rotation.z = -s * Math.atan2(4.8, 2.6); gh.add(r); });
    gh.add(box(2.8, 1.8, .08, M(0x2a2c32), 0, 5.4, 2.95)); const w1 = new THREE.Mesh(new THREE.PlaneGeometry(2.5, 1.5), glowM(0xffd896, .9)); w1.position.set(0, 5.4, 3.0); gh.add(w1); gh.add(box(.06, 1.6, .06, M(0x2a2c32), 0, 5.4, 3.02));
    const arch = new THREE.Shape(); arch.moveTo(-.9, 0); arch.lineTo(-.9, 1.8); arch.absarc(0, 1.8, .9, Math.PI, 0, true); arch.lineTo(.9, 0);
    const ad = new THREE.Mesh(new THREE.ShapeGeometry(arch), glowM(0xffd896, .9)); ad.position.set(-.5, .4, 2.96); gh.add(ad);
    gh.add(box(1.6, 6.2, .12, matTex(woodTex(6, 1, true, "#8a5a36", "#6e4528", 6), .7), 1.9, 3.1, 2.96)); gh.add(box(1.4, .15, 1.2, M(0xcfcbc3), -.5, .1, 3.3));
  }
  g.add(gh);
}

function buildSierra() {
  const g = new THREE.Group(); gateBase(g); signWall(g, "SIERRA", "sierra");
  letters(g, "SIERRA", 10, 3.1, -14.5, 7.65, 0, "#f7f4ee", .12, "300 300px 'Times New Roman', Georgia, serif", 0, 6);
  g.add(box(10.2, .18, .5, M(0x6e695f), -14.5, 6.12, 0));
  guardPavilion(g, 2, -2, "sierra");
  const rt = new THREE.Group(); rt.position.set(22, 0, -2);
  rt.add(box(6, 9, 6, M(0xf2f3f7), 0, 4.5, 0)); rt.add(box(6.3, .3, 6.3, M(0xd9dbe3), 0, 9.1, 0));
  const tri = new THREE.Shape(); tri.moveTo(-1.2, 0); tri.lineTo(3, 0); tri.lineTo(3, 6.6); tri.closePath();
  const tm = new THREE.Mesh(new THREE.ShapeGeometry(tri), matTex(woodTex(7, 3, true, "#8a5a36", "#6e4528", 8), .7)); tm.position.set(-.2, .2, 3.05); rt.add(tm);
  rt.add(box(24, 5, .7, M(0xe9eaf0), 18, 2.5, -2)); rt.add(box(24, .2, .9, M(0xcfd1d8), 18, 5.1, -2)); g.add(rt);
  for (let k = 0; k < 16; k++) bush(g, -22.5 + k * 1.1, 2.7 + (k % 2) * .4, k % 3 ? 0xd6c9a0 : 0x8ab060, .55);
  for (let k = 0; k < 8; k++) grassClump(g, -22 + k * 2.2, 3.6, 0xe0c9b0, 1.2);
  leafTree(g, -26.5, 4.5, 6, { cols: [0x6f9a3e, 0x80ad4a], spread: 1.6 });
  [-31, -25.5, -5, 3].forEach((x, i) => palm(g, x, -3 + (i % 2) * 2, 16 + (i % 2) * 2, { lean: i % 2 ? .02 : -.03 }));
  [20, 25.5, 30.5, 34].forEach((x, i) => palm(g, x, 6 - i * 1.4, 18 + i * .4, { lean: i % 2 ? .04 : -.03 }));
  for (let k = 0; k < 9; k++) gableHouse(g, 10 + k * 3.8, -15 - k * 1.7, 6, 8, 6, 0x353c4b, 0xe6e8f0);
  for (let k = 0; k < 14; k++) leafTree(g, -10 + k * 5, -24, 9 + (k % 3) * 2, { spread: 3 });
  g.add(car(11, 10.2, 0xb9bec7, 4.7, 1.4, .08)); bicycle(g, 5.7, 5.3, .5); bicycle(g, 7.6, 5.1, .4);
  g.add(person(5.7, 5.3, 0x23314f, 1.7, 0x2a2d3a, { sit: true }), person(7.6, 5.1, 0x2b2c33, 1.75, 0x2a2d3a, { sit: true }));
  [-10, -5].forEach((x) => lampPost(g, x, 3.4, 3.2, .9)); for (let k = 0; k < 12; k++) bush(g, 30 + k * 1.1, 8 - k * .2, k % 2 ? 0xe6c93a : 0xf0a8c0, .5);
  return g;
}
function buildMontana() {
  const g = new THREE.Group(); gateBase(g); signWall(g, "MONTANA", "montana");
  letters(g, "MONTANA", 11.5, 2.5, -14, 2.7, .95, "#fbf6ec", .95, "400 300px 'Helvetica Neue', Arial, sans-serif", 0, 6);
  for (let k = 0; k < 20; k++) bush(g, -22.5 + k * 1.1, 2.7 + (k % 2) * .3, k % 2 ? 0xd6d36a : 0xe6c93a, .6);
  guardPavilion(g, 3, -2, "montana");
  const arch = new THREE.Group(); arch.position.set(14.5, 0, -3);
  arch.add(box(6.4, 6.6, 1.5, M(0xf3f3f6), 0, 3.3, 0)); arch.add(box(6.8, .3, 1.8, M(0xdcdde4), 0, 6.75, 0));
  const lat = canvasTex(256, 256, (c, w, h) => { c.fillStyle = "#e6e6ea"; c.fillRect(0, 0, w, h); c.strokeStyle = "#7a7d85"; c.lineWidth = 8; for (let i = 0; i <= 8; i++) { c.beginPath(); c.moveTo(i * 32, 0); c.lineTo(i * 32, h); c.stroke(); c.beginPath(); c.moveTo(0, i * 32); c.lineTo(w, i * 32); c.stroke(); } });
  const apShape = new THREE.Shape(); apShape.moveTo(-1.6, 0); apShape.lineTo(-1.6, 2.2); apShape.absarc(0, 2.2, 1.6, Math.PI, 0, true); apShape.lineTo(1.6, 0);
  const ap = new THREE.Mesh(new THREE.ShapeGeometry(apShape), matTex(lat, .85)); ap.position.set(0, .15, .78); arch.add(ap);
  const rim = new THREE.Mesh(new THREE.TorusGeometry(1.65, .1, 6, 24, Math.PI), M(0xcfd1d8)); rim.position.set(0, 2.35, .8); arch.add(rim);
  g.add(arch); g.add(box(18, 5.2, .7, M(0xe9eaf0), 29, 2.6, -4));
  [-27, -22.5, -18, -7].forEach((x, i) => palm(g, x, -4 - i * .6, 15 + (i % 2) * 2, { fan: true })); [21, 25.5, 30.5].forEach((x, i) => palm(g, x, 6 - i * 1.5, 17 + i, { fan: true }));
  for (let k = 0; k < 12; k++) leafTree(g, -34 + k * 6, -16, 9 + (k % 3), { spread: 3 }); for (let k = 0; k < 4; k++) gableHouse(g, 26 + k * 4, -14 - k * 1.6, 6, 8, 5.5, 0x353c4b, 0xe6e8f0);
  g.add(car(11.5, 10, 0xc3c8d0, 4.9, 1.4, .06));
  g.add(person(5.5, 4.1, 0x8a6a4a, 1.8, 0x3a3a42, { walk: true }), person(6.4, 4.1, 0x4a6aa5, 1.7, 0x2a2d3a, { skirt: 0x4a6aa5 }), person(7.1, 4, 0xd9bdc8, 1.2, 0x4a4a52, { skirt: 0xf2e6e8 }));
  [-10, -5].forEach((x) => lampPost(g, x, 3.4, 3.2, .9)); for (let k = 0; k < 12; k++) bush(g, 22 + k * 1.1, 8 - k * .2, k % 2 ? 0xf0f0e8 : 0xe85a6a, .5);
  return g;
}

// =====================================================================================
//  GERBANG UTAMA
// =====================================================================================
function shopBlock(g, x, z, names, cols, rotY = 0, wide = 22) {
  const b = new THREE.Group(); b.position.set(x, 0, z); b.rotation.y = rotY; const UW = wide / 2, D = 14, hG = 3.6, hU = 5.8;
  const white = M(0xf0f0f2, .7);
  b.add(box(wide, hG + hU + .8, D, white, 0, (hG + hU + .8) / 2, -D / 2)); b.add(box(.4, hG + hU + .8, D, M(0x8b8d95), wide / 2 + .1, (hG + hU + .8) / 2, -D / 2));
  const sign = (t, c) => canvasTex(512, 128, (cx, w, h) => { cx.fillStyle = "#5a5148"; cx.fillRect(0, 0, w, h); cx.fillStyle = c; cx.font = "italic bold 66px Georgia, serif"; cx.textAlign = "center"; cx.textBaseline = "middle"; cx.shadowColor = c; cx.shadowBlur = 12; cx.fillText(t, w / 2, h / 2 + 4); });
  const glassT = canvasTex(256, 320, (c, w, h) => { const gr = c.createLinearGradient(0, 0, w, h); gr.addColorStop(0, "#f7c3a0"); gr.addColorStop(1, "#e89c7e"); c.fillStyle = gr; c.fillRect(0, 0, w, h); c.fillStyle = "rgba(255,255,255,.3)"; for (let i = 0; i < 8; i++) c.fillRect(20 + (i * 47) % 200, 20 + (i * 83) % 260, 60, 6); c.strokeStyle = "#2f3036"; c.lineWidth = 5; c.strokeRect(2, 2, w - 4, h - 4); c.beginPath(); c.moveTo(w / 2, 0); c.lineTo(w / 2, h); c.stroke(); [.3, .68].forEach((f) => { c.beginPath(); c.moveTo(0, h * f); c.lineTo(w, h * f); c.stroke(); }); });
  const shopT = canvasTex(256, 128, (c, w, h) => { const gr = c.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, "#ffe2b0"); gr.addColorStop(1, "#f5b46a"); c.fillStyle = gr; c.fillRect(0, 0, w, h); c.fillStyle = "#b86a3a"; for (let i = 0; i < 6; i++) c.fillRect(14 + i * 40, 30 + (i % 2) * 24, 28, 56); c.strokeStyle = "#2f3036"; c.lineWidth = 4; c.strokeRect(2, 2, w - 4, h - 4); [.33, .66].forEach((f) => { c.beginPath(); c.moveTo(w * f, 0); c.lineTo(w * f, h); c.stroke(); }); });
  const gm = (t) => new THREE.MeshStandardMaterial({ map: t, emissive: 0xffffff, emissiveMap: t, emissiveIntensity: .55, roughness: .3 });
  const louv = canvasTex(256, 64, (c, w, h) => { c.fillStyle = "#e8e6e2"; c.fillRect(0, 0, w, h); c.fillStyle = "#9b958c"; for (let xx = 0; xx < w; xx += 8) c.fillRect(xx, 6, 4, h - 12); });
  names.forEach((n, i) => {
    const px = (i - .5) * UW;
    const sg = new THREE.Mesh(new THREE.PlaneGeometry(UW, 1), gm(sign(n, cols[i]))); sg.position.set(px, hG - .5, .03); b.add(sg);
    const sh = new THREE.Mesh(new THREE.PlaneGeometry(UW - .8, hG - 1.1), gm(shopT)); sh.position.set(px, (hG - 1.1) / 2 + .1, .03); b.add(sh);
    const up = new THREE.Mesh(new THREE.PlaneGeometry(UW - .6, hU - .9), gm(glassT)); up.position.set(px, hG + (hU - .9) / 2, .05); b.add(up);
    const lv = new THREE.Mesh(new THREE.PlaneGeometry(UW - .6, .8), matTex(louv, .8)); lv.position.set(px, hG + hU - .45, .06); b.add(lv);
  });
  b.add(box(.3, hU + .8, .5, white, 0, hG + (hU + .8) / 2, .1)); b.add(box(wide + .3, .3, .6, white, 0, hG + hU + .75, .2)); b.add(box(wide + .3, .25, .6, white, 0, hG - .02, .25));
  g.add(b);
}
function buildEntrance() {
  const g = new THREE.Group(); groundPlane(g, 0x7a8f5a);
  const plaza = new THREE.Mesh(new THREE.PlaneGeometry(150, 70), matTex(pavTex(50, 24, "#8c8e95", "#7c7e86"), .95)); plaza.rotation.x = -Math.PI / 2; plaza.position.set(0, .02, 14); g.add(plaza);
  shopBlock(g, -34, -4, ["DIGIGRAM", "BOOKstore"], ["#42d4ff", "#c6f432"], .5, 20);
  shopBlock(g, 26, -4, ["Fresh Cake", "Skin Care"], ["#d6f04a", "#f3f3f3"], -.02, 24);
  const wood = matTex(woodTex(10, 1, true, "#9a6a42", "#7e5434", 8), .75);
  g.add(box(36, .6, 8.5, matTex(woodTex(26, 1, true, "#8a5a36", "#6e4528", 8), .75), -2, 8.5, -4)); g.add(box(36.4, .25, 8.9, M(0x3a3a3e), -2, 8.2, -4));
  [-14, 12].forEach((x) => g.add(box(2.4, 8.5, 3.2, wood, x, 4.25, -3))); [-6, 0, 6].forEach((x) => g.add(box(.28, 8.2, .28, M(0x3a3a3e), x, 4.1, 0.5)));
  g.add(box(1.9, 5.2, 3.2, wood, -8, 2.6, -6)); g.add(box(1.9, 4.2, 3.2, wood, 8, 2.1, -8)); g.add(box(1.9, 3.6, 3.2, wood, 3.6, 1.8, -10));
  letters(g, "SHAISTANAYA CITY", 27, 3.7, -22, 2.5, 5.6, "#ffffff", .15, "bold 300px 'Helvetica Neue', Arial, sans-serif", 0, 7);
  g.add(box(28, .4, 1.6, M(0x4a4a50), -22, .2, 5.6, false));
  for (let k = 0; k < 24; k++) bush(g, -35 + k * 1.2, 6.3, 0x3f8a3a, .55);
  [[-34, 6, 20], [-26, 4, 21.5], [-17, 2, 23], [-6, 4, 21]].forEach(([x, z, h], i) => palm(g, x, z, h, { fan: true, lean: i % 2 ? .02 : -.02 }));
  leafTree(g, -46, -2, 12); leafTree(g, 40, 2, 11); const cy = new THREE.Mesh(new THREE.ConeGeometry(1.5, 9, 12), M(0x2f5a35)); cy.position.set(-17, 4.5, -6); g.add(cy); const cy2 = cy.clone(); cy2.position.set(-14.5, 3.6, -6.5); cy2.scale.y = .8; g.add(cy2);
  g.add(car(-4, 9, 0xf2f3f5, 4.6, 1.8, .15)); g.add(car(15.5, 8.5, 0xf2f3f5, 4.6, 1.5, -.1)); g.add(car(21, 8.2, 0xd9b13f, 3.9, 1.3, -.05)); g.add(car(27, 8.4, 0xdadde4, 4.7, 1.45, -.05));
  bicycle(g, 11, 4.5, 2.2); g.add(person(11, 4.5, 0x2a2a32, 1.75, 0x2a2d3a, { sit: true, rot: 2.2 }));
  g.add(person(18.5, 5, 0xd9d9de, 1.7, 0x3a3a42), person(24.5, 5, 0x39313b, 1.75, 0x2a2d3a), person(32, 4.8, 0xe8e8ea, 1.7, 0x2a2d3a, { skirt: 0x2a2a30 }), person(29.6, 5.2, 0xd96b6b, 1.7, 0x3a3a42));
  for (let k = 0; k < 8; k++) { const b = new THREE.Mesh(new THREE.IcosahedronGeometry(6 + k % 3, 1), M(0x40703f, 1)); b.position.set(-34 + k * 12, 7, -28); g.add(b); }
  return g;
}

export const FASUM_MODELS = {
  masjid:   { build: buildMasjid,  target: [-8, 4, 0],  pos: [-4, 4, 44],  sky: 0x78a6d8 },
  basket:   { build: buildBasket,  target: [0, 3, -2],  pos: [-1, 3.2, 26], sky: 0xaec9e4 },
  gym:      { build: buildGym,     target: [0, 1, 0],   pos: [0, 20, 32],  sky: 0xaec9e4 },
  play:     { build: buildPlay,    target: [0, 2.5, 0], pos: [0, 4, 32],   sky: 0xaec9e4 },
  sierra:   { build: buildSierra,  target: [2, 5, 0],   pos: [-12, 3.4, 58], sky: 0x8fb4de },
  montana:  { build: buildMontana, target: [2, 5, 0],   pos: [-12, 3.4, 58], sky: 0x8fb4de },
  entrance: { build: buildEntrance, target: [-4, 6, 0], pos: [0, 4, 98],   sky: 0x5aa6e6 },
};
