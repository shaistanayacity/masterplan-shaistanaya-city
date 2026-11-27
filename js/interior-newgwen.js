// Interior 3D New Gwen (denah & perabot dari foto unit contoh F5-08). Satuan meter, lantai y=0, bagian depan z=0, ke belakang z negatif.
// Lebar 5,4 m, panjang 8,4 m (~45 m2). Ruang tamu+makan di depan dengan plafon dobel tinggi; di belakang: kamar anak, lorong, kamar utama,
// kamar mandi (ujung lorong), dapur, dan area servis.
import * as THREE from "./vendor/three.module.js";
import { canvasTex } from "./house3d.js";

const W = 5.4, D = 9.0, HL = 4.8, HB = 2.8, ZB = -4.4;           // lebar, panjang, tinggi ruang tamu, tinggi belakang, batas depan/belakang
const M = (c, r = .8, o = {}) => new THREE.MeshStandardMaterial({ color: c, roughness: r, ...o });
const emi = (c, k = 1) => new THREE.MeshStandardMaterial({ color: c, emissive: c, emissiveIntensity: k, roughness: .6 });
const rnd = (() => { let s = 99; return () => (s = (s * 16807) % 2147483647) / 2147483647; })();
const rep = (t, x, y) => { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(x, y); return t; };
function box(w, h, d, mat, x, y, z) { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat); m.position.set(x, y, z); return m; }
function cyl(rt, rb, h, mat, x, y, z, seg = 16) { const m = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), mat); m.position.set(x, y, z); return m; }
function sph(r, mat, x, y, z) { const m = new THREE.Mesh(new THREE.SphereGeometry(r, 16, 12), mat); m.position.set(x, y, z); return m; }
function plane(w, h, mat, x, y, z, ry = 0) { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat); m.position.set(x, y, z); m.rotation.y = ry; return m; }

// ---------- tekstur ----------
const floorTex = () => rep(canvasTex(256, 256, (c, w, h) => { c.fillStyle = "#efe7d6"; c.fillRect(0, 0, w, h); for (let i = 0; i < 400; i++) { c.fillStyle = `rgba(${200 + rnd() * 30},${180 + rnd() * 30},${150 + rnd() * 30},.12)`; c.fillRect(rnd() * w, rnd() * h, 30, 2); } c.strokeStyle = "#cdbfa5"; c.lineWidth = 3; c.strokeRect(0, 0, w, h); }), W / .8, D / .8);
const wallTex = (a = "#d9dadb") => canvasTex(64, 64, (c, w, h) => { c.fillStyle = a; c.fillRect(0, 0, w, h); for (let i = 0; i < 80; i++) { c.fillStyle = "rgba(0,0,0,.006)"; c.fillRect(rnd() * w, rnd() * h, 6, 6); } });
const bathTile = (rx, ry) => rep(canvasTex(128, 256, (c, w, h) => { c.fillStyle = "#efe6d0"; c.fillRect(0, 0, w, h); for (let i = 0; i < 90; i++) { c.fillStyle = `rgba(150,130,100,${.06 + rnd() * .08})`; c.fillRect(rnd() * w, rnd() * h, 1, 18 + rnd() * 30); } c.strokeStyle = "#d4c8ae"; c.lineWidth = 4; c.strokeRect(0, 0, w, h); }), rx, ry);
const marbleTex = () => canvasTex(256, 256, (c, w, h) => { c.fillStyle = "#e9e9ee"; c.fillRect(0, 0, w, h); c.strokeStyle = "#7a7e90"; for (let i = 0; i < 14; i++) { c.lineWidth = .8 + rnd() * 2.2; c.beginPath(); let x = rnd() * w, y = 0; c.moveTo(x, y); for (let k = 0; k < 8; k++) { x += (rnd() - .5) * 60; y += h / 8; c.lineTo(x, y); } c.stroke(); } });
const rugTex = () => canvasTex(256, 256, (c, w, h) => { c.fillStyle = "#d6d2cd"; c.fillRect(0, 0, w, h); for (let i = 0; i < 520; i++) { c.fillStyle = `rgba(${20 + rnd() * 70},${20 + rnd() * 70},${24 + rnd() * 70},${.25 + rnd() * .45})`; const l = 6 + rnd() * 26; c.save(); c.translate(rnd() * w, rnd() * h); c.rotate(rnd() * 3); c.fillRect(0, 0, l, 2 + rnd() * 4); c.restore(); } });
const truckTex = () => canvasTex(256, 256, (c, w, h) => { c.fillStyle = "#f7f1df"; c.fillRect(0, 0, w, h); const cols = ["#d63a2f", "#2f6fd6", "#f2b01c", "#222"]; for (let i = 0; i < 26; i++) { c.fillStyle = cols[i % 4]; const x = rnd() * w, y = rnd() * h; c.fillRect(x, y, 22, 12); c.fillStyle = "#222"; c.beginPath(); c.arc(x + 4, y + 13, 4, 0, 7); c.arc(x + 18, y + 13, 4, 0, 7); c.fill(); } });
const duvetTex = () => canvasTex(128, 128, (c, w, h) => { c.fillStyle = "#f4f2ee"; c.fillRect(0, 0, w, h); for (let i = 0; i < 160; i++) { c.fillStyle = `rgba(150,150,150,${.05 + rnd() * .09})`; c.fillRect(rnd() * w, rnd() * h, 22, 1.4); } });
const woodDoor = () => canvasTex(128, 256, (c, w, h) => { c.fillStyle = "#8a5a36"; c.fillRect(0, 0, w, h); c.strokeStyle = "#2a1a10"; c.lineWidth = 3; for (let y = 0; y < h; y += 42) { c.beginPath(); c.moveTo(0, y); c.lineTo(w, y); c.stroke(); } for (let i = 0; i < 90; i++) { c.fillStyle = "rgba(60,30,10,.18)"; c.fillRect(rnd() * w, rnd() * h, 1, 12); } });

// ---------- komponen ----------
function curtain(g, x, y, z, w, h, ry = 0) {                                    // tirai voil putih berlipat
  const grp = new THREE.Group(); const m = M(0xf6f6f6, 1, { transparent: true, opacity: .8, side: THREE.DoubleSide });
  for (let i = 0; i < Math.round(w / .12); i++) grp.add(plane(.1, h, m, -w / 2 + i * .12 + .06, 0, ((i % 2) - .5) * .05));
  grp.add(cyl(.018, .018, w + .2, M(0x2a2420), 0, h / 2 + .06, 0.03)).children[grp.children.length - 1].rotation.z = Math.PI / 2;
  grp.position.set(x, y + h / 2, z); grp.rotation.y = ry; g.add(grp);
}
function windowDaylight(g, w, h, x, y, z, ry, frame = 0x1d1e22, grid = [2, 3]) {  // jendela berbingkai gelap dengan cahaya terang di luar
  const grp = new THREE.Group();
  grp.add(plane(w, h, emi(0xf4f9ff, 1.3), 0, 0, -.02)); grp.add(plane(w, h, emi(0xf4f9ff, 1.3), 0, 0, -.02, Math.PI));
  grp.add(box(w + .12, .06, .08, M(frame), 0, h / 2, 0)); grp.add(box(w + .12, .06, .08, M(frame), 0, -h / 2, 0)); grp.add(box(.06, h, .08, M(frame), -w / 2, 0, 0)); grp.add(box(.06, h, .08, M(frame), w / 2, 0, 0));
  for (let i = 1; i < grid[0]; i++) grp.add(box(.03, h, .05, M(frame), -w / 2 + w * i / grid[0], 0, 0));
  for (let j = 1; j < grid[1]; j++) grp.add(box(w, .03, .05, M(frame), 0, -h / 2 + h * j / grid[1], 0));
  grp.position.set(x, y + h / 2, z); grp.rotation.y = ry; g.add(grp);
}
function doorFrame(g, x, z, axis, w = .9, h = 2.1, leafAngle = 0, leaf = 0x2b2430) {  // axis 'x' = dinding sejajar sumbu x (bukaan di arah z)
  const grp = new THREE.Group(); const fm = M(0x16171a, .6);
  grp.add(box(.07, h, .2, fm, -w / 2, h / 2, 0)); grp.add(box(.07, h, .2, fm, w / 2, h / 2, 0)); grp.add(box(w + .14, .07, .2, fm, 0, h, 0));
  if (leafAngle) { const l = new THREE.Group(); l.add(box(w - .02, h - .02, .04, M(leaf, .5), (w - .02) / 2, h / 2, 0)); l.add(box(.12, .03, .05, M(0xb9bcc2, .3, { metalness: .8 }), w - .15, 1.0, .05)); l.position.set(-w / 2, 0, 0); l.rotation.y = leafAngle; grp.add(l); }
  grp.position.set(x, 0, z); if (axis === "z") grp.rotation.y = Math.PI / 2; g.add(grp);
}
function wallWithOpenings(g, mat, axis, fixed, from, to, h, openings, y0 = 0, thick = .12) {  // dinding dengan bukaan [[a,b,tinggiAtas,tinggiBawah]]
  const lo = Math.min(from, to), hi = Math.max(from, to);
  const ops = openings.map(([a, b, top, bot = 0]) => [Math.min(a, b), Math.max(a, b), top, bot]).sort((p, q) => p[0] - q[0]); let cur = lo;
  const put = (a, b, y1, y2) => { const len = b - a, c = (a + b) / 2, hh = y2 - y1; if (len < .01 || hh < .01) return; g.add(axis === "x" ? box(len, hh, thick, mat, c, y1 + hh / 2, fixed) : box(thick, hh, len, mat, fixed, y1 + hh / 2, c)); };
  ops.forEach(([a, b, top, bot]) => { put(cur, a, y0, h); if (top < h) put(a, b, top, h); if (bot > y0) put(a, b, y0, bot); cur = b; });
  put(cur, hi, y0, h);
}
function downlight(g, x, y, z, k = 1) { const d = new THREE.Mesh(new THREE.CylinderGeometry(.07, .07, .02, 16), emi(0xfff1c8, 2)); d.position.set(x, y - .01, z); g.add(d); }
function plant(g, x, z, h = 1.0, col = 0x3f7a35, pot = 0xc9a24a) { const p = new THREE.Group(); p.add(cyl(.12, .09, .22, M(pot, .3, { metalness: .6 }), 0, .11, 0)); for (let i = 0; i < 9; i++) { const l = new THREE.Mesh(new THREE.ConeGeometry(.05, h * .7, 5), M(col, 1)); const a = i * .7; l.position.set(Math.cos(a) * .07, .22 + h * .35, Math.sin(a) * .07); l.rotation.set(Math.sin(a) * .5, 0, -Math.cos(a) * .5); p.add(l); } p.position.set(x, 0, z); g.add(p); }
function orchid(g, x, y, z) { g.add(cyl(.05, .04, .1, M(0xffffff), x, y + .05, z)); for (let i = 0; i < 4; i++) g.add(sph(.045, M(i % 2 ? 0xf2f2f2 : 0xe9e4ee), x + (i - 1.5) * .05, y + .2 + (i % 2) * .08, z)); g.add(cyl(.006, .006, .22, M(0x3f7a35), x, y + .16, z)); }
function framedArt(g, w, h, x, y, z, ry, kind = "flower") {
  const t = canvasTex(128, 128 * h / w, (c, ww, hh) => { c.fillStyle = kind === "tree" ? "#d8cfc2" : "#cfd0cc"; c.fillRect(0, 0, ww, hh); if (kind === "flower") { c.fillStyle = "#f4f1ea"; for (let i = 0; i < 4; i++) { c.beginPath(); c.arc(ww * (.3 + i * .12), hh * (.45 + (i % 2) * .1), 12 + i * 3, 0, 7); c.fill(); } c.strokeStyle = "#6b6a58"; c.lineWidth = 2; c.beginPath(); c.moveTo(ww * .4, hh * .5); c.lineTo(ww * .35, hh * .95); c.stroke(); } else { c.strokeStyle = "#4a3e36"; c.lineWidth = 3; c.beginPath(); c.moveTo(ww * .5, hh); c.quadraticCurveTo(ww * .4, hh * .5, ww * .7, hh * .1); c.stroke(); c.fillStyle = "#f6efe8"; for (let i = 0; i < 12; i++) { c.beginPath(); c.arc(ww * (.4 + rnd() * .4), hh * (.1 + rnd() * .5), 4, 0, 7); c.fill(); } } });
  const grp = new THREE.Group(); grp.add(box(w + .06, h + .06, .03, M(0xb89455, .4, { metalness: .5 }), 0, 0, 0)); grp.add(plane(w, h, new THREE.MeshStandardMaterial({ map: t, roughness: .9 }), 0, 0, .02));
  grp.position.set(x, y, z); grp.rotation.y = ry; g.add(grp);
}
function ac(g, x, y, z, ry) { const grp = new THREE.Group(); grp.add(box(.9, .27, .2, M(0xf6f6f6, .4), 0, 0, 0)); grp.add(box(.84, .05, .21, M(0xe6e6e8, .4), 0, -.08, .01)); grp.add(box(.1, .015, .21, emi(0x7fb4ff, .8), .32, .06, .01)); grp.position.set(x, y, z); grp.rotation.y = ry; g.add(grp); }
function skirting(g, len, x, z, ry, h = .09) { const b = box(len, h, .02, M(0xb9a98c, .7), 0, h / 2, 0); const gp = new THREE.Group(); gp.add(b); gp.position.set(x, 0, z); gp.rotation.y = ry; g.add(gp); }

// ---------- ruang tamu & makan ----------
function livingDining(g, mats) {
  const wall = mats.wall, white = M(0xf6f6f7, .35), blk = M(0x15161a, .35, { metalness: .1 });
  // dinding depan z=0 (pintu kayu + jendela sempit + jendela tinggi berkisi)
  wallWithOpenings(g, wall, "x", 0, 0, W, HL, [[3.55, 4.4, 2.15], [4.75, 5.2, 2.2, .35], [1.7, 4.7, 4.5, 3.4]], 0, .16);
  g.add(box(3.0, .02, .02, M(0x000), 3.2, 3.4, -.01));
  doorFrame(g, 3.975, -.03, "x", .85, 2.15); const dm = new THREE.MeshStandardMaterial({ map: woodDoor(), roughness: .6 }); const door = plane(.8, 2.1, dm, 3.975, 1.075, -.04, Math.PI); g.add(door);
  g.add(box(.05, .2, .03, M(0x222), 3.65, 1.0, -.07));
  windowDaylight(g, .45, 1.8, 4.975, .4, -.04, Math.PI, 0x1d1e22, [1, 4]); curtain(g, 4.975, .3, -.12, .75, 2.1);
  // jendela tinggi berkisi: area terang + lamel putih bergaris
  const lw = 3.0, lh = 1.1, lx = 3.2, ly = 3.95; g.add(plane(lw, lh, emi(0xf4f9ff, 1.4), lx, ly, -.04, Math.PI));
  for (let i = 0; i < 26; i++) g.add(box(.045, lh, .03, M(i % 3 ? 0x2a2b30 : 0xf0f0f2, .5), lx - lw / 2 + .06 + i * (lw - .1) / 25, ly, -.01));
  g.add(box(lw + .16, .07, .1, blk, lx, ly + lh / 2, -.03)); g.add(box(lw + .16, .07, .1, blk, lx, ly - lh / 2, -.03)); g.add(box(.07, lh, .1, blk, lx - lw / 2, ly, -.03)); g.add(box(.07, lh, .1, blk, lx + lw / 2, ly, -.03));
  framedArt(g, .62, 1.1, 2.2, 1.7, -.12, Math.PI, "tree"); plant(g, 5.1, -.4, 1.1, 0x4f8a3a);
  // lampu lantai (belakang pintu) dan sofa
  const fl = (x, z) => { const l = new THREE.Group(); for (let i = 0; i < 3; i++) { const a = i * 2.1; const leg = cyl(.012, .012, 1.5, M(0xc9c9cc, .3, { metalness: .8 }), Math.cos(a) * .14, .75, Math.sin(a) * .14); leg.rotation.set(Math.sin(a) * .1, 0, -Math.cos(a) * .1); l.add(leg); } const sh = new THREE.Mesh(new THREE.CylinderGeometry(.18, .26, .34, 20, 1, true), M(0xfff4dc, .9, { emissive: 0xffd89a, emissiveIntensity: .75, side: THREE.DoubleSide })); sh.position.y = 1.55; l.add(sh); l.position.set(x, 0, z); g.add(l); const pl = new THREE.PointLight(0xffd9a0, .5, 4, 2); pl.position.set(x, 1.5, z); g.add(pl); };
  fl(4.65, -.5);
  // dinding kanan x=W (sofa) & koridor
  wallWithOpenings(g, wall, "z", W, 0, ZB, HL, [[-.9, -.0 - .01, 0]].slice(0, 0), 0, .16);
  // dinding kiri x=0: TV unit + jendela prancis (makan)
  wallWithOpenings(g, mats.wain, "z", 0, 0, ZB, HL, [[-2.95, -4.2, 2.55, 0.0]], 0, .16);
  windowDaylight(g, 1.1, 2.4, .06, 0, -3.57, Math.PI / 2, 0x1d1e22, [2, 6]); curtain(g, .1, 0, -3.57, 1.6, 2.55, Math.PI / 2);
  // wainscot putih berbingkai di sepanjang dinding kiri bawah
  const wainMat = M(0xfbfbfb, .25);
  for (let z = -2.9; z > -4.3; z -= 1.0) { g.add(box(.03, 1.0, .9, wainMat, .09, 1.0, z - .45)); g.add(box(.02, .9, .8, M(0xeaeaea, .3), .115, 1.0, z - .45)); }
  g.add(box(.05, .06, ZB * -1, wainMat, .1, 1.55, ZB / 2));
  // TV unit (dinding kiri, di dekat depan)
  const tv = new THREE.Group(); tv.position.set(.05, 0, -.3);
  tv.add(box(.45, .85, 2.7, blk, .22, .43, -1.35));                                          // kabinet bawah hitam
  for (let i = 0; i < 4; i++) tv.add(box(.02, .72, .6, M(0x23242a, .4), .46, .43, -.3 - i * .66));
  tv.add(box(.6, .06, 2.74, white, .3, .88, -1.35)); tv.add(box(.12, 2.2, 2.74, white, .06, 2.0, -1.35)); tv.add(box(.22, .1, 2.74, white, .12, 3.2, -1.35));
  tv.add(box(.04, 2.0, 2.4, M(0xededf0, .5), .13, 2.05, -1.35)); tv.add(box(.05, .055, 2.2, emi(0xffc15a, 2.5), .45, .92, -1.35)); const tvl = new THREE.PointLight(0xffc880, .4, 3, 2); tvl.position.set(.7, 1.0, -1.35); tv.add(tvl);
  const scr = box(.06, .72, 1.3, M(0x0b0c10, .15, { metalness: .5 }), .2, 1.65, -1.2); tv.add(scr);
  tv.add(box(.12, .06, .12, M(0x333), .12, 1.65, -1.2));
  g.add(tv);
  // rak lengkung (niche) di samping TV
  const ni = new THREE.Group(); ni.position.set(.08, 0, -3.0); ni.add(box(.38, 2.25, .75, white, .19, 1.13, 0)); ni.add(box(.34, 1.95, .6, M(0xdedee3, .5), .2, 1.15, 0));
  for (let i = 0; i < 4; i++) ni.add(box(.34, .03, .58, white, .21, .5 + i * .45, 0)); ni.add(box(.02, 1.9, .03, emi(0xffc15a, 2.2), .38, 1.15, .28));
  const arc = new THREE.Mesh(new THREE.CylinderGeometry(.3, .3, .36, 20, 1, false, 0, Math.PI).rotateZ(Math.PI / 2).rotateY(Math.PI / 2), white); arc.position.set(.19, 2.3, 0); ni.add(arc); g.add(ni);
  orchid(g, .35, .88, -2.7); [0, 1, 2].forEach((i) => g.add(box(.2, .28, .03, M(i === 1 ? 0xe9e9e9 : 0x222, .5), .3, 1.02 + i * .0, -.7 - i * .17)));
  // sofa abu terang (menghadap TV)
  const sofa = new THREE.Group(); sofa.position.set(4.45, 0, -1.65); sofa.rotation.y = -Math.PI / 2;
  const fab = M(0xd3d0cc, 1); sofa.add(box(1.85, .26, .88, fab, 0, .36, 0)); sofa.add(box(1.85, .5, .2, fab, 0, .78, -.34)); [-1, 1].forEach((s) => { sofa.add(box(.15, .45, .86, fab, s * .94, .6, 0)); });
  for (let i = 0; i < 2; i++) sofa.add(box(.85, .16, .68, M(0xe3e0dc, 1), -.44 + i * .88, .55, .04));
  [-.7, .7].forEach((x, i) => { const cu = box(.38, .38, .12, M(i ? 0x9a9ca0 : 0xdad8d6, 1), x, .8, -.1); cu.rotation.z = (i ? 1 : -1) * .15; sofa.add(cu); }); [[-.88, -.35], [.88, -.35], [-.88, .35], [.88, .35]].forEach(([x, z]) => sofa.add(cyl(.025, .02, .3, M(0xb5762f, .5), x, .15, z, 8)));
  g.add(sofa);
  // karpet & meja kopi bulat gelap
  const rug = plane(2.5, 1.9, new THREE.MeshStandardMaterial({ map: rugTex(), roughness: 1 }), 2.4, .012, -1.7); rug.rotation.x = -Math.PI / 2; rug.rotation.z = .1; g.add(rug);
  const ct = new THREE.Group(); ct.position.set(2.7, 0, -1.65); ct.add(new THREE.Mesh(new THREE.CylinderGeometry(.52, .5, .05, 32), M(0x2c1f19, .45))); ct.children[0].position.y = .43; ct.add(cyl(.12, .2, .42, M(0x2c1f19, .5), 0, .21, 0)); orchid(ct, 0, .46, 0); g.add(ct);
  plant(g, 5.0, -2.75, 1.25, 0x5f9a45); plant(g, 4.7, -3.25, 1.25, 0x5f9a45); [[5.0, -2.75, 0xf6f6f6], [4.7, -3.25, 0xf6f6f6]].forEach(([x, z]) => { for (let i = 0; i < 3; i++) g.add(sph(.05, M(0xf8f8f8, .5), x + (i - 1) * .04, 1.35 + i * .06, z)); });
  // set makan: meja hitam, 4 kursi abu, vas bunga, lampu lantai kiri
  const dn = new THREE.Group(); dn.position.set(1.45, 0, -3.5); dn.rotation.y = Math.PI / 2;
  dn.add(box(1.6, .05, .85, M(0x151211, .4), 0, .75, 0)); [[-.7, -.35], [.7, -.35], [-.7, .35], [.7, .35]].forEach(([x, z]) => dn.add(box(.05, .74, .05, M(0x151211, .5), x, .37, z)));
  dn.add(box(1.6, .005, .34, M(0xe9e4d8, 1), 0, .78, 0));
  [-.6, .6].forEach((x) => [-1, 1].forEach((s) => { const ch = new THREE.Group(); ch.add(box(.44, .06, .44, M(0x6f7480, 1), 0, .46, 0)); ch.add(box(.44, .55, .06, M(0x6f7480, 1), 0, .74, -.2 * s)); [[-.19, -.19], [.19, -.19], [.19, .19], [.19, -.19]].forEach(([a, b]) => ch.add(box(.04, .46, .04, M(0x15161a, .5), a, .23, b))); ch.position.set(x, 0, s * .6); ch.rotation.y = s > 0 ? Math.PI : 0; dn.add(ch); }));
  [[-.6, -.2], [.6, -.2], [-.6, .2], [.6, .2]].forEach(([x, z]) => { dn.add(cyl(.12, .12, .01, M(0x2a2b30, .5), x, .79, z)); dn.add(cyl(.09, .05, .06, M(0xa6aaa8, .6), x, .83, z)); dn.add(cyl(.025, .025, .13, M(0xdfe8ee, .1, { transparent: true, opacity: .6 }), x + .2, .86, z - .1)); });
  dn.add(cyl(.05, .07, .3, M(0xd6cfc4, .4), 0, .93, 0)); for (let i = 0; i < 7; i++) { dn.add(sph(.04, M(0xf8f8f6, .7), (rnd() - .5) * .24, 1.15 + rnd() * .15, (rnd() - .5) * .24)); }
  g.add(dn); fl(.35, -2.3);
  // pendant ring emas dengan 3 bola
  const pend = new THREE.Group(); pend.position.set(2.6, 3.7, -1.8); const ring = new THREE.Mesh(new THREE.TorusGeometry(.32, .012, 8, 36), M(0xc9a24a, .3, { metalness: .8 })); ring.rotation.x = Math.PI / 2; pend.add(ring); pend.add(cyl(.006, .006, 1.1, M(0xc9a24a, .3, { metalness: .8 }), 0, .55, 0));
  [0, 2.1, 4.2].forEach((a) => pend.add(sph(.09, emi(0xfff2cf, 2), Math.cos(a) * .32, -.02 - (a > 3 ? .1 : 0), Math.sin(a) * .32))); const pl = new THREE.PointLight(0xffe5b0, .8, 7, 2); pl.position.y = -.2; pend.add(pl); g.add(pend);
  [[1.2, -.9], [2.6, -.9], [4.0, -.9], [1.2, -2.6], [2.6, -2.6], [4.0, -2.6], [1.2, -3.9], [2.6, -3.9], [4.0, -3.9]].forEach(([x, z]) => downlight(g, x, HL, z));
  // dinding kanan (x=W) + dinding ruang belakang
  g.add(box(.16, HL, -ZB - .0, wall, W, HL / 2, ZB / 2 - 0));
  framedArt(g, .8, 1.0, W - .1, 1.75, -3.5, -Math.PI / 2, "flower"); skirting(g, ZB * -1, W - .09, ZB / 2, -Math.PI / 2); skirting(g, W, W / 2, -.09, 0);
  ac(g, W - .15, 3.0, -2.2, -Math.PI / 2);
}

// ---------- kamar anak (ranjang tingkat) ----------
function kidsRoom(g, mats) {
  const x0 = 0, x1 = 2.4, z0 = ZB, z1 = -6.4, grey = M(0x7a7c82, .5), white = M(0xf2f2f4, .4);
  const bunk = new THREE.Group(); bunk.position.set(.12, 0, z1);                                        // z lokal 0 = dinding belakang, + = ke dalam kamar
  bunk.add(box(2.0, .5, .98, grey, 1.0, .26, .5)); [0, 1, 2].forEach((i) => bunk.add(box(.56, .38, .02, M(0x666870, .5), .38 + i * .65, .27, .99)));
  const kb = new THREE.MeshStandardMaterial({ map: truckTex(), roughness: 1 }); bunk.add(box(1.95, .16, .92, kb, 1.0, .6, .5));              // kasur bawah bermotif truk
  bunk.add(box(1.95, .16, .92, M(0xf6f6f4, 1), 1.0, 1.55, .5)); bunk.add(box(2.0, .05, .98, grey, 1.0, 1.3, .5)); bunk.add(box(2.0, .1, .98, M(0xdadada, .5), 1.0, 1.3, .5));
  for (let i = 0; i < 11; i++) bunk.add(box(.04, .52, .04, grey, .1 + i * .18, 1.85, .98)); bunk.add(box(2.0, .05, .05, grey, 1.0, 2.1, .98));
  bunk.add(box(2.0, .9, .05, M(0x8a8174, .6), 1.0, .85, .04)); bunk.add(box(2.0, .04, .02, emi(0xffd89a, 1.0), 1.0, 1.2, .96)); bunk.add(box(.05, 1.9, .98, grey, 2.0, .95, .5));
  for (let i = 0; i < 4; i++) { bunk.add(box(.5, .3, .9, white, -.28 + i * .0, .15 + i * .3, .5)); bunk.children[bunk.children.length - 1].position.x = -.28 + i * .06; bunk.add(box(.16, .02, .02, M(0x111, .5), -.25 + i * .06, .2 + i * .3, .96)); }
  g.add(bunk);
  // rak sudut bermarmer
  const sh = new THREE.Group(); sh.position.set(2.1, 0, z1 + .55);
  sh.add(box(.3, 2.2, .55, grey, 0, 1.1, 0)); sh.add(plane(.28, 1.6, new THREE.MeshStandardMaterial({ map: marbleTex(), roughness: .3 }), .02, 1.3, -.265, 0)); for (let i = 0; i < 5; i++) sh.add(box(.3, .03, .5, M(0x8a8174, .5), 0, .5 + i * .35, 0)); orchid(sh, 0, 2.2, -.1); sh.add(sph(.1, M(0xf2f2f2, .5), 0, 1.1, -.1)); sh.add(box(.18, .22, .02, M(0xe8e6e0, .5), 0, 1.45, .1)); plant(sh, 0, .0, .3, 0x4f8a3a, 0x8a5a2a); sh.children[sh.children.length - 1].position.set(0, 1.5, .0); g.add(sh);
  // jendela + tirai + AC + lampu
  windowDaylight(g, .8, 1.5, .08, .55, -5.5, Math.PI / 2, 0x16171a, [2, 3]); curtain(g, .1, .5, -5.5, 1.2, 2.2, Math.PI / 2);
  ac(g, 1.2, 2.45, z0 - .08 - .0 + .0, 0); downlight(g, 1.3, HB, -5.9); downlight(g, 1.3, HB, -6.5);
  framedArt(g, .5, .65, 2.35, 1.7, -5.2, -Math.PI / 2, "flower");
}

// ---------- kamar utama ----------
function masterRoom(g) {
  const x0 = 3.4, x1 = W, z0 = ZB, z1 = -7.4;
  // kasur 150 putih + sprei abu, kepala beludru scalloped, bantal abu
  const bed = new THREE.Group(); bed.position.set(4.62, 0, z1 + .02);
  bed.add(box(1.55, .3, 2.05, M(0xe8e4dc, 1), 0, .2, 1.05)); bed.add(box(1.5, .22, 1.95, new THREE.MeshStandardMaterial({ map: duvetTex(), roughness: 1 }), 0, .46, 1.1)); bed.add(box(1.52, .02, .55, M(0x8a8c90, 1), 0, .58, 1.2));
  bed.add(box(1.7, .9, .12, M(0xcfc5ad, 1), 0, .6, .02)); for (let i = 0; i < 5; i++) { const sc = cyl(.18, .18, .14, M(0xcfc5ad, 1), -.68 + i * .34, 1.06, .03, 20); sc.rotation.x = Math.PI / 2; bed.add(sc); }
  [[-.4, .45], [.4, .45]].forEach(([x, z], i) => { bed.add(box(.55, .26, .12, M(0xf5f5f3, 1), x, .75, z - .3)); }); [[-.4, .7], [.4, .7]].forEach(([x, z]) => { const cu = box(.42, .38, .1, M(0x5c5e62, 1), x, .74, z - .15); cu.rotation.x = -.2; bed.add(cu); });
  g.add(bed); g.add(box(1.8, 1.4, .05, white(), 4.62, 1.6, z1 + .05));                          // panel dinding berbingkai putih
  for (let i = 0; i < 2; i++) g.add(box(1.0 - i * .1, 1.0 - i * .1, .02, M(0xfbfbfb, .3), 4.62, 1.65, z1 + .09 + i * .01));
  // meja rias putih + cermin lengkung emas
  const v = new THREE.Group(); v.position.set(3.65, 0, z1 + .22); v.add(box(.4, .75, .4, M(0xf0f0f2, .4), 0, .38, 0)); v.add(box(.4, .04, .44, M(0xdcdce0, .3), 0, .76, 0)); const mir = new THREE.Mesh(new THREE.CylinderGeometry(.27, .27, .03, 24, 1, false, 0, Math.PI).rotateX(Math.PI / 2).rotateZ(Math.PI / 2), M(0xd8dde2, .05, { metalness: .9 })); mir.position.set(-.18, 1.6, 0); v.add(mir); v.add(box(.03, .85, .5, M(0xd8dde2, .05, { metalness: .9 }), -.18, 1.2, 0)); v.add(cyl(.1, .1, .2, M(0x44474c, 1), .2, .1, .5)); v.add(cyl(.02, .02, .5, M(0x111, .4), .1, 1.0, -.1)); g.add(v);
  // lemari dinding (rak terbuka + gantungan baju + kabinet hitam)
  const wd = new THREE.Group(); wd.position.set(x0 + .27, 0, -5.3);
  wd.add(box(.5, 2.05, 1.3, M(0xfafafa, .3), 0, 1.03, 0)); wd.add(box(.46, .9, 1.22, M(0x14151a, .3), .0, .5, 0)); wd.add(box(.46, .03, 1.2, M(0xfafafa, .3), 0, .95, 0)); for (let i = 0; i < 4; i++) wd.add(box(.46, .03, .55, M(0xfafafa, .3), 0, 1.2 + i * .28, -.33));
  wd.add(cyl(.012, .012, .62, M(0xcfcfd2, .3, { metalness: .8 }), 0, 1.8, .28)).rotation.x = Math.PI / 2; for (let i = 0; i < 5; i++) wd.add(box(.04, .5, .24, M([0xe9d98a, 0xf1f1ee, 0x2a2a2e, 0xdcd8c8, 0xece5c9][i], 1), 0, 1.5, .08 + i * .12));
  [[.1, 1.05], [.1, 1.5], [.1, 1.95]].forEach(([x, y], i) => wd.add(box(.2, .18, .22, M(0xd8c8b0, 1), .0, y + .08 + i * .0, -.42)));
  g.add(wd);
  windowDaylight(g, .6, 1.5, x1 - .06, .55, -6.3, -Math.PI / 2, 0x16171a, [1, 3]); curtain(g, x1 - .1, .5, -6.3, 1.0, 2.2, -Math.PI / 2);
  ac(g, 4.4, 2.45, z0 - .08, 0); framedArt(g, .55, .75, x1 - .05, 1.55, -5.1, -Math.PI / 2, "flower"); downlight(g, 4.6, HB, -5.9); downlight(g, 4.6, HB, -6.6);
}
const white = () => M(0xfbfbfb, .3);

// ---------- kamar mandi ----------
function bathroom(g) {
  const bx0 = 2.4, bx1 = 3.4, bz0 = -7.4, bz1 = -D; const tl = new THREE.MeshStandardMaterial({ map: bathTile(1.4, 2), roughness: .25 });
  [[bx0, bz0, "z", bz1 - bz0], [bx1, bz0, "z", bz1 - bz0]].forEach(([x, , , len]) => g.add(box(.05, HB, Math.abs(len), tl, x + (x === bx0 ? .03 : -.03), HB / 2, (bz0 + bz1) / 2)));
  g.add(box(bx1 - bx0, HB, .05, tl, (bx0 + bx1) / 2, HB / 2, bz1 + .03));
  // closet duduk
  const wc = new THREE.Group(); wc.position.set(bx1 - .32, 0, bz1 + .5); wc.add(cyl(.2, .14, .4, M(0xf8f8f8, .15), 0, .2, 0)); const seat = new THREE.Mesh(new THREE.CylinderGeometry(.19, .19, .04, 20), M(0xf4f4f4, .15)); seat.position.set(0, .42, .1); seat.scale.z = 1.25; wc.add(seat); wc.add(box(.36, .4, .16, M(0xf8f8f8, .15), 0, .55, -.2)); wc.add(cyl(.03, .03, .01, M(0xcfd2d6, .2, { metalness: .7 }), 0, .76, -.2)); g.add(wc);
  // shower: selang + hand-shower + kran krom + gantungan hitam + lubang air
  g.add(cyl(.012, .012, .75, M(0xcfd2d6, .2, { metalness: .9 }), bx0 + .06, 1.3, bz1 + .45)).rotation.x = .0; g.add(cyl(.06, .05, .03, M(0xd6d9de, .2, { metalness: .9 }), bx0 + .07, 1.95, bz1 + .45)); g.add(box(.1, .06, .06, M(0xcfd2d6, .2, { metalness: .9 }), bx0 + .06, 1.05, bz1 + .45));
  [.4, .7].forEach((dz) => g.add(sph(.025, M(0x111, .3), bx0 + .05, 1.6, bz1 + dz))); g.add(cyl(.07, .07, .01, M(0xb9bcc2, .3, { metalness: .8 }), (bx0 + bx1) / 2, .005, bz1 + .5));
  // ceruk (niche) dengan tanaman + botol + pot hitam
  g.add(box(.5, .12, .02, M(0xdcd0b8, .3), (bx0 + bx1) / 2, 1.2, bz1 + .06)); g.add(cyl(.03, .03, .08, M(0x1a1a1c), (bx0 + bx1) / 2 - .1, 1.26, bz1 + .08)); g.add(cyl(.03, .03, .08, M(0x1a1a1c), (bx0 + bx1) / 2, 1.26, bz1 + .08)); g.add(sph(.03, M(0x4f8a3a, 1), (bx0 + bx1) / 2 + .15, 1.26, bz1 + .08));
  // kipas, lampu, pintu berlouver hitam
  g.add(box(.2, .02, .2, M(0xe6e6e8, .5), (bx0 + bx1) / 2 + .2, HB - .01, -8.0)); downlight(g, (bx0 + bx1) / 2, HB, -8.2); const bl = new THREE.PointLight(0xfff0c8, .7, 3, 2); bl.position.set((bx0 + bx1) / 2, 2.3, -8.1); g.add(bl);
  doorFrame(g, 2.9, bz0, "x", .78, 2.05, 0); doorFrame(g, 2.4, -6.9, "z", .8, 2.1, -1.5);
  const lv = new THREE.Group(); lv.position.set(2.51, 0, bz0 + .02); lv.add(box(.78, 2.05, .04, M(0x15161a, .5), 0, 1.03, 0)); for (let i = 0; i < 12; i++) lv.add(box(.74, .05, .05, M(0x23242a, .4), 0, .15 + i * .165, .03)); lv.rotation.y = -1.52; g.add(lv);
  // pelapis lantai mandi
  const fl = plane(bx1 - bx0, Math.abs(bz1 - bz0), M(0xe4dfd2, .2), (bx0 + bx1) / 2, .006, (bz0 + bz1) / 2); fl.rotation.x = -Math.PI / 2; g.add(fl);
}

// ---------- dapur & servis ----------
function kitchen(g) {
  const kx0 = 0, kx1 = 2.4, kz0 = -6.4, kz1 = -D; const tile = rep(canvasTex(128, 128, (c, w, h) => { c.fillStyle = "#4b4f55"; c.fillRect(0, 0, w, h); for (let i = 0; i < 160; i++) { c.fillStyle = `rgba(${40 + rnd() * 50},${44 + rnd() * 50},${48 + rnd() * 50},.5)`; c.fillRect(rnd() * w, rnd() * h, 5, 5); } c.strokeStyle = "#2a2d31"; c.lineWidth = 3; c.strokeRect(0, 0, w, h); }), 3, 2);
  const fl = plane(kx1 - kx0, kz0 - kz1, new THREE.MeshStandardMaterial({ map: tile, roughness: .55 }), (kx0 + kx1) / 2, .007, (kz0 + kz1) / 2); fl.rotation.x = -Math.PI / 2; g.add(fl);
  const set = new THREE.Group(); set.position.set(1.3, 0, kz1 + .3);
  set.add(box(1.5, .75, .56, M(0x14151a, .35), 0, .38, 0)); [-.37, .37].forEach((x) => { set.add(box(.7, .6, .02, M(0x1c1d22, .4), x, .4, .29)); set.add(box(.52, .44, .02, M(0x14151a, .4), x, .4, .3)); });
  set.add(box(1.54, .05, .6, M(0xfafafa, .25), 0, .78, 0)); set.add(box(1.5, .75, .03, M(0xf2f2f4, .3), 0, 1.2, -.28));
  set.add(box(.7, .02, .45, M(0xc9ccd0, .25, { metalness: .8 }), .45, .795, 0)); set.add(cyl(.015, .015, .28, M(0xd6d9de, .2, { metalness: .9 }), .45, .94, -.2)); set.add(box(.6, .02, .5, M(0x111, .3), -.35, .8, 0)); [-.5, -.22].forEach((x) => set.add(cyl(.07, .07, .015, M(0x2a2a2e, .4), x, .82, -.02))); set.add(cyl(.12, .12, .06, M(0xe8e0d0, .6), -.35, .85, .02)); set.add(box(.04, .22, .04, M(0x15161a), -.65, .9, -.15));
  set.add(box(.8, .72, .3, M(0xfafafa, .3), -.2, 1.58, -.12)); set.add(box(.02, .6, .02, M(0xe6e6e8), -.2, 1.58, .04)); set.add(box(.8, .72, .02, M(0xededf0, .5), -.2, 1.58, .04)); set.add(box(.22, .28, .02, M(0xd9e8d0, .8), .42, 1.5, -.1));
  g.add(set); framedArt(g, .5, .5, .05, 1.55, -7.6, Math.PI / 2, "flower"); framedArt(g, .45, .5, .05, 1.55, -8.2, Math.PI / 2, "flower"); const sk = box(.9, .05, 1.3, emi(0xf4f9ff, 1.2), 1.2, HB + .55, -8.3); g.add(sk); const kl = new THREE.PointLight(0xfff4d8, .9, 4, 2); kl.position.set(1.2, 2.4, -7.6); g.add(kl);
  // area servis (belakang kanan) tertutup + pintu
  
}

// ---------- rangkaian ----------
export function build() {
  const g = new THREE.Group();
  const wall = new THREE.MeshStandardMaterial({ map: wallTex("#d6d7d8"), roughness: .95 });
  const wallLite = new THREE.MeshStandardMaterial({ map: wallTex("#e3e4e4"), roughness: .95 });
  const mats = { wall: wallLite, wain: wallLite };
  const floor = plane(W, D, new THREE.MeshStandardMaterial({ map: floorTex(), roughness: .18, metalness: .02 }), W / 2, 0, -D / 2); floor.rotation.x = -Math.PI / 2; g.add(floor);
  // plafon: depan tinggi (dobel tinggi) + belakang rendah
  const c1 = plane(W, -ZB, M(0xf3f3f4, 1), W / 2, HL, ZB / 2); c1.rotation.x = Math.PI / 2; c1.name = 'ceil'; g.add(c1);
  const c2 = plane(W, D + ZB, M(0xf3f3f4, 1), W / 2, HB, (ZB - D) / 2); c2.rotation.x = Math.PI / 2; c2.name = 'ceil'; g.add(c2);
  // dinding luar (kiri, kanan, belakang) dan dinding pemisah ruang belakang
  g.add(box(.16, HB, D + ZB, wallLite, 0, HB / 2, (ZB - D) / 2)); g.add(box(.16, HB, D + ZB, wallLite, W, HB / 2, (ZB - D) / 2)); g.add(box(W, HB, .16, wallLite, W / 2, HB / 2, -D));
  // dinding atas pemisah depan-belakang (tinggi penuh, terbuka di lorong): z=ZB
  wallWithOpenings(g, wallLite, "x", ZB, 0, W, HL, [[2.4, 3.4, HB + .3]].filter((o) => o[2] > 0.5), 0, .16);
  // partisi ruang belakang
  wallWithOpenings(g, wallLite, "z", 2.4, ZB, -7.4, HB, [[-5.55, -4.7, 2.1], [-7.3, -6.5, 2.1]], 0, .12);   // sisi kiri lorong: pintu kamar anak & dapur
  wallWithOpenings(g, wallLite, "z", 3.4, ZB, -7.4, HB, [[-6.9, -6.1, 2.1]], 0, .12);                // sisi kanan lorong: pintu kamar utama
  wallWithOpenings(g, wallLite, "x", -6.4, 0, 2.4, HB, [], 0, .12);                                      // pemisah kamar anak / dapur
  wallWithOpenings(g, wallLite, "x", -7.4, 2.4, 3.4, HB, [[2.51, 3.29, 2.05]], 0, .12);                  // pintu kamar mandi
  wallWithOpenings(g, wallLite, "x", -7.4, 3.4, W, HB, [], 0, .12);                                      // pemisah kamar utama / servis
  doorFrame(g, 2.4, -5.125, "z", .85, 2.1, -1.5); doorFrame(g, 3.4, -6.5, "z", .85, 2.1, 1.5);
  livingDining(g, mats); kidsRoom(g, mats); masterRoom(g); bathroom(g); kitchen(g);
  // cahaya
  g.add(new THREE.AmbientLight(0xffffff, .85)); g.add(new THREE.HemisphereLight(0xf4f8ff, 0xd9c9a8, .75));
  const sun = new THREE.DirectionalLight(0xfff3dd, .7); sun.position.set(3, 6, 4); g.add(sun);
  const cor = new THREE.PointLight(0xfff0d0, .7, 4, 2); cor.position.set(3, 2.4, -6.2); g.add(cor);
  return g;
}

export const ROOMS = [
  { key: "tamu",  label: "Ruang Tamu",   pos: [4.7, 1.6, -4.0],   look: [1.0, 1.25, -1.2], fov: 78, photos: ["tamu", "tamu2"] },
  { key: "makan", label: "Ruang Makan",  pos: [3.4, 1.6, -.9],    look: [.9, 1.05, -3.7],  fov: 78, photos: ["makan", "tamu2"] },
  { key: "anak",  label: "Kamar Anak",   pos: [2.15, 1.45, -4.55], look: [.7, 1.05, -6.3],  fov: 95, photos: ["anak", "anak2"] },
  { key: "utama", label: "Kamar Utama",  pos: [5.15, 1.55, -4.6], look: [4.5, 1.0, -7.3],  fov: 100, photos: ["utama", "utama2", "utama3"] },
  { key: "mandi", label: "Kamar Mandi",  pos: [2.9, 1.5, -6.55],  look: [2.9, 1.1, -8.8],  fov: 95, photos: ["mandi", "mandi2", "mandi3"] },
  { key: "dapur", label: "Dapur",        pos: [2.0, 1.5, -6.9],   look: [.8, .9, -8.7],    fov: 95, photos: ["dapur"] },
];

// ---------- penampil: geser untuk melihat sekeliling, roda/cubit untuk zoom, tombol pindah ruangan ----------
export function mountInterior(el, onRoom) {
  const scene = new THREE.Scene(); scene.background = new THREE.Color(0xe9eaec); scene.add(build()); el.__scene = scene;
  const renderer = new THREE.WebGLRenderer({ antialias: true }); renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
  el.appendChild(renderer.domElement); renderer.domElement.style.cssText = "width:100%;height:100%;display:block;touch-action:none;cursor:grab";
  const cam = new THREE.PerspectiveCamera(72, 1, .05, 60);
  let yaw = 0, pitch = 0, fov = 72, tw = null;
  const orient = (look, pos) => { const d = new THREE.Vector3(...look).sub(new THREE.Vector3(...pos)); return [Math.atan2(d.x, -d.z), Math.atan2(d.y, Math.hypot(d.x, d.z))]; };
  const apply = () => { cam.rotation.order = "YXZ"; cam.rotation.set(pitch, -yaw, 0); cam.fov = fov; cam.updateProjectionMatrix(); };
  const angDiff = (a, b) => { let d = b - a; while (d > Math.PI) d -= 2 * Math.PI; while (d < -Math.PI) d += 2 * Math.PI; return d; };
  function goTo(key, instant) {
    const r = ROOMS.find((q) => q.key === key) || ROOMS[0]; const [ty, tp] = orient(r.look, r.pos);
    const from = { p: cam.position.clone(), y: yaw, pi: pitch }, to = { p: new THREE.Vector3(...r.pos), y: yaw + angDiff(yaw, ty), pi: tp };
    const f1 = r.fov || 72; if (instant) { cam.position.copy(to.p); yaw = ty; pitch = tp; fov = f1; apply(); } else tw = { from, to, t: 0, f0: fov, f1 };
    if (onRoom) onRoom(r);
  }
  let drag = null;
  const pd = (e) => { drag = { x: e.clientX, y: e.clientY }; renderer.domElement.style.cursor = "grabbing"; renderer.domElement.setPointerCapture(e.pointerId); };
  const pm = (e) => { if (!drag) return; const k = fov / 80 * .0045; yaw += (e.clientX - drag.x) * k; pitch = Math.max(-1.2, Math.min(1.2, pitch + (e.clientY - drag.y) * k)); drag = { x: e.clientX, y: e.clientY }; tw = null; apply(); };
  const pu = () => { drag = null; renderer.domElement.style.cursor = "grab"; };
  renderer.domElement.addEventListener("pointerdown", pd); renderer.domElement.addEventListener("pointermove", pm); renderer.domElement.addEventListener("pointerup", pu); renderer.domElement.addEventListener("pointercancel", pu);
  renderer.domElement.addEventListener("wheel", (e) => { e.preventDefault(); fov = Math.max(40, Math.min(105, fov + e.deltaY * .04)); apply(); }, { passive: false });
  const resize = () => { const w = el.clientWidth || 1, h = el.clientHeight || 1; renderer.setSize(w, h, false); cam.aspect = w / h; cam.updateProjectionMatrix(); };
  const ro = new ResizeObserver(resize); ro.observe(el); resize();
  let raf = 0, last = performance.now();
  const loop = (t) => { raf = requestAnimationFrame(loop); const dt = Math.min(.05, (t - last) / 1000); last = t;
    if (tw) { tw.t = Math.min(1, tw.t + dt / 1.1); const e = tw.t < .5 ? 2 * tw.t * tw.t : 1 - Math.pow(-2 * tw.t + 2, 2) / 2; cam.position.lerpVectors(tw.from.p, tw.to.p, e); yaw = tw.from.y + (tw.to.y - tw.from.y) * e; pitch = tw.from.pi + (tw.to.pi - tw.from.pi) * e; fov = tw.f0 + (tw.f1 - tw.f0) * e; apply(); if (tw.t >= 1) tw = null; }
    renderer.render(scene, cam); };
  goTo("tamu", true); loop(last);
  return { goTo, dispose() { cancelAnimationFrame(raf); ro.disconnect(); scene.traverse((o) => { if (o.geometry) o.geometry.dispose(); if (o.material) [].concat(o.material).forEach((m) => { if (m.map) m.map.dispose(); m.dispose(); }); }); renderer.dispose(); renderer.domElement.remove(); } };
}
