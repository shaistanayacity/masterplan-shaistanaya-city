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

## Cakupan data

Hanya blok yang **ada harga resminya di pricelist** yang dibuat interaktif
per-unit, yaitu:

- **Cluster Sierra**: E1, E3, E8 (tipe Bianca & Arnica)
- **Cluster Montana**: F1, F2, F3, F5, F6, F7, F8, F9, F10, F11, F12, F15, F16
  (tipe Gwen, New Gwen, Darlene, Angeline)
- **Tahap 1 (Sold Out)**: B1, B2, C1, C2, D1, D2 — dua kolom kavling
  abu-abu di sisi timur site (tidak berwarna di legenda PDF, tidak ada di
  pricelist). Per konfirmasi pemilik data, blok-blok ini adalah tahap
  penjualan lama yang **sudah terjual semua**, jadi seluruh unitnya
  ditandai SOLD tanpa harga (lihat `TYPES.TAHAP1` di
  `scripts/generate_data.py`). Jumlah unit per kolom (B2=9, C2=18, D2=11,
  B1=9, C1=19, D1=12) dihitung dari tinggi blok hasil deteksi warna dibagi
  tinggi rata-rata satu unit — bukan hasil hitung manual satu-satu, jadi
  bisa meleset 1-2 unit per kolom.

Blok Ruko (A) dan blok abu-abu lain yang belum ada di pricelist maupun
belum dikonfirmasi statusnya (E5, E6, E7, E9, E10, E11) sengaja **tidak**
dibuat per-unit karena tidak ada data tipe/harga/status untuk unit-unit
itu — blok-blok itu tetap tampil apa adanya di gambar master plan (tanpa
overlay), supaya tidak menampilkan harga/status yang dikarang.

## Sumber & asumsi status unit (PENTING — mohon divalidasi)

Sumber data:
- **Tata letak blok & jumlah persil per blok**: dibaca dari `SC_MASTERPLAN.pdf`.
- **Tipe, LB/LT, harga jual**: dari `Pricelist_Semua_Tipe_Shaistanaya_City.docx`
  (periode September 2026, harga sebelum diskon).

Dokumen pricelist **tidak** berisi kolom status per unit (Sold/Ready/Hold)
secara eksplisit — hanya daftar unit yang *masih tersedia* per blok. Status
tiap unit pada halaman ini disimpulkan dengan aturan berikut:

1. Kalau nomor unit **tercantum** di kolom "No Unit" pricelist → **TERSEDIA**.
2. Kalau blok tersebut di pricelist tercantum sebagai **rentang penuh**
   (mis. `F3: 01-08`, `NEW GWEN F5: 02-07` + 2 unit hook) → unit lain di blok
   itu yang tidak disebut dianggap **HOLD** (rumah contoh / kavling kantor
   pemasaran), bukan sold — karena pola penyebutan rentang penuh menandakan
   blok itu baru rilis dan seluruh unitnya masih dipasarkan.
3. Kalau blok tersebut di pricelist hanya menyebut **sebagian kecil/nomor
   acak** (mis. `F1: 05`, `F12: 02,05,07`, `F15: 05`) atau **tidak disebut
   sama sekali** (F2, F6, F8, F9, F10, F11, F16 — semua tipe Darlene/
   Angeline/Gwen tanpa baris "tersedia") → unit yang tidak disebut dianggap
   **SOLD**, karena pola ini menandakan blok tersebut sudah lama dipasarkan
   dan mayoritas sudah terjual.
4. Unit dengan tag **"RC"** pada gambar PDF (rumah contoh) ditandai **HOLD**
   dengan label "RUMAH CONTOH" di kartu popup — posisi persisnya dibaca
   manual dari gambar dan bisa saja meleset satu-dua nomor unit.

**Ini adalah inferensi berdasarkan pola dokumen, bukan data status transaksi
yang sebenarnya.** Sebelum dipakai untuk marketing/website resmi, tolong
cross-check status SOLD/HOLD/TERSEDIA di `js/data.js` dengan data inventory
tim sales yang sebenarnya. Field yang relevan per unit: `no`, `status`
(`"TERSEDIA" | "SOLD" | "HOLD"`), `price`, `lb`, `lt`, `type`.

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
