// Model 3D tambahan: BIANCA (gable), GWEN/ANGELINE/DARLENE (atap slate), RUKO, dan varian HOOK (unit pojok).
// Semua proporsi diukur dari foto render di assets/renders/. Satuan tekstur: 1 = lebar satu rumah.
import * as THREE from "./vendor/three.module.js";
import { canvasTex, drawMirrored, litMat, box } from "./house3d.js";

const mk = (c, r = 1, extra = {}) => new THREE.MeshStandardMaterial({ color: c, roughness: r, ...extra });

// ---------- lingkungan bersama ----------
function car(x, z, col, len = 4.6, hh = 1.35, rotY = 0) {
  const c = new THREE.Group();
  const sp = new THREE.Shape();
  [[0, .3], [0, .78], [.9, .88], [1.5, hh], [len - 1.5, hh], [len - .8, .88], [len, .8], [len, .3]].forEach(([a, b], i) => i ? sp.lineTo(a, b) : sp.moveTo(a, b));
  const body = new THREE.Mesh(new THREE.ExtrudeGeometry(sp, { depth: 1.8, bevelEnabled: false }), new THREE.MeshStandardMaterial({ color: col, metalness: .5, roughness: .3 }));
  body.position.set(-len / 2, 0, -.9); c.add(body);
  const gs = new THREE.Shape();
  [[1.55, .9], [1.65, hh - .06], [len - 1.65, hh - .06], [len - 1.05, .9]].forEach(([a, b], i) => i ? gs.lineTo(a, b) : gs.moveTo(a, b));
  const gl = new THREE.Mesh(new THREE.ExtrudeGeometry(gs, { depth: 1.84, bevelEnabled: false }), new THREE.MeshStandardMaterial({ color: 0x141a24, metalness: .7, roughness: .15 }));
  gl.position.set(-len / 2, 0, -.92); c.add(gl);
  [[.95, .9], [len - .95, .9], [.95, -.9], [len - .95, -.9]].forEach(([a, b]) => {
    const w = new THREE.Mesh(new THREE.CylinderGeometry(.34, .34, .25, 18), mk(0x0e0e0f)); w.rotation.x = Math.PI / 2;
    w.position.set(a - len / 2, .34, b); c.add(w);
  });
  c.traverse((o) => { o.castShadow = true; });
  c.position.set(x, 0, z); c.rotation.y = rotY; return c;
}
function person(x, z, shirt, h = 1.75, pants = 0x2a2d3a) {
  const p = new THREE.Group();
  const leg = new THREE.Mesh(new THREE.CylinderGeometry(.13, .11, h * .5, 8), mk(pants)); leg.position.y = h * .25; p.add(leg);
  const tor = new THREE.Mesh(new THREE.CylinderGeometry(.19, .16, h * .32, 10), mk(shirt)); tor.position.y = h * .66; p.add(tor);
  const hd = new THREE.Mesh(new THREE.SphereGeometry(.12, 12, 10), mk(0xd9a98a)); hd.position.y = h * .9; p.add(hd);
  p.traverse((o) => { o.castShadow = true; }); p.position.set(x, 0, z); return p;
}
function bush(g, x, z, col, r) { const b = new THREE.Mesh(new THREE.IcosahedronGeometry(r, 1), mk(col)); b.position.set(x, r * .8, z); b.castShadow = true; g.add(b); }
function tree(g, x, z, h = 7) {
  const t = new THREE.Group();
  const tr = new THREE.Mesh(new THREE.CylinderGeometry(.07, .12, h, 8), mk(0x5b4636)); tr.position.y = h / 2; t.add(tr);
  for (let k = 0; k < 16; k++) {
    const f = new THREE.Mesh(new THREE.IcosahedronGeometry(.45 + (k % 3) * .12, 1), mk(k % 2 ? 0x8cc15a : 0x6fa747));
    const a = k * 2.4; f.position.set(Math.cos(a) * (.5 + (k % 5) * .35), h * .5 + k * .2, Math.sin(a) * .8); f.scale.y = .6; f.castShadow = true; t.add(f);
  }
  t.position.set(x, 0, z); g.add(t);
}
function environment(g, o) {
  const { x0, x1, cars = [], people = [], bg = 0x2f5a35, roadZ = 9.5, lawn = null, flowers = true } = o;
  const w = x1 - x0, cx = (x0 + x1) / 2;
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(240, 240), mk(0x6b8f4a)); ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true; g.add(ground);
  const pave = canvasTex(256, 256, (c, ww, hh) => {
    c.fillStyle = "#9c9da1"; c.fillRect(0, 0, ww, hh); c.strokeStyle = "#85868b"; c.lineWidth = 2;
    for (let y = 0; y < hh; y += 32) { c.beginPath(); c.moveTo(0, y); c.lineTo(ww, y); c.stroke(); for (let x = (y / 32 % 2) * 32; x < ww; x += 64) { c.beginPath(); c.moveTo(x, y); c.lineTo(x, y + 32); c.stroke(); } }
  });
  pave.wrapS = pave.wrapT = THREE.RepeatWrapping; pave.repeat.set(Math.max(4, w / 3), 2);
  const drive = new THREE.Mesh(new THREE.BoxGeometry(w + 8, .06, 6), new THREE.MeshStandardMaterial({ map: pave, roughness: .9 }));
  drive.position.set(cx, .03, 3.3); drive.receiveShadow = true; g.add(drive);
  g.add(box(w + 8, .05, 7, mk(0x55575c, .95), cx, .02, roadZ, false));
  g.add(box(w + 8, .2, .3, mk(0xb9b9b6), cx, .1, roadZ - 3.1, false));
  if (lawn) g.add(box(lawn.w, .08, lawn.d, mk(0x7fb04a), lawn.x, .05, lawn.z, false));
  cars.forEach(([x, z, col, len, hh, rot]) => g.add(car(x, z, col, len, hh, rot)));
  people.forEach(([x, z, c, h, p]) => g.add(person(x, z, c, h, p)));
  if (flowers) {
    for (let k = 0; k < 12; k++) bush(g, x0 + 1 + k * (w / 11), 13.2 + (k % 3), 0xd9472b, .42 + (k % 4) * .1);
    for (let k = 0; k < 6; k++) bush(g, x0 - 1 + k * 2.2, 12.6, 0xe6c93a, .4);
  }
  for (let k = 0; k < 16; k++) {
    const b = new THREE.Mesh(new THREE.IcosahedronGeometry(7 + (k % 4) * 1.5, 1), mk(k % 3 ? bg : 0x3d6e3c));
    b.position.set(cx - 48 + k * 6.4, 8 + (k % 3) * 2, -26 - (k % 2) * 5); g.add(b);
  }
}
const planks = (c, w, h, y0, y1, a = "#54463d", b1 = "#4b3e36", b2 = "#5d4e44", step = 14) => {
  c.fillStyle = a; c.fillRect(0, y0, w, y1 - y0);
  for (let y = y0, i = 0; y < y1; y += step, i++) { c.fillStyle = i % 2 ? b1 : b2; c.fillRect(0, y, w, step - 1); }
};

// =====================================================================================
//  GABLE 2 LANTAI (BIANCA): tiap rumah punya balkon sendiri; A dan B (cermin) dipisah dinding dalam.
// =====================================================================================
const BP = { W: 5, G: .73, H1: 1.16, RISE: .5, D: 12 };
BP.T = BP.H1 + BP.RISE;

function biancaUpper(mirror, glow) {
  const { H1, T } = BP, cw = 640, ch = Math.round(cw * T);
  const X = (u) => u * cw, Y = (v) => (1 - v / T) * ch;
  const poly = (c, pts) => { c.beginPath(); pts.forEach(([u, v], i) => i ? c.lineTo(X(u), Y(v)) : c.moveTo(X(u), Y(v))); c.closePath(); };
  const inner = [[.04, H1 - .05], [.5, T - .09], [.96, H1 - .05], [.96, .04], [.04, .04]];
  return canvasTex(cw, ch, (c) => {
    drawMirrored(c, cw, mirror);
    c.fillStyle = glow ? "#000" : "#575a62"; c.fillRect(0, 0, cw, ch);
    if (glow) {
      const gr = c.createLinearGradient(0, Y(.73), 0, Y(.16)); gr.addColorStop(0, "#ffe3ab"); gr.addColorStop(1, "#f0b25f");
      c.fillStyle = gr; c.fillRect(X(.55), Y(.73), X(.91) - X(.55), Y(.16) - Y(.73));
      c.fillStyle = "rgba(255,255,255,.5)"; c.fillRect(X(.58), Y(.66), X(.08), Y(.5) - Y(.66)); c.fillRect(X(.78), Y(.62), X(.09), Y(.46) - Y(.62));
      c.fillStyle = "#1c1d22"; [.55, .73, .91].forEach((u) => c.fillRect(X(u) - 3, Y(.73), 6, Y(.16) - Y(.73)));
      return;
    }
    c.save(); poly(c, inner); c.clip();
    const wg = c.createLinearGradient(0, 0, 0, ch); wg.addColorStop(0, "#f2f4fc"); wg.addColorStop(1, "#d6dbef");
    c.fillStyle = wg; c.fillRect(0, 0, cw, ch);
    c.strokeStyle = "#a8aec6"; c.lineWidth = 2;
    const ln = (a, b, d, e) => { c.beginPath(); c.moveTo(X(a), Y(b)); c.lineTo(X(d), Y(e)); c.stroke(); };
    ln(.37, .92, .37, T); ln(.04, .92, .37, .92); ln(.04, .38, .52, .38); ln(.3, .38, .3, .79); ln(.04, 1.1, .37, 1.1);
    c.beginPath(); c.rect(X(.52), 0, X(.44), Y(.79)); c.clip();
    for (let u = .52; u < .96; u += .013) { c.fillStyle = (Math.round(u / .013) % 2) ? "#463a34" : "#5e4f47"; c.fillRect(X(u), 0, X(.013), Y(.79)); }
    c.restore();
    c.fillStyle = "#23262c"; c.fillRect(X(.545), Y(.745), X(.92) - X(.545), Y(.15) - Y(.745));
  });
}
function biancaGround(mirror, glow) {
  const { G } = BP, cw = 640, ch = Math.round(cw * G);
  const X = (u) => u * cw, Y = (v) => (1 - v / G) * ch;
  return canvasTex(cw, ch, (c) => {
    drawMirrored(c, cw, mirror);
    c.fillStyle = glow ? "#000" : "#54463d"; c.fillRect(0, 0, cw, ch);
    if (!glow) {
      for (let v = 0; v < G; v += .034) { c.fillStyle = Math.round(v / .034) % 2 ? "#4b3e36" : "#5d4e44"; c.fillRect(0, Y(v + .034), cw, Y(v) - Y(v + .034) - 1); }
      c.fillStyle = "#6e7077"; c.fillRect(0, Y(.03), cw, Y(0) - Y(.03));
      c.fillStyle = "#16181d"; c.fillRect(X(.53) - 4, Y(.62) - 4, X(.27) + 8, Y(.13) - Y(.62) + 8);
      c.fillStyle = "#a8744a"; c.fillRect(X(.86), Y(.6), X(.14), Y(.06) - Y(.6));
      c.fillStyle = "#cfd2dc"; c.fillRect(X(.02), Y(.58), X(.27), Y(.48) - Y(.58));
    } else {
      const gr = c.createLinearGradient(0, Y(.62), 0, Y(.13)); gr.addColorStop(0, "#ffe0a2"); gr.addColorStop(1, "#eeb766");
      c.fillStyle = gr; c.fillRect(X(.53), Y(.62), X(.27), Y(.13) - Y(.62));
      c.fillStyle = "#ffe9b8"; c.fillRect(X(.03), Y(.57), X(.25), Y(.49) - Y(.57));
      c.fillStyle = "#ff9a4a"; c.globalAlpha = .5; c.fillRect(X(.86), Y(.6), X(.14), Y(.06) - Y(.6)); c.globalAlpha = 1;
    }
  });
}
function recessMat(rw, rh, niche) {
  const cw = 160, ch = Math.round(cw * rh / rw);
  const X = (u) => (u / rw) * cw, Y = (v) => (1 - v / rh) * ch;
  const t = (glow) => canvasTex(cw, ch, (c) => {
    c.fillStyle = glow ? "#000" : "#6c6f78"; c.fillRect(0, 0, cw, ch);
    if (!glow) planks(c, cw, ch, Y(BP.G), ch, "#54463d", "#4b3e36", "#5d4e44", 12), c.fillRect(0, 0, 0, 0);
    if (!glow) { c.fillStyle = "#6c6f78"; c.fillRect(0, 0, cw, Y(BP.G)); c.fillStyle = "#2a2c33"; c.fillRect(X(.08) - 3, Y(BP.G + .95), X(.06) + 6, Y(BP.G + .45) - Y(BP.G + .95) + 6); }
    else { c.fillStyle = "#ffd89a"; c.fillRect(X(.08), Y(BP.G + .95), X(.06), Y(BP.G + .45) - Y(BP.G + .95)); }
  });
  return litMat([t(false), t(true)]);
}

function buildBianca(opts = {}) {
  const { W, G, H1, RISE, D, T } = BP;
  const g = new THREE.Group();
  const gh = G * W, h1 = H1 * W, rise = RISE * W, topH = T * W;
  const sideMat = mk(0xcfd3e0, .85), greyMat = mk(0x4f525a, .7), greyTop = mk(0x62656e, .7), railMat = mk(0x1f2126, .5);
  const roofTex = canvasTex(256, 256, (c, w, h) => { c.fillStyle = "#313a4b"; c.fillRect(0, 0, w, h); c.strokeStyle = "#252c3a"; c.lineWidth = 2; for (let y = 0; y < h; y += 16) { c.beginPath(); c.moveTo(0, y); c.lineTo(w, y); c.stroke(); } });
  roofTex.wrapS = roofTex.wrapT = THREE.RepeatWrapping; roofTex.repeat.set(5, 4);
  const roofMat = new THREE.MeshStandardMaterial({ map: roofTex, roughness: .55 });
  const shape = new THREE.Shape();
  [[0, 0], [W, 0], [W, h1], [W / 2, topH], [0, h1]].forEach(([x, y], i) => i ? shape.lineTo(x, y) : shape.moveTo(x, y));
  const prismGeo = new THREE.ExtrudeGeometry(shape, { depth: D, bevelEnabled: false });
  const frontGeo = new THREE.ShapeGeometry(shape);
  { const p = frontGeo.attributes.position, uv = frontGeo.attributes.uv; for (let i = 0; i < p.count; i++) uv.setXY(i, p.getX(i) / W, p.getY(i) / topH); }
  const grGeo = new THREE.PlaneGeometry(W, gh);
  const slopeLen = Math.hypot(W / 2, rise) + .25;
  const upA = litMat([biancaUpper(false, false), biancaUpper(false, true)]), upB = litMat([biancaUpper(true, false), biancaUpper(true, true)]);
  const grA = litMat([biancaGround(false, false), biancaGround(false, true)]), grB = litMat([biancaGround(true, false), biancaGround(true, true)]);
  const recH = (G + .95) * W, rw = .3 * W;
  const recMat = recessMat(.3, G + .95);

  function unit(x0, mirror) {
    const u = new THREE.Group(); u.position.x = x0;
    u.add(box(W, gh, D, sideMat, W / 2, gh / 2, -D / 2));
    const fg = new THREE.Mesh(grGeo, mirror ? grB : grA); fg.position.set(W / 2, gh / 2, .02); u.add(fg);
    const prism = new THREE.Mesh(prismGeo, sideMat); prism.position.set(0, gh, -D); prism.castShadow = true; u.add(prism);
    const fr = new THREE.Mesh(frontGeo, mirror ? upB : upA); fr.position.set(0, gh, .02); u.add(fr);
    const bx = mirror ? W * .25 : W * .75, bw = W * .5;
    u.add(box(bw, .16 * W, 1.3, greyMat, bx, gh + .08 * W, .65));                        // slab balkon
    u.add(box(bw + .1, .06 * W, .7, greyMat, bx, gh + .76 * W, .35));                    // kanopi kaca
    const n = 14, rl = bw - .3;
    for (let k = 0; k <= n; k++) u.add(box(.035, .24 * W, .035, railMat, bx - rl / 2 + k * rl / n, gh + .28 * W, 1.2, false));
    u.add(box(rl, .06, .06, railMat, bx, gh + .4 * W, 1.2, false));
    const dx = mirror ? W * .07 : W * .93;
    u.add(box(W * .3, .12, .9, greyTop, dx, gh * .85, .45));                              // kanopi pintu
    [-1, 1].forEach((s) => {
      const r = box(slopeLen, .16, D + .4, roofMat, W / 2 + s * (W / 4), gh + h1 + rise / 2 + .1, -D / 2 + .15);
      r.rotation.z = -s * Math.atan2(rise, W / 2); u.add(r);
    });
    return u;
  }
  function spacer(x0, pilaster) {
    const s = new THREE.Group(); s.position.x = x0;
    const pw = .12 * W, ph = (G + H1 + .03) * W;
    const pil = mk(0xd9dce8, .8), pg = mk(0x8b8e98);
    s.add(box(pw, ph, D + .5, [pg, pg, pil, pg, pil, pg], pw / 2, ph / 2, -D / 2 + .5));
    s.add(box(rw, recH, D, sideMat, pw + rw / 2, recH / 2, -D / 2 - .2));
    const rf = new THREE.Mesh(new THREE.PlaneGeometry(rw, recH), recMat); rf.position.set(pw + rw / 2, recH / 2, -.19); s.add(rf);
    return s;
  }
  const sp = .42 * W;
  const row = new THREE.Group();
  let x = 0;
  const seq = opts.hook ? [false, true, false] : [false, true, false, true];
  seq.forEach((m) => { row.add(spacer(x, true)); row.add(unit(x + sp, m)); x += sp + W; });
  const endP = spacer(x, true); endP.children.length = 1; row.add(endP);
  let total = x + .12 * W;
  if (opts.hook) addCornerWing(row, { x: x + .12 * W, W, gh, h1, D, sideMat, roofMat, upper: true });
  if (opts.hook) total += 5;
  row.position.x = -total / 2; g.add(row);
  const gx = -total / 2;
  environment(g, {
    x0: gx, x1: gx + total,
    cars: opts.hook ? [[gx + 9, 3.6, 0xb9bec7], [gx + 14.6, 3.6, 0xc9ced6, 4.4]] : [[gx + 4.6, 3.5, 0xc9ced6], [gx + 19.5, 3.5, 0xb9bec7, 4.9, 1.3], [gx + 25.3, 3.6, 0xb8bcc4]],
    people: opts.hook ? [[gx + total - 6, 6.5, 0xc7d8c2, 1.65, 0x3b4a6b], [gx + total - 5, 6.4, 0x8da0c0]] : [[gx + 10, 4.6, 0xefe7d8, 1.65, 0xefe7d8], [gx + 12.8, 4.4, 0x4b5a78]],
    lawn: { x: gx + total - 9, z: 6.6, w: 16, d: 4.5 },
  });
  tree(g, gx + (opts.hook ? 4 : 17), 5.3, 6.5);
  return g;
}

// Sayap samping unit pojok (hook): ruang lantai bawah berpanel kayu + volume atas, taman samping.
export function addCornerWing(row, o) {
  const { x, W, gh, h1, D, sideMat, roofMat } = o;
  const wing = new THREE.Group(); wing.position.x = x;
  const ww = 4.6, wd = D * .62;
  const woodTex = canvasTex(256, 256, (c, w, h) => planks(c, w, h, 0, h, "#6d5240", "#5e4535", "#7a5d48", 20));
  woodTex.wrapS = woodTex.wrapT = THREE.RepeatWrapping; woodTex.repeat.set(2, 1.2);
  const woodMat = new THREE.MeshStandardMaterial({ map: woodTex, roughness: .85 });
  wing.add(box(ww, gh, wd, woodMat, ww / 2, gh / 2, -wd / 2));
  wing.add(box(ww + .2, .14, wd + .2, mk(0x62656e), ww / 2, gh + .07, -wd / 2));
  wing.add(box(1.8, 2.0, .08, mk(0x1d1f25), ww * .6, gh * .5, .04, false));
  const win = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 1.8), new THREE.MeshBasicMaterial({ color: 0xffd896 })); win.position.set(ww * .6, gh * .5, .09); wing.add(win);
  if (o.upper) {                                                  // bay gable sempit di lantai atas dengan jendela
    const bw = 3.0, br = bw / 2, bd = 5;
    const sh = new THREE.Shape(); [[0, 0], [bw, 0], [bw, h1], [bw / 2, h1 + br], [0, h1]].forEach(([a, b], i) => i ? sh.lineTo(a, b) : sh.moveTo(a, b));
    const bay = new THREE.Mesh(new THREE.ExtrudeGeometry(sh, { depth: bd, bevelEnabled: false }), sideMat);
    bay.position.set(ww - bw - .1, gh + .14, -bd + .2); bay.castShadow = true; wing.add(bay);
    const fr = new THREE.Mesh(new THREE.ShapeGeometry(sh), new THREE.MeshStandardMaterial({ color: 0xdfe3f2, roughness: .8 }));
    fr.position.set(ww - bw - .1, gh + .14, .22); wing.add(fr);
    wing.add(box(1.5, 2.6, .08, mk(0x23262c), ww - bw / 2 - .1, gh + 2.0, .25, false));
    const gl = new THREE.Mesh(new THREE.PlaneGeometry(1.3, 2.4), new THREE.MeshBasicMaterial({ color: 0xffd896 })); gl.position.set(ww - bw / 2 - .1, gh + 2.0, .3); wing.add(gl);
    wing.add(box(bw * .45, h1 * .55, .06, mk(0x54463f), ww - bw / 2 - .1, gh + h1 * .8 + .14, .26, false));
    [-1, 1].forEach((s2) => {
      const ang = Math.atan2(br, bw / 2), len = Math.hypot(bw / 2, br) + .2;
      const r = box(len, .14, bd + .3, roofMat, ww - bw / 2 - .1 + s2 * (bw / 4), gh + .14 + h1 + br / 2 + .06, -bd / 2 + .3);
      r.rotation.z = -s2 * ang; wing.add(r);
    });
  }
  row.add(wing);
}

// =====================================================================================
//  ATAP SLATE (GWEN / NEW GWEN / DARLENE / ANGELINE): atap miring ke depan, sirip putih,
//  jendela atas di bawah kanopi, porch putih berlengkung berpasangan.
// =====================================================================================
const SW = 6, SG = .72, SU = .38, SR = .52, SD = 12;   // lebar, lantai bawah, pita jendela atas, tinggi atap (satuan W)

function slateUpper(style, mirror, glow) {
  const cw = 768, ch = Math.round(cw * SU);
  const X = (u) => u * cw, Y = (v) => (1 - v / SU) * ch;
  return canvasTex(cw, ch, (c) => {
    drawMirrored(c, cw, mirror);
    c.fillStyle = glow ? "#000" : "#e8e9f0"; c.fillRect(0, 0, cw, ch);
    // jendela: [x0,x1] area bingkai, kaca, kisi-kisi
    const cfg = {
      gwen:     { frame: [.16, .88], glass: [.46, .84], louv: [[.18, .45]] },
      angeline: { frame: [.2, .86], glass: [.37, .69], louv: [[.22, .37], [.69, .84]] },
      darlene:  { frame: [.16, .92], glass: null, louv: [[.18, .9]] },
    }[style];
    const v0 = .02, v1 = .3;
    if (!glow) {
      c.fillStyle = "#4b4e57"; c.fillRect(X(cfg.frame[0]), Y(v1 + .03), X(cfg.frame[1] - cfg.frame[0]), Y(v0 - .01) - Y(v1 + .03));
    }
    const warm = (u0, u1, bright) => {
      const gr = c.createLinearGradient(0, Y(v1), 0, Y(v0)); gr.addColorStop(0, "#ffe9b8"); gr.addColorStop(1, "#f2b968");
      c.fillStyle = gr; c.fillRect(X(u0), Y(v1), X(u1 - u0), Y(v0) - Y(v1));
    };
    if (cfg.glass) {
      warm(cfg.glass[0], cfg.glass[1]);
      c.strokeStyle = glow ? "#1c1d22" : "#2b2d33"; c.lineWidth = 3;
      const [a, b] = cfg.glass; for (let i = 0; i <= 3; i++) { const u = a + (b - a) * i / 3; c.beginPath(); c.moveTo(X(u), Y(v1)); c.lineTo(X(u), Y(v0)); c.stroke(); }
      for (let i = 0; i <= 2; i++) { const v = v0 + (v1 - v0) * i / 2; c.beginPath(); c.moveTo(X(a), Y(v)); c.lineTo(X(b), Y(v)); c.stroke(); }
    }
    cfg.louv.forEach(([a, b]) => {
      if (style === "darlene") warm(a, b);
      for (let u = a; u < b; u += .018) {
        c.fillStyle = glow ? (style === "darlene" ? "#2a1f12" : "#000") : "#3a3d45";
        c.fillRect(X(u), Y(v1), X(.009), Y(v0) - Y(v1));
      }
      if (!glow && style !== "darlene") { c.fillStyle = "#4b4e57"; c.globalAlpha = .6; c.fillRect(X(a), Y(v1), X(b - a), Y(v0) - Y(v1)); c.globalAlpha = 1; }
    });
  });
}
function slateGround(mirror, glow) {
  const cw = 768, ch = Math.round(cw * SG);
  const X = (u) => u * cw, Y = (v) => (1 - v / SG) * ch;
  const archPath = (c, u0, u1, v0, v1) => {
    const r = (u1 - u0) / 2 * cw, cx = X((u0 + u1) / 2), top = Y(v1) + r;
    c.beginPath(); c.moveTo(X(u0), Y(v0)); c.lineTo(X(u0), top); c.arc(cx, top, r, Math.PI, 0); c.lineTo(X(u1), Y(v0)); c.closePath();
  };
  return canvasTex(cw, ch, (c) => {
    drawMirrored(c, cw, mirror);
    c.fillStyle = glow ? "#000" : "#6e5240"; c.fillRect(0, 0, cw, ch);
    if (!glow) {
      for (let v = 0; v < SG; v += .036) { c.fillStyle = Math.round(v / .036) % 2 ? "#664a39" : "#7b5c46"; c.fillRect(0, Y(v + .036), cw, Y(v) - Y(v + .036) - 1); }
      c.fillStyle = "#6e7077"; c.fillRect(0, Y(.03), cw, Y(0) - Y(.03));
      c.fillStyle = "#74777f"; c.fillRect(X(.105), Y(.6), X(.37), Y(.145) - Y(.6));              // lis luar kusen
      c.fillStyle = "#1f2127"; c.fillRect(X(.118), Y(.587), X(.344), Y(.158) - Y(.587));        // kusen gelap
    } else {
      const panes = [[.13, .284], [.296, .45]], rows = [[.17, .575]];
      panes.forEach(([u0, u1]) => rows.forEach(([v0, v1]) => {
        const gr = c.createLinearGradient(0, Y(v1), 0, Y(v0)); gr.addColorStop(0, "#ffe6b0"); gr.addColorStop(1, "#e9a95a");
        c.fillStyle = gr; c.fillRect(X(u0), Y(v1), X(u1 - u0), Y(v0) - Y(v1));
        c.fillStyle = "rgba(190,120,50,.35)"; c.fillRect(X(u0), Y(v1), X(.018), Y(v0) - Y(v1)); c.fillRect(X(u1 - .018), Y(v1), X(.018), Y(v0) - Y(v1));   // tirai
      }));
    }
    if (!glow) {
      c.fillStyle = "#1f2127";                                                                    // sekat kaca
      c.fillRect(X(.284), Y(.587), X(.012), Y(.158) - Y(.587));
    }
  });
}

function porchMat() {                                      // satu blok putih untuk dua porch bersebelahan (A + B)
  const pw = .84, ph = SG * .95, cw = 640, ch = Math.round(cw * ph / pw);
  const X = (u) => u * cw, Y = (v) => (1 - v / ph) * ch;
  const arch = (c, u0, u1, v0, v1) => { const r = (u1 - u0) / 2 * cw, cx = X((u0 + u1) / 2), top = Y(v1) + r; c.beginPath(); c.moveTo(X(u0), Y(v0)); c.lineTo(X(u0), top); c.arc(cx, top, r, Math.PI, 0); c.lineTo(X(u1), Y(v0)); c.closePath(); };
  const t = (glow) => canvasTex(cw, ch, (c) => {
    c.fillStyle = glow ? "#000" : "#e9eaf1"; c.fillRect(0, 0, cw, ch);
    [[.07, .35], [.49, .77]].forEach(([a0, a1]) => {
      const gr = c.createLinearGradient(0, Y(.55), 0, Y(.02)); gr.addColorStop(0, "#ffe2b0"); gr.addColorStop(1, "#d99a5a");
      arch(c, a0, a1, .02, .55); c.fillStyle = glow ? "#e8b878" : gr; c.fill();
      c.save(); arch(c, a0 + .03, a1 - .03, .02, .5); c.clip(); c.fillStyle = glow ? "#2c1a0e" : "#7d5636"; c.fillRect(0, 0, cw, ch);
      c.strokeStyle = glow ? "#1a0f08" : "#684528"; c.lineWidth = 2;
      for (let u = a0 + .04; u < a1 - .03; u += .03) { c.beginPath(); c.moveTo(X(u), 0); c.lineTo(X(u), ch); c.stroke(); }
      c.restore();
    });
  });
  return litMat([t(false), t(true)]);
}

function buildSlate(style, opts = {}) {
  const g = new THREE.Group();
  const W = SW, D = SD, gh = SG * W, uh = SU * W, rise = SR * W;
  const yEave = gh + uh, yRidge = yEave + rise, sRidge = 4.4, backDrop = 3.2;
  const white = mk(0xe9eaf1, .8), slateTex = canvasTex(256, 256, (c, w, h) => {
    c.fillStyle = "#5a6376"; c.fillRect(0, 0, w, h);
    for (let y = 0; y < h; y += 24) { c.fillStyle = "#454d5e"; c.fillRect(0, y, w, 2); for (let x = (y / 24 % 2) * 16; x < w; x += 32) { c.fillRect(x, y, 2, 24); } }
  });
  slateTex.wrapS = slateTex.wrapT = THREE.RepeatWrapping; slateTex.repeat.set(4, 3);
  const slate = new THREE.MeshStandardMaterial({ map: slateTex, roughness: .55 });
  const upA = litMat([slateUpper(style, false, false), slateUpper(style, false, true)]), upB = litMat([slateUpper(style, true, false), slateUpper(style, true, true)]);
  const grA = litMat([slateGround(false, false), slateGround(false, true)]), grB = litMat([slateGround(true, false), slateGround(true, true)]);
  const front = new THREE.PlaneGeometry(W, uh), grGeo = new THREE.PlaneGeometry(W, gh);
  const slopeLen = Math.hypot(sRidge + .4, rise);
  const slopeAng = Math.atan2(rise, sRidge + .4);

  // profil sirip/dinding pembatas (sisi): depan -> belakang mengikuti kemiringan atap
  const prof = new THREE.Shape();
  [[-.4, 0], [D, 0], [D, yEave - backDrop + .35], [sRidge, yRidge + .3], [-.4, yEave + .3]].forEach(([s, y], i) => i ? prof.lineTo(s, y) : prof.moveTo(s, y));
  const finGeo = new THREE.ExtrudeGeometry(prof, { depth: .3, bevelEnabled: false }); finGeo.rotateY(Math.PI / 2);
  const wallGeo = new THREE.ExtrudeGeometry(prof, { depth: .08, bevelEnabled: false }); wallGeo.rotateY(Math.PI / 2);

  function unit(x0, mirror) {
    const u = new THREE.Group(); u.position.x = x0;
    u.add(box(W, gh, D, white, W / 2, gh / 2, -D / 2));
    const fg = new THREE.Mesh(grGeo, mirror ? grB : grA); fg.position.set(W / 2, gh / 2, .02); u.add(fg);
    u.add(box(W, uh, D, white, W / 2, gh + uh / 2, -D / 2));
    const fu = new THREE.Mesh(front, mirror ? upB : upA); fu.position.set(W / 2, gh + uh / 2, .02); u.add(fu);
    // porch putih menjorok + atap datar: satu blok untuk pasangan A+B (dibuat di unit A)
    if (!mirror) {
      u.add(box(W * .84, gh * .95, 1.3, white, W, gh * .475, .65));
      const pf = new THREE.Mesh(new THREE.PlaneGeometry(W * .84, gh * .95), porchMat()); pf.position.set(W, gh * .475, 1.32); u.add(pf);
      u.add(box(W * .86, .14, 1.45, mk(0x62656e), W, gh * .97, .72));
    }
    // atap miring depan (slate) + belakang
    const rf = box(slopeLen, .16, W - .1, slate, 0, 0, 0);
    rf.geometry = new THREE.BoxGeometry(W - .1, .16, slopeLen);
    rf.rotation.x = slopeAng; rf.position.set(W / 2, yEave + rise / 2 + .08, -(sRidge - .4) / 2 + .0);
    u.add(rf);
    const bl = Math.hypot(D - sRidge, backDrop);
    const rb = box(W - .1, .16, bl, slate, W / 2, yRidge - backDrop / 2 + .08, -(sRidge + D) / 2);
    rb.rotation.x = -Math.atan2(backDrop, D - sRidge); u.add(rb);
    // lis fascia di tepi atap
    u.add(box(W - .1, .22, .12, white, W / 2, yEave + .08, .42, false));
    return u;
  }
  const n = opts.hook ? 3 : 4;
  const row = new THREE.Group();
  for (let i = 0; i < n; i++) {
    row.add(unit(i * W, i % 2 === 1));
    const fin = new THREE.Mesh(finGeo, white); fin.position.set(i * W - .15, 0, 0); fin.castShadow = true; row.add(fin);
  }
  const EX = 3.8;
  const endFin = new THREE.Mesh(opts.hook ? wallGeo : finGeo, white);
  endFin.position.set(n * W - .15, 0, 0); endFin.castShadow = true; row.add(endFin);
  let total = n * W;
  if (opts.hook) {
    // unit pojok melebar: dinding kayu lantai bawah + dinding putih polos di atas, atap slate menerus,
    // dinding samping putih besar mengikuti kemiringan atap
    const woodTex = canvasTex(256, 256, (c, w, h) => planks(c, w, h, 0, h, "#7b5c46", "#664a39", "#7b5c46", 18));
    woodTex.wrapS = woodTex.wrapT = THREE.RepeatWrapping; woodTex.repeat.set(2, 1.2);
    const wood = new THREE.MeshStandardMaterial({ map: woodTex, roughness: .85 });
    const x0 = n * W, cxx = x0 + EX / 2;
    row.add(box(EX, yEave, D, white, cxx, yEave / 2, -D / 2));
    const wf = new THREE.Mesh(new THREE.PlaneGeometry(EX, gh), wood); wf.position.set(cxx, gh / 2, .02); row.add(wf);
    row.add(box(EX, .12, 1.0, mk(0x62656e), cxx, gh * .97, .5));
    row.add(box(1.3, 2.3, .08, mk(0x1d1f25), x0 + EX * .66, gh * .5, .06, false));
    const wg = new THREE.Mesh(new THREE.PlaneGeometry(1.05, 2.05), new THREE.MeshBasicMaterial({ color: 0xffd896 })); wg.position.set(x0 + EX * .66, gh * .5, .11); row.add(wg);
    const rfH = box(EX, .16, slopeLen, slate, 0, 0, 0);
    rfH.geometry = new THREE.BoxGeometry(EX, .16, slopeLen); rfH.rotation.x = slopeAng; rfH.position.set(cxx, yEave + rise / 2 + .08, -(sRidge - .4) / 2); row.add(rfH);
    const bl2 = Math.hypot(D - sRidge, backDrop);
    const rbH = box(EX, .16, bl2, slate, cxx, yRidge - backDrop / 2 + .08, -(sRidge + D) / 2); rbH.rotation.x = -Math.atan2(backDrop, D - sRidge); row.add(rbH);
    row.add(box(EX, .22, .12, white, cxx, yEave + .08, .42, false));
    const sideWall = new THREE.Mesh(finGeo, white); sideWall.position.set(x0 + EX - .15, 0, 0); sideWall.castShadow = true; row.add(sideWall);
    if (style === "angeline") {                                    // jendela samping lantai atas (kotak berbingkai gelap)
      row.add(box(.12, 1.9, 3.2, mk(0x3b3e46), x0 + EX + .02, gh + uh * .75, -3.2, false));
      const sw = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 1.5), new THREE.MeshBasicMaterial({ color: 0xffd896 })); sw.rotation.y = Math.PI / 2; sw.position.set(x0 + EX + .09, gh + uh * .75, -3.2); row.add(sw);
    }
    total += EX;
  }
  row.position.x = -total / 2; g.add(row);
  const gx = -total / 2;
  const hookCars = [[gx + 3.6, 3.7, 0xd8dce4], [gx + 9.8, 3.6, 0x16181d]];
  const rowCars = [[gx + 3.6, 3.5, 0xf2f3f5, 4.7, 1.5], [gx + 17.5, 3.5, 0x1c1e22, 4.6, 1.5], [gx + 23.4, 3.5, 0xb8bcc4, 4.5, 1.4]];
  environment(g, {
    x0: gx, x1: gx + total, cars: opts.hook ? hookCars : rowCars,
    people: opts.hook ? [[gx + total - 2.5, 7.2, 0xefece4, 1.7, 0xefece4], [gx + total - 1.6, 7.1, 0x777b86]] : [[gx + 11.2, 4.7, 0xd8c7b0, 1.7, 0xd8c7b0], [gx + 12.6, 4.6, 0xe3dccf]],
    lawn: { x: gx + (opts.hook ? total - 9 : 14.5), z: 6.2, w: opts.hook ? 18 : 11, d: opts.hook ? 5.5 : 2.4 },
  });
  if (!opts.hook) { for (let k = 0; k < 6; k++) bush(g, gx + 10 + k * 1.4, 5.0 + (k % 2) * .4, k % 2 ? 0x3f8a3a : 0x5a9a42, .55 + (k % 3) * .1); }
  else { for (let k = 0; k < 10; k++) bush(g, gx + total - 16 + k * 1.3, 5.3, k % 2 ? 0x3f8a3a : 0x5a9a42, .6); }
  return g;
}

// =====================================================================================
//  RUKO: 2 unit berjejer, rangka putih, kaca tinggi, kisi-kisi atas, papan nama.
// =====================================================================================
function buildRuko() {
  const g = new THREE.Group();
  const UW = 5.2, D = 15, hG = 3.7, hU = 5.5, hL = .9;
  const sign = (text, col, mirror) => canvasTex(512, 128, (c, w, h) => {
    c.fillStyle = "#5a5148"; c.fillRect(0, 0, w, h);
    c.fillStyle = col; c.font = "bold 70px 'Helvetica Neue', Arial, sans-serif"; c.textAlign = "center"; c.textBaseline = "middle";
    c.shadowColor = col; c.shadowBlur = 14; c.fillText(text, w / 2, h / 2 + 4);
  });
  const glassTex = (shop) => canvasTex(512, 640, (c, w, h) => {
    const gr = c.createLinearGradient(0, 0, w, h); gr.addColorStop(0, "#f7c3a0"); gr.addColorStop(1, "#e89c7e");
    c.fillStyle = gr; c.fillRect(0, 0, w, h);
    c.fillStyle = "rgba(255,255,255,.35)"; for (let i = 0; i < 10; i++) c.fillRect(30 + (i * 53) % 400, 40 + (i * 97) % 520, 90, 10);
    c.strokeStyle = "#2f3036"; c.lineWidth = 7;
    c.strokeRect(3, 3, w - 6, h - 6); c.beginPath(); c.moveTo(w / 2, 0); c.lineTo(w / 2, h); c.stroke();
    [.3, .68].forEach((f) => { c.beginPath(); c.moveTo(0, h * f); c.lineTo(w, h * f); c.stroke(); });
  });
  const shopTex = canvasTex(512, 256, (c, w, h) => {
    const gr = c.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, "#ffe2b0"); gr.addColorStop(1, "#f5b46a");
    c.fillStyle = gr; c.fillRect(0, 0, w, h);
    c.fillStyle = "#c97a4a"; for (let i = 0; i < 7; i++) c.fillRect(20 + i * 70, 40 + (i % 2) * 60, 50, 90);
    c.strokeStyle = "#2f3036"; c.lineWidth = 6; c.strokeRect(2, 2, w - 4, h - 4);
    [.33, .66].forEach((f) => { c.beginPath(); c.moveTo(w * f, 0); c.lineTo(w * f, h); c.stroke(); });
  });
  const louver = canvasTex(256, 64, (c, w, h) => { c.fillStyle = "#e8e6e2"; c.fillRect(0, 0, w, h); c.fillStyle = "#a9a39b"; for (let x = 0; x < w; x += 8) c.fillRect(x, 6, 4, h - 12); });
  const white = mk(0xf2f2f4, .7), grey = mk(0x6d6a68, .8);
  const glow = (tex) => new THREE.MeshStandardMaterial({ map: tex, emissive: 0xffffff, emissiveMap: tex, emissiveIntensity: .55, roughness: .3 });
  const total = 2 * UW;
  g.add(box(total, hG + hU + hL, D, white, 0, (hG + hU + hL) / 2, -D / 2));
  [[-UW / 2, "DIGICAM", "#42d4ff"], [UW / 2, "BOOKstore", "#c6f432"]].forEach(([x, name, col]) => {
    const sg = new THREE.Mesh(new THREE.PlaneGeometry(UW, 1), new THREE.MeshStandardMaterial({ map: sign(name, col), emissive: 0xffffff, emissiveMap: sign(name, col), emissiveIntensity: .5 }));
    sg.position.set(x, hG - .5, .03); g.add(sg);
    const sh = new THREE.Mesh(new THREE.PlaneGeometry(UW - .7, hG - 1.05), glow(shopTex)); sh.position.set(x, (hG - 1) / 2 + .1, .03); g.add(sh);
    const up = new THREE.Mesh(new THREE.PlaneGeometry(UW - .5, hU - .4), glow(glassTex())); up.position.set(x, hG + hU / 2, .06); g.add(up);
    const lv = new THREE.Mesh(new THREE.PlaneGeometry(UW - .5, hL - .1), new THREE.MeshStandardMaterial({ map: louver, roughness: .8 })); lv.position.set(x, hG + hU + hL / 2 - .02, .05); g.add(lv);
  });
  g.add(box(.35, hU + hL, .5, white, 0, hG + (hU + hL) / 2, .1));                    // kolom tengah
  g.add(box(total + .3, .3, .6, white, 0, hG + hU + hL - .05, .2));                  // balok atas
  g.add(box(total + .3, .25, .6, white, 0, hG - .02, .25));                           // balok antar lantai
  g.add(box(.3, hG + hU + hL, D + .1, grey, total / 2 + .15, (hG + hU + hL) / 2, -D / 2));
  g.position.x = 0;
  const gx = -total / 2 - 6;
  environment(g, {
    x0: gx, x1: total / 2 + 8, bg: 0x40703f, flowers: false,
    cars: [[-6.5, 5.6, 0xd9d4cf, 4.9, 1.6, .3], [-.5, 6.2, 0x9aa0a8, 4.5, 1.5, .2], [6.5, 5.8, 0xf0f0f2, 4.8, 1.55, -.3]],
    people: [[-9.7, 5.5, 0x23314f, 1.65, 0x23314f], [-8.9, 5.6, 0x2b2c33, 1.8], [-2.8, 4.6, 0x1f2430, 1.65, 0xdadada], [3.2, 4.4, 0x39313b, 1.75], [9.4, 5.2, 0xd9d9de, 1.7], [11.3, 6.6, 0xeeeeee, 1.7, 0x23252b]],
    roadZ: 11,
  });
  tree(g, -11, 4, 9); tree(g, -9.3, 2, 11);
  const cy = new THREE.Mesh(new THREE.ConeGeometry(1.6, 9, 12), mk(0x2f5a35)); cy.position.set(total / 2 + 3, 4.5, 1); g.add(cy);
  g.add(box(14, 2.4, .3, mk(0xe6c6b8, .9), -total / 2 - 8, 1.2, 1.6));                // pagar peach di kiri
  return g;
}

export const EXTRA_MODELS = {
  bianca:         { build: () => buildBianca(), target: [0, 5.5, 0], pos: [-8, 3, 36] },
  "bianca-hook":  { build: () => buildBianca({ hook: true }), target: [3, 5, 0], pos: [28, 4, 36] },
  gwen:           { build: () => buildSlate("gwen"), target: [0, 4.5, 0], pos: [-8, 3, 40] },
  "gwen-hook":    { build: () => buildSlate("gwen", { hook: true }), target: [3, 4.5, 0], pos: [26, 4, 34] },
  angeline:       { build: () => buildSlate("angeline"), target: [0, 4.5, 0], pos: [-8, 3, 40] },
  "angeline-hook": { build: () => buildSlate("angeline", { hook: true }), target: [3, 4.5, 0], pos: [26, 4, 34] },
  darlene:        { build: () => buildSlate("darlene"), target: [0, 4.5, 0], pos: [-8, 3, 40] },
  "darlene-hook": { build: () => buildSlate("darlene", { hook: true }), target: [3, 4.5, 0], pos: [26, 4, 34] },
  ruko:           { build: () => buildRuko(), target: [0, 5, 0], pos: [-6, 3.5, 36] },
};
