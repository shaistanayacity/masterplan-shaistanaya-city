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
# LT (luas tanah) per tipe di bawah sudah dicocokkan ke angka yang tertulis
# langsung di setiap persil pada gambar master plan (tools_masterplan.pdf) --
# bukan cuma satu angka "khas hook" yang digeneralisir ke semua unit hook di
# suatu blok. Unit pojok/hook yang ukurannya beda-beda per blok (mis. ujung
# kiri F6/F7/F8, atau ujung kiri F9/F10) masing-masing dapat entri TYPES
# sendiri (lihat komentar di tiap entri) supaya LT yang tampil di popup sama
# persis dengan yang tertulis di gambar. Untuk varian yang harganya belum
# ada di pricelist manapun (semua hook ANGELINE selain yang sudah official,
# dan GWEN_HOOK8), harga dipakai dari tipe "hook" resmi terdekat dalam
# keluarga yang sama (harga per m2 hook biasanya satu tarif per blok,
# terlepas dari sedikit selisih LT antar persil pojok) -- bukan angka
# karangan baru.
TYPES = {
    "GWEN":            dict(name="GWEN",            cluster="montana", lb=38, lt=72,  price=660_000_000, color="#f472b6", render="assets/renders/gwen.jpg"),
    "GWEN_HOOK":       dict(name="GWEN (Hook)",      cluster="montana", lb=38, lt=106.1, price=800_000_000, color="#f472b6", render="assets/renders/gwen-hook.jpg"),
    # Ujung kiri F9/F10 -- satu-satunya sisi GWEN yang ukurannya 112,1, bukan 106,1.
    "GWEN_HOOK8":      dict(name="GWEN (Hook)",      cluster="montana", lb=38, lt=112.1, price=840_000_000, color="#f472b6", render="assets/renders/gwen-hook.jpg"),
    # Render reguler NEW GWEN sama persis dengan foto yang dipakai DARLENE (dikirim
    # dua kali oleh pemilik data) -- dipakai ulang, bukan disimpan dobel.
    "NEW_GWEN":        dict(name="NEW GWEN",         cluster="montana", lb=42, lt=72,  price=675_000_000, color="#fb923c", render="assets/renders/darlene.jpg"),
    "NEW_GWEN_HOOK1":  dict(name="NEW GWEN (Hook)",  cluster="montana", lb=42, lt=106.1, price=840_000_000, color="#fb923c", render="assets/renders/new-gwen-hook.jpg"),
    "NEW_GWEN_HOOK8":  dict(name="NEW GWEN (Hook)",  cluster="montana", lb=45, lt=112.1, price=880_000_000, color="#fb923c", render="assets/renders/new-gwen-hook.jpg"),
    "DARLENE":         dict(name="DARLENE",          cluster="montana", lb=45, lt=91,  price=795_000_000, color="#f87171", render="assets/renders/darlene.jpg"),
    # ANGELINE reguler (unit tengah) LT-nya 90, BUKAN 133 -- 133,1 itu ukuran unit
    # hook di ujung kanan (F6/F7/F8 unit 01), sebelumnya salah dipakai untuk semua unit.
    # "render" = foto render tampak depan (sama untuk semua varian dengan bentuk
    # rumah yang sama -- hook cuma beda ukuran tanah/posisi pojok, bukan beda desain).
    "ANGELINE":        dict(name="ANGELINE",         cluster="montana", lb=45, lt=90,  price=None,        color="#86efac", render="assets/renders/angeline.jpg"),
    "ANGELINE_HOOK":   dict(name="ANGELINE (Hook)",  cluster="montana", lb=45, lt=133.1, price=950_000_000, color="#86efac", render="assets/renders/angeline-hook.jpg"),
    # Ujung kiri F6/F7/F8 masing-masing punya LT unik (bukan hook yang sama seperti unit 01).
    "ANGELINE_HOOK_F6": dict(name="ANGELINE (Hook)", cluster="montana", lb=45, lt=124.1, price=950_000_000, color="#86efac", render="assets/renders/angeline-hook.jpg"),
    "ANGELINE_HOOK_F7": dict(name="ANGELINE (Hook)", cluster="montana", lb=45, lt=79.9,  price=950_000_000, color="#86efac", render="assets/renders/angeline-hook.jpg"),
    "ANGELINE_HOOK_F8": dict(name="ANGELINE (Hook)", cluster="montana", lb=45, lt=77,    price=950_000_000, color="#86efac", render="assets/renders/angeline-hook.jpg"),
    # Render BIANCA sama untuk Garden dan Deluxe -- bedanya cuma hook atau bukan
    # (sama seperti ARNICA), bukan Garden vs Deluxe.
    "BIANCA_GARDEN":   dict(name="BIANCA Garden",    cluster="sierra",  lb=55, lt=72,  price=840_000_000, color="#fde68a", render="assets/renders/bianca.jpg"),
    "BIANCA_DELUXE":   dict(name="BIANCA Deluxe",    cluster="sierra",  lb=65, lt=72,  price=880_000_000, color="#fde68a", render="assets/renders/bianca.jpg"),
    "BIANCA_DELUXE_HOOK": dict(name="BIANCA Deluxe (Hook)", cluster="sierra", lb=87, lt=95.7, price=1_150_000_000, color="#fde68a", render="assets/renders/bianca-hook.jpg"),
    # Render ARNICA sama untuk Garden dan Pool -- bedanya cuma hook atau bukan
    # (per instruksi pemilik data), bukan Garden vs Pool.
    "ARNICA_GARDEN_E1":  dict(name="ARNICA Garden",  cluster="sierra",  lb=70, lt=90,  price=990_000_000,  color="#d8b4a0", render="assets/renders/arnica.jpg"),
    "ARNICA_POOL_E1":    dict(name="ARNICA Pool",    cluster="sierra",  lb=91, lt=90,  price=1_160_000_000, color="#d8b4a0", render="assets/renders/arnica.jpg"),
    "ARNICA_GARDEN_E8":  dict(name="ARNICA Garden",  cluster="sierra",  lb=70, lt=90,  price=1_010_000_000, color="#d8b4a0", render="assets/renders/arnica.jpg"),
    "ARNICA_POOL_E8":    dict(name="ARNICA Pool",    cluster="sierra",  lb=91, lt=90,  price=1_180_000_000, color="#d8b4a0", render="assets/renders/arnica.jpg"),
    "ARNICA_GARDEN_E1_HOOK": dict(name="ARNICA Garden (Hook)", cluster="sierra", lb=70, lt=160, price=1_350_000_000, color="#d8b4a0", render="assets/renders/arnica-hook.jpg"),
    "ARNICA_POOL_E1_HOOK":   dict(name="ARNICA Pool (Hook)",   cluster="sierra", lb=91, lt=160, price=1_520_000_000, color="#d8b4a0", render="assets/renders/arnica-hook.jpg"),
    "ARNICA_GARDEN_E8_HOOK": dict(name="ARNICA Garden (Hook)", cluster="sierra", lb=82, lt=105.3, price=1_155_000_000, color="#d8b4a0", render="assets/renders/arnica-hook.jpg"),
    "ARNICA_POOL_E8_HOOK":   dict(name="ARNICA Pool (Hook)",   cluster="sierra", lb=91, lt=105.3, price=1_325_000_000, color="#d8b4a0", render="assets/renders/arnica-hook.jpg"),
    # Ujung kanan E8 (unit 01, HOLD/belum dijual -- tidak muncul di popup manapun,
    # tapi datanya tetap dibenarkan supaya konsisten dengan gambar sumber).
    "ARNICA_E8_HOOK_R": dict(name="ARNICA (E8)",     cluster="sierra",  lb=None, lt=133.1, price=None, color="#d8b4a0", render="assets/renders/arnica-hook.jpg"),
    "TAHAP1":          dict(name="Kavling Tahap 1",      cluster="tahap1",  lb=None, lt=None, price=None, color="#c2beb8"),
    # LT Ruko = lebar x panjang persil (mis. 5 x 12 = 60), bukan 12 -- itu cuma
    # salah satu sisi kotaknya. Belum ada data resmi luas bangunan (LB) ruko
    # bertingkat ini, jadi lb dikosongkan (None) daripada menampilkan angka
    # yang salah.
    "RUKO":            dict(name="RUKO",                 cluster="ruko",    lb=None, lt=60, price=None, color="#8b8ce0", render="assets/renders/ruko.jpg"),
    # Dua unit yang datanya ada di gambar (05 RC/Show Unit, 06 SOLD) sama-sama
    # persil ukuran standar 90; sisanya tetap tidak berharga/tidak bertipe pasti.
    "E7_TBD":          dict(name="ARNICA (E7)",           cluster="sierra",  lb=None, lt=90, price=None, color="#d8b4a0", render="assets/renders/arnica-e7.jpg"),
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
                available=None, hold=None, hold_label="SHOW UNIT",
                hold_labels=None, overrides=None, street="", skip_four=False):
    """
    direction: 'rtl' (01 at right, N at left) | 'ltr' (01 at left)
                'btt' (01 at bottom, N at top) | 'ttb' (01 at top)
    available: set of unit numbers that are TERSEDIA (default: all)
    hold: set of unit numbers that are HOLD/show unit
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
            "render": t.get("render"),
            "color": t["color"],
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

def make_single_unit_block(block_id, cluster, box_px, type_key, status, no="01", street="",
                             hold_label="SHOW UNIT", polygon_px=None):
    """One physical lot = one block with a single precisely-placed unit. Used for the
    tilted Ruko row, where units aren't uniform rectangles that can be sliced evenly.

    polygon_px: optional list of (x, y) corners (full-image pixel space) for a rotated
    lot -- e.g. from cv2.minAreaRect. When given, box_px is only used loosely (pass the
    polygon's own bounding box); the polygon is re-expressed as % of that box and applied
    as a CSS clip-path, so the colored overlay follows the lot's true tilted shape instead
    of its axis-aligned bounding rectangle.
    """
    t = TYPES[type_key]
    clip_path = None
    if polygon_px:
        bx1, by1, bx2, by2 = box_px
        bw, bh = (bx2 - bx1), (by2 - by1)
        clip_path = [
            (round((x - bx1) / bw * 100, 2), round((y - by1) / bh * 100, 2))
            for x, y in polygon_px
        ]
    return {
        "id": block_id,
        "cluster": cluster,
        "box": pct_box(*box_px),
        "orientation": "row",
        "street": street,
        "clipPath": clip_path,
        "units": [{
            "no": no,
            "cell": 0,
            "type": t["name"],
            "lb": t["lb"],
            "lt": t["lt"],
            "price": t["price"],
            "render": t.get("render"),
            "color": t["color"],
            "status": status,
            "statusLabel": hold_label if status == "HOLD" else None,
        }],
    }

def make_facility(facility_id, name, box_px, polygon_px=None, render=None):
    """A clickable community-facility marker (mosque, clubhouse, etc.) -- has no
    price/LB/LT/status, just a name + optional photo popup. polygon_px works exactly
    like make_single_unit_block's: full-image pixel corners, re-expressed as a
    CSS clip-path so the clickable shape follows the building's real footprint
    instead of its plain bounding box."""
    clip_path = None
    if polygon_px:
        bx1, by1, bx2, by2 = box_px
        bw, bh = (bx2 - bx1), (by2 - by1)
        clip_path = [
            (round((x - bx1) / bw * 100, 2), round((y - by1) / bh * 100, 2))
            for x, y in polygon_px
        ]
    return {
        "id": facility_id,
        "name": name,
        "render": render,
        "box": pct_box(*box_px),
        "clipPath": clip_path,
    }

FACILITIES = []
BLOCKS = []

# ---------------- Cluster Sierra ----------------
# E1 cuma 5 lot riil (01,02,03,05,06 -- tidak ada 04, sama seperti blok lain),
# bukan 6 nomor berurutan. Arahnya juga kebalik dari yang dikira sebelumnya: 06
# (unit hook, LT 160) ada di ATAS blok, 01 di paling BAWAH -- kode sebelumnya
# menaruh 01 di atas (direction "ttb"), jadi klik unit pojok atas malah
# nampilin data unit 01 (LT 90) padahal seharusnya unit 06 (LT 160). Unit 06
# juga secara fisik ~1,8x lebih tinggi dari unit lainnya (match LT 160 vs 90),
# jadi dipotong manual per-unit (bukan 5 potongan sama rata via make_block)
# supaya kotaknya pas mengikuti garis petak asli di gambar, bukan cuma
# proporsi tebakan.
E1_X1, E1_X2 = 1263, 1365
E1_ROWS = [
    ("06", 1007, 1082, "ARNICA_GARDEN_E1_HOOK"),
    ("05", 1082, 1125, "ARNICA_GARDEN_E1"),
    ("03", 1125, 1168, "ARNICA_GARDEN_E1"),
    ("02", 1168, 1211, "ARNICA_GARDEN_E1"),
    ("01", 1211, 1253, "ARNICA_GARDEN_E1"),
]
for no, ry1, ry2, tkey in E1_ROWS:
    BLOCKS.append(make_single_unit_block(
        "E1", "sierra", (E1_X1, ry1, E1_X2, ry2), tkey, "TERSEDIA", no=no,
        street="JL. SIERRA E1",
    ))

BLOCKS.append(make_block(
    # Revisi (1 Sep 2026): tersedia sisa 12,11,09/RC,06,05,03,01 -- lainnya SOLD.
    # No unit "04" in this block either -- 11 real lots, not 12.
    # Revisi (25 Sep 2026): top-y sebelumnya (868) kepotong masuk ke baris blok "A" di
    # atasnya (baris biru, bukan bagian E3) -- sampling piksel gambar sumber menunjukkan
    # baris kuning E3 baru mulai di y=914, jadi warna kuning & tag SOLD-nya numpuk ke
    # baris atas yang bukan miliknya. Diperbaiki jadi 914-1001 (pas di baris kuningnya).
    "E3", "sierra", (895, 914, 1365, 1001), 11, "rtl", skip_four=True,
    type_key="BIANCA_GARDEN",
    available={1, 3, 5, 6, 11, 12},
    hold={9},
    overrides={1: "BIANCA_DELUXE_HOOK", 7: "BIANCA_DELUXE", 8: "BIANCA_DELUXE",
               9: "BIANCA_DELUXE", 10: "BIANCA_DELUXE", 11: "BIANCA_DELUXE", 12: "BIANCA_DELUXE"},
    street="JL. SIERRA E3",
))

# Masjid An-Nur -- community facility building between E11/F3 and the C2 road grid.
# Polygon corners traced from the source image via color-threshold contour detection
# (isolating the building's white fill from the surrounding grey pavement) so the
# clickable area follows the actual roofline instead of a box that would spill onto
# the road/sidewalk -- or onto neighboring F3 -- around it.
FACILITIES.append(make_facility(
    "MASJID", "Masjid An-Nur Shaistanaya City",
    box_px=(1181, 1863, 1371, 2000),
    polygon_px=[
        (1210, 1863), (1195, 1933), (1198, 1963), (1231, 1956),
        (1250, 1972), (1250, 1993), (1308, 2000), (1314, 1960),
        (1371, 1959), (1362, 1933), (1319, 1927), (1323, 1886),
        (1265, 1875), (1260, 1898), (1223, 1893), (1192, 1907),
        (1182, 1896), (1183, 1865),
    ],
    render="assets/renders/masjid-an-nur.jpg",
))

# Basketball court -- the narrow "LAPANGAN" green strip between F11/F12 and the west
# perimeter hedge. Already a plain axis-aligned rectangle on the source image, so no
# clip-path polygon is needed here (unlike the mosque's irregular footprint).
FACILITIES.append(make_facility(
    "LAPANGAN", "Basketball Court",
    box_px=(827, 2822, 867, 2989),
    render="assets/renders/basketball-court.jpg",
))

# Outdoor gym & BBQ pit -- the full green plaza square (red fan-shaped rubber floor +
# tan gate icon + corner planters) next to the B1 tahap1 column near ROW 14. Revised
# (25 Sep 2026) per owner feedback to cover the whole square, not just the red icon.
FACILITIES.append(make_facility(
    "GYM", "Outdoor Gym & Barbeque Pit",
    box_px=(1543, 1246, 1638, 1331),
    render="assets/renders/outdoor-gym.jpg",
))

# Kids playground -- yellow bench-row icon + tan paved plaza next to the C1 tahap1
# column, further down ROW 14. Whole square (tan pavement + yellow icon + green
# border), matching how the GYM facility's hotspot was widened above.
FACILITIES.append(make_facility(
    "PLAYGROUND", "Kids Playground",
    box_px=(1545, 2456, 1638, 2530),
    render="assets/renders/kids-playground.jpg",
))

# Cluster Sierra gate -- the red/tan hatched "ROW 14" crossing-pattern icon between
# E1/E2 and the B2 tahap1 column, previously mistaken for a plain pedestrian-crossing
# marker. It's actually the cluster entrance gate symbol.
FACILITIES.append(make_facility(
    "GERBANG_SIERRA", "Gate Cluster Sierra",
    box_px=(1277, 1274, 1445, 1328),
    render="assets/renders/gerbang-sierra.jpg",
))

# Cluster Montana gate -- the tan+red-striped "ROW 14" icon near F1/F2, between the
# C2/D2 tahap1 columns further down. Same shape family as the Sierra gate.
FACILITIES.append(make_facility(
    "GERBANG_MONTANA", "Gate Cluster Montana",
    box_px=(1296, 2433, 1463, 2529),
    render="assets/renders/gerbang-montana.jpg",
))

BLOCKS.append(make_block(
    # Revisi (2 Sep 2026, dikoreksi lagi): E7 dan E8 sebelumnya kegabung jadi satu blok --
    # sekarang dipisah. E7 BUKAN blok yang sudah terjual habis: cuma unit 05 yang Show Unit;
    # unit 06 ternyata SOLD (bukan tersedia). Sisanya masih putih polos di gambar
    # sumber, artinya belum dijual/diputuskan -- HOLD "Belum Dijual" (tampil putih polos,
    # bukan SOLD/Show Unit). Tipe/harga E7 belum ada di pricelist manapun.
    "E7", "sierra", (811, 1337, 1210, 1432), 9, "rtl", skip_four=True,
    type_key="E7_TBD",
    hold={1, 2, 3, 5, 7, 8, 9, 10},
    hold_label="BELUM DIJUAL",
    hold_labels={5: "SHOW UNIT"},
    street="JL. SIERRA E7",
))

BLOCKS.append(make_block(
    # Revisi (1 Sep 2026, dikoreksi lagi): E8 tersedia sisa 10, 09, 06. Unit 01 berwarna
    # putih di gambar sumber (belum dijual/diputuskan) -- HOLD, bukan SOLD. Unit 01 juga
    # persil hook (LT 133,1) di ujung kanan, sama seperti pola E7/ANGELINE.
    "E8", "sierra", (811, 1432, 1210, 1542), 9, "rtl", skip_four=True,
    type_key="ARNICA_GARDEN_E8",
    available={6, 9, 10},
    hold={1},
    hold_label="BELUM DIJUAL",
    overrides={1: "ARNICA_E8_HOOK_R", 10: "ARNICA_GARDEN_E8_HOOK"},
    street="JL. SIERRA E8",
))

# ---------------- Cluster Montana ----------------
# None of the Montana row blocks below have a unit "04" either (skip_four=True everywhere
# in this section) -- an 8-unit-looking row is really 7 real lots labeled ...,03,05,...,08.
BLOCKS.append(make_block(
    # unit_stock.pdf (1 Sep 2026): F1 Ready = 0 -- semua SOLD.
    # Top-y fixed 25 Sep 2026: was 2110, which sampling the source image's fill color
    # shows starts ~25px (orig scale) too low -- the true top is y=2073, which makes
    # the 8 equal-height cells line up exactly with the real row lines (30px/unit at
    # orig scale) instead of drifting further off with each row down the column, which
    # is what made the SOLD tags look misaligned from the actual unit boundaries.
    "F1", "montana", (1277, 2073, 1372, 2431), 8, "btt", skip_four=True,
    type_key="DARLENE",
    street="JL. MONTANA F1",
))

BLOCKS.append(make_block(
    # unit_stock.pdf (1 Sep 2026): F2 Ready = 0 -- semua SOLD.
    # Revisi (25 Sep 2026): kode sebelumnya salah di tiga hal sekaligus, dikonfirmasi
    # ulang oleh pemilik (SC-F2-01 di paling ATAS, SC-F2-19 di paling BAWAH) dan oleh
    # sampling piksel gambar sumber:
    #  1) direction seharusnya "ttb" (01 di atas), bukan "btt" -- kode lama menaruh
    #     nomor terbesar (19) di atas, kebalik dari gambar aslinya.
    #  2) skip_four seharusnya True (tidak ada unit "04") -- kode lama memberi label
    #     rata 1-19 tanpa skip, sehingga tiap unit dari baris ke-4 dst kegeser satu
    #     nomor dari yang tertulis di gambar.
    #  3) top-y seharusnya 2530, bukan 2560 -- baris paling atas (tercetak "01"/RC di
    #     gambar sumber) sebelumnya sama sekali tidak ke-cover blok manapun (bukan cuma
    #     kegeser dikit kayak F1), makanya sempat ditambah manual sebagai "F2-20" di
    #     commit sebelumnya. Sekarang digabung jadi satu definisi blok yang benar (18
    #     unit fisik: 01,02,03,05,06,...,19) supaya tidak ada lagi baris yatim/nomor
    #     yang kegeser.
    "F2", "montana", (1285, 2530, 1379, 3249), 18, "ttb", skip_four=True,
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
    # Ujung kiri (unit 08) LT 124,1, ujung kanan (unit 01) LT 133,1 -- keduanya hook,
    # beda ukuran, sebelumnya dua-duanya salah dianggap unit reguler biasa.
    "F6", "montana", (879, 2162, 1212, 2264), 7, "rtl", skip_four=True,
    type_key="ANGELINE",
    overrides={1: "ANGELINE_HOOK", 8: "ANGELINE_HOOK_F6"},
    street="JL. MONTANA F6",
))

BLOCKS.append(make_block(
    # unit_stock.pdf (1 Sep 2026): F7 Ready = 0 -- semua SOLD (termasuk unit hook 01). 9 lots.
    # Ujung kiri (unit 10) LT 79,9, ujung kanan (unit 01) LT 133,1.
    "F7", "montana", (824, 2328, 1211, 2440), 9, "rtl", skip_four=True,
    type_key="ANGELINE",
    overrides={1: "ANGELINE_HOOK", 10: "ANGELINE_HOOK_F7"},
    street="JL. MONTANA F7",
))

BLOCKS.append(make_block(
    # Revisi (21 Sep 2026): F8 sebenarnya 9 lot (10,09,08,07,06,05,03,02,01), bukan 8 --
    # sebelumnya kelewat unit "10" di ujung kiri. Ujung kiri (unit 10) LT 77, ujung
    # kanan (unit 01) LT 133,1 -- keduanya hook.
    "F8", "montana", (825, 2425, 1211, 2534), 9, "rtl", skip_four=True,
    type_key="ANGELINE",
    overrides={1: "ANGELINE_HOOK", 10: "ANGELINE_HOOK_F8"},
    street="JL. MONTANA F8",
))

BLOCKS.append(make_block(
    # unit_stock.pdf (1 Sep 2026): F9 tersedia 08,07,06,05,03,01/RC -- lainnya (02) SOLD. 7 lots.
    # Ujung kiri (unit 08) LT 112,1, ujung kanan (unit 01) LT 106,1 -- dua ukuran hook beda.
    "F9", "montana", (886, 2599, 1219, 2685), 7, "rtl", skip_four=True,
    type_key="GWEN",
    available={3, 5, 6, 7, 8},
    hold={1},
    overrides={1: "GWEN_HOOK", 8: "GWEN_HOOK8"},
    street="JL. MONTANA F9",
))

BLOCKS.append(make_block(
    # unit_stock.pdf (1 Sep 2026): F10 tersedia 08,07,06,05,03,02,01 -- semua 7 lot tersedia.
    # Sama seperti F9: ujung kiri (08) LT 112,1, ujung kanan (01) LT 106,1.
    "F10", "montana", (886, 2678, 1219, 2763), 7, "rtl", skip_four=True,
    type_key="GWEN",
    available={1, 2, 3, 5, 6, 7, 8},
    overrides={1: "GWEN_HOOK", 8: "GWEN_HOOK8"},
    street="JL. MONTANA F10",
))

BLOCKS.append(make_block(
    # unit_stock.pdf (1 Sep 2026): F11 tersedia 01. 8 lots -- ada unit 09 di ujung kiri
    # (sebelah LAPANGAN) yang sebelumnya kepotong dari kotak blok. Unit 09 LT tetap 72
    # (bukan hook), hanya ujung kanan (01) yang hook, LT 106,1.
    "F11", "montana", (868, 2823, 1220, 2910), 8, "rtl", skip_four=True,
    type_key="GWEN",
    available={1},
    overrides={1: "GWEN_HOOK"},
    street="JL. MONTANA F11",
))

BLOCKS.append(make_block(
    # Revisi (1 Sep 2026): F12 01 masih tersedia (tambahan dari 02, 05, 07). 8 lots -- unit
    # 09 di ujung kiri (sebelah LAPANGAN), sama seperti F11 (bukan hook, LT 72).
    "F12", "montana", (868, 2900, 1220, 2988), 8, "rtl", skip_four=True,
    type_key="GWEN",
    available={1, 2, 5, 7},
    overrides={1: "GWEN_HOOK"},
    street="JL. MONTANA F12",
))

BLOCKS.append(make_block(
    # Revisi (1 Sep 2026): F15 tersedia 3 unit -- 08, 05, 01. 7 lots. Kedua ujung (08 dan
    # 01) hook LT 106,1 -- sebelumnya cuma unit 08 yang dibenarkan, unit 01 belum.
    "F15", "montana", (889, 3050, 1219, 3135), 7, "rtl", skip_four=True,
    type_key="GWEN",
    available={1, 5, 8},
    overrides={1: "GWEN_HOOK", 8: "GWEN_HOOK"},
    street="JL. MONTANA F15",
))

BLOCKS.append(make_block(
    # Revisi (1 Sep 2026): F16 ada 1 tersedia, no unit 01. 7 lots. Kedua ujung (08 dan 01)
    # hook LT 106,1, sama seperti F15.
    "F16", "montana", (889, 3125, 1219, 3213), 7, "rtl", skip_four=True,
    type_key="GWEN",
    available={1},
    overrides={1: "GWEN_HOOK", 8: "GWEN_HOOK"},
    street="JL. MONTANA F16",
))

# ---------------- Ruko (Blok A) ----------------
# Revisi (3 Sep 2026): total Ruko = 18 unit. Numbering dari kanan (dekat gerbang ROW 19) ke
# kiri, A1..A21 dengan A4/A13/A14 dilewati (18 label riil):
#   A1, A2   = 2 lot di kavling KANAN gerbang ("01", "02" di gambar sumber)
#   A3, A5   = 2 lot di kavling KIRI gerbang ("03", "05" di gambar sumber -- BUKAN 4 lot
#              dengan baris kosong di atasnya seperti dugaan sebelumnya)
#   A6..A21  = 14 lot di baris diagonal utama (masing-masing kotak sendiri, presisi,
#              karena barisnya diagonal)
# 2 + 2 + 14 = 18.
RUKO_LABELS = [n for n in range(1, 22) if n not in (4, 13, 14)]  # 18 labels, tops out at 21
assert len(RUKO_LABELS) == 18

# 14 rotated quadrilaterals for the main diagonal row (each unit's true tilted shape, via
# cv2.minAreaRect on its own color blob -- NOT an axis-aligned box), in ascending-x
# (leftmost-first) order. Using the real 4 corners (rendered as a CSS clip-path) instead of
# a bounding rectangle keeps the SOLD tag from overlapping into the neighboring unit, which
# an axis-aligned box can't avoid on a tilted row.
RUKO_MAIN_POLYGONS_LTR = [
    [(886.5, 926.6), (875.3, 847.1), (907.0, 842.6), (918.2, 922.2)],
    [(919.6, 922.1), (909.5, 842.6), (941.7, 838.5), (951.8, 918.0)],
    [(954.5, 917.9), (944.2, 838.1), (975.9, 834.0), (986.2, 913.8)],
    [(988.3, 913.1), (978.3, 833.5), (1010.4, 829.4), (1020.4, 909.1)],
    [(1023.9, 909.3), (1011.8, 829.3), (1044.0, 824.5), (1056.1, 904.4)],
    [(1058.1, 904.0), (1047.5, 824.5), (1078.9, 820.3), (1089.5, 899.8)],
    [(1092.0, 900.0), (1080.6, 820.5), (1112.8, 815.9), (1124.2, 895.4)],
    [(1126.7, 895.4), (1115.7, 815.7), (1147.7, 811.3), (1158.7, 890.9)],
    [(1160.4, 891.0), (1149.7, 811.1), (1181.7, 806.8), (1192.4, 886.8)],
    [(1195.1, 886.2), (1184.4, 806.6), (1216.4, 802.3), (1227.1, 881.9)],
    [(1229.7, 881.7), (1219.3, 801.7), (1250.9, 797.6), (1261.3, 877.6)],
    [(1264.0, 877.3), (1253.3, 797.9), (1284.8, 793.7), (1295.5, 873.1)],
    [(1298.1, 872.6), (1287.7, 792.7), (1319.6, 788.5), (1330.1, 868.5)],
    [(1331.0, 868.1), (1322.1, 787.9), (1363.9, 783.2), (1372.8, 863.5)],
]
RUKO_MAIN_POLYGONS = list(reversed(RUKO_MAIN_POLYGONS_LTR))  # rightmost first


def _bbox(points):
    xs = [p[0] for p in points]
    ys = [p[1] for p in points]
    return (min(xs), min(ys), max(xs), max(ys))


RUKO_MAIN_ENTRIES = [(_bbox(poly), poly) for poly in RUKO_MAIN_POLYGONS]

# 2 lots right of the gate ("02" left cell, "01" right cell on the source PDF).
# Top y (750) fixed 21 Sep 2026: was 735, which reached above the lot's actual
# color fill into the empty gate-canopy area above it -- harmless at the old 55%
# tag height, but once the SOLD tag was made taller (90%) the red box visibly
# overflowed into that empty area. Confirmed by sampling the source image's fill
# color column-by-column: the taupe lot color only starts at y=750.
CORNER_RIGHT_BOX = (1565, 750, 1635, 834)
crx1, cry1, crx2, cry2 = CORNER_RIGHT_BOX
crxm = (crx1 + crx2) // 2
CORNER_RIGHT_ENTRIES = [((crxm, cry1, crx2, cry2), None), ((crx1, cry1, crxm, cry2), None)]  # "01","02"

# 2 lots left of the gate ("05" left cell, "03" right cell on the source PDF).
# Top y (783) fixed 21 Sep 2026, same reason as CORNER_RIGHT_BOX above -- was 735,
# the lot's actual color fill only starts at y=783 (confirmed by color sampling,
# and matches the adjacent main-row polygon's own top y values closely).
CORNER_LEFT_BOX = (1364, 783, 1430, 850)
clx1, cly1, clx2, cly2 = CORNER_LEFT_BOX
clxm = (clx1 + clx2) // 2
CORNER_LEFT_ENTRIES = [((clxm, cly1, clx2, cly2), None), ((clx1, cly1, clxm, cly2), None)]  # "03","05"

# Right-to-left physical order: right-of-gate corner, left-of-gate corner, then main row.
RUKO_ALL_ENTRIES = CORNER_RIGHT_ENTRIES + CORNER_LEFT_ENTRIES + RUKO_MAIN_ENTRIES
assert len(RUKO_ALL_ENTRIES) == 18

for label, (box, polygon) in zip(RUKO_LABELS, RUKO_ALL_ENTRIES):
    BLOCKS.append(make_single_unit_block(
        f"A-{label:02d}", "ruko", box, "RUKO", "SOLD", no=unit_no(label), street="JL. RUKO A",
        polygon_px=polygon,
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
    # Revisi (25 Sep 2026): per permintaan owner, ukuran tiap kotak unit disamakan
    # persis dengan F2-01 (3,948% x 1,186% dari gambar) -- bukan hasil sampling batas
    # lot asli seperti blok lain. Sengaja TIDAK mengikuti garis lot sebenarnya di
    # gambar sumber untuk blok ini.
    "D2", "tahap1", (1422, 2534, 1516, 3173), 16, "ttb",
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
    "facilities": FACILITIES,
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
