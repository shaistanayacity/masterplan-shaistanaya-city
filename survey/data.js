/* Data virtual survey. Ganti foto/denah/spesifikasi di sini — tidak perlu ubah survey.js.
 *
 * scenes[].photo   : foto equirectangular (JPG 2:1) di folder photos/
 * scenes[].plan    : posisi titik scene di denah, dalam persen {x, y} dari gambar denah
 * scenes[].yaw     : arah pandang awal (derajat, 0 = tengah foto)
 * hotspots[]       : panah pindah scene. yaw/pitch = posisi panah di foto, to = id scene tujuan
 * floors[].plan    : gambar denah di folder plans/
 * floors[].specs   : tabel spesifikasi lantai (label, nilai) */
window.SURVEY = {
  title: "Virtual Survey",
  unit: "Tipe Contoh (placeholder)",
  summary: [["Luas Tanah", "105 m²"], ["Luas Bangunan", "86 m²"], ["Lantai", "2"], ["Kamar Tidur", "3"]],
  floors: [
    { id: "l1", label: "Lantai 1", plan: "plans/lantai-1.png", area: "43 m²",
      specs: [["Ruang", "Teras, Ruang Tamu, Dapur & Dining"], ["Luas Lantai", "43 m²"], ["Lantai", "Granit 60×60"], ["Plafon", "Gypsum, tinggi 3,0 m"], ["Listrik", "2.200 VA"]] },
    { id: "l2", label: "Lantai 2", plan: "plans/lantai-2.png", area: "43 m²",
      specs: [["Ruang", "Kamar Utama, Kamar 2, Balkon"], ["Luas Lantai", "43 m²"], ["Lantai", "Granit 60×60"], ["Plafon", "Gypsum, tinggi 2,8 m"], ["Sanitair", "Closet duduk, shower"]] }
  ],
  scenes: [
    { id: "l1-teras",  floor: "l1", title: "Teras", photo: "photos/l1-teras.jpg", plan: { x: 25, y: 75 }, yaw: 0,
      hotspots: [{ to: "l1-living", yaw: 90, pitch: -5, label: "Ruang Tamu" }] },
    { id: "l1-living", floor: "l1", title: "Ruang Tamu", photo: "photos/l1-living.jpg", plan: { x: 25, y: 35 }, yaw: 0,
      hotspots: [{ to: "l1-teras", yaw: -90, pitch: -5, label: "Teras" }, { to: "l1-dapur", yaw: 90, pitch: -5, label: "Dapur" }, { to: "l2-master", yaw: 180, pitch: 5, label: "Naik ke Lantai 2" }] },
    { id: "l1-dapur",  floor: "l1", title: "Dapur & Dining", photo: "photos/l1-dapur.jpg", plan: { x: 70, y: 35 }, yaw: 0,
      hotspots: [{ to: "l1-living", yaw: -90, pitch: -5, label: "Ruang Tamu" }] },
    { id: "l2-master", floor: "l2", title: "Kamar Utama", photo: "photos/l2-master.jpg", plan: { x: 30, y: 35 }, yaw: 0,
      hotspots: [{ to: "l2-balkon", yaw: 90, pitch: -5, label: "Balkon" }, { to: "l1-living", yaw: 180, pitch: 5, label: "Turun ke Lantai 1" }] },
    { id: "l2-balkon", floor: "l2", title: "Balkon", photo: "photos/l2-balkon.jpg", plan: { x: 70, y: 70 }, yaw: 0,
      hotspots: [{ to: "l2-master", yaw: -90, pitch: -5, label: "Kamar Utama" }] }
  ]
};
