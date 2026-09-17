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
    "RUKO":            dict(name="RUKO",                 cluster="ruko",    lb=60, lt=12, price=None, color="#8b8ce0"),
    "E7_TBD":          dict(name="ARNICA (E7)",           cluster="sierra",  lb=None, lt=None, price=None, color="#d8b4a0"),
}

def unit_no(n):
    return f"{n:02d}"

def label_sequence(n):
    """First n positive integers, skipping 4 -- no block in this project has a unit
    numbered 4 (numbering goes ...,03,05,...). Confirmed by the owner for the blocks
    that pass skip_four=True to make_block()."""
    seq = []
    k = 1
    while len(seq) < n:
        if k != 4:
            seq.append(k)
        k += 1
    return seq

def make_block(block_id, cluster, box_px, count, direction, type_key,
                available=None, hold=None, hold_label="RUMAH CONTOH",
                hold_labels=None, overrides=None, street="", skip_four=False):
    """
    direction: 'rtl' (01 at right, N at left) | 'ltr' (01 at left)
                'btt' (01 at bottom, N at top) | 'ttb' (01 at top)
    available: set of unit numbers that are TERSEDIA (default: all)
    hold: set of unit numbers that are HOLD/RC
    hold_label: default popup label for any HOLD unit in this block
    hold_labels: {unit_no: label} to override hold_label for specific units
    overrides: {unit_no: type_key} for hook units with special price
    skip_four: use label_sequence() instead of a plain 1..count run
    """
    available = available or set()
    hold = hold or set()
    hold_labels = hold_labels or {}
    overrides = overrides or {}
    orientation = "row" if direction in ("rtl", "ltr") else "col"
    order = label_sequence(count) if skip_four else list(range(1, count + 1))
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
            "statusLabel": hold_labels.get(n, hold_label) if status == "HOLD" else None,
        })

    return {
        "id": block_id,
        "cluster": cluster,
        "box": pct_box(*box_px),
        "orientation": orientation,
        "street": street,
        "units": units,
    }

def make_single_unit_block(block_id, cluster, box_px, type_key, status, no="01", street="", hold_label="RUMAH CONTOH"):
    """One physical lot = one block with a single precisely-placed unit. Used for the
    tilted Ruko row, where units aren't uniform rectangles that can be sliced evenly."""
    t = TYPES[type_key]
    return {
        "id": block_id,
        "cluster": cluster,
        "box": pct_box(*box_px),
        "orientation": "row",
        "street": street,
        "units": [{
            "no": no,
            "cell": 0,
            "type": t["name"],
            "lb": t["lb"],
            "lt": t["lt"],
            "price": t["price"],
            "status": status,
            "statusLabel": hold_label if status == "HOLD" else None,
        }],
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
    # Revisi (1 Sep 2026): tersedia sisa 12,11,09/RC,06,05,03,01 -- lainnya SOLD.
    # No unit "04" in this block either -- 11 real lots, not 12.
    "E3", "sierra", (895, 868, 1365, 1007), 11, "rtl", skip_four=True,
    type_key="BIANCA_GARDEN",
    available={1, 3, 5, 6, 11, 12},
    hold={9},
    overrides={1: "BIANCA_DELUXE_HOOK", 7: "BIANCA_DELUXE", 8: "BIANCA_DELUXE",
               9: "BIANCA_DELUXE", 10: "BIANCA_DELUXE", 11: "BIANCA_DELUXE", 12: "BIANCA_DELUXE"},
    street="JL. SIERRA E3",
))

BLOCKS.append(make_block(
    # Revisi (2 Sep 2026, dikoreksi lagi): E7 dan E8 sebelumnya kegabung jadi satu blok --
    # sekarang dipisah. E7 BUKAN blok yang sudah terjual habis: cuma unit 05 yang RC (rumah
    # contoh); unit 06 ternyata SOLD (bukan tersedia). Sisanya masih putih polos di gambar
    # sumber, artinya belum dijual/diputuskan -- HOLD "Belum Dijual" (tampil putih polos,
    # bukan SOLD/RC). Tipe/harga E7 belum ada di pricelist manapun.
    "E7", "sierra", (811, 1337, 1210, 1432), 9, "rtl", skip_four=True,
    type_key="E7_TBD",
    hold={1, 2, 3, 5, 7, 8, 9, 10},
    hold_label="BELUM DIJUAL",
    hold_labels={5: "RUMAH CONTOH"},
    street="JL. SIERRA E7",
))

BLOCKS.append(make_block(
    # Revisi (1 Sep 2026, dikoreksi lagi): E8 tersedia sisa 10, 09, 06. Unit 01 berwarna
    # putih di gambar sumber (belum dijual/diputuskan) -- HOLD, bukan SOLD.
    "E8", "sierra", (811, 1432, 1210, 1542), 9, "rtl", skip_four=True,
    type_key="ARNICA_GARDEN_E8",
    available={6, 9, 10},
    hold={1},
    hold_label="BELUM DIJUAL",
    overrides={10: "ARNICA_GARDEN_E8_HOOK"},
    street="JL. SIERRA E8",
))

# ---------------- Cluster Montana ----------------
# None of the Montana row blocks below have a unit "04" either (skip_four=True everywhere
# in this section) -- an 8-unit-looking row is really 7 real lots labeled ...,03,05,...,08.
BLOCKS.append(make_block(
    # unit_stock.pdf (1 Sep 2026): F1 Ready = 0 -- semua SOLD.
    "F1", "montana", (1277, 2110, 1372, 2431), 8, "btt", skip_four=True,
    type_key="DARLENE",
    street="JL. MONTANA F1",
))

BLOCKS.append(make_block(
    # unit_stock.pdf (1 Sep 2026): F2 Ready = 0 -- semua SOLD.
    "F2", "montana", (1285, 2560, 1379, 3249), 19, "btt",
    type_key="DARLENE",
    street="JL. MONTANA F2",
))

BLOCKS.append(make_block(
    # Revisi (1 Sep 2026): F3 tersedia sisa 06, 05, 02 -- lainnya SOLD. 7 lots, no unit "04".
    "F3", "montana", (903, 1936, 1192, 2017), 7, "rtl", skip_four=True,
    type_key="NEW_GWEN",
    available={2, 5, 6},
    street="JL. MONTANA F3",
))

BLOCKS.append(make_block(
    # Revisi (1 Sep 2026): F5 tersedia sisa 08, 06, 03, 02 -- lainnya SOLD. 7 lots.
    "F5", "montana", (879, 2079, 1212, 2160), 7, "rtl", skip_four=True,
    type_key="NEW_GWEN",
    available={2, 3, 6, 8},
    overrides={1: "NEW_GWEN_HOOK1", 8: "NEW_GWEN_HOOK8"},
    street="JL. MONTANA F5",
))

BLOCKS.append(make_block(
    "F6", "montana", (879, 2162, 1212, 2264), 7, "rtl", skip_four=True,
    type_key="ANGELINE",
    street="JL. MONTANA F6",
))

BLOCKS.append(make_block(
    # unit_stock.pdf (1 Sep 2026): F7 Ready = 0 -- semua SOLD (termasuk unit hook 01). 9 lots.
    "F7", "montana", (824, 2328, 1211, 2440), 9, "rtl", skip_four=True,
    type_key="ANGELINE",
    street="JL. MONTANA F7",
))

BLOCKS.append(make_block(
    # unit_stock.pdf (1 Sep 2026): F8 Ready = 0 -- semua SOLD. 8 lots.
    "F8", "montana", (825, 2425, 1211, 2534), 8, "rtl", skip_four=True,
    type_key="ANGELINE",
    street="JL. MONTANA F8",
))

BLOCKS.append(make_block(
    # unit_stock.pdf (1 Sep 2026): F9 tersedia 08,07,06,05,03,01/RC -- lainnya (02) SOLD. 7 lots.
    "F9", "montana", (886, 2599, 1219, 2685), 7, "rtl", skip_four=True,
    type_key="GWEN",
    available={3, 5, 6, 7, 8},
    hold={1},
    street="JL. MONTANA F9",
))

BLOCKS.append(make_block(
    # unit_stock.pdf (1 Sep 2026): F10 tersedia 08,07,06,05,03,02,01 -- semua 7 lot tersedia.
    "F10", "montana", (886, 2678, 1219, 2763), 7, "rtl", skip_four=True,
    type_key="GWEN",
    available={1, 2, 3, 5, 6, 7, 8},
    street="JL. MONTANA F10",
))

BLOCKS.append(make_block(
    # unit_stock.pdf (1 Sep 2026): F11 tersedia 01. 7 lots.
    "F11", "montana", (868, 2823, 1220, 2910), 7, "rtl", skip_four=True,
    type_key="GWEN",
    available={1},
    street="JL. MONTANA F11",
))

BLOCKS.append(make_block(
    # Revisi (1 Sep 2026): F12 01 masih tersedia (tambahan dari 02, 05, 07). 7 lots.
    "F12", "montana", (868, 2900, 1220, 2988), 7, "rtl", skip_four=True,
    type_key="GWEN",
    available={1, 2, 5, 7},
    street="JL. MONTANA F12",
))

BLOCKS.append(make_block(
    # Revisi (1 Sep 2026): F15 tersedia 3 unit -- 08, 05, 01. 7 lots.
    "F15", "montana", (889, 3050, 1219, 3135), 7, "rtl", skip_four=True,
    type_key="GWEN",
    available={1, 5, 8},
    overrides={8: "GWEN_HOOK"},
    street="JL. MONTANA F15",
))

BLOCKS.append(make_block(
    # Revisi (1 Sep 2026): F16 ada 1 tersedia, no unit 01. 7 lots.
    "F16", "montana", (889, 3125, 1219, 3213), 7, "rtl", skip_four=True,
    type_key="GWEN",
    available={1},
    street="JL. MONTANA F16",
))

# ---------------- Ruko (Blok A) ----------------
# Revisi (2 Sep 2026): seluruh unit Ruko/A sudah SOLD, dan numbering dikoreksi ulang --
# dari kanan ke kiri (A1, A2, A3, ...), dengan A4, A13, A14 tidak ada. Urutan fisik dari
# kanan (dekat gerbang ROW 19) ke kiri:
#   4 unit di kavling pojok kanan gerbang
#   14 unit di baris diagonal utama (masing-masing kotak sendiri, presisi, karena
#      barisnya diagonal -- lihat RUKO_MAIN_BOXES, dideteksi dari warna per unit)
#   4 unit di kavling pojok kiri gerbang
# = 22 unit total. Catatan: pemilik data sempat menyebut totalnya "A21" -- kemungkinan
# menghitung salah satu kavling pojok sebagai 3 (bukan 4) unit. Di sini kedua pojok dibuat
# simetris 4 unit (sesuai instruksi eksplisit "harusnya 4 unit 4 label"), dan baris utama
# tetap 14 unit (setiap unitnya sudah dikonfirmasi sebagai kotak warna terpisah di gambar
# sumber, jadi tidak ada yang dihapus tanpa bukti) -- kalau total yang benar memang 21,
# tinggal hapus satu unit di sini dan sesuaikan RUKO_LABELS di bawah.
RUKO_LABELS = [n for n in range(1, 26) if n not in (4, 13, 14)]  # 22 labels, tops out at 25
assert len(RUKO_LABELS) == 22

# 14 boxes for the main diagonal row, precisely color-detected per unit, in ascending-x
# (leftmost-first) order.
RUKO_MAIN_BOXES_LTR = [
    (876, 844, 916, 926), (911, 840, 952, 922), (945, 835, 986, 917),
    (979, 830, 1021, 913), (1014, 827, 1056, 909), (1048, 821, 1090, 904),
    (1081, 817, 1125, 899), (1116, 813, 1157, 895), (1150, 808, 1193, 891),
    (1187, 803, 1227, 886), (1221, 799, 1262, 881), (1255, 795, 1295, 877),
    (1288, 790, 1330, 873), (1323, 784, 1365, 868),
]
RUKO_MAIN_BOXES = list(reversed(RUKO_MAIN_BOXES_LTR))  # rightmost first

# Corner extension left of the gate: 2x2 grid of 4 lots ("05"/"03" numbered on the source
# PDF, the row above them left unlabeled on the drawing but same size lots).
CORNER_LEFT_BOX = (1362, 692, 1435, 798)
clx1, cly1, clx2, cly2 = CORNER_LEFT_BOX
clxm, clym = (clx1 + clx2) // 2, (cly1 + cly2) // 2
CORNER_LEFT_BOXES = [
    (clx1, cly1, clxm, clym), (clxm, cly1, clx2, clym),   # top-left, top-right
    (clx1, clym, clxm, cly2), (clxm, clym, clx2, cly2),   # bottom-left "05", bottom-right "03"
]

# Mirrored corner extension right of the gate: also a 2x2 grid of 4 lots ("02"/"01"
# numbered, the row above them unlabeled) -- previously modeled as only 3 lots (one wide
# unlabeled cell instead of two), corrected to match the left corner's 2x2 pattern.
CORNER_RIGHT_BOX = (1565, 702, 1635, 842)
crx1, cry1, crx2, cry2 = CORNER_RIGHT_BOX
crxm, crym = (crx1 + crx2) // 2, (cry1 + cry2) // 2
CORNER_RIGHT_BOXES = [
    (crx1, cry1, crxm, crym), (crxm, cry1, crx2, crym),   # top-left, top-right
    (crx1, crym, crxm, cry2), (crxm, crym, crx2, cry2),   # bottom-left "02", bottom-right "01"
]

# Right-to-left physical order: right corner, then main row, then left corner.
RUKO_ALL_BOXES = list(reversed(CORNER_RIGHT_BOXES)) + RUKO_MAIN_BOXES + CORNER_LEFT_BOXES
assert len(RUKO_ALL_BOXES) == 22

for label, box in zip(RUKO_LABELS, RUKO_ALL_BOXES):
    BLOCKS.append(make_single_unit_block(
        f"A-{label:02d}", "ruko", box, "RUKO", "SOLD", no=unit_no(label), street="JL. RUKO A",
    ))

# ---------------- Tahap 1 (older grey/uncolored kavling columns, sold out) ----------------
# B2/C2/D2 = inner column, B1/C1/D1 = outer (road-side) column. Neither is priced in the
# current pricelist and neither has a legend color on the source PDF -- per user confirmation
# these were an earlier phase ("Tahap 1") that is fully sold out, so every unit here is SOLD.
# Unit counts per column are as given by the user (1 Sep 2026 correction), not re-derived
# from image detection: B2=8, C2=26, D2=16, B1=5, C1=27, D1=16.
BLOCKS.append(make_block(
    "B2", "tahap1", (1368, 870, 1454, 1268), 8, "ttb",
    type_key="TAHAP1", street="JL. TAHAP 1 B2",
))
BLOCKS.append(make_block(
    "C2", "tahap1", (1374, 1340, 1474, 2430), 26, "ttb",
    type_key="TAHAP1", street="JL. TAHAP 1 C2",
))
BLOCKS.append(make_block(
    "D2", "tahap1", (1422, 2534, 1475, 3189), 16, "ttb",
    type_key="TAHAP1", street="JL. TAHAP 1 D2",
))
BLOCKS.append(make_block(
    "B1", "tahap1", (1555, 845, 1632, 1273), 5, "ttb",
    type_key="TAHAP1", street="JL. TAHAP 1 B1",
))
BLOCKS.append(make_block(
    "C1", "tahap1", (1555, 1328, 1632, 2458), 27, "ttb",
    type_key="TAHAP1", street="JL. TAHAP 1 C1",
))
BLOCKS.append(make_block(
    "D1", "tahap1", (1555, 2530, 1632, 3228), 16, "ttb",
    type_key="TAHAP1", street="JL. TAHAP 1 D1",
))

CLUSTERS = {
    "montana": {"name": "Cluster Montana", "legendTitle": "LEGENDA"},
    "sierra": {"name": "Cluster Sierra", "legendTitle": "LEGENDA"},
    "ruko": {"name": "Ruko (Sold Out)", "legendTitle": "LEGENDA"},
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
for cl in ("montana", "sierra", "ruko", "tahap1"):
    ready = sum(1 for b in BLOCKS if b["cluster"] == cl for u in b["units"] if u["status"] == "TERSEDIA")
    sold = sum(1 for b in BLOCKS if b["cluster"] == cl for u in b["units"] if u["status"] == "SOLD")
    hold = sum(1 for b in BLOCKS if b["cluster"] == cl for u in b["units"] if u["status"] == "HOLD")
    print(cl, "ready", ready, "sold", sold, "hold", hold, "total", ready+sold+hold)
print("grand total units", total)
