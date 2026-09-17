# Master Plan Interaktif — Shaistanaya City

Halaman statis (HTML/CSS/JS, tanpa build step) yang menampilkan master plan
Shaistanaya City dengan overlay per-unit yang bisa diklik — gayanya mengikuti
contoh "Java Residence Sukodono" yang diberikan: setiap unit berwarna sesuai
tipe rumah, unit yang **sudah terjual** diberi label kecil **"SOLD"**, unit
**rumah contoh/hold** diberi label **"RC"**, dan klik pada sebuah unit
membuka kartu popup berisi kode unit, cluster, tipe, LB/LT, alamat, harga,
dan status. Ada juga panel ringkasan (Unit Ready / Sold / Hold + persentase)
per cluster, sama seperti panel "JRS5 Tahap 001/002" pada contoh.

Buka `index.html` langsung di browser, atau jalankan server statis apa saja,
misalnya:

```bash
python3 -m http.server 8000
# lalu buka http://localhost:8000
```

## Struktur

```
index.html        Markup halaman
css/style.css      Tampilan (popup, panel ringkasan, legenda, overlay unit)
js/data.js         Dataset unit (auto-generated, lihat bagian "Sumber data")
js/app.js          Render overlay + interaksi popup, dari data.js
assets/masterplan.jpg  Gambar master plan (dari SC_MASTERPLAN.pdf)
```

Posisi setiap blok unit (`js/data.js`, field `box`) dihitung otomatis dengan
mendeteksi warna blok pada gambar master plan asli (image-color detection +
bounding box), lalu setiap blok dipotong rata sejumlah unit di dalamnya. Jadi
posisi overlay sudah cukup presisi menempel ke gambar, tapi **bukan hasil
digitasi manual per-persil** — kalau ada blok yang terasa sedikit geser,
cukup ubah angka `box.left/top/width/height` (persen dari gambar) di
`js/data.js` atau sesuaikan window deteksi warna.

Pengecualian: baris **Ruko (Blok A)** ada di jalan yang miring/diagonal,
jadi tidak bisa dipotong rata sebagai satu persegi panjang tanpa jadi tidak
presisi. Untuk blok itu, semua unitnya (14 di baris diagonal utama + 4 di
kavling pojok kiri dekat gerbang ROW 19 + 3 di kavling pojok kanannya =
21 unit) masing-masing dideteksi sebagai kotak sendiri-sendiri (per-unit,
bukan per-blok) lewat `make_single_unit_block()` di
`scripts/generate_data.py`, jadi setiap unit menempel pas mengikuti
kemiringan/posisi aslinya di gambar.

## Cakupan data

Hanya blok yang **ada harga resminya di pricelist** yang dibuat interaktif
per-unit, yaitu:

- **Cluster Sierra**: E1, E3, E7, E8 (tipe Bianca & Arnica)
- **Cluster Montana**: F1, F2, F3, F5, F6, F7, F8, F9, F10, F11, F12, F15, F16
  (tipe Gwen, New Gwen, Darlene, Angeline)
- **Ruko (Blok A)**: 21 unit ruko (14 di baris diagonal utama + 4 + 3 di
  dua kavling pojok dekat gerbang ROW 19) — semua **SOLD** (tidak ada data
  harga, jadi popup-nya cuma tampilkan status).
- **Tahap 1 (Sold Out)**: B1, B2, C1, C2, D1, D2 — dua kolom kavling
  abu-abu di sisi timur site (tidak berwarna di legenda PDF, tidak ada di
  pricelist). Ini tahap penjualan lama yang **sudah terjual semua**, jadi
  seluruh unitnya ditandai SOLD tanpa harga (lihat `TYPES.TAHAP1` di
  `scripts/generate_data.py`). Jumlah unit per kolom (B2=9, C2=18, D2=11,
  B1=9, C1=19, D1=12) dihitung dari tinggi blok hasil deteksi warna dibagi
  tinggi rata-rata satu unit — bukan hasil hitung manual satu-satu, jadi
  bisa meleset 1-2 unit per kolom.

E7 sekarang juga interaktif (unit 05 = hold/RC, sisanya SOLD) tapi tipe dan
harganya belum ada di pricelist manapun, jadi popup-nya hanya menampilkan
nama generik "ARNICA (E7)" tanpa harga.

Blok abu-abu lain yang belum ada di pricelist maupun belum dikonfirmasi
statusnya (E5, E6, E9, E10, E11) sengaja **tidak** dibuat per-unit karena
tidak ada data tipe/harga/status untuk unit-unit itu — blok-blok itu tetap
tampil apa adanya di gambar master plan (tanpa overlay), supaya tidak
menampilkan harga/status yang dikarang.

## Sumber & status unit

Sumber data:
- **Tata letak blok & jumlah persil per blok**: dibaca dari `SC_MASTERPLAN.pdf`,
  dan dari deteksi warna blok pada gambarnya (lihat bagian "Posisi blok" di atas).
- **Tipe, LB/LT, harga jual**: dari `Pricelist_Semua_Tipe_Shaistanaya_City.docx`
  (periode September 2026, harga sebelum diskon).
- **Status TERSEDIA/SOLD/HOLD per unit**: sumber terakhir & paling otoritatif
  adalah `unit_stock.pdf` (tabel "Blok / Tipe / Ready / Nomor Unit Ready",
  per 1 September 2026) — setiap unit yang nomornya tercantum di kolom
  "Nomor Unit Ready" = **TERSEDIA**, yang ditandai `/RC` = **HOLD** (rumah
  contoh), sisanya = **SOLD**. Blok yang tidak ada di tabel itu (E1, B1/B2)
  memakai status dari revisi tertulis sebelumnya (1 September 2026) atau,
  kalau juga tidak disebut di situ, pola pricelist lama (lihat di bawah).
  Setiap blok yang datanya berasal dari `unit_stock.pdf` ditandai komentar
  `# unit_stock.pdf (1 Sep 2026): ...` persis di atas definisinya di
  `scripts/generate_data.py`, supaya mudah dilacak balik ke sumbernya.

**Tidak ada blok yang punya unit nomor 04** (penomoran loncat dari 03
langsung ke 05) — dikonfirmasi pemilik data. Blok-blok yang terbukti
mengikuti pola ini dari pembacaan gambar + `unit_stock.pdf` (E7, E8, F1,
F3, F5, F6, F7, F8, F9, F10, F11, F12, F15, F16) dibuat dengan
`skip_four=True` di `make_block()`, yang menghasilkan nomor unit
01,02,03,05,06,... (bukan 01,02,03,04,05,...) — jadi jumlah unit
riilnya **satu lebih sedikit** dari yang kelihatan di gambar kalau cuma
menghitung nomor tertinggi (mis. baris yang nomornya sampai "08" itu
isinya cuma 7 unit, bukan 8). E1, E3, F2, Ruko, dan Tahap 1 **belum**
diubah ke `skip_four=True` karena belum ada bukti/konfirmasi eksplisit
untuk blok-blok itu — kalau ternyata sama, tinggal tambahkan
`skip_four=True` dan sesuaikan `count`-nya (kurangi 1) di panggilan
`make_block()` masing-masing.

Kalau ada blok yang **belum pernah direvisi** (tidak disebut di atas) dan
statusnya masih terasa tidak pas, kemungkinan itu peninggalan dugaan lama
saya — sebelum revisi tertulis di atas ada, status unit disimpulkan dari
pola pricelist (rentang penuh = mayoritas masih tersedia, nomor acak/tidak
disebut = mayoritas sudah terjual). Field yang relevan per unit di
`js/data.js`: `no`, `status` (`"TERSEDIA" | "SOLD" | "HOLD"`), `price`,
`lb`, `lt`, `type`.

Harga yang ditampilkan hanya **satu angka "Harga Jual"** (sesuai dokumen
sumber) — bukan tiga skema Cash/Inhouse/KPR seperti contoh Java Residence,
karena pricelist Shaistanaya City tidak memuat rincian per skema pembayaran
itu. Untuk tipe ARNICA (E1/E8), dua pilihan desain (Garden/Pool) pada
persil yang sama masing-masing dibuatkan unit kode berbeda secara implisit
lewat field `type` di popup — silakan sesuaikan kalau tim ingin tampilan
"pilih Garden atau Pool" dalam satu popup.

## Mengedit data

`js/data.js` adalah file yang di-generate. Untuk mengubah data (status unit,
harga, jumlah unit per blok, dll.), cara paling rapi adalah mengedit ulang
generator-nya lalu menjalankannya kembali — atau langsung edit `js/data.js`
untuk perubahan kecil (aman, karena file ini murni data, dibaca oleh
`js/app.js`).
