(function () {
  "use strict";

  const data = MASTERPLAN_DATA;
  const overlay = document.getElementById("mp-overlay");
  const summaryPanels = document.getElementById("summary-panels");
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

  const CLUSTER_LABEL = {
    montana: "Cluster Montana",
    sierra: "Cluster Sierra",
    tahap1: "Tahap 1 (Sold Out)",
  };

  function fmtRupiah(n) {
    if (n === null || n === undefined) return null;
    return "Rp" + n.toLocaleString("id-ID");
  }

  function fmtLT(v) {
    return (typeof v === "number" && v % 1 !== 0) ? v.toFixed(1).replace(".", ",") : v;
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

      block.units
        .slice()
        .sort((a, b) => a.cell - b.cell)
        .forEach((unit) => {
          const cell = document.createElement("div");
          const statusClass =
            unit.status === "SOLD" ? "mp-unit--sold" :
            unit.status === "HOLD" ? "mp-unit--hold" : "mp-unit--tersedia";
          cell.className = "mp-unit " + statusClass;
          cell.title = `${block.id}-${unit.no} · ${unit.type} · ${unit.status}`;

          const noSpan = document.createElement("span");
          noSpan.className = "mp-unit__no";
          noSpan.textContent = unit.no;
          cell.appendChild(noSpan);

          if (unit.status === "SOLD" || unit.status === "HOLD") {
            const tag = document.createElement("span");
            tag.className = "mp-unit__tag";
            tag.textContent = unit.status === "SOLD" ? "SOLD" : "RC";
            cell.appendChild(tag);
          }

          cell.addEventListener("click", () => openPopup(block, unit));
          el.appendChild(cell);
        });

      overlay.appendChild(el);
    });
  }

  // ---------- Popup ----------
  function openPopup(block, unit) {
    const code = `SC-${block.id}-${unit.no}`;
    upCode.textContent = code;
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
      note.textContent = "Unit ini sudah terjual (Tahap 1).";
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

  // ---------- Summary panels ----------
  function renderSummary() {
    const byCluster = {};
    data.blocks.forEach((block) => {
      const bucket = (byCluster[block.cluster] = byCluster[block.cluster] || { ready: 0, sold: 0, hold: 0 });
      block.units.forEach((u) => {
        if (u.status === "TERSEDIA") bucket.ready++;
        else if (u.status === "SOLD") bucket.sold++;
        else bucket.hold++;
      });
    });

    summaryPanels.innerHTML = "";
    Object.keys(byCluster).forEach((clusterId) => {
      const s = byCluster[clusterId];
      const total = s.ready + s.sold + s.hold || 1;
      const pct = (n) => ((n / total) * 100).toFixed(2) + "%";

      const card = document.createElement("div");
      card.className = "summary-card";
      card.innerHTML = `
        <div class="summary-card__title">${CLUSTER_LABEL[clusterId] || clusterId}</div>
        <div class="summary-row"><span class="summary-row__label">Unit Ready</span>
          <span class="summary-row__value ready">${s.ready}<span class="summary-row__pct">(${pct(s.ready)})</span></span></div>
        <div class="summary-row"><span class="summary-row__label">Unit Sold</span>
          <span class="summary-row__value sold">${s.sold}<span class="summary-row__pct">(${pct(s.sold)})</span></span></div>
        <div class="summary-row"><span class="summary-row__label">Unit Hold</span>
          <span class="summary-row__value hold">${s.hold}<span class="summary-row__pct">(${pct(s.hold)})</span></span></div>
      `;
      summaryPanels.appendChild(card);
    });
  }

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

  renderBlocks();
  renderSummary();
  renderLegend();
})();
