// Tautan tampilan 3D rumah per TIPE. Edit file ini saja -- tidak perlu generate ulang data.
//
// Kunci = nama tipe (huruf besar). Unit memakai kunci terpanjang yang cocok dengan awal
// nama tipenya, jadi "ANGELINE" juga berlaku untuk "ANGELINE (Hook)", kecuali ada kunci
// yang lebih spesifik seperti "ANGELINE (HOOK)".
//
// Isi `url` dengan salah satu:
//   - Link embed dari aplikasi lain (dibuka di iframe): Sketchfab, Spline, Matterport,
//     Kuula, 3DVista, Google Drive preview, dsb. Pakai URL "embed"-nya, bukan URL halaman.
//       Sketchfab : https://sketchfab.com/models/<ID>/embed
//       Spline    : https://my.spline.design/<nama>/   (Share > Public URL)
//       Matterport: https://my.matterport.com/show/?m=<ID>
//   - File model langsung berakhiran .glb / .gltf (di-host di repo ini, mis.
//     "assets/models/angeline.glb", atau URL https), ditampilkan dengan <model-viewer>.
// Kosongkan (null) kalau belum ada: overlay otomatis menampilkan foto render tipe itu.
window.HOUSE_VIEWS = {
  "ANGELINE":   { url: null },
  "GWEN":       { url: null },
  "NEW GWEN":   { url: null },
  "DARLENE":    { url: null },
  "BIANCA":     { url: null },
  "ARNICA":     { url: null },
  "RUKO":       { url: null },
};
