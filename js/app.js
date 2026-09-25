(function () {
  "use strict";

  const data = MASTERPLAN_DATA;
  const overlay = document.getElementById("mp-overlay");
  const legendTypesEl = document.getElementById("legend-types");
  const legendPanel = document.getElementById("legend-panel");
  const btnLegend = document.getElementById("btn-legend");

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

  // ---------- Render unit overlays ----------
  function renderBlocks() {
    data.blocks.forEach((block) => {
      const el = document.createElement("div");
      el.className = "mp-block";
      el.dataset.orientation = block.orientation;
      el.style.left = block.box.left + "%";
      el.style.top = block.box.top + "%";
      el.style.width = block.box.width + "%";
      el.style.height = block.box.height + "%";
      if (block.clipPath) {
        const poly = block.clipPath.map((p) => `${p[0]}% ${p[1]}%`).join(", ");
        el.style.clipPath = `polygon(${poly})`;
      }

      block.units
        .slice()
        .sort((a, b) => a.cell - b.cell)
        .forEach((unit) => {
          const cell = document.createElement("div");
          const isUnreleased = unit.status === "HOLD" && unit.statusLabel === "BELUM DIJUAL";
          const statusClass =
            unit.status === "SOLD" ? "mp-unit--sold" :
            isUnreleased ? "mp-unit--unreleased" :
            unit.status === "HOLD" ? "mp-unit--hold" : "mp-unit--tersedia";
          cell.className = "mp-unit " + statusClass;
          cell.title = `${block.id}-${unit.no} · ${unit.type} · ${unit.status}`;

          // Fill with the unit's own type color (matching the legend) instead of a
          // flat status tint, so the site plan reads by type/cluster like the
          // reference master plan -- status is shown via the small SOLD/Show Unit
          // tag on top, not by recoloring the whole cell.
          if (!isUnreleased && unit.color) {
            cell.style.background = hexToRgba(unit.color, 0.62);
          }

          if (!isUnreleased) {
            const noSpan = document.createElement("span");
            noSpan.className = "mp-unit__no";
            noSpan.textContent = unit.no;
            cell.appendChild(noSpan);
          }

          if (unit.status === "SOLD" || (unit.status === "HOLD" && !isUnreleased)) {
            const tag = document.createElement("span");
            // SOLD uses a stamped image asset (bold, crisp at any size) instead of
            // rendered text -- see .mp-unit--sold .mp-unit__tag in style.css. Hold
            // units keep the short text label since there's no equivalent asset.
            tag.className = "mp-unit__tag" + (unit.status === "SOLD" ? " mp-unit__tag--img" : "");
            tag.textContent = unit.status === "SOLD" ? "" : "SU";
            cell.appendChild(tag);
          }

          if (!isUnreleased) {
            cell.addEventListener("click", () => openPopup(block, unit));
            cell.style.cursor = "pointer";
          } else {
            cell.style.cursor = "default";
          }
          el.appendChild(cell);
        });

      overlay.appendChild(el);
    });
  }

  // ---------- Facility markers (mosque, etc.) ----------
  function renderFacilities() {
    (data.facilities || []).forEach((fac) => {
      const el = document.createElement("div");
      el.className = "mp-facility";
      el.title = fac.name;
      el.style.left = fac.box.left + "%";
      el.style.top = fac.box.top + "%";
      el.style.width = fac.box.width + "%";
      el.style.height = fac.box.height + "%";
      if (fac.clipPath) {
        const poly = fac.clipPath.map((p) => `${p[0]}% ${p[1]}%`).join(", ");
        el.style.clipPath = `polygon(${poly})`;
      }
      el.addEventListener("click", () => openFacilityPopup(fac));
      overlay.appendChild(el);
    });
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
})();
