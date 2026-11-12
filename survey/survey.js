(function () {
  "use strict";
  var D = window.SURVEY, $ = function (id) { return document.getElementById(id); };
  var byId = {}, floorById = {};
  D.scenes.forEach(function (s) { byId[s.id] = s; });
  D.floors.forEach(function (f) { floorById[f.id] = f; });
  $("unit-name").textContent = D.unit;
  document.title = D.title + " — " + D.unit;

  // Pannellum multi-scene config dari data.js
  var scenes = {};
  D.scenes.forEach(function (s) {
    scenes[s.id] = {
      type: "equirectangular", panorama: s.photo, yaw: s.yaw || 0, hfov: 100,
      hotSpots: (s.hotspots || []).map(function (h) {
        return { type: "scene", sceneId: h.to, yaw: h.yaw, pitch: h.pitch || 0, text: h.label };
      })
    };
  });
  var viewer = pannellum.viewer("pano", {
    default: { firstScene: D.scenes[0].id, autoLoad: true, showControls: true, compass: false },
    scenes: scenes
  });

  var current = null, shownFloor = null;

  function el(tag, attrs, text) {
    var e = document.createElement(tag);
    Object.keys(attrs || {}).forEach(function (k) { e.setAttribute(k, attrs[k]); });
    if (text != null) e.textContent = text;
    return e;
  }
  function fillSpecs(node, rows) {
    node.textContent = "";
    rows.forEach(function (r) { node.appendChild(el("dt", {}, r[0])); node.appendChild(el("dd", {}, r[1])); });
  }

  // Tab lantai: klik lantai -> tampil denah + spesifikasi, lalu loncat ke scene pertama lantai itu.
  var floorsEl = $("floors");
  D.floors.forEach(function (f) {
    var b = el("button", { type: "button", role: "tab", "data-floor": f.id }, f.label);
    b.addEventListener("click", function () {
      showFloor(f.id);
      var first = D.scenes.filter(function (s) { return s.floor === f.id; })[0];
      if (first && (!current || byId[current].floor !== f.id)) viewer.loadScene(first.id);
    });
    floorsEl.appendChild(b);
  });
  fillSpecs($("summary"), D.summary || []);

  function showFloor(id) {
    var f = floorById[id];
    if (!f) return;
    shownFloor = id;
    Array.prototype.forEach.call(floorsEl.children, function (b) {
      b.setAttribute("aria-selected", b.getAttribute("data-floor") === id ? "true" : "false");
    });
    $("plan-img").src = f.plan;
    $("plan-img").alt = "Denah " + f.label;
    $("floor-name").textContent = f.label + (f.area ? " · " + f.area : "");
    fillSpecs($("specs"), f.specs || []);
    var dots = $("plan-dots"), rooms = $("rooms");
    dots.textContent = ""; rooms.textContent = "";
    D.scenes.filter(function (s) { return s.floor === id; }).forEach(function (s) {
      var d = el("button", { type: "button", class: "dot", title: s.title, "aria-label": s.title, "data-scene": s.id });
      d.style.left = s.plan.x + "%"; d.style.top = s.plan.y + "%";
      d.addEventListener("click", function () { viewer.loadScene(s.id); closePanel(); });
      dots.appendChild(d);
      var r = el("button", { type: "button", "data-scene": s.id }, s.title);
      r.addEventListener("click", function () { viewer.loadScene(s.id); closePanel(); });
      rooms.appendChild(r);
    });
    markCurrent();
  }
  function markCurrent() {
    document.querySelectorAll("[data-scene]").forEach(function (n) {
      if (n.getAttribute("data-scene") === current) n.setAttribute("aria-current", "true");
      else n.removeAttribute("aria-current");
    });
  }

  viewer.on("scenechange", function (id) {
    current = id;
    $("scene-title").textContent = byId[id].title;
    if (shownFloor !== byId[id].floor) showFloor(byId[id].floor); else markCurrent();
    try { history.replaceState(null, "", "#" + id); } catch (e) {}
  });
  viewer.on("load", function () {
    if (!current) { current = viewer.getScene(); $("scene-title").textContent = byId[current].title; showFloor(byId[current].floor); }
  });

  // Deep link: survey/#l2-master
  var hash = location.hash.slice(1);
  if (hash && byId[hash] && hash !== D.scenes[0].id) viewer.loadScene(hash);

  // Panel mobile
  var panel = $("panel");
  function closePanel() { panel.classList.remove("open"); }
  $("panel-toggle").addEventListener("click", function () { panel.classList.toggle("open"); });
})();
