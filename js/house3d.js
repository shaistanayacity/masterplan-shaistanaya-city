// Model 3D prosedural (Three.js, dimuat lokal dari js/vendor). Dipanggil dari app.js lewat
// url "builtin:<nama>" di js/models.js. Setiap model = fungsi yang mengembalikan THREE.Group.
import * as THREE from "./vendor/three.module.js";
import { OrbitControls } from "./vendor/OrbitControls.js";

function canvasTex(w, h, draw) {
  const c = document.createElement("canvas");
  c.width = w; c.height = h;
  draw(c.getContext("2d"), w, h);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}

// ---------- ARNICA: dibuat mengikuti render resmi (proporsi diukur dari foto) ----------
// Satuan gambar: 1 = lebar satu rumah (W = 6 m). Pola deretan di foto: [pilaster][dinding dalam][A][B]
// dan diulang; B = cermin A, A+B berbagi balkon, kaca, dan kanopi satu bentang.
const W = 6, G = .6, H1 = .91, RISE = .5, T = H1 + RISE;     // G: tinggi lantai bawah, H1: tinggi dinding atas
const D = 13;

function drawMirrored(c, w, mirror) { if (mirror) { c.translate(w, 0); c.scale(-1, 1); } }

function upperTextures(mirror) {
  const cw = 768, ch = Math.round(cw * T);
  const X = (u) => u * cw, Y = (v) => (1 - v / T) * ch;
  const poly = (c, pts) => { c.beginPath(); pts.forEach(([u, v], i) => i ? c.lineTo(X(u), Y(v)) : c.moveTo(X(u), Y(v))); c.closePath(); };
  const inner = [[.035, H1 - .05], [.5, T - .085], [.965, H1 - .05], [.965, .035], [.035, .035]];
  const mk = (glow) => canvasTex(cw, ch, (c) => {
    drawMirrored(c, cw, mirror);
    c.fillStyle = glow ? "#000" : "#5b5e66"; c.fillRect(0, 0, cw, ch);
    if (glow) {
      const gr = c.createLinearGradient(0, Y(.58), 0, Y(.115));
      gr.addColorStop(0, "#ffe3ab"); gr.addColorStop(1, "#f0b25f");
      c.fillStyle = gr; c.fillRect(X(.445), Y(.58), X(.992) - X(.445), Y(.115) - Y(.58));
      c.fillStyle = "rgba(255,255,255,.55)";                       // rak & lampu di dalam
      [[.47, .5, .1, .06], [.62, .52, .09, .05], [.84, .5, .1, .06], [.47, .34, .1, .05], [.9, .3, .06, .06]]
        .forEach(([u, v, a, b]) => c.fillRect(X(u), Y(v), X(a), Y(v - b) - Y(v)));
      c.fillStyle = "#1c1d22";
      [.445, .58, .73, .875, .99].forEach((u) => c.fillRect(X(u) - 3, Y(.58), 6, Y(.115) - Y(.58)));
      c.fillRect(X(.445), Y(.58), X(.55), 5); c.fillRect(X(.445), Y(.115) - 5, X(.55), 5);
      return;
    }
    // panel putih kebiruan di dalam rangka
    c.save(); poly(c, inner); c.clip();
    const wg = c.createLinearGradient(0, 0, 0, ch); wg.addColorStop(0, "#f2f4fc"); wg.addColorStop(1, "#d9ddf0");
    c.fillStyle = wg; c.fillRect(0, 0, cw, ch);
    c.strokeStyle = "#a8aec6"; c.lineWidth = 2;
    const ln = (a, b, d, e) => { c.beginPath(); c.moveTo(X(a), Y(b)); c.lineTo(X(d), Y(e)); c.stroke(); };
    ln(.21, .75, .21, T); ln(.035, .75, .21, .75); ln(.035, .21, .44, .21); ln(.3, .21, .3, .58);
    // kayu vertikal (sisi dalam)
    c.beginPath(); c.rect(X(.44), 0, X(.965) - X(.44), Y(.632)); c.clip();
    c.fillStyle = "#54463f"; c.fillRect(X(.44), 0, X(.53), ch);
    for (let u = .44; u < .965; u += .0125) {
      c.fillStyle = (Math.round(u / .0125) % 2) ? "#463a34" : "#5e4f47";
      c.fillRect(X(u), 0, X(.0125), Y(.632));
    }
    c.restore();
    c.fillStyle = "#23262c"; c.fillRect(X(.44), Y(.64), X(.965) - X(.44), Y(.1) - Y(.64));   // lubang kaca (diisi glow)
    c.fillStyle = "#c9cde0";                                                       // dinding putih bawah kaca kiri
  });
  const make = (glow) => { const t = mk(glow); return t; };
  return [make(false), make(true)];
}

function groundTextures(mirror) {
  const cw = 768, ch = Math.round(cw * G);
  const X = (u) => u * cw, Y = (v) => (1 - v / G) * ch;
  const mk = (glow) => canvasTex(cw, ch, (c) => {
    drawMirrored(c, cw, mirror);
    c.fillStyle = glow ? "#000" : "#54463d"; c.fillRect(0, 0, cw, ch);
    if (!glow) {
      for (let v = 0; v < G; v += .034) { c.fillStyle = Math.round(v / .034) % 2 ? "#4b3e36" : "#5d4e44"; c.fillRect(0, Y(v + .034), cw, Y(v) - Y(v + .034) - 1); }
      c.fillStyle = "#6e7077"; c.fillRect(0, Y(.03), cw, Y(0) - Y(.03));           // plint
      c.fillStyle = "#d3b894"; c.fillRect(X(.6), Y(.53), X(.34), Y(.03) - Y(.53));   // portal pintu
      c.fillStyle = "#a8744a"; c.fillRect(X(.64), Y(.5), X(.22), Y(.05) - Y(.5));         // daun pintu
      c.strokeStyle = "#8a5c39"; c.lineWidth = 2;
      for (let u = .65; u < .86; u += .03) { c.beginPath(); c.moveTo(X(u), Y(.5)); c.lineTo(X(u), Y(.05)); c.stroke(); }
      c.fillStyle = "#16181d"; c.fillRect(X(.12) - 5, Y(.507) - 5, X(.255) + 10, Y(.179) - Y(.507) + 10);   // bingkai jendela
    }
    const gr = c.createLinearGradient(0, Y(.507), 0, Y(.179));
    gr.addColorStop(0, glow ? "#ffe0a2" : "#ffe0a2"); gr.addColorStop(1, "#eeb766");
    if (glow) {
      c.fillStyle = gr; c.fillRect(X(.12), Y(.507), X(.255), Y(.179) - Y(.507));
      c.fillStyle = "rgba(255,255,255,.5)"; c.fillRect(X(.14), Y(.48), X(.06), Y(.3) - Y(.48)); c.fillRect(X(.3), Y(.48), X(.05), Y(.3) - Y(.48));
      c.fillStyle = "#ff9a4a"; c.globalAlpha = .55; c.fillRect(X(.64), Y(.5), X(.22), Y(.05) - Y(.5)); c.globalAlpha = 1;
    } else {
      c.fillStyle = gr; c.fillRect(X(.12), Y(.507), X(.255), Y(.179) - Y(.507));
      c.fillStyle = "#16181d"; c.fillRect(X(.245) - 2, Y(.507), 4, Y(.179) - Y(.507));
    }
  });
  return [mk(false), mk(true)];
}

function recessTextures() {
  const rw = .3, rh = G + .85, cw = 192, ch = Math.round(cw * rh / rw);
  const X = (u) => (u / rw) * cw, Y = (v) => (1 - v / rh) * ch;
  const mk = (glow) => canvasTex(cw, ch, (c) => {
    c.fillStyle = glow ? "#000" : "#6c6f78"; c.fillRect(0, 0, cw, ch);
    if (!glow) {
      for (let v = 0; v < G; v += .034) { c.fillStyle = Math.round(v / .034) % 2 ? "#4b3e36" : "#5d4e44"; c.fillRect(0, Y(v + .034), cw, Y(v) - Y(v + .034) - 1); }
      c.fillStyle = "#2a2c33"; c.fillRect(X(.075) - 4, Y(G + 1.2) - 4, X(.065) + 8, Y(G + .72) - Y(G + 1.2) + 8);
    } else {
      const gr = c.createLinearGradient(0, Y(G + 1.2), 0, Y(G + .72));
      gr.addColorStop(0, "#ffe6b4"); gr.addColorStop(1, "#f0b765");
      c.fillStyle = gr; c.fillRect(X(.075), Y(G + 1.2), X(.065), Y(G + .72) - Y(G + 1.2));
    }
  });
  return [mk(false), mk(true)];
}

function litMat(pair) {
  return new THREE.MeshStandardMaterial({ map: pair[0], emissive: 0xffffff, emissiveMap: pair[1], emissiveIntensity: .9, roughness: .85 });
}
function box(w, h, d, mat, x, y, z, cast = true) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
  m.position.set(x, y, z); m.castShadow = cast; m.receiveShadow = true; return m;
}

function buildArnica() {
  const g = new THREE.Group();
  const gh = G * W, h1 = H1 * W, rise = RISE * W, topH = T * W;       // meter
  const sideMat = new THREE.MeshStandardMaterial({ color: 0xcfd3e0, roughness: .85 });
  const greyMat = new THREE.MeshStandardMaterial({ color: 0x4f525a, roughness: .7 });
  const greyTop = new THREE.MeshStandardMaterial({ color: 0x62656e, roughness: .7 });
  const railMat = new THREE.MeshStandardMaterial({ color: 0x1f2126, roughness: .5 });
  const roofTex = canvasTex(256, 256, (c, w, h) => {
    c.fillStyle = "#313a4b"; c.fillRect(0, 0, w, h); c.strokeStyle = "#252c3a"; c.lineWidth = 2;
    for (let y = 0; y < h; y += 16) { c.beginPath(); c.moveTo(0, y); c.lineTo(w, y); c.stroke(); }
    for (let x = 0; x < w; x += 32) { c.beginPath(); c.moveTo(x, 0); c.lineTo(x, h); c.stroke(); }
  });
  roofTex.wrapS = roofTex.wrapT = THREE.RepeatWrapping; roofTex.repeat.set(5, 4);
  const roofMat = new THREE.MeshStandardMaterial({ map: roofTex, roughness: .55 });

  const shape = new THREE.Shape();
  [[0, 0], [W, 0], [W, h1], [W / 2, topH], [0, h1]].forEach(([x, y], i) => i ? shape.lineTo(x, y) : shape.moveTo(x, y));
  const prismGeo = new THREE.ExtrudeGeometry(shape, { depth: D, bevelEnabled: false });
  const frontGeo = new THREE.ShapeGeometry(shape);
  { const p = frontGeo.attributes.position, uv = frontGeo.attributes.uv;
    for (let i = 0; i < p.count; i++) uv.setXY(i, p.getX(i) / W, p.getY(i) / topH); }
  const grGeo = new THREE.PlaneGeometry(W, gh);
  const slopeLen = Math.hypot(W / 2, rise) + .25;

  const upA = litMat(upperTextures(false)), upB = litMat(upperTextures(true));
  const grA = litMat(groundTextures(false)), grB = litMat(groundTextures(true));
  const recTex = litMat(recessTextures());
  const recH = (G + .85) * W;

  function unit(x0, mirror) {
    const u = new THREE.Group(); u.position.x = x0;
    u.add(box(W, gh, D, sideMat, W / 2, gh / 2, -D / 2));
    const fg = new THREE.Mesh(grGeo, mirror ? grB : grA); fg.position.set(W / 2, gh / 2, .02); u.add(fg);
    const prism = new THREE.Mesh(prismGeo, sideMat); prism.position.set(0, gh, -D); prism.castShadow = true; u.add(prism);
    const fr = new THREE.Mesh(frontGeo, mirror ? upB : upA); fr.position.set(0, gh, .02); u.add(fr);
    // kanopi pintu
    const dx = mirror ? W * (1 - .77) : W * .77;
    u.add(box(W * .36, .12, .9, greyTop, dx, gh * .88, .45));
    [-1, 1].forEach((s) => {
      const r = box(slopeLen, .16, D + .4, roofMat, W / 2 + s * (W / 4), gh + h1 + rise / 2 + .1, -D / 2 + .15);
      r.rotation.z = -s * Math.atan2(rise, W / 2); u.add(r);
    });
    return u;
  }

  function pair(x0) {
    const p = new THREE.Group(); p.position.x = x0;
    p.add(unit(0, false), unit(W, true));
    const cx = W, span = 1.15 * W;
    p.add(box(span, .114 * W, 1.4, greyMat, cx, gh + .057 * W, .7));                 // slab balkon
    p.add(box(span, .07 * W, .72, greyMat, cx, gh + .615 * W, .36));                  // kanopi di atas kaca
    const n = 42, rl = span - .5;
    for (let k = 0; k <= n; k++) p.add(box(.035, (.31 - .114) * W, .035, railMat, cx - rl / 2 + k * rl / n, gh + (.114 + .098) * W, 1.3, false));
    p.add(box(rl, .07, .07, railMat, cx, gh + .31 * W, 1.3, false));
    p.add(box(rl, .05, .05, railMat, cx, gh + .114 * W + .05, 1.3, false));
    return p;
  }
  function spacer(x0) {                                                              // pilaster + dinding dalam
    const s = new THREE.Group(); s.position.x = x0;
    const pw = .12 * W, ph = (G + H1 + .03) * W;
    const pil = [new THREE.MeshStandardMaterial({ color: 0x8b8e98 }), new THREE.MeshStandardMaterial({ color: 0x8b8e98 }),
      new THREE.MeshStandardMaterial({ color: 0xd9dce8 }), new THREE.MeshStandardMaterial({ color: 0x8b8e98 }),
      new THREE.MeshStandardMaterial({ color: 0xdfe2ee, roughness: .8 }), new THREE.MeshStandardMaterial({ color: 0x8b8e98 })];
    s.add(box(pw, ph, D + .5, pil, pw / 2, ph / 2, -D / 2 + .5));
    s.add(box(pw + .05, .9, D + .55, new THREE.MeshStandardMaterial({ color: 0x777a84 }), pw / 2, .45, -D / 2 + .5));
    const rw = .3 * W;
    s.add(box(rw, recH, D, sideMat, pw + rw / 2, recH / 2, -D / 2 - .2));
    const rf = new THREE.Mesh(new THREE.PlaneGeometry(rw, recH), recTex);
    rf.position.set(pw + rw / 2, recH / 2, -.19); s.add(rf);
    return s;
  }
  const spW = .42 * W, blockW = spW + 2 * W;
  const total = 2 * blockW + .12 * W;
  const row = new THREE.Group();
  for (let k = 0; k < 2; k++) {
    row.add(spacer(k * blockW));
    row.add(pair(k * blockW + spW));
  }
  const endPil = spacer(2 * blockW);                                                  // pilaster penutup kanan (tanpa dinding dalam)
  endPil.children.splice(2);
  endPil.children.length = 2;
  row.add(endPil);
  row.position.x = -total / 2;
  g.add(row);

  // lingkungan
  const mk = (c, r = 1) => new THREE.MeshStandardMaterial({ color: c, roughness: r });
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(200, 200), mk(0x6b8f4a)); ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true; g.add(ground);
  const pave = canvasTex(256, 256, (c, w, h) => {
    c.fillStyle = "#9c9da1"; c.fillRect(0, 0, w, h); c.strokeStyle = "#85868b"; c.lineWidth = 2;
    for (let y = 0; y < h; y += 32) { c.beginPath(); c.moveTo(0, y); c.lineTo(w, y); c.stroke(); for (let x = (y / 32 % 2) * 32; x < w; x += 64) { c.beginPath(); c.moveTo(x, y); c.lineTo(x, y + 32); c.stroke(); } }
  });
  pave.wrapS = pave.wrapT = THREE.RepeatWrapping; pave.repeat.set(12, 2);
  const drive = new THREE.Mesh(new THREE.BoxGeometry(total + 8, .06, 6), new THREE.MeshStandardMaterial({ map: pave, roughness: .9 }));
  drive.position.set(0, .03, 3.3); drive.receiveShadow = true; g.add(drive);
  g.add(box(total + 8, .05, 7, mk(0x55575c, .95), 0, .02, 9.5, false));
  g.add(box(total + 8, .2, .3, mk(0xb9b9b6), 0, .1, 6.4, false));                        // kerb
  const gx = -total / 2;
  g.add(box(11, .08, 2.2, mk(0x7fb04a), gx + 17.5, .05, 5.2, false));                      // petak rumput tengah

  // mobil (siluet samping diekstrusi): sedan hitam, mini kuning, SUV hitam, sedan perak
  const car = (x, z, col, len = 4.6, hh = 1.35) => {
    const c = new THREE.Group();
    const sp = new THREE.Shape(); [[0, .3], [0, .78], [.9, .88], [1.5, hh], [len - 1.5, hh], [len - .8, .88], [len, .8], [len, .3]].forEach(([a, b], i) => i ? sp.lineTo(a, b) : sp.moveTo(a, b));
    const body = new THREE.Mesh(new THREE.ExtrudeGeometry(sp, { depth: 1.8, bevelEnabled: false }), new THREE.MeshStandardMaterial({ color: col, metalness: .5, roughness: .3 }));
    body.position.set(-len / 2, 0, -.9); c.add(body);
    const gs = new THREE.Shape(); [[1.55, .9], [1.65, hh - .06], [len - 1.65, hh - .06], [len - 1.05, .9]].forEach(([a, b], i) => i ? gs.lineTo(a, b) : gs.moveTo(a, b));
    const gl = new THREE.Mesh(new THREE.ExtrudeGeometry(gs, { depth: 1.84, bevelEnabled: false }), new THREE.MeshStandardMaterial({ color: 0x141a24, metalness: .7, roughness: .15 }));
    gl.position.set(-len / 2, 0, -.92); c.add(gl);
    [[.95, .9], [len - .95, .9], [.95, -.9], [len - .95, -.9]].forEach(([a, b]) => {
      const w = new THREE.Mesh(new THREE.CylinderGeometry(.34, .34, .25, 18), new THREE.MeshStandardMaterial({ color: 0x0e0e0f })); w.rotation.x = Math.PI / 2;
      w.position.set(a - len / 2, .34, b); c.add(w);
    });
    c.traverse((o) => { o.castShadow = true; });
    c.position.set(x, 0, z); return c;
  };
  g.add(car(gx + 4.6, 3.5, 0x181a20), car(gx + 20.7, 3.4, 0xd9b13f, 3.9, 1.3), car(gx + 25.3, 3.6, 0x1c1e22, 4.8, 1.5), car(gx + 30.3, 3.5, 0xb9bec7));

  // orang
  const person = (x, z, shirt, h = 1.75, pants = 0x2a2d3a) => {
    const p = new THREE.Group();
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(.13, .11, h * .5, 8), mk(pants)); leg.position.y = h * .25; p.add(leg);
    const tor = new THREE.Mesh(new THREE.CylinderGeometry(.19, .16, h * .32, 10), mk(shirt)); tor.position.y = h * .66; p.add(tor);
    const hd = new THREE.Mesh(new THREE.SphereGeometry(.12, 12, 10), mk(0xd9a98a)); hd.position.y = h * .9; p.add(hd);
    p.traverse((o) => { o.castShadow = true; }); p.position.set(x, 0, z); return p;
  };
  g.add(person(gx + 17.4, 4.6, 0x8c93a8), person(gx + 18.2, 4.4, 0x9a9aa6, 1.65, 0x4a5568),
        person(gx + 8.5, 4.4, 0xf1f1f1), person(gx + 9.7, 4.6, 0xd96b8c, 1.2, 0x555b6e));

  // pohon tengah + semak + bunga merah
  const tree = new THREE.Group();
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(.07, .12, 7, 8), mk(0x5b4636)); trunk.position.y = 3.5; tree.add(trunk);
  for (let k = 0; k < 18; k++) {
    const f = new THREE.Mesh(new THREE.IcosahedronGeometry(.45 + (k % 3) * .12, 1), mk(k % 2 ? 0x8cc15a : 0x6fa747));
    const a = k * 2.4; f.position.set(Math.cos(a) * (.5 + (k % 5) * .35), 3.6 + k * .22, Math.sin(a) * .8); f.scale.y = .6; f.castShadow = true; tree.add(f);
  }
  tree.position.set(gx + 17.6, 0, 5.3); g.add(tree);
  const bush = (x, z, col, r) => { const b = new THREE.Mesh(new THREE.IcosahedronGeometry(r, 1), mk(col)); b.position.set(x, r * .8, z); b.castShadow = true; g.add(b); };
  for (let k = 0; k < 7; k++) bush(gx + 11 + k * 1.1, 5.0 + (k % 2) * .5, k % 2 ? 0x3f7a35 : 0x5a9a42, .5 + (k % 3) * .12);
  for (let k = 0; k < 14; k++) bush(gx + 2 + k * 2.6, 13.5 + (k % 3), 0xd9472b, .45 + (k % 4) * .1);
  for (let k = 0; k < 6; k++) bush(gx - 1 + k * 2, 12.8, 0xe6c93a, .4);

  // pepohonan latar belakang
  for (let k = 0; k < 16; k++) {
    const b = new THREE.Mesh(new THREE.IcosahedronGeometry(7 + (k % 4) * 1.5, 1), mk(k % 3 ? 0x2f5a35 : 0x3d6e3c));
    b.position.set(-48 + k * 6.4, 8 + (k % 3) * 2, -D - 12 - (k % 2) * 5); g.add(b);
  }
  return g;
}

const MODELS = { arnica: { build: buildArnica, target: [0, 5.5, 0], pos: [-10, 3.2, 40] } };

export function has(name) { return !!MODELS[name]; }

export function mount(el, name) {
  const def = MODELS[name];
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x9bbbd8);
  scene.add(new THREE.HemisphereLight(0xeaf3ff, 0x8aa070, 1.6));
  const sun = new THREE.DirectionalLight(0xfff1d6, 2.4);
  sun.position.set(22, 30, 36); sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  Object.assign(sun.shadow.camera, { left: -40, right: 40, top: 30, bottom: -30, near: 1, far: 120 });
  scene.add(sun);
  scene.add(def.build());

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  el.appendChild(renderer.domElement);
  renderer.domElement.style.cssText = "width:100%;height:100%;display:block;touch-action:none";

  const camera = new THREE.PerspectiveCamera(34, 1, .1, 300);
  const t = new THREE.Vector3(...def.target);
  camera.position.set(...def.pos);
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.target.copy(t);
  controls.enableDamping = true;
  controls.autoRotate = false;
  controls.maxPolarAngle = Math.PI / 2 - .03;
  controls.minDistance = 8; controls.maxDistance = 70;
  controls.addEventListener("start", () => { controls.autoRotate = false; });

  const resize = () => {
    const w = el.clientWidth || 1, h = el.clientHeight || 1;
    renderer.setSize(w, h, false);
    camera.aspect = w / h; camera.updateProjectionMatrix();
  };
  const ro = new ResizeObserver(resize); ro.observe(el); resize();
  let raf = 0;
  const loop = () => { raf = requestAnimationFrame(loop); controls.update(); renderer.render(scene, camera); };
  loop();

  return function dispose() {
    cancelAnimationFrame(raf); ro.disconnect(); controls.dispose();
    scene.traverse((o) => {
      if (o.geometry) o.geometry.dispose();
      if (o.material) [].concat(o.material).forEach((m) => { if (m.map) m.map.dispose(); m.dispose(); });
    });
    renderer.dispose(); renderer.domElement.remove();
  };
}
