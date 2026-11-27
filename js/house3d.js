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

// ---------- ARNICA: 3 unit rumah 2 lantai beratap pelana, fasad panel putih + kayu ----------
function buildArnica() {
  const g = new THREE.Group();
  const W = 6, D = 12, H1 = 3.2, H2 = 3.2, PEAK = 2.2;
  const FR = 0x5d6068, WOOD = 0x7a5e48;

  // Fasad lantai atas (segilima: dinding + pelana), koordinat tekstur ternormalisasi.
  const topH = H2 + PEAK;
  const upperTex = canvasTex(768, 691, (c, w, h) => {
    const X = (m) => (m / W) * w, Y = (m) => (1 - m / topH) * h;
    c.fillStyle = "#5d6068"; c.fillRect(0, 0, w, h);                     // rangka abu tua
    c.fillStyle = "#e9ecf3";                                             // panel putih
    c.beginPath(); c.moveTo(X(.25), Y(0)); c.lineTo(X(5.75), Y(0)); c.lineTo(X(5.75), Y(H2 - .1));
    c.lineTo(X(3), Y(topH - .35)); c.lineTo(X(.25), Y(H2 - .1)); c.closePath(); c.fill();
    c.strokeStyle = "#b9bfcc"; c.lineWidth = 2;                          // sambungan panel
    [[1.5, 0, 1.5, 3.4], [4.5, 0, 4.5, 3.4], [.25, 1.6, 1.5, 1.6], [4.5, 1.9, 5.75, 1.9]].forEach(([a, b, d, e]) => {
      c.beginPath(); c.moveTo(X(a), Y(b)); c.lineTo(X(d), Y(e)); c.stroke();
    });
    // kayu vertikal di pelana atas
    c.save(); c.beginPath(); c.moveTo(X(1.45), Y(H2 - .1)); c.lineTo(X(4.55), Y(H2 - .1));
    c.lineTo(X(4.55), Y(3.3)); c.lineTo(X(3), Y(topH - .55)); c.lineTo(X(1.45), Y(3.3)); c.closePath(); c.clip();
    c.fillStyle = "#6d5a4c"; c.fillRect(0, 0, w, h);
    c.strokeStyle = "#51423a"; c.lineWidth = 2;
    for (let x = 1.4; x < 4.6; x += .11) { c.beginPath(); c.moveTo(X(x), 0); c.lineTo(X(x), h); c.stroke(); }
    c.restore();
    // pintu kaca balkon (hangat dari dalam)
    const gr = c.createLinearGradient(0, Y(2.6), 0, Y(.35));
    gr.addColorStop(0, "#ffe2a8"); gr.addColorStop(1, "#f6c978");
    c.fillStyle = gr; c.fillRect(X(1.2), Y(2.6), X(4.8) - X(1.2), Y(.35) - Y(2.6));
    c.strokeStyle = "#2b2d33"; c.lineWidth = 5; c.strokeRect(X(1.2), Y(2.6), X(4.8) - X(1.2), Y(.35) - Y(2.6));
    c.lineWidth = 3;
    [2.4, 3.6].forEach((x) => { c.beginPath(); c.moveTo(X(x), Y(2.6)); c.lineTo(X(x), Y(.35)); c.stroke(); });
  });
  const upperShape = new THREE.Shape();
  [[0, 0], [W, 0], [W, H2], [W / 2, topH], [0, H2]].forEach(([x, y], i) => i ? upperShape.lineTo(x, y) : upperShape.moveTo(x, y));
  const frontGeo = new THREE.ShapeGeometry(upperShape);
  { const p = frontGeo.attributes.position, uv = frontGeo.attributes.uv;
    for (let i = 0; i < p.count; i++) uv.setXY(i, p.getX(i) / W, p.getY(i) / topH); }
  const prismGeo = new THREE.ExtrudeGeometry(upperShape, { depth: D, bevelEnabled: false });
  const sideMat = new THREE.MeshStandardMaterial({ color: 0xdfe2ea, roughness: .8 });

  const groundTex = canvasTex(768, 384, (c, w, h) => {
    const X = (m) => (m / W) * w, Y = (m) => (1 - m / H1) * h;
    c.fillStyle = "#7a5e48"; c.fillRect(0, 0, w, h);
    c.strokeStyle = "#5e463a"; c.lineWidth = 2;
    for (let y = 0; y < H1; y += .16) { c.beginPath(); c.moveTo(0, Y(y)); c.lineTo(w, Y(y)); c.stroke(); }
    c.fillStyle = "#a07a58"; c.fillRect(X(.6), Y(2.4), X(1.7) - X(.6), Y(0) - Y(2.4));          // pintu
    c.strokeStyle = "#2b2d33"; c.lineWidth = 4; c.strokeRect(X(.6), Y(2.4), X(1.7) - X(.6), Y(0) - Y(2.4));
    const gr = c.createLinearGradient(0, Y(2.5), 0, Y(.4));
    gr.addColorStop(0, "#ffe2a8"); gr.addColorStop(1, "#f1c070");
    c.fillStyle = gr; c.fillRect(X(3.2), Y(2.5), X(5.2) - X(3.2), Y(.4) - Y(2.5));              // jendela
    c.strokeStyle = "#2b2d33"; c.strokeRect(X(3.2), Y(2.5), X(5.2) - X(3.2), Y(.4) - Y(2.5));
    c.beginPath(); c.moveTo(X(4.2), Y(2.5)); c.lineTo(X(4.2), Y(.4)); c.stroke();
  });

  const roofMat = new THREE.MeshStandardMaterial({ color: 0x2f3440, roughness: .6 });
  const slabMat = new THREE.MeshStandardMaterial({ color: 0x6a6d75, roughness: .7 });
  const railMat = new THREE.MeshStandardMaterial({ color: 0x23252b, roughness: .5 });
  const ang = Math.atan2(PEAK, W / 2), slopeLen = Math.hypot(W / 2, PEAK) + .5;

  for (let i = -1; i <= 1; i++) {
    const u = new THREE.Group();
    u.position.x = i * W;
    // lantai bawah
    const gb = new THREE.Mesh(new THREE.BoxGeometry(W, H1, D), [
      sideMat, sideMat, sideMat, sideMat,
      new THREE.MeshStandardMaterial({ map: groundTex, roughness: .85 }), sideMat]);
    gb.position.set(W / 2, H1 / 2, -D / 2); gb.castShadow = gb.receiveShadow = true; u.add(gb);
    // lantai atas: prisma + fasad bertekstur
    const prism = new THREE.Mesh(prismGeo, sideMat);
    prism.position.set(0, H1, -D); prism.castShadow = true; u.add(prism);
    const front = new THREE.Mesh(frontGeo, new THREE.MeshStandardMaterial({ map: upperTex, roughness: .8 }));
    front.position.set(0, H1, .02); u.add(front);
    // balkon + railing
    const slab = new THREE.Mesh(new THREE.BoxGeometry(W - .5, .25, 1.3), slabMat);
    slab.position.set(W / 2, H1 + .02, .65); slab.castShadow = true; u.add(slab);
    for (let k = 0; k <= 22; k++) {
      const b = new THREE.Mesh(new THREE.BoxGeometry(.04, 1, .04), railMat);
      b.position.set(.5 + k * ((W - 1) / 22), H1 + .62, 1.25); u.add(b);
    }
    const top = new THREE.Mesh(new THREE.BoxGeometry(W - 1, .06, .06), railMat);
    top.position.set(W / 2, H1 + 1.13, 1.25); u.add(top);
    // kanopi pintu
    const can = new THREE.Mesh(new THREE.BoxGeometry(2, .12, 1.2), slabMat);
    can.position.set(1.45, 2.6, .6); can.castShadow = true; u.add(can);
    // atap
    [-1, 1].forEach((s) => {
      const r = new THREE.Mesh(new THREE.BoxGeometry(slopeLen, .14, D + .6), roofMat);
      r.position.set(W / 2 + s * (W / 4), H1 + H2 + PEAK / 2 + .08, -D / 2 + .1);
      r.rotation.z = -s * ang; r.castShadow = true; u.add(r);
    });
    g.add(u);
  }
  g.position.x = -W / 2;

  // lingkungan: halaman, jalan, mobil, pohon, tanaman
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(80, 80), new THREE.MeshStandardMaterial({ color: 0x78a84a, roughness: 1 }));
  ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true; ground.position.set(0, -0.001, 0); g.add(ground);
  const drive = new THREE.Mesh(new THREE.BoxGeometry(3 * W + 2, .05, 5), new THREE.MeshStandardMaterial({ color: 0xb8b8b4, roughness: .9 }));
  drive.position.set(W, .02, 3); drive.receiveShadow = true; g.add(drive);
  const road = new THREE.Mesh(new THREE.BoxGeometry(80, .04, 6), new THREE.MeshStandardMaterial({ color: 0x4b4d52, roughness: .95 }));
  road.position.set(W, .01, 8.5); road.receiveShadow = true; g.add(road);

  const car = (x, z, col) => {
    const c = new THREE.Group();
    const m = new THREE.MeshStandardMaterial({ color: col, metalness: .4, roughness: .35 });
    const body = new THREE.Mesh(new THREE.BoxGeometry(1.8, .6, 4.2), m); body.position.y = .55;
    const cab = new THREE.Mesh(new THREE.BoxGeometry(1.6, .5, 2.2), new THREE.MeshStandardMaterial({ color: 0x1b2430, metalness: .6, roughness: .2 }));
    cab.position.set(0, 1.05, -.2);
    c.add(body, cab);
    [[-.9, 1.3], [.9, 1.3], [-.9, -1.3], [.9, -1.3]].forEach(([wx, wz]) => {
      const w = new THREE.Mesh(new THREE.CylinderGeometry(.33, .33, .22, 16), new THREE.MeshStandardMaterial({ color: 0x111111 }));
      w.rotation.z = Math.PI / 2; w.position.set(wx, .33, wz); c.add(w);
    });
    c.traverse((o) => { o.castShadow = true; });
    c.position.set(x, 0, z); return c;
  };
  g.add(car(W * .1, 3.4, 0x20242b), car(W * 1.05, 3.4, 0xe0b23a), car(W * 1.95, 3.4, 0xb9c0c8));

  const tree = new THREE.Group();
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(.08, .13, 3.6, 8), new THREE.MeshStandardMaterial({ color: 0x5b4636 }));
  trunk.position.y = 1.8; tree.add(trunk);
  for (let k = 0; k < 7; k++) {
    const f = new THREE.Mesh(new THREE.IcosahedronGeometry(.55 + (k % 3) * .12, 1), new THREE.MeshStandardMaterial({ color: 0x5f9b3c, roughness: 1 }));
    f.position.set((k % 3 - 1) * .5, 2.9 + (k % 4) * .35, ((k * 7) % 3 - 1) * .4); f.castShadow = true; tree.add(f);
  }
  tree.position.set(W * 1.5, 0, 4.2); g.add(tree);
  for (let k = 0; k < 10; k++) {
    const b = new THREE.Mesh(new THREE.IcosahedronGeometry(.28 + (k % 3) * .08, 1), new THREE.MeshStandardMaterial({ color: k % 2 ? 0x3f8a3a : 0xd9472b, roughness: 1 }));
    b.position.set(W * .35 + k * 1.5, .25, 5.6 + (k % 2) * .4); b.castShadow = true; g.add(b);
  }
  return g;
}

const MODELS = { arnica: { build: buildArnica, target: [0, 3, -2], dist: 26 } };

export function has(name) { return !!MODELS[name]; }

export function mount(el, name) {
  const def = MODELS[name];
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xbfd9ee);
  scene.fog = new THREE.Fog(0xbfd9ee, 50, 110);
  scene.add(new THREE.HemisphereLight(0xdfeeff, 0x6f8f55, 1.1));
  const sun = new THREE.DirectionalLight(0xfff1d6, 2.4);
  sun.position.set(14, 22, 18); sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  Object.assign(sun.shadow.camera, { left: -25, right: 25, top: 25, bottom: -25, near: 1, far: 80 });
  scene.add(sun);
  scene.add(def.build());

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  el.appendChild(renderer.domElement);
  renderer.domElement.style.cssText = "width:100%;height:100%;display:block;touch-action:none";

  const camera = new THREE.PerspectiveCamera(40, 1, .1, 200);
  const t = new THREE.Vector3(...def.target);
  camera.position.set(t.x + def.dist * .55, t.y + def.dist * .3, t.z + def.dist * .85);
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.target.copy(t);
  controls.enableDamping = true;
  controls.autoRotate = true; controls.autoRotateSpeed = .6;
  controls.maxPolarAngle = Math.PI / 2 - .03;
  controls.minDistance = 8; controls.maxDistance = 55;
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
