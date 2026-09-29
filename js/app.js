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

  // .stage__inner never had an explicit height -- it simply grew to fit its content
  // (the image), which was harmless while zoom was a paint-only CSS transform. Now
  // that pan/zoom resizes .zoom-target's real box (see initPanZoom), .stage__inner
  // MUST have a size of its own, independent of that child, or it would grow right
  // along with it every time we zoom in -- a runaway feedback loop, since each
  // zoom step would read back its own already-enlarged height as the "base" size
  // for the next one. Pinning the aspect ratio keeps it a true fixed viewport.
  stageInner.style.aspectRatio = IMG_W + " / " + IMG_H;

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
  // image) -- re-expressed here as absolute viewBox pixel coordinates.
  function clipPathToAbsPoints(clipPath, box) {
    return clipPath.map(([px, py]) => [
      box.left + (px / 100) * box.width,
      box.top + (py / 100) * box.height,
    ]);
  }

  function clipPathToPoints(clipPath, box) {
    return clipPathToAbsPoints(clipPath, box)
      .map(([x, y]) => x.toFixed(2) + "," + y.toFixed(2))
      .join(" ");
  }

  // Where a label (unit number, SOLD stamp, "SU" badge) should sit and how it should
  // tilt, derived straight from a cell's own true shape instead of a hardcoded angle:
  //  - cx/cy: the polygon's centroid (exact for these lots, since cv2.minAreaRect
  //    always produces a parallelogram, whose vertex average IS its centroid).
  //  - angle: whichever pair of parallel edges reads closest to horizontal -- the
  //    direction text in a left-to-right row of lots should follow. NOT simply the
  //    polygon's longer side: a narrow-frontage, deep lot (e.g. Ruko, ~5m wide x 12m
  //    deep) has its LONGER edge running front-to-back, perpendicular to the row, so
  //    picking "longest" there would orient labels sideways. Flipped 180 deg when it
  //    would otherwise print upside down.
  //  - width/height: the chosen edge's length ("along the row") and its neighbor's
  //    ("into the lot") -- the polygon's own rotated-frame size, smaller than its
  //    axis-aligned bounding box, so labels sized off these stay inside the tilted
  //    shape instead of the larger box.
  function getLabelTransform(points) {
    let sx = 0, sy = 0;
    points.forEach(([x, y]) => { sx += x; sy += y; });
    const cx = sx / points.length, cy = sy / points.length;

    const edges = points.map((p, i) => {
      const q = points[(i + 1) % points.length];
      const dx = q[0] - p[0], dy = q[1] - p[1];
      let angle = Math.atan2(dy, dx) * 180 / Math.PI;
      if (angle > 90) angle -= 180;
      else if (angle < -90) angle += 180;
      return { len: Math.hypot(dx, dy), angle };
    });
    let best = 0;
    edges.forEach((e, i) => { if (Math.abs(e.angle) < Math.abs(edges[best].angle)) best = i; });

    return {
      cx, cy,
      angle: edges[best].angle,
      width: edges[best].len,
      height: edges[(best + 1) % edges.length].len,
    };
  }

  // Shared gradient/shadow defs for the SOLD stamp (added once, referenced by every
  // SOLD tag via url(#...)) -- see createSoldTag() for why this replaced an <image>
  // pointing at assets/sold-tag.svg.
  function ensureSoldDefs() {
    if (overlay.querySelector("#soldFill")) return;
    const defs = svgEl("defs");
    const grad = svgEl("linearGradient", { id: "soldFill", x1: "0%", y1: "0%", x2: "100%", y2: "100%" });
    grad.appendChild(svgEl("stop", { offset: "0%", "stop-color": "#ee3a35" }));
    grad.appendChild(svgEl("stop", { offset: "100%", "stop-color": "#c8171c" }));
    defs.appendChild(grad);
    const filter = svgEl("filter", { id: "soldShadow", x: "-30%", y: "-30%", width: "160%", height: "160%" });
    filter.appendChild(svgEl("feDropShadow", {
      dx: "4", dy: "6", stdDeviation: "6", "flood-color": "#000000", "flood-opacity": "0.35",
    }));
    defs.appendChild(filter);
    overlay.appendChild(defs);
  }

  // The SOLD stamp (tilted red badge, white "SOLD" text) as real inline SVG shapes,
  // mirroring assets/sold-tag.svg's own markup (viewBox 0 0 400 242) instead of
  // loading it via <image href="...">. An <image> referencing an external SVG gets
  // rasterized once by the browser at its initial displayed size, so it looked crisp
  // at rest but went blurry once zoomed in via our CSS transform -- native shapes in
  // the same SVG document stay vector and redraw sharp at any zoom.
  function createSoldTag(cx, cy, tagW, tagH) {
    const scale = Math.min(tagW / 400, tagH / 242);
    const ox = (cx - tagW / 2) + (tagW - 400 * scale) / 2;
    const oy = (cy - tagH / 2) + (tagH - 242 * scale) / 2;
    const g = svgEl("g", {
      class: "mp-unit__tag mp-unit__tag--img",
      transform: `translate(${ox.toFixed(2)} ${oy.toFixed(2)}) scale(${scale.toFixed(4)})`,
    });
    const shadowG = svgEl("g", { filter: "url(#soldShadow)" });
    const tiltG = svgEl("g", { transform: "rotate(-12 200 121)" });
    tiltG.appendChild(svgEl("rect", {
      x: "35", y: "71", width: "330", height: "100", rx: "18",
      fill: "url(#soldFill)", stroke: "#ffffff", "stroke-width": "6",
    }));
    const text = svgEl("text", {
      x: "200", y: "141", "text-anchor": "middle",
      "font-family": "Arial, Helvetica, sans-serif", "font-weight": "800",
      "font-size": "66", fill: "#ffffff", "letter-spacing": "2",
    });
    text.textContent = "SOLD";
    tiltG.appendChild(text);
    shadowG.appendChild(tiltG);
    g.appendChild(shadowG);
    return g;
  }

  const popup = document.getElementById("unit-popup");
  const popupBackdrop = document.getElementById("unit-popup-backdrop");
  const popupClose = document.getElementById("unit-popup-close");
  const upCode = document.getElementById("up-code");
  const upCluster = document.getElementById("up-cluster");
  const upStatus = document.getElementById("up-status");
  const upType = document.getElementById("up-type");
  const upAddr = document.getElementById("up-addr");
  const upRender = document.getElementById("up-render");

  const CLUSTER_LABEL = {
    montana: "Cluster Montana",
    sierra: "Cluster Sierra",
    ruko: "Ruko (Sold Out)",
    tahap1: "Tahap 1 (Sold Out)",
  };

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
    ensureSoldDefs();
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

        // Where labels sit/tilt: a polygon cell (e.g. the tilted Ruko row) gets its
        // rotation computed straight from its own true shape (getLabelTransform), so
        // its number/SOLD/SU labels read parallel to the lot's long side instead of
        // sitting axis-aligned against a slanted cell. A plain rectangular cell has
        // no polygon to derive an angle from, so it falls back to the block's own
        // manually-measured block.tagRotate (e.g. E3, which sits on a visibly tilted
        // diagonal boundary road) -- 0 for every other (already-upright) block, so
        // nothing there changes.
        let labelCx, labelCy, labelAngle, labelW, labelH;
        if (block.clipPath) {
          const t = getLabelTransform(clipPathToAbsPoints(block.clipPath, box));
          labelCx = t.cx; labelCy = t.cy; labelAngle = t.angle;
          labelW = t.width; labelH = t.height;
        } else {
          labelCx = bb.left + bb.width / 2;
          labelCy = bb.top + bb.height / 2;
          labelAngle = block.tagRotate || 0;
          labelW = bb.width; labelH = bb.height;
        }
        const rotateAttr = labelAngle
          ? `rotate(${labelAngle.toFixed(2)} ${labelCx.toFixed(2)} ${labelCy.toFixed(2)})`
          : null;

        // Tahap 1 kavling already print their own lot number on the base image, so
        // our overlay number is redundant -- and per owner feedback, the
        // still-available ones (e.g. B1 01-03) should look as blank as an
        // unreleased cell instead of drawing attention with a duplicate number.
        if (!isUnreleased && block.cluster !== "tahap1") {
          const noText = svgEl("text", {
            class: "mp-unit__no",
            x: labelCx.toFixed(2), y: labelCy.toFixed(2),
          });
          if (rotateAttr) noText.setAttribute("transform", rotateAttr);
          noText.textContent = unit.no;
          g.appendChild(noText);
        }

        if (unit.status === "SOLD" || (unit.status === "HOLD" && !isUnreleased)) {
          if (unit.status === "SOLD") {
            // Native vector stamp (bold, crisp at any zoom) instead of rendered text
            // or an <image> reference -- badge sized at 80%x60% of the cell, not
            // filling it, so the cell's own type color still shows around it (same
            // as the reference master plan's small "terjual" sticker on a colored lot).
            const tagW = labelW * 0.8, tagH = labelH * 0.6;
            const soldTag = createSoldTag(labelCx, labelCy, tagW, tagH);
            if (rotateAttr) {
              // Prepended (not appended) -- it must be the outermost transform, applied
              // in the same absolute cell-center coordinates as labelCx/labelCy, not
              // inside the already-scaled/translated local space createSoldTag() set up.
              soldTag.setAttribute("transform", rotateAttr + " " + soldTag.getAttribute("transform"));
            }
            g.appendChild(soldTag);
          } else {
            // Hold/"Show Unit" units keep the short text label since there's no
            // equivalent stamp asset.
            const tagW = labelW * 0.62, tagH = labelH * 0.26;
            const tagG = svgEl("g", { class: "mp-unit__tag" });
            tagG.appendChild(svgEl("rect", {
              class: "mp-unit__tag-bg",
              x: (labelCx - tagW / 2).toFixed(2), y: (labelCy - tagH / 2).toFixed(2),
              width: tagW.toFixed(2), height: tagH.toFixed(2), rx: (2 * VB).toFixed(2),
            }));
            const tagText = svgEl("text", {
              class: "mp-unit__tag-text",
              x: labelCx.toFixed(2), y: labelCy.toFixed(2),
            });
            tagText.textContent = "SU";
            tagG.appendChild(tagText);
            if (rotateAttr) tagG.setAttribute("transform", rotateAttr);
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
  // Zoom is applied by literally resizing .zoom-target (its width/height in real CSS
  // px, = the viewport's natural size * scale) rather than a CSS `transform: scale()`.
  // A transform-based scale was tried first and looked fine at rest, but on mobile
  // Chromium/WebKit the browser rasterizes a transform-scaled layer into a cached
  // bitmap sized for the scale at the time it was promoted, and doesn't always
  // re-rasterize it at the new (sharper) resolution until something else forces a
  // repaint -- which is exactly why the SOLD stamps stayed blurry after a zoom
  // gesture until the user tapped one. Resizing the actual box instead makes the
  // browser lay out and paint the SVG's vector shapes at their true target
  // resolution every time, no repaint-trigger workaround needed. Only position
  // (translate) still goes through the transform, which is cheap and never blurs.
  // .stage__inner clips the oversized content (overflow:hidden) at its own fixed
  // layout size (unaffected by a child growing past it), acting as the viewport.
  function initPanZoom() {
    const MIN_SCALE = 1;
    const MAX_SCALE = 6;
    let scale = 1, tx = 0, ty = 0;

    function applyTransform() {
      const baseW = stageInner.clientWidth, baseH = stageInner.clientHeight;
      zoomTarget.style.width = (baseW * scale) + "px";
      zoomTarget.style.height = (baseH * scale) + "px";
      zoomTarget.style.transform = `translate(${tx}px, ${ty}px)`;
      // At rest (1x) a one-finger drag should scroll the page like normal, since
      // there's nothing to pan yet -- switch to "none" only once zoomed in, so a
      // drag then moves the map instead of the page scrolling underneath it.
      stageInner.style.touchAction = scale > MIN_SCALE ? "none" : "pan-y";
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
      // Reset before the zoom-controls early-return below -- otherwise a real drag
      // gesture's dragOccurred=true would leak into the very next tap on a zoom
      // button and get silently swallowed by the click-suppression listener further
      // down, since that tap's own pointerdown never reaches the line that clears it.
      dragOccurred = false;
      if (e.target.closest(".zoom-controls")) return;
      pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
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

    // Establish explicit sizing up front (identical to the natural 100%-width layout
    // at scale 1) so the very first zoom doesn't jump between implicit and explicit sizing.
    applyTransform();
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
