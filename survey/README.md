# Virtual Survey 360°

Halaman: `survey/index.html` (viewer 360° Pannellum, di-vendor di `vendor/`, tanpa CDN/build).
Klik tab **Lantai 1/2** → tampil denah + spesifikasi lantai, dan titik merah di denah menunjukkan posisi scene saat ini
(klik titik/ruangan untuk pindah). Deep link: `survey/#l2-master`.

## Mengganti dengan file asli
1. Taruh foto equirectangular (JPG rasio 2:1) di `photos/`, gambar denah di `plans/`.
2. Edit `data.js`: scene (`photo`, posisi titik di denah `plan {x,y}` dalam %, `hotspots` panah pindah scene),
   lantai (`plan`, `specs`), dan `summary`. `survey.js` tidak perlu diubah.
3. `python3 -m http.server` lalu buka `/survey/`.

File di `photos/` dan `plans/` saat ini placeholder (dibuat `scripts/make_placeholders.py`).
