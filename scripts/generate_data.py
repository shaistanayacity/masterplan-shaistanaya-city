"""
Regenerates js/data.js from the block/type/price definitions below.

Bounding boxes (box_px) were obtained by detecting each block's fill color
in the source master plan image (SC_MASTERPLAN.pdf rendered at 2381x3368)
and taking the tight bounding box of the matching pixels. Re-run this
script after editing any block definition, price, or status set below.

    python3 scripts/generate_data.py
"""
import json
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent
IMG_W, IMG_H = 2381, 3368

def pct_box(x1, y1, x2, y2):
    return {
        "left": round(x1 / IMG_W * 100, 3),
        "top": round(y1 / IMG_H * 100, 3),
        "width": round((x2 - x1) / IMG_W * 100, 3),
        "height": round((y2 - y1) / IMG_H * 100, 3),
    }

def rp(n):
    return "Rp" + f"{n:,}".replace(",", ".")

# ---- Type catalog (from Pricelist_Semua_Tipe_Shaistanaya_City.docx) ----
TYPES = {
    "GWEN":            dict(name="GWEN",            cluster="montana", lb=38, lt=72,  price=660_000_000, color="#f472b6"),
    "GWEN_HOOK":       dict(name="GWEN (Hook)",      cluster="montana", lb=38, lt=106, price=800_000_000, color="#f472b6"),
    "NEW_GWEN":        dict(name="NEW GWEN",         cluster="montana", lb=42, lt=72,  price=675_000_000, color="#fb923c"),
    "NEW_GWEN_HOOK1":  dict(name="NEW GWEN (Hook)",  cluster="montana", lb=42, lt=106, price=840_000_000, color="#fb923c"),
    "NEW_GWEN_HOOK8":  dict(name="NEW GWEN (Hook)",  cluster="montana", lb=45, lt=112, price=880_000_000, color="#fb923c"),
    "DARLENE":         dict(name="DARLENE",          cluster="montana", lb=45, lt=91,  price=795_000_000, color="#f87171"),
    "ANGELINE":        dict(name="ANGELINE",         cluster="montana", lb=45, lt=133, price=None,        color="#86efac"),
    "ANGELINE_HOOK":   dict(name="ANGELINE (Hook)",  cluster="montana", lb=45, lt=133, price=950_000_000, color="#86efac"),
    "BIANCA_GARDEN":   dict(name="BIANCA Garden",    cluster="sierra",  lb=55, lt=72,  price=840_000_000, color="#fde68a"),
    "BIANCA_DELUXE":   dict(name="BIANCA Deluxe",    cluster="sierra",  lb=65, lt=72,  price=880_000_000, color="#fde68a"),
    "BIANCA_DELUXE_HOOK": dict(name="BIANCA Deluxe (Hook)", cluster="sierra", lb=87, lt=95.7, price=1_150_000_000, color="#fde68a"),
    "ARNICA_GARDEN_E1":  dict(name="ARNICA Garden",  cluster="sierra",  lb=70, lt=90,  price=990_000_000,  color="#d8b4a0"),
    "ARNICA_POOL_E1":    dict(name="ARNICA Pool",    cluster="sierra",  lb=91, lt=90,  price=1_160_000_000, color="#d8b4a0"),
    "ARNICA_GARDEN_E8":  dict(name="ARNICA Garden",  cluster="sierra",  lb=70, lt=90,  price=1_010_000_000, color="#d8b4a0"),
    "ARNICA_POOL_E8":    dict(name="ARNICA Pool",    cluster="sierra",  lb=91, lt=90,  price=1_180_000_000, color="#d8b4a0"),
    "ARNICA_GARDEN_E1_HOOK": dict(name="ARNICA Garden (Hook)", cluster="sierra", lb=70, lt=160, price=1_350_000_000, color="#d8b4a0"),
    "ARNICA_POOL_E1_HOOK":   dict(name="ARNICA Pool (Hook)",   cluster="sierra", lb=91, lt=160, price=1_520_000_000, color="#d8b4a0"),
    "ARNICA_GARDEN_E8_HOOK": dict(name="ARNICA Garden (Hook)", cluster="sierra", lb=82, lt=105.3, price=1_155_000_000, color="#d8b4a0"),
    "ARNICA_POOL_E8_HOOK":   dict(name="ARNICA Pool (Hook)",   cluster="sierra", lb=91, lt=105.3, price=1_325_000_000, color="#d8b4a0"),
    "TAHAP1":          dict(name="Kavling Tahap 1",      cluster="tahap1",  lb=None, lt=None, price=None, color="#c2beb8"),
}

def unit_no(n):
    return f"{n:02d}"

def make_block(block_id, cluster, box_px, count, direction, type_key,
                available=None, hold=None, hold_label="RUMAH CONTOH",
                overrides=None, street=""):
    """
    direction: 'rtl' (01 at right, N at left) | 'ltr' (01 at left)
                'btt' (01 at bottom, N at top) | 'ttb' (01 at top)
    available: set of unit numbers that are TERSEDIA (default: all)
    hold: set of unit numbers that are HOLD/RC
    overrides: {unit_no: type_key} for hook units with special price
    """
    available = available or set()
    hold = hold or set()
    overrides = overrides or {}
    orientation = "row" if direction in ("rtl", "ltr") else "col"
    order = list(range(1, count + 1))
    if direction in ("rtl", "btt"):
        order = list(reversed(order))  # cell 0 (visually first/left-or-top) gets the highest number

    units = []
    for cell_index, n in enumerate(order):
        tkey = overrides.get(n, type_key)
        t = TYPES[tkey]
        if n in available:
            status = "TERSEDIA"
        elif n in hold:
            status = "HOLD"
        else:
            status = "SOLD"
        units.append({
            "no": unit_no(n),
            "cell": cell_index,
            "type": t["name"],
            "lb": t["lb"],
            "lt": t["lt"],
            "price": t["price"],
            "status": status,
            "statusLabel": hold_label if status == "HOLD" else None,
        })

    return {
        "id": block_id,
        "cluster": cluster,
        "box": pct_box(*box_px),
        "orientation": orientation,
        "street": street,
        "units": units,
    }

BLOCKS = []

# ---------------- Cluster Sierra ----------------
BLOCKS.append(make_block(
    "E1", "sierra", (1263, 1007, 1365, 1253), 6, "ttb",
    type_key="ARNICA_GARDEN_E1",
    available={1,2,3,4,5,6},
    overrides={6: "ARNICA_GARDEN_E1_HOOK"},
    street="JL. SIERRA E1",
))

BLOCKS.append(make_block(
    "E3", "sierra", (895, 868, 1365, 1007), 12, "rtl",
    type_key="BIANCA_GARDEN",
    available={1,2,3,4,5,6,7,10,11,12},
    hold={8, 9},
    overrides={1: "BIANCA_DELUXE_HOOK", 7: "BIANCA_DELUXE", 8: "BIANCA_DELUXE",
               9: "BIANCA_DELUXE", 10: "BIANCA_DELUXE", 11: "BIANCA_DELUXE", 12: "BIANCA_DELUXE"},
    street="JL. SIERRA E3",
))

BLOCKS.append(make_block(
    "E8", "sierra", (812, 1337, 1070, 1542), 10, "rtl",
    type_key="ARNICA_GARDEN_E8",
    available={3,4,5,6,7,8,9,10},
    hold={1, 2},
    overrides={10: "ARNICA_GARDEN_E8_HOOK"},
    street="JL. SIERRA E8",
))

# ---------------- Cluster Montana ----------------
BLOCKS.append(make_block(
    "F1", "montana", (1277, 2110, 1372, 2431), 9, "btt",
    type_key="DARLENE",
    available={5},
    street="JL. MONTANA F1",
))

BLOCKS.append(make_block(
    "F2", "montana", (1285, 2560, 1379, 3249), 19, "btt",
    type_key="DARLENE",
    hold={13},
    street="JL. MONTANA F2",
))

BLOCKS.append(make_block(
    "F3", "montana", (903, 1936, 1192, 2017), 8, "rtl",
    type_key="NEW_GWEN",
    available={1,2,3,4,5,6,7,8},
    street="JL. MONTANA F3",
))

BLOCKS.append(make_block(
    "F5", "montana", (879, 2079, 1212, 2160), 8, "rtl",
    type_key="NEW_GWEN",
    available={1,2,3,4,5,6,7,8},
    overrides={1: "NEW_GWEN_HOOK1", 8: "NEW_GWEN_HOOK8"},
    street="JL. MONTANA F5",
))

BLOCKS.append(make_block(
    "F6", "montana", (879, 2162, 1212, 2264), 8, "rtl",
    type_key="ANGELINE",
    street="JL. MONTANA F6",
))

BLOCKS.append(make_block(
    "F7", "montana", (824, 2328, 1211, 2440), 10, "rtl",
    type_key="ANGELINE",
    available={1},
    overrides={1: "ANGELINE_HOOK"},
    street="JL. MONTANA F7",
))

BLOCKS.append(make_block(
    "F8", "montana", (825, 2425, 1211, 2534), 9, "rtl",
    type_key="ANGELINE",
    hold={1},
    street="JL. MONTANA F8",
))

BLOCKS.append(make_block(
    "F9", "montana", (886, 2599, 1219, 2685), 8, "rtl",
    type_key="GWEN",
    hold={1},
    street="JL. MONTANA F9",
))

BLOCKS.append(make_block(
    "F10", "montana", (886, 2678, 1219, 2763), 8, "rtl",
    type_key="GWEN",
    street="JL. MONTANA F10",
))

BLOCKS.append(make_block(
    "F11", "montana", (868, 2823, 1220, 2910), 8, "rtl",
    type_key="GWEN",
    street="JL. MONTANA F11",
))

BLOCKS.append(make_block(
    "F12", "montana", (868, 2900, 1220, 2988), 8, "rtl",
    type_key="GWEN",
    available={2,5,7},
    street="JL. MONTANA F12",
))

BLOCKS.append(make_block(
    "F15", "montana", (889, 3050, 1219, 3135), 8, "rtl",
    type_key="GWEN",
    available={5,8},
    overrides={8: "GWEN_HOOK"},
    street="JL. MONTANA F15",
))

BLOCKS.append(make_block(
    "F16", "montana", (889, 3125, 1219, 3213), 8, "rtl",
    type_key="GWEN",
    street="JL. MONTANA F16",
))

# ---------------- Tahap 1 (older grey/uncolored kavling columns, sold out) ----------------
# B2/C2/D2 = inner column, B1/C1/D1 = outer (road-side) column. Neither is priced in the
# current pricelist and neither has a legend color on the source PDF -- per user confirmation
# these were an earlier phase ("Tahap 1") that is fully sold out, so every unit here is SOLD.
BLOCKS.append(make_block(
    "B2", "tahap1", (1322, 736, 1463, 1268), 9, "ttb",
    type_key="TAHAP1", street="JL. TAHAP 1 B2",
))
BLOCKS.append(make_block(
    "C2", "tahap1", (1320, 1340, 1479, 2430), 18, "ttb",
    type_key="TAHAP1", street="JL. TAHAP 1 C2",
))
BLOCKS.append(make_block(
    "D2", "tahap1", (1383, 2534, 1480, 3189), 11, "ttb",
    type_key="TAHAP1", street="JL. TAHAP 1 D2",
))
BLOCKS.append(make_block(
    "B1", "tahap1", (1550, 737, 1636, 1271), 9, "ttb",
    type_key="TAHAP1", street="JL. TAHAP 1 B1",
))
BLOCKS.append(make_block(
    "C1", "tahap1", (1554, 1328, 1636, 2458), 19, "ttb",
    type_key="TAHAP1", street="JL. TAHAP 1 C1",
))
BLOCKS.append(make_block(
    "D1", "tahap1", (1550, 2530, 1636, 3228), 12, "ttb",
    type_key="TAHAP1", street="JL. TAHAP 1 D1",
))

CLUSTERS = {
    "montana": {"name": "Cluster Montana", "legendTitle": "LEGENDA"},
    "sierra": {"name": "Cluster Sierra", "legendTitle": "LEGENDA"},
    "tahap1": {"name": "Tahap 1 (Sold Out)", "legendTitle": "LEGENDA"},
}

LEGEND = [
    {"key": "ruko", "label": "RUKO", "color": "#8b8ce0"},
    {"key": "angeline", "label": "ANGELINE", "color": "#86efac"},
    {"key": "darlene", "label": "DARLENE", "color": "#f87171"},
    {"key": "gwen", "label": "GWEN", "color": "#f472b6"},
    {"key": "new_gwen", "label": "NEW GWEN", "color": "#fb923c"},
    {"key": "arnica", "label": "ARNICA", "color": "#d8b4a0"},
    {"key": "bianca", "label": "BIANCA", "color": "#fde68a"},
    {"key": "tahap1", "label": "TAHAP 1 (SOLD OUT)", "color": "#c2beb8"},
]

data = {
    "project": "Shaistanaya City",
    "periode": "September 2026",
    "image": "assets/masterplan.jpg",
    "imageSize": {"width": IMG_W, "height": IMG_H},
    "clusters": CLUSTERS,
    "legend": LEGEND,
    "blocks": BLOCKS,
}

with open(REPO_ROOT / "js" / "data.js", "w") as f:
    f.write("// Auto-generated unit/price/status dataset for the Shaistanaya City interactive masterplan.\n")
    f.write("// Source: SC_MASTERPLAN.pdf (block layout) + Pricelist_Semua_Tipe_Shaistanaya_City.docx (types & prices, Sept 2026).\n")
    f.write("// See README.md for the assumptions used to infer per-unit SOLD/TERSEDIA/HOLD status.\n")
    f.write("const MASTERPLAN_DATA = ")
    f.write(json.dumps(data, ensure_ascii=False, indent=2))
    f.write(";\n")

# quick sanity summary
total = sum(len(b["units"]) for b in BLOCKS)
for cl in ("montana", "sierra", "tahap1"):
    ready = sum(1 for b in BLOCKS if b["cluster"] == cl for u in b["units"] if u["status"] == "TERSEDIA")
    sold = sum(1 for b in BLOCKS if b["cluster"] == cl for u in b["units"] if u["status"] == "SOLD")
    hold = sum(1 for b in BLOCKS if b["cluster"] == cl for u in b["units"] if u["status"] == "HOLD")
    print(cl, "ready", ready, "sold", sold, "hold", hold, "total", ready+sold+hold)
print("grand total units", total)
