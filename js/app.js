(function () {
  "use strict";

  const data = MASTERPLAN_DATA;
  const overlay = document.getElementById("mp-overlay");
  const stageInner = document.getElementById("stage-inner");
  const zoomTarget = document.getElementById("zoom-target");
  const zoomInBtn = document.getElementById("zoom-in");
  const zoomOutBtn = document.getElementById("zoom-out");
  const zoomResetBtn = document.getElementById("zoom-reset");
  const legendTypesEl = document.getElementById("legend-types");
  const legendPanel = document.getElementById("legend-panel");
  const btnLegend = document.getElementById("btn-legend");

  const SVG_NS = "http://www.w3.org/2000/svg";
  const IMG_W = data.imageSize.width;
  const IMG_H = data.imageSize.height;
  // Legacy CSS px sizes from the old percentage-based HTML overlay (rendered at up
  // to 1100px container width) converted into fixed viewBox units, so text/strokes
  // keep the same relative size they always had -- just vector-sharp now.
  const VB = IMG_W / 1100;

  function svgEl(tag, attrs) {
    const el = document.createElementNS(SVG_NS, tag);
    if (attrs) {
      for (const k in attrs) el.setAttribute(k, attrs[k]);
    }
    return el;
  }

  function pxBox(box) {
    return {
      left: (box.left / 100) * IMG_W,
      top: (box.top / 100) * IMG_H,
      width: (box.width / 100) * IMG_W,
      height: (box.height / 100) * IMG_H,
    };
  }

  // clipPath points are stored as % of the block/facility's own box (not the whole
  // image) -- re-expressed here as absolute viewBox pixel coordinates for a <polygon>.
  function clipPathToPoints(clipPath, box) {
    return clipPath
      .map(([px, py]) => {
        const x = box.left + (px / 100) * box.width;
        const y = box.top + (py / 100) * box.height;
        return x.toFixed(2) + "," + y.toFixed(2);
      })
      .join(" ");
  }

  const popup = document.getElementById("unit-popup");
  const popupBackdrop = document.getElementById("unit-popup-backdrop");
  const popupClose = document.getElementById("unit-popup-close");
  const upCode = document.getElementById("up-code");
  const upCluster = document.getElementById("up-cluster");
  const upStatus = document.getElementById("up-status");
  const upType = document.getElementById("up-type");
  const upAddr = document.getElementById("up-addr");
  const upPrices = document.getElementById("up-prices");
  const upRender = document.getElementById("up-render");

  const CLUSTER_LABEL = {
    montana: "Cluster Montana",
    sierra: "Cluster Sierra",
    ruko: "Ruko (Sold Out)",
    tahap1: "Tahap 1 (Sold Out)",
  };

  function fmtRupiah(n) {
    if (n === null || n === undefined) return null;
    return "Rp" + n.toLocaleString("id-ID");
  }

  function fmtLT(v) {
    return (typeof v === "number" && v % 1 !== 0) ? v.toFixed(1).replace(".", ",") : v;
  }

  function hexToRgba(hex, alpha) {
    const n = parseInt(hex.slice(1), 16);
    const r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  // ---------- Render unit overlays (real SVG shapes, sharp at any zoom) ----------
  function renderBlocks() {
    data.blocks.forEach((block) => {
      const box = pxBox(block.box);
      const units = block.units.slice().sort((a, b) => a.cell - b.cell);
      const n = units.length;

      units.forEach((unit, i) => {
        // Divide the block's box into `n` equal cells along its main axis -- same
        // split the old flexbox layout did, just computed in viewBox px now. Blocks
        // with a clipPath (single precisely-placed lots, e.g. the tilted Ruko row)
        // have exactly one unit, whose true shape is the polygon itself, not a slice
        // of the bounding box.
        let cellBox = null;
        if (!block.clipPath) {
          if (block.orientation === "col") {
            const h = box.height / n;
            cellBox = { left: box.left, top: box.top + i * h, width: box.width, height: h };
          } else {
            const w = box.width / n;
            cellBox = { left: box.left + i * w, top: box.top, width: w, height: box.height };
          }
        }
        const bb = cellBox || box;

        const isUnreleased = unit.status === "HOLD" && unit.statusLabel === "BELUM DIJUAL";
        const statusClass =
          unit.status === "SOLD" ? "mp-unit--sold" :
          isUnreleased ? "mp-unit--unreleased" :
          unit.status === "HOLD" ? "mp-unit--hold" : "mp-unit--tersedia";

        const g = svgEl("g", { class: "mp-unit " + statusClass });
        const titleEl = svgEl("title");
        titleEl.textContent = `${block.id}-${unit.no} · ${unit.type} · ${unit.status}`;
        g.appendChild(titleEl);

        let cell;
        if (block.clipPath) {
          cell = svgEl("polygon", {
            class: "mp-unit__cell",
            points: clipPathToPoints(block.clipPath, box),
          });
        } else {
          cell = svgEl("rect", {
            class: "mp-unit__cell",
            x: bb.left.toFixed(2), y: bb.top.toFixed(2),
            width: bb.width.toFixed(2), height: bb.height.toFixed(2),
          });
        }
        // Fill with the unit's own type color (matching the legend) instead of a
        // flat status tint, so the site plan reads by type/cluster like the
        // reference master plan -- status is shown via the small SOLD/Show Unit
        // tag on top, not by recoloring the whole cell. Skipped for "tahap1" --
        // those are plain land kavling with no house type/legend color to show,
        // so tinting them grey didn't convey anything and just looked like an
        // arbitrary mark on the still-available units (e.g. B1 01-03). Left plain
        // white instead, matching the untouched/hold look.
        if (!isUnreleased && unit.color && block.cluster !== "tahap1") {
          cell.style.fill = hexToRgba(unit.color, 0.62);
        }
        g.appendChild(cell);

        const cx = bb.left + bb.width / 2;
        const cy = bb.top + bb.height / 2;

        // Tahap 1 kavling already print their own lot number on the base image, so
        // our overlay number is redundant -- and per owner feedback, the
        // still-available ones (e.g. B1 01-03) should look as blank as an
        // unreleased cell instead of drawing attention with a duplicate number.
        if (!isUnreleased && block.cluster !== "tahap1") {
          const noText = svgEl("text", {
            class: "mp-unit__no",
            x: cx.toFixed(2), y: cy.toFixed(2),
          });
          noText.textContent = unit.no;
          g.appendChild(noText);
        }

        if (unit.status === "SOLD" || (unit.status === "HOLD" && !isUnreleased)) {
          if (unit.status === "SOLD") {
            // Stamped SVG image asset (bold, crisp at any size) instead of rendered
            // text -- badge sized at 80%x60% of the cell, not filling it, so the
            // cell's own type color still shows around it (same as the reference
            // master plan's small "terjual" sticker sitting on a colored lot).
            const tagW = bb.width * 0.8, tagH = bb.height * 0.6;
            const img = svgEl("image", {
              class: "mp-unit__tag mp-unit__tag--img",
              x: (cx - tagW / 2).toFixed(2), y: (cy - tagH / 2).toFixed(2),
              width: tagW.toFixed(2), height: tagH.toFixed(2),
              preserveAspectRatio: "xMidYMid meet",
              href: "assets/sold-tag.svg",
            });
            img.setAttributeNS("http://www.w3.org/1999/xlink", "href", "assets/sold-tag.svg");
            g.appendChild(img);
          } else {
            // Hold/"Show Unit" units keep the short text label since there's no
            // equivalent stamp asset.
            const tagW = bb.width * 0.55, tagH = bb.height * 0.4;
            const tagG = svgEl("g", { class: "mp-unit__tag" });
            tagG.appendChild(svgEl("rect", {
              class: "mp-unit__tag-bg",
              x: (cx - tagW / 2).toFixed(2), y: (cy - tagH / 2).toFixed(2),
              width: tagW.toFixed(2), height: tagH.toFixed(2), rx: (2 * VB).toFixed(2),
            }));
            const tagText = svgEl("text", {
              class: "mp-unit__tag-text",
              x: cx.toFixed(2), y: cy.toFixed(2),
            });
            tagText.textContent = "SU";
            tagG.appendChild(tagText);
            // Some blocks (e.g. E3) sit on the diagonal boundary road, visibly
            // tilted -- rotate the "SU" tag to match instead of sitting axis-aligned
            // against a slanted cell. Doesn't touch the SOLD stamp's own fixed tilt.
            if (block.tagRotate) {
              tagG.setAttribute("transform", `rotate(${block.tagRotate} ${cx.toFixed(2)} ${cy.toFixed(2)})`);
            }
            g.appendChild(tagG);
          }
        }

        if (!isUnreleased) {
          g.style.cursor = "pointer";
          g.addEventListener("click", () => openPopup(block, unit));
        } else {
          g.style.cursor = "default";
        }
        overlay.appendChild(g);
      });
    });
  }

  // ---------- Facility markers (mosque, etc.) ----------
  function renderFacilities() {
    (data.facilities || []).forEach((fac) => {
      const box = pxBox(fac.box);
      let el;
      if (fac.clipPath) {
        el = svgEl("polygon", { class: "mp-facility", points: clipPathToPoints(fac.clipPath, box) });
      } else {
        el = svgEl("rect", {
          class: "mp-facility",
          x: box.left.toFixed(2), y: box.top.toFixed(2),
          width: box.width.toFixed(2), height: box.height.toFixed(2),
        });
      }
      const titleEl = svgEl("title");
      titleEl.textContent = fac.name;
      el.appendChild(titleEl);
      el.addEventListener("click", () => openFacilityPopup(fac));
      overlay.appendChild(el);
    });
  }

  // ---------- Pan & zoom ----------
  // Transforms .zoom-target (the raster image + SVG overlay together, kept in sync
  // since both are siblings sized identically inside it) with translate+scale.
  // .stage__inner clips it (overflow:hidden) at its own untransformed layout size,
  // which acts as the fixed viewport -- CSS transforms never change layout size, so
  // that viewport stays put while the content visually pans/zooms inside it.
  function initPanZoom() {
    const MIN_SCALE = 1;
    const MAX_SCALE = 6;
    let scale = 1, tx = 0, ty = 0;

    function applyTransform() {
      zoomTarget.style.transform = `translate(${tx}px, ${ty}px) scale(${scale})`;
    }

    function clamp() {
      const vw = stageInner.clientWidth, vh = stageInner.clientHeight;
      const cw = vw * scale, ch = vh * scale;
      const minTx = Math.min(0, vw - cw);
      const minTy = Math.min(0, vh - ch);
      tx = Math.min(0, Math.max(tx, minTx));
      ty = Math.min(0, Math.max(ty, minTy));
    }

    function zoomAt(clientX, clientY, factor) {
      const rect = stageInner.getBoundingClientRect();
      const px = clientX - rect.left, py = clientY - rect.top;
      const newScale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, scale * factor));
      if (newScale === scale) return;
      const contentX = (px - tx) / scale;
      const contentY = (py - ty) / scale;
      scale = newScale;
      tx = px - contentX * scale;
      ty = py - contentY * scale;
      clamp();
      applyTransform();
    }

    zoomInBtn.addEventListener("click", () => {
      const r = stageInner.getBoundingClientRect();
      zoomAt(r.left + r.width / 2, r.top + r.height / 2, 1.4);
    });
    zoomOutBtn.addEventListener("click", () => {
      const r = stageInner.getBoundingClientRect();
      zoomAt(r.left + r.width / 2, r.top + r.height / 2, 1 / 1.4);
    });
    zoomResetBtn.addEventListener("click", () => {
      scale = 1; tx = 0; ty = 0;
      applyTransform();
    });

    stageInner.addEventListener("wheel", (e) => {
      e.preventDefault();
      const factor = Math.pow(1.0015, -e.deltaY);
      zoomAt(e.clientX, e.clientY, factor);
    }, { passive: false });

    // Unified mouse + touch pan/pinch via Pointer Events, with click-vs-drag
    // disambiguation so a real drag doesn't also fire a unit's click/popup.
    //
    // Pointer capture is deliberately NOT taken on pointerdown -- calling
    // setPointerCapture() immediately makes Chromium retarget the eventual
    // pointerup/click to the capturing element (stageInner) instead of whatever
    // was actually under the cursor, which silently broke every unit/button click.
    // Instead we only capture once real movement is detected (past CLICK_SLOP),
    // i.e. once we're sure it's a drag, not a tap -- a plain click never captures,
    // so it reaches its real target normally; a real drag captures and the
    // resulting click harmlessly lands on stageInner itself instead.
    const CLICK_SLOP = 4;
    const pointers = new Map();
    let panStart = null;
    let pinchStart = null;
    let dragOccurred = false;

    function tryCapture(id) {
      try { stageInner.setPointerCapture(id); } catch (err) { /* pointer already gone -- ignore */ }
    }

    stageInner.addEventListener("pointerdown", (e) => {
      if (e.target.closest(".zoom-controls")) return;
      pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      dragOccurred = false;
      if (pointers.size === 1) {
        panStart = { x: e.clientX, y: e.clientY, tx, ty, pointerId: e.pointerId, captured: false };
        pinchStart = null;
      } else if (pointers.size === 2) {
        // Two fingers down is already unambiguous -- capture both immediately.
        panStart = null;
        dragOccurred = true;
        pointers.forEach((_, id) => tryCapture(id));
        stageInner.classList.add("is-panning");
        const pts = Array.from(pointers.values());
        pinchStart = {
          dist: Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y),
          scale, tx, ty,
          midX: (pts[0].x + pts[1].x) / 2,
          midY: (pts[0].y + pts[1].y) / 2,
        };
      }
    });

    stageInner.addEventListener("pointermove", (e) => {
      if (!pointers.has(e.pointerId)) return;
      pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });

      if (pointers.size === 1 && panStart) {
        const dx = e.clientX - panStart.x, dy = e.clientY - panStart.y;
        if (!panStart.captured && Math.hypot(dx, dy) > CLICK_SLOP) {
          panStart.captured = true;
          dragOccurred = true;
          tryCapture(panStart.pointerId);
          stageInner.classList.add("is-panning");
        }
        if (panStart.captured && scale > MIN_SCALE) {
          tx = panStart.tx + dx;
          ty = panStart.ty + dy;
          clamp();
          applyTransform();
        }
      } else if (pointers.size === 2 && pinchStart) {
        const pts = Array.from(pointers.values());
        const dist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
        const newScale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, pinchStart.scale * (dist / pinchStart.dist)));
        const rect = stageInner.getBoundingClientRect();
        const px = pinchStart.midX - rect.left, py = pinchStart.midY - rect.top;
        const contentX = (px - pinchStart.tx) / pinchStart.scale;
        const contentY = (py - pinchStart.ty) / pinchStart.scale;
        scale = newScale;
        tx = px - contentX * scale;
        ty = py - contentY * scale;
        clamp();
        applyTransform();
      }
    });

    function endPointer(e) {
      pointers.delete(e.pointerId);
      if (pointers.size < 2) pinchStart = null;
      if (pointers.size === 0) {
        panStart = null;
        stageInner.classList.remove("is-panning");
      } else if (pointers.size === 1) {
        const [id] = pointers.keys();
        const [remaining] = pointers.values();
        panStart = { x: remaining.x, y: remaining.y, tx, ty, pointerId: id, captured: true };
      }
    }
    stageInner.addEventListener("pointerup", endPointer);
    stageInner.addEventListener("pointercancel", endPointer);
    stageInner.addEventListener("pointerleave", (e) => {
      if (pointers.has(e.pointerId)) endPointer(e);
    });

    // Backup for browsers that don't retarget the compatibility click event the
    // way Chromium does: if the gesture that just ended was a real drag/pinch,
    // swallow the click before it reaches a unit/facility's own click listener.
    stageInner.addEventListener("click", (e) => {
      if (dragOccurred) {
        e.stopPropagation();
        e.preventDefault();
      }
    }, true);
  }

  function openFacilityPopup(fac) {
    upCode.textContent = fac.name;
    upCluster.hidden = true;
    upStatus.hidden = true;

    if (fac.render) {
      upRender.src = fac.render;
      upRender.alt = fac.name;
      upRender.hidden = false;
    } else {
      upRender.hidden = true;
      upRender.removeAttribute("src");
    }

    upType.hidden = true;
    upAddr.hidden = true;
    upPrices.innerHTML = "";

    popup.hidden = false;
    popupBackdrop.hidden = false;
  }

  // ---------- Popup ----------
  function openPopup(block, unit) {
    const code = `SC-${block.id}-${unit.no}`;
    upCode.textContent = code;
    upStatus.hidden = false;
    upAddr.hidden = false;
    upCluster.hidden = false;
    upType.hidden = false;

    if (unit.render) {
      upRender.src = unit.render;
      upRender.alt = unit.type;
      upRender.hidden = false;
    } else {
      upRender.hidden = true;
      upRender.removeAttribute("src");
    }
    upCluster.textContent = CLUSTER_LABEL[block.cluster] || block.cluster;

    upStatus.textContent =
      unit.status === "SOLD" ? "SOLD" :
      unit.status === "HOLD" ? (unit.statusLabel || "HOLD") : "TERSEDIA";
    upStatus.className = "status-badge " + (
      unit.status === "SOLD" ? "status-badge--sold" :
      unit.status === "HOLD" ? "status-badge--hold" : "status-badge--tersedia"
    );

    upType.textContent = (unit.lb && unit.lt)
      ? `${unit.type} · LB ${fmtLT(unit.lb)}/LT ${fmtLT(unit.lt)} m²`
      : unit.lt
      ? `${unit.type} · LT ${fmtLT(unit.lt)} m²`
      : unit.type;
    upAddr.textContent = `${block.street || ("Blok " + block.id)} No. ${unit.no} — Shaistanaya City`;

    upPrices.innerHTML = "";
    if (unit.price) {
      const box = document.createElement("div");
      box.className = "price-box";
      box.innerHTML = `<div class="price-box__label">Harga Jual</div><div class="price-box__value">${fmtRupiah(unit.price)}</div>`;
      upPrices.appendChild(box);
      const note = document.createElement("div");
      note.className = "price-box__note";
      note.textContent = "Harga list sebelum diskon — periode " + (data.periode || "");
      upPrices.appendChild(note);
    } else if (unit.status === "SOLD") {
      const note = document.createElement("div");
      note.className = "price-box__note";
      note.textContent = "Unit ini sudah terjual.";
      upPrices.appendChild(note);
    } else {
      const note = document.createElement("div");
      note.className = "price-box__note";
      note.textContent = "Hubungi tim sales kami untuk info harga terbaru.";
      upPrices.appendChild(note);
    }

    popup.hidden = false;
    popupBackdrop.hidden = false;
  }

  function closePopup() {
    popup.hidden = true;
    popupBackdrop.hidden = true;
  }

  popupClose.addEventListener("click", closePopup);
  popupBackdrop.addEventListener("click", closePopup);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closePopup();
  });

  // ---------- Legend ----------
  function renderLegend() {
    legendTypesEl.innerHTML = "";
    data.legend.forEach((item) => {
      const row = document.createElement("div");
      row.className = "legend-row";
      row.innerHTML = `<span class="swatch" style="background:${item.color}"></span>${item.label}`;
      legendTypesEl.appendChild(row);
    });
  }

  btnLegend.addEventListener("click", () => {
    legendPanel.classList.toggle("is-hidden");
  });

  // On narrow screens the legend is a large inline block (not a floating panel), so start
  // it collapsed -- the "Legenda" button still opens it the same way as on desktop.
  if (window.matchMedia("(max-width: 860px)").matches) {
    legendPanel.classList.add("is-hidden");
  }

  renderBlocks();
  renderFacilities();
  renderLegend();
  initPanZoom();
})();
