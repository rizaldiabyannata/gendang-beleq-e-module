// Bekas service worker offline modul ini.
//
// Berkas ini sengaja TIDAK dihapus. Menghapusnya tidak mencabut worker yang sudah
// terpasang di perangkat siswa: peramban akan terus menyajikan cache lama selamanya,
// dan siswa tidak akan pernah melihat versi baru mana pun. Satu-satunya jalan keluar
// adalah menerbitkan versi baru yang mencabut dirinya sendiri, yaitu berkas ini.
//
// Baru boleh benar-benar dibuang setelah semua perangkat dipastikan sudah melewatinya.
self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', (e) => {
  e.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.map((k) => caches.delete(k)));
    await self.registration.unregister();
    // Tanpa muat ulang, tab yang sedang terbuka tetap menampilkan halaman yang tadi
    // disajikan dari cache sampai siswa menutupnya sendiri.
    const windows = await self.clients.matchAll({ type: 'window' });
    windows.forEach((c) => c.navigate(c.url));
  })());
});

// Tidak ada penangan fetch: setiap permintaan langsung lewat ke jaringan.
