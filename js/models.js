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
//   - "builtin:<nama>" -> model 3D buatan sendiri di js/house3d.js (sekarang: builtin:arnica).
// Kosongkan (null) kalau belum ada: overlay otomatis menampilkan foto render tipe itu.
window.HOUSE_VIEWS = {
  "ANGELINE":              { url: "builtin:angeline" },
  "ANGELINE (HOOK)":       { url: "builtin:angeline-hook" },
  "GWEN":                  { url: "builtin:gwen" },
  "GWEN (HOOK)":           { url: "builtin:gwen-hook" },
  "NEW GWEN":              { url: "builtin:darlene" },
  "NEW GWEN (HOOK)":       { url: "builtin:darlene-hook" },
  "DARLENE":               { url: "builtin:darlene" },
  "BIANCA":                { url: "builtin:bianca" },
  "BIANCA DELUXE (HOOK)":  { url: "builtin:bianca-hook" },
  "ARNICA":                { url: "builtin:arnica" },
  "ARNICA GARDEN (HOOK)":  { url: "builtin:arnica-hook" },
  "ARNICA POOL (HOOK)":    { url: "builtin:arnica-hook" },
  "ARNICA (E8)":           { url: "builtin:arnica-hook" },
  "RUKO":                  { url: "builtin:ruko" },
};
