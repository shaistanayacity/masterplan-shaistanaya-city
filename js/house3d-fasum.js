// Model 3D fasilitas umum (masjid, lapangan, gym, playground, gerbang). Proporsi dari foto render di assets/renders/.
import * as THREE from "./vendor/three.module.js";
import { canvasTex, litMat, box } from "./house3d.js";
import { mk, car, person, bush, tree } from "./house3d-more.js";

const M = (c, r = .85, o = {}) => new THREE.MeshStandardMaterial({ color: c, roughness: r, ...o });
const glowM = (c, k = 1) => new THREE.MeshStandardMaterial({ color: c, emissive: c, emissiveIntensity: k, roughness: .6 });
function tilesTex(w, h, a, b, step, seam) {
  const t = canvasTex(256, 256, (c, ww, hh) => {
    c.fillStyle = a; c.fillRect(0, 0, ww, hh);
    for (let y = 0, i = 0; y < hh; y += step, i++) { c.fillStyle = i % 2 ? b : a; c.fillRect(0, y, ww, step - 2); }
    c.strokeStyle = seam; c.lineWidth = 2;
    for (let y = 0; y < hh; y += step) for (let x = (y / step % 2) * 40; x < ww; x += 80) { c.beginPath(); c.moveTo(x, y); c.lineTo(x, y + step); c.stroke(); }
  });
  t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(w, h); return t;
}
const stoneMat = (rx = 4, ry = 1) => new THREE.MeshStandardMaterial({ map: tilesTex(rx, ry, "#8d8a83", "#7f7c76", 64, "#6a6862"), roughness: .9 });
const slatMat = (col1 = "#6d5646", col2 = "#5a4638", rx = 6, ry = 1, emissive = false) => {
  const t = canvasTex(128, 128, (c, w, h) => { for (let x = 0; x < w; x += 8) { c.fillStyle = (x / 8) % 2 ? col2 : col1; c.fillRect(x, 0, 8, h); } });
  t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rx, ry);
  return new THREE.MeshStandardMaterial({ map: t, roughness: .8, ...(emissive ? { emissive: 0xff9a3a, emissiveIntensity: .25 } : {}) });
};
function groundPlane(g, col = 0x6b8f4a, size = 260) { const p = new THREE.Mesh(new THREE.PlaneGeometry(size, size), M(col, 1)); p.rotation.x = -Math.PI / 2; p.receiveShadow = true; g.add(p); return p; }
function slab(g, w, d, x, z, mat, y = .03, h = .06) { const m = box(w, h, d, mat, x, y, z, false); g.add(m); return m; }
function letters(g, text, w, h, x, y, z, color, glow = 0, font = "bold 300px 'Helvetica Neue', Arial, sans-serif", rotY = 0) {
  const t = canvasTex(2048, Math.round(2048 * h / w), (c, cw, ch) => {
    c.clearRect(0, 0, cw, ch); c.fillStyle = color; c.font = font; c.textAlign = "center"; c.textBaseline = "middle";
    let fs = 460; c.font = font.replace(/\d+px/, fs + "px"); while (c.measureText(text).width > cw * .96 && fs > 20) { fs -= 8; c.font = font.replace(/\d+px/, fs + "px"); }
    c.fillText(text, cw / 2, ch / 2 + fs * .04);
  });
  const mat = new THREE.MeshStandardMaterial({ map: t, transparent: true, alphaTest: .35, side: THREE.DoubleSide, emissive: glow ? new THREE.Color(color) : 0x000000, emissiveMap: glow ? t : null, emissiveIntensity: glow });
  for (let k = 0; k < 3; k++) { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat); m.position.set(x, y, z + k * .08); m.rotation.y = rotY; g.add(m); }
}
function palm(g, x, z, h = 10, o = {}) {
  const { fan = false, lean = 0, leaf = 0x4f7a35 } = o, p = new THREE.Group();
  const tr = new THREE.Mesh(new THREE.CylinderGeometry(fan ? .3 : .17, fan ? .42 : .27, h, 8), M(fan ? 0x6e6050 : 0x8a7d6a, .95));
  tr.position.y = h / 2; tr.castShadow = true; p.add(tr);
  const crown = new THREE.Group(); crown.position.y = h; p.add(crown);
  for (let i = 0; i < (fan ? 16 : 12); i++) {
    const bl = new THREE.Mesh(new THREE.BoxGeometry(fan ? 1.0 : .55, .06, fan ? 3.2 : 4.0).translate(0, 0, fan ? 1.6 : 2.0), M(leaf, 1));
    const a = i / (fan ? 16 : 12) * Math.PI * 2;
    bl.rotation.order = "YXZ"; bl.rotation.y = a; bl.rotation.x = (fan ? .25 : .45) + (i % 3) * .22; bl.castShadow = true; crown.add(bl);
  }
  if (fan) { const sk = new THREE.Mesh(new THREE.CylinderGeometry(.55, 1.0, 2.4, 10), M(0x7a6040, 1)); sk.position.y = -1.3; crown.add(sk); }
  p.position.set(x, 0, z); p.rotation.z = lean; g.add(p);
}
function blossom(g, x, z, h = 6, col = 0xb572c9) {
  const tr = new THREE.Mesh(new THREE.CylinderGeometry(.14, .22, h * .65, 7), M(0x6b5b50)); tr.position.set(x, h * .32, z); g.add(tr);
  for (let k = 0; k < 14; k++) {
    const f = new THREE.Mesh(new THREE.IcosahedronGeometry(.9 + (k % 3) * .25, 1), M(k % 4 ? col : 0xd49be0, 1));
    const a = k * 2.2; f.position.set(x + Math.cos(a) * 1.5, h * .75 + (k % 4) * .5, z + Math.sin(a) * 1.3); f.castShadow = true; g.add(f);
  }
}
function leafyBush(g, x, z, r = 1, col = 0x3f8a3a) { for (let k = 0; k < 6; k++) { const b = new THREE.Mesh(new THREE.ConeGeometry(.28, 1.6 * r, 5), M(k % 2 ? col : 0x5aa045, 1)); const a = k * 1.05; b.position.set(x + Math.cos(a) * .35 * r, .8 * r, z + Math.sin(a) * .35 * r); b.rotation.set(Math.sin(a) * .5, 0, -Math.cos(a) * .5); g.add(b); } }
function gableHouse(g, x, z, w = 7, d = 10, h = 5, roof = 0x353c4b, wall = 0xe4e6ee, rotY = 0) {
  const grp = new THREE.Group();
  grp.add(box(w, h, d, M(wall), 0, h / 2, 0));
  const sh = new THREE.Shape(); [[-w / 2, 0], [w / 2, 0], [0, w * .4]].forEach(([a, b], i) => i ? sh.lineTo(a, b) : sh.moveTo(a, b));
  const gb = new THREE.Mesh(new THREE.ExtrudeGeometry(sh, { depth: d, bevelEnabled: false }), M(wall)); gb.position.set(0, h, -d / 2); grp.add(gb);
  [-1, 1].forEach((s) => { const r = box(Math.hypot(w / 2, w * .4) + .3, .16, d + .4, M(roof, .6), s * w / 4, h + w * .2 + .06, 0); r.rotation.z = -s * Math.atan2(w * .4, w / 2); grp.add(r); });
  grp.position.set(x, 0, z); grp.rotation.y = rotY; g.add(grp);
}

// ---------------- MASJID AN-NUR ----------------
function buildMasjid() {
  const g = new THREE.Group(); groundPlane(g, 0x6f9250);
  slab(g, 80, 28, 0, 14, M(0x62656c, .95), .02, .04);
  const white = M(0xf1f1f3, .8), grey = M(0x58595f, .8);
  const archTex = (glow) => canvasTex(768, 540, (c, w, h) => {
    const X = (u) => u * w, Y = (v) => (1 - v) * h;
    const arch = (u0, u1, top) => { const r = (u1 - u0) / 2 * w, cx = X((u0 + u1) / 2); c.beginPath(); c.moveTo(X(u0), Y(.03)); c.lineTo(X(u0), Y(top) + r); c.arc(cx, Y(top) + r, r, Math.PI, 0); c.lineTo(X(u1), Y(.03)); c.closePath(); };
    c.fillStyle = glow ? "#000" : "#f3f3f6"; c.fillRect(0, 0, w, h);
    [[.09, .39], [.50, .81]].forEach(([u0, u1], i) => {
      if (!glow) { arch(u0 - .02, u1 + .02, .73); c.fillStyle = "#6b655e"; c.fill(); }
      arch(u0, u1, .71); const gr = c.createLinearGradient(0, Y(.7), 0, Y(.05)); gr.addColorStop(0, "#ffe6b0"); gr.addColorStop(1, "#f2b968");
      c.fillStyle = gr; c.fill();
      if (i === 1) { c.save(); arch(u0, u1, .71); c.clip(); c.fillStyle = glow ? "#8a5a25" : "#7a5a3a"; for (let u = u0; u < u1; u += .018) c.fillRect(X(u), Y(.71), X(.008), Y(.55) - Y(.71)); c.fillStyle = glow ? "#1a1a1c" : "#26282e"; c.fillRect(X(u0 + .02), Y(.5), X(u1 - u0 - .04), Y(.05) - Y(.5)); c.restore(); }
    });
  });
  const A = new THREE.Mesh(new THREE.PlaneGeometry(9.6, 6.7), litMat([archTex(false), archTex(true)])); A.position.set(-12.2, 3.35, 6.02); g.add(A);
  g.add(box(9.6, 6.7, 6, white, -12.2, 3.35, 3)); g.add(box(10, .25, 6.4, grey, -12.2, 6.8, 3));
  g.add(box(11.8, 8.4, 9, white, -7.9, 4.2, -4.5));                                                           // volume belakang
  const louv = new THREE.Mesh(new THREE.PlaneGeometry(7.8, 1.7), slatMat("#7a5638", "#5e4028", 20, 1, true)); louv.position.set(-8.4, 7.1, .02); g.add(louv);
  g.add(box(7.9, .1, .12, glowM(0xffc15a, 1.4), -8.4, 8.0, .08, false));                                      // strip LED
  const latTex = (glow) => canvasTex(640, 580, (c, w, h) => {
    c.fillStyle = glow ? "#000" : "#5b5d63"; c.fillRect(0, 0, w, h);
    const gr = c.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, "#ffd890"); gr.addColorStop(1, "#d98a35");
    if (glow) { c.fillStyle = gr; c.fillRect(30, 30, w - 60, h - 60); } else { c.fillStyle = "#c9a36a"; c.fillRect(30, 30, w - 60, h - 60); }
    c.strokeStyle = glow ? "#ffe9c0" : "#f1f1f3"; c.lineWidth = 9;
    for (let x = 30; x <= w - 30; x += 36) { c.beginPath(); c.moveTo(x, 30); c.lineTo(x, h - 30); c.stroke(); }
    for (let y = 30; y <= h - 30; y += 36) { c.beginPath(); c.moveTo(30, y); c.lineTo(w - 30, y); c.stroke(); }
  });
  const L = new THREE.Mesh(new THREE.PlaneGeometry(6.3, 5.7), litMat([latTex(false), latTex(true)])); L.position.set(-4.25, 2.85, 6.05); g.add(L);
  g.add(box(6.3, 5.7, 1, grey, -4.25, 2.85, 5.5));
  g.add(box(3.6, 8.8, 9, white, .2, 4.4, -.5));                                                                // sayap kanan tinggi
  g.add(box(1.4, 2.8, .1, M(0x24262c), .4, 1.4, 4.1)); g.add(box(1.6, .12, .8, grey, .4, 2.95, 4.35));
  palm(g, -26, 3, 11, { lean: .05 }); palm(g, 8.5, 4, 13, { lean: -.04 });
  for (let k = 0; k < 8; k++) bush(g, -18 + k * 2.2, 8 + (k % 2) * .6, k % 2 ? 0x3f7a35 : 0x56924a, .85);
  tree(g, -34, -6, 10); tree(g, -30, -12, 11); tree(g, 16, -10, 11);
  for (let k = 0; k < 6; k++) { const b = new THREE.Mesh(new THREE.IcosahedronGeometry(6 + k % 3, 1), M(0x2f5a35, 1)); b.position.set(-40 + k * 14, 8, -22); g.add(b); }
  g.add(person(-9.4, 6.9, 0x2a2a30, 1.75, 0x2a2a30), person(-8.7, 6.9, 0xf0ede6, 1.8, 0xf0ede6));
  return g;
}

// ---------------- BASKETBALL COURT ----------------
function buildBasket() {
  const g = new THREE.Group(); groundPlane(g, 0x6b8f4a);
  const path = new THREE.Mesh(new THREE.PlaneGeometry(6, 10), new THREE.MeshStandardMaterial({ map: tilesTex(3, 5, "#9c9588", "#8a8478", 40, "#6f6a60"), roughness: 1 })); path.rotation.x = -Math.PI / 2; path.position.set(-1, .03, 11); g.add(path);
  const court = new THREE.Mesh(new THREE.PlaneGeometry(9, 15), M(0xb3364a, .95)); court.rotation.x = -Math.PI / 2; court.position.set(0, .04, 1); g.add(court);
  const key = canvasTex(256, 256, (c, w, h) => { c.fillStyle = "#c2a45a"; c.fillRect(0, 0, w, h); c.strokeStyle = "#f3e9c4"; c.lineWidth = 6; c.strokeRect(6, 6, w - 12, h - 12); c.beginPath(); c.arc(w / 2, h, 80, Math.PI, 0); c.stroke(); });
  const kp = new THREE.Mesh(new THREE.PlaneGeometry(5.6, 6), new THREE.MeshStandardMaterial({ map: key, roughness: .9 })); kp.rotation.x = -Math.PI / 2; kp.position.set(0, .05, -4.5); g.add(kp);
  g.add(box(.3, 7, 22, slatMat("#7a6350", "#6a5444", 22, 1), -5.2, 3.5, -1));                              // pagar kayu kiri
  g.add(box(.8, 4.5, 22, stoneMat(10, 1), -7, 2.25, -1));
  g.add(box(.6, 5, 24, stoneMat(10, 1), 5.5, 2.5, -2));                                                   // tembok batu kanan
  gableHouse(g, 9.5, -8, 6, 9, 8, 0x353c4b, 0xd8dbe6);
  g.add(box(.18, 5.4, .18, M(0xe8e8ea), 0, 2.7, -5.6));
  const bb = box(3.2, 2.0, .12, M(0x4a5fc4), 0, 5.2, -5.3); g.add(bb);
  g.add(box(1.2, .8, .13, M(0xeeeeee), 0, 4.95, -5.22, false));
  const rim = new THREE.Mesh(new THREE.TorusGeometry(.38, .03, 8, 20), M(0xf08a2a)); rim.rotation.x = Math.PI / 2; rim.position.set(0, 4.5, -4.95); g.add(rim);
  g.add(box(3.4, .35, 1, M(0x7b5a3c), 4.2, .5, 1.5)); g.add(box(3.2, .3, .6, M(0x2a2a2e), 4.2, .2, 1.5));
  [[-2.4, 5, 0xc83a3a], [-1.6, 3.6, 0x2c2c32], [-3.2, 3.8, 0xd96b8c], [2.8, 0, 0x4aa3a8], [3.7, 0, 0x8a9a8a]].forEach(([x, z, c], i) => g.add(person(x, z - 2, c, 1.75 - (i === 3 ? 0 : .02), 0x2a2d3a)));
  g.add(person(3.5, 1.5, 0xf2eee6, 1.3, 0x555b6e), person(4.4, 1.5, 0xd9bdc8, 1.3, 0x555b6e), person(5, 1.4, 0x7a3a50, 1.3, 0x2a2d3a));
  [[-1.2, 4], [-.6, 1.5], [2, -2.4]].forEach(([x, z]) => { const b = new THREE.Mesh(new THREE.SphereGeometry(.22, 14, 12), M(0xe8742a)); b.position.set(x, .26, z); g.add(b); });
  for (let k = 0; k < 7; k++) leafyBush(g, -4.4 + (k % 3) * .9, 8 - k * 1.3, 1.3 + (k % 2) * .4);
  for (let k = 0; k < 5; k++) bush(g, -3.2 + k * 1.1, 13.4, 0xe6c93a, .22);
  for (let k = 0; k < 8; k++) bush(g, 3 + k * .5, 8 - (k % 3) * 1.2, k % 2 ? 0xc78bb8 : 0xe6c93a, .32);
  blossom(g, 2.5, -9, 7); blossom(g, -3.5, -11, 8, 0xd9472b);
  for (let k = 0; k < 6; k++) tree(g, -9 - k * 2, -4 + k * 2, 11);
  return g;
}

// ---------------- OUTDOOR GYM & BBQ ----------------
function buildGym() {
  const g = new THREE.Group(); groundPlane(g, 0x5f8a45);
  slab(g, 70, 50, 0, 0, M(0x5f8a45, 1), .01, .02);
  const cob = new THREE.Mesh(new THREE.PlaneGeometry(6, 9), new THREE.MeshStandardMaterial({ map: tilesTex(3, 4, "#8a8780", "#7a776f", 28, "#5f5c56"), roughness: 1 })); cob.rotation.x = -Math.PI / 2; cob.position.set(0, .05, 7); g.add(cob);
  const floor = new THREE.Mesh(new THREE.CylinderGeometry(7.5, 7.5, .1, 36), M(0xb7314a, .95)); floor.position.set(0, .05, -1.5); floor.scale.z = .8; g.add(floor);
  slab(g, 80, 9, 0, 17, M(0x4b4f58, .95), .02, .04);                                                            // jalan depan
  const wallM = stoneMat(12, 1);
  g.add(box(.5, 5, 30, M(0xd9dbe3), -14, 2.5, -2)); g.add(box(.5, 3.2, 28, wallM, 14.5, 1.6, -2)); g.add(box(29, 3.2, .5, wallM, 0, 1.6, -14));
  g.add(box(8, 2.6, .2, slatMat("#a0613a", "#8e5430", 8, 1), -9.5, 1.5, -13.7)); g.add(box(7, 2.6, .2, slatMat("#a0613a", "#8e5430", 7, 1), 7.5, 1.5, -13.7));
  gableHouse(g, 19, -3, 8, 12, 5.5, 0x353c4b, 0xe0e2ea, 0); g.add(box(.4, 9, 10, M(0xd5d8e2), -16.5, 4.5, 0));
  const aframe = (x, z, s = 1) => { const gp = new THREE.Group(); [[-1, 0], [1, 0]].forEach(([d]) => { const b = box(.3, 8.2 * s, .7, M(0xf0e6d8), d * 1.5 * s, 4 * s, 0); b.rotation.z = d * .38; gp.add(b); const b2 = box(.18, 8.2 * s, .72, M(0x7a3a2a), d * 1.5 * s, 4 * s, 0); b2.rotation.z = d * .38; gp.add(b2); });
    gp.position.set(x, .6, z); g.add(gp); };
  [[-11, 3], [-8.4, 3], [-5.8, 3]].forEach(([x, z], i) => aframe(x, z, .95 - i * .08)); [[8.5, 3.3], [11.1, 3.3], [13.7, 3.3]].forEach(([x, z], i) => aframe(x, z, .75 + i * .1));
  g.add(box(12, .7, 3, stoneMat(5, 1), -8, .35, 3)); g.add(box(8.5, .7, 3, stoneMat(4, 1), 11, .35, 3.3));
  for (let k = 0; k < 8; k++) { bush(g, -13 + k * 1.5, 6, 0x3f8a3a, .5); } for (let k = 0; k < 6; k++) bush(g, 9 + k * 1.4, 6.4, 0x3f8a3a, .5);
  const blue = M(0x2f6fd6, .5);
  [[-4.5, -1], [-3, -2.2], [-1.8, -1.4]].forEach(([x, z], i) => { g.add(box(.25, 1.6, .25, blue, x, .9, z)); g.add(box(1.8, .2, .3, blue, x + .5, 1.2, z)); g.add(box(.7, .15, .7, M(0x2a2a30), x, .3, z + .4)); });
  g.add(box(1.4, 2.4, 1.2, blue, 3.5, 1.3, -2)); g.add(box(.3, 2.8, .3, blue, 4.3, 1.4, -2.3)); g.add(box(1.6, .5, 1, blue, 3.4, .35, -.8));
  g.add(box(3.6, .5, 1.2, M(0x7a5a3c), -10, .6, -10.6)); g.add(box(3.6, .5, 1.2, M(0x7a5a3c), -7, .6, -9)); g.add(box(1.8, .15, 1.8, M(0xcaa27a), -9, 1.1, -7.6));
  const um = new THREE.Mesh(new THREE.ConeGeometry(1.6, .7, 12), M(0xf1f1f1)); um.position.set(-9, 3.2, -7.6); g.add(um); g.add(box(.08, 2.3, .08, M(0x555555), -9, 1.9, -7.6));
  g.add(box(3.8, .5, 1.2, M(0x7a5a3c), 5.5, .6, -11)); g.add(box(1.4, .9, 1, M(0x555a63), 8.5, .45, -11.5));
  palm(g, -3, -8, 11); palm(g, 3.5, -9, 12); blossom(g, -.6, -9, 7);
  [[-1.5, -1.5, 0xd9473a], [.8, -2.5, 0x4f8a8a], [2.2, -.6, 0xd96b8c], [3.6, -1.8, 0xe8d9d0]].forEach(([x, z, c]) => g.add(person(x, z, c, 1.75)));
  return g;
}

// ---------------- KIDS PLAYGROUND ----------------
function buildPlay() {
  const g = new THREE.Group(); groundPlane(g, 0x6b9a4c);
  slab(g, 90, 14, 0, 18, M(0x4b4f58, .95), .02, .04);
  slab(g, 90, 1, 0, 11.4, M(0xb9b9b6), .08, .16);
  const cob = new THREE.Mesh(new THREE.PlaneGeometry(10, 12), new THREE.MeshStandardMaterial({ map: tilesTex(5, 6, "#9c9588", "#8a8478", 36, "#6f6a60"), roughness: 1 })); cob.rotation.x = -Math.PI / 2; cob.position.set(0, .04, 5); g.add(cob);
  g.add(box(46, 5.5, .5, M(0xe3e4ea), 0, 2.75, -8));
  const poleM = M(0x4a4d56, .6);
  for (let k = 0; k < 32; k++) { const x = -15.5 + k * 1.0; const h = 3.2 + ((k * 7) % 5) * .7; const p = new THREE.Mesh(new THREE.CylinderGeometry(.11, .11, h, 8), poleM); p.position.set(x, h / 2, -5 + (k % 2) * .4); p.castShadow = true; g.add(p); }
  const swing = new THREE.Group(); const pink = M(0xe0457b, .4);
  [0, 1.6, 3.2].forEach((dz, i) => { const t = new THREE.Mesh(new THREE.TorusGeometry(1.5 + i * .0, .09, 8, 24, Math.PI), pink); t.position.set(0, .0, dz - 2); t.rotation.y = 0; swing.add(t); });
  const bar = box(.12, .12, 3.4, pink, 0, 3, -.4); swing.add(bar);
  [[-.0, 0], [0, 1.3]].forEach(([x, dz]) => { swing.add(box(.04, 2.2, .04, M(0x333333), x, 1.9, -1.2 + dz)); swing.add(box(.45, .08, .3, M(0x2a2a30), x, .8, -1.2 + dz)); });
  swing.position.set(3, .1, -2); swing.rotation.y = Math.PI / 2; g.add(swing);
  const sand = box(3.2, .35, 2.4, M(0xc7a56c), -3, .18, -1); g.add(sand);
  const rd = new THREE.Mesh(new THREE.CylinderGeometry(1.0, 1.0, .25, 18), M(0xb0703c)); rd.position.set(-3, .5, -1); g.add(rd);
  g.add(box(.2, .8, 3, M(0x7a5a3c), -3, .6, -1));
  for (let k = 0; k < 16; k++) { bush(g, -12 + k * .9, 9.5, 0x3f8a3a, .55); bush(g, 6 + k * .9, 9.5, 0x3f8a3a, .55); }
  g.add(box(10, .06, 4, M(0x7fb04a, 1), -11, .04, 7.5)); g.add(box(10, .06, 4, M(0x7fb04a, 1), 11, .04, 7.5));
  [[-5, -9], [-1, -11], [5, -10], [10, -9]].forEach(([x, z], i) => blossom(g, x, z, 7 + (i % 2), i % 2 ? 0xc084d6 : 0xb06bc4));
  palm(g, -6.5, -9, 12, { lean: .02 }); palm(g, 1, -9.5, 13);
  gableHouse(g, 19, -3, 7, 12, 5.5, 0x353c4b, 0xe6e8f0); gableHouse(g, -19, -3, 6, 12, 5.5, 0x353c4b, 0xd9dbe3);
  for (let k = 0; k < 8; k++) g.add(box(.06, 1.3, .06, M(0x1c1c20), 14.6 + k * .55, .65, 4.3, false)); g.add(box(4.4, .06, .06, M(0x1c1c20), 16.8, 1.3, 4.3, false));
  g.add(person(-3.3, 1.5, 0x6a7ea6, 1.2), person(-1.8, 1.2, 0xd96b8c, 1.1), person(.8, 1.4, 0xd9a6b0, 1.1), person(2.2, 1.2, 0xf1f1f1, 1.0), person(12.8, 8.5, 0xf2eee6, 1.7, 0x4a8fb5), person(13.7, 8.4, 0xffffff, 1.1, 0xffffff));
  return g;
}

// ---------------- GERBANG: dasar bersama ----------------
function gateBase(g) {
  groundPlane(g, 0x6b9a4c);
  slab(g, 120, 30, 0, 12, M(0x4e515a, .95), .02, .04);
  const pat = canvasTex(256, 128, (c, w, h) => { c.fillStyle = "#cfc6b8"; c.fillRect(0, 0, w, h); for (let x = 0; x < w; x += 32) { c.fillStyle = (x / 32) % 2 ? "#a8452f" : "#c9a28a"; c.fillRect(x, 20, 28, h - 40); } c.strokeStyle = "#7d7468"; c.lineWidth = 6; c.strokeRect(0, 0, w, h); });
  pat.wrapS = pat.wrapT = THREE.RepeatWrapping; pat.repeat.set(3, 1);
  const dp = new THREE.Mesh(new THREE.BoxGeometry(18, .08, 6), new THREE.MeshStandardMaterial({ map: pat })); dp.position.set(6, .07, 6); g.add(dp);
}
function buildSierra() {
  const g = new THREE.Group(); gateBase(g);
  const sc = new THREE.Group(); sc.position.set(-14, 0, 0);
  sc.add(box(18, 6, 1.4, stoneMat(6, 1), 0, 3, 0));
  sc.add(box(12.5, 3.8, .2, slatMat("#9a6a42", "#7e5434", 22, 1, true), -1.5, 2.6, .78));
  const wedge = new THREE.Shape(); wedge.moveTo(-7.7, 4.1); wedge.lineTo(4.7, 4.1); wedge.lineTo(4.7, 2.7); wedge.lineTo(-7.7, .8); wedge.closePath();
  const wm = new THREE.Mesh(new THREE.ShapeGeometry(wedge), glowM(0xfaf3e6, .6)); wm.position.set(0, 0, .9); sc.add(wm);
  sc.add(box(.12, .15, 1.5, glowM(0xffc15a, 1.6), -1.5, 4.12, .8, false));
  g.add(sc); letters(g, "SIERRA", 9, 3, -15, 7.5, .3, "#f7f4ee", .15, "300 300px 'Times New Roman', Georgia, serif");
  const gh = new THREE.Group(); gh.position.set(2, 0, -2);
  gh.add(box(6, 7.4, 6.4, M(0xf2f3f7), 0, 3.7, 0));
  const sh = new THREE.Shape(); [[-3, 0], [3, 0], [3, 1.6], [0, 4.6], [-3, 1.6]].forEach(([a, b], i) => i ? sh.lineTo(a, b) : sh.moveTo(a, b));
  const gb = new THREE.Mesh(new THREE.ExtrudeGeometry(sh, { depth: 6.4, bevelEnabled: false }), M(0x6a6d76)); gb.position.set(0, 7.4, -3.2); gh.add(gb);
  gh.add(box(2.3, 5.6, .12, slatMat("#9a6a42", "#7e5434", 6, 1), .8, 9.2, 3.25)); gh.add(box(1.8, 5, .12, M(0xe6e8f0), -1.5, 9.2, 3.26));
  gh.add(box(2.2, 3.6, .1, glowM(0xffd896, .9), 0, 2.2, 3.22)); gh.add(box(6.6, .3, 1.8, M(0x5a5d65), 0, 4.1, 3.9));
  g.add(gh);
  const rt = new THREE.Group(); rt.position.set(22, 0, -2);
  rt.add(box(6, 9, 6, M(0xf2f3f7), 0, 4.5, 0));
  const tri = new THREE.Shape(); tri.moveTo(-1, 0); tri.lineTo(3, 0); tri.lineTo(3, 6); tri.closePath();
  const tm = new THREE.Mesh(new THREE.ShapeGeometry(tri), slatMat("#8a5a36", "#6e4528", 3, 3)); tm.position.set(-.2, .2, 3.05); rt.add(tm);
  rt.add(box(18, 5, .6, M(0xe9eaf0), 14, 2.5, -2)); g.add(rt);
  for (let k = 0; k < 14; k++) bush(g, -24 + k * 1.2, 2.4, k % 3 ? 0xd6c9a0 : 0x8ab060, .55);
  [-30, -25, -4].forEach((x, i) => palm(g, x, -3 + i, 16, { leaf: 0x5a8a3a })); [20, 26, 31, 34].forEach((x, i) => palm(g, x, 6 - i, 18, { leaf: 0x5a8a3a, lean: i % 2 ? .03 : -.03 }));
  tree(g, -26, 5, 6);
  for (let k = 0; k < 7; k++) gableHouse(g, 10 + k * 3.6, -14 - k * 1.5, 6, 8, 6, 0x353c4b, 0xe6e8f0);
  g.add(car(10, 9, 0xb9bec7, 4.7, 1.4, 0)); g.add(person(6.3, 3.8, 0x23314f, 1.7), person(7.3, 3.6, 0x2b2c33, 1.75));
  for (let k = 0; k < 10; k++) bush(g, 30 + k * 1.1, 8 - k * .2, k % 2 ? 0xe6c93a : 0xf0a8c0, .5);
  return g;
}
function buildMontana() {
  const g = new THREE.Group(); gateBase(g);
  const sc = new THREE.Group(); sc.position.set(-14, 0, 0);
  sc.add(box(18, 5.5, 1.4, stoneMat(6, 1), 0, 2.75, 0));
  sc.add(box(14, 2.6, .2, M(0x2b2420, .7), 0, 2.5, .78)); sc.add(box(14, .15, .15, glowM(0xffc15a, 1.6), 0, 3.85, .9, false));
  g.add(sc); letters(g, "MONTANA", 11, 2.4, -14, 2.5, .95, "#fbf6ec", .9, "400 300px 'Helvetica Neue', Arial, sans-serif");
  for (let k = 0; k < 18; k++) bush(g, -22 + k * 1.2, 2.6, k % 2 ? 0xd6d36a : 0xe6c93a, .6);
  const gh = new THREE.Group(); gh.position.set(3, 0, -2);
  gh.add(box(5, 6.4, 5.5, M(0xf2f3f7), 0, 3.2, 0));
  const sh = new THREE.Shape(); [[-2.5, 0], [2.5, 0], [0, 4.6]].forEach(([a, b], i) => i ? sh.lineTo(a, b) : sh.moveTo(a, b));
  const gb = new THREE.Mesh(new THREE.ExtrudeGeometry(sh, { depth: 5.5, bevelEnabled: false }), M(0xe9eaf0)); gb.position.set(0, 6.4, -2.75); gh.add(gb);
  [-1, 1].forEach((s) => { const r = box(Math.hypot(2.5, 4.6) + .3, .18, 5.9, M(0x353c4b, .6), s * 1.25, 6.4 + 2.3 + .08, 0); r.rotation.z = -s * Math.atan2(4.6, 2.5); gh.add(r); });
  gh.add(box(2.6, 1.6, .1, glowM(0xffd896, .9), 0, 5.3, 2.8)); gh.add(box(2.0, 3.4, .1, glowM(0xffd896, .9), -.4, 2.0, 2.8)); gh.add(box(1.4, 6, .12, slatMat("#8a5a36", "#6e4528", 5, 1), 1.9, 3, 2.82));
  g.add(gh);
  const arch = new THREE.Group(); arch.position.set(14, 0, -3);
  arch.add(box(6, 6.4, 1.4, M(0xf3f3f6), 0, 3.2, 0));
  const lat = canvasTex(256, 256, (c, w, h) => { c.fillStyle = "#e6e6ea"; c.fillRect(0, 0, w, h); c.strokeStyle = "#7a7d85"; c.lineWidth = 7; for (let i = 0; i <= 8; i++) { c.beginPath(); c.moveTo(i * 32, 0); c.lineTo(i * 32, h); c.stroke(); c.beginPath(); c.moveTo(0, i * 32); c.lineTo(w, i * 32); c.stroke(); } });
  const ap = new THREE.Mesh(new THREE.CircleGeometry(1.5, 24, 0, Math.PI), new THREE.MeshStandardMaterial({ map: lat })); ap.position.set(0, 3.0, .72); arch.add(ap);
  const lp = new THREE.Mesh(new THREE.PlaneGeometry(3, 3), new THREE.MeshStandardMaterial({ map: lat })); lp.position.set(0, 1.5, .72); arch.add(lp);
  g.add(arch); g.add(box(16, 5, .6, M(0xe9eaf0), 28, 2.5, -4));
  [-26, -22, -18, -8].forEach((x, i) => palm(g, x, -4 - i, 15, { fan: true })); [20, 25, 30].forEach((x, i) => palm(g, x, 6 - i * 1.5, 17, { fan: true }));
  for (let k = 0; k < 7; k++) tree(g, -30 + k * 8, -16, 9);
  g.add(car(11, 9, 0xb9bec7, 4.9, 1.4, 0)); g.add(person(5.5, 3.6, 0x8a6a4a, 1.8), person(6.4, 3.6, 0x4a6aa5, 1.7), person(7.1, 3.5, 0xd9bdc8, 1.2));
  for (let k = 0; k < 10; k++) bush(g, 22 + k * 1.1, 8 - k * .2, k % 2 ? 0xf0f0e8 : 0xe85a6a, .55);
  return g;
}

// ---------------- GERBANG UTAMA ----------------
function shopBlock(g, x, z, names, cols, rotY = 0, wide = 22) {
  const b = new THREE.Group(); b.position.set(x, 0, z); b.rotation.y = rotY; const UW = wide / 2, D = 14, hG = 3.6, hU = 5.8;
  const white = M(0xf0f0f2, .7);
  b.add(box(wide, hG + hU + .8, D, white, 0, (hG + hU + .8) / 2, -D / 2));
  const sign = (t, c) => canvasTex(512, 128, (cx, w, h) => { cx.fillStyle = "#5a5148"; cx.fillRect(0, 0, w, h); cx.fillStyle = c; cx.font = "italic bold 66px Georgia, serif"; cx.textAlign = "center"; cx.textBaseline = "middle"; cx.shadowColor = c; cx.shadowBlur = 12; cx.fillText(t, w / 2, h / 2 + 4); });
  const glassT = canvasTex(256, 320, (c, w, h) => { const gr = c.createLinearGradient(0, 0, w, h); gr.addColorStop(0, "#f7c3a0"); gr.addColorStop(1, "#e89c7e"); c.fillStyle = gr; c.fillRect(0, 0, w, h); c.strokeStyle = "#2f3036"; c.lineWidth = 5; c.strokeRect(2, 2, w - 4, h - 4); c.beginPath(); c.moveTo(w / 2, 0); c.lineTo(w / 2, h); c.stroke(); [.3, .68].forEach((f) => { c.beginPath(); c.moveTo(0, h * f); c.lineTo(w, h * f); c.stroke(); }); });
  const shopT = canvasTex(256, 128, (c, w, h) => { const gr = c.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, "#ffe2b0"); gr.addColorStop(1, "#f5b46a"); c.fillStyle = gr; c.fillRect(0, 0, w, h); c.strokeStyle = "#2f3036"; c.lineWidth = 4; c.strokeRect(2, 2, w - 4, h - 4); [.33, .66].forEach((f) => { c.beginPath(); c.moveTo(w * f, 0); c.lineTo(w * f, h); c.stroke(); }); });
  const gm = (t) => new THREE.MeshStandardMaterial({ map: t, emissive: 0xffffff, emissiveMap: t, emissiveIntensity: .55, roughness: .3 });
  names.forEach((n, i) => {
    const px = (i - .5) * UW;
    const sg = new THREE.Mesh(new THREE.PlaneGeometry(UW, 1), gm(sign(n, cols[i]))); sg.position.set(px, hG - .5, .03); b.add(sg);
    const sh = new THREE.Mesh(new THREE.PlaneGeometry(UW - .8, hG - 1.1), gm(shopT)); sh.position.set(px, (hG - 1.1) / 2 + .1, .03); b.add(sh);
    const up = new THREE.Mesh(new THREE.PlaneGeometry(UW - .6, hU - .5), gm(glassT)); up.position.set(px, hG + hU / 2, .05); b.add(up);
    b.add(box(UW - .6, .6, .1, M(0xc9c4bc), px, hG + hU + .35, .06, false));
  });
  b.add(box(.3, hU + .8, .5, white, 0, hG + (hU + .8) / 2, .1)); b.add(box(wide + .3, .3, .6, white, 0, hG + hU + .75, .2));
  g.add(b);
}
function buildEntrance() {
  const g = new THREE.Group(); groundPlane(g, 0x7a8f5a);
  slab(g, 140, 60, 0, 14, M(0x8e9096, .95), .02, .04);
  shopBlock(g, -34, -4, ["DIGIGRAM", "BOOKstore"], ["#42d4ff", "#c6f432"], .5, 20);
  shopBlock(g, 26, -4, ["Fresh Cake", "Skin Care"], ["#d6f04a", "#f3f3f3"], -.02, 24);
  const wood = slatMat("#9a6a42", "#7e5434", 10, 1);
  g.add(box(34, .5, 8, slatMat("#8a5a36", "#6e4528", 24, 1), -2, 8.4, -4));                          // kanopi kayu di atas jalan
  [-14, 12].forEach((x) => g.add(box(2.2, 8.4, 3, wood, x, 4.2, -3)));
  [-6, 0, 6].forEach((x) => g.add(box(.25, 8, .25, M(0x3a3a3e), x, 4, 0)));
  g.add(box(1.8, 5, 3, wood, -8, 2.5, -6)); g.add(box(1.8, 4, 3, wood, 8, 2, -8));
  letters(g, "SHAISTANAYA CITY", 26, 3.6, -22, 2.4, 5.5, "#ffffff", .1, "bold 300px 'Helvetica Neue', Arial, sans-serif");
  for (let k = 0; k < 22; k++) bush(g, -34 + k * 1.2, 5.4, 0x3f8a3a, .55);
  [[-34, 6, 20], [-26, 4, 21], [-17, 2, 23], [-6, 4, 21]].forEach(([x, z, h]) => palm(g, x, z, h, { fan: true }));
  tree(g, -45, -2, 12); tree(g, 40, 2, 11); const cy = new THREE.Mesh(new THREE.ConeGeometry(1.4, 8, 10), M(0x2f5a35)); cy.position.set(-17, 4, -6); g.add(cy);
  g.add(car(-4, 8, 0xf2f3f5, 4.6, 1.8)); g.add(car(16, 6, 0xf2f3f5, 4.6, 1.5)); g.add(car(21, 6.2, 0xd9b13f, 3.9, 1.3)); g.add(car(27, 6.4, 0xdadde4, 4.7, 1.45));
  g.add(person(11, 3, 0x23314f, 1.7), person(18.5, 4, 0xd9d9de, 1.7), person(24.5, 4, 0x39313b, 1.75), person(32, 3.6, 0xeeeeee, 1.7));
  for (let k = 0; k < 7; k++) { const b = new THREE.Mesh(new THREE.IcosahedronGeometry(6 + k % 3, 1), M(0x40703f, 1)); b.position.set(-30 + k * 12, 7, -26); g.add(b); }
  return g;
}

export const FASUM_MODELS = {
  masjid:   { build: buildMasjid,  target: [-8, 4, 0],  pos: [-4, 4, 44],  sky: 0x78a6d8 },
  basket:   { build: buildBasket,  target: [0, 3, -2],  pos: [-1, 3.2, 24], sky: 0xaec9e4 },
  gym:      { build: buildGym,     target: [0, 1, 0],   pos: [0, 20, 30],  sky: 0xaec9e4 },
  play:     { build: buildPlay,    target: [0, 2.5, 0], pos: [0, 4, 30],   sky: 0xaec9e4 },
  sierra:   { build: buildSierra,  target: [2, 5, 0],   pos: [-12, 3.4, 58], sky: 0x8fb4de },
  montana:  { build: buildMontana, target: [2, 5, 0],   pos: [-12, 3.4, 58], sky: 0x8fb4de },
  entrance: { build: buildEntrance, target: [-4, 6, 0], pos: [0, 4, 98],   sky: 0x5aa6e6 },
};
