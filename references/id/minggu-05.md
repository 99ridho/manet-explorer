---
minggu: 5
judul: Mobilitas dan Propagasi Radio
dosen: Muhammad Ridho Kurniawan Pratama, M.T.I.
sumber:
  - Misra, Woungang & Misra (2009), *Guide to Wireless Ad Hoc Networks*, bab 9, 10, dan 11
---

# Minggu 5: Mobilitas dan Propagasi Radio

Rujukan: Misra bab 9 (hlm. 211-236), bab 10 (hlm. 237-254), bab 11 (hlm. 255-280).
Durasi: 150 menit (3 SKS).

<!-- slide: cover -->
kicker: PERTEMUAN 5 · INTEGRASI JARINGAN MANDIRI/MOBILE
judul: Mobilitas dan Propagasi Radio
subjudul: Integrasi Jaringan Mandiri/Mobile · Pertemuan 5
Catatan: Dua model yang paling memengaruhi hasil simulasi MANET: bagaimana node bergerak, dan bagaimana sinyal merambat.

<!-- slide: disclosure -->

<!-- slide: agenda -->
kicker: TUJUAN PERTEMUAN
judul: Setelah pertemuan ini, Anda dapat:
- Menjalankan Random Waypoint | Parameter kecepatan dan jeda, serta kelemahannya.
- Membedakan model individu dan grup | Kapan RPGM lebih masuk akal daripada RWP.
- Memilih model propagasi | Free space, two-ray ground, shadowing, dan fading.
- Menjelaskan sisi positif mobilitas | Mobilitas bisa membantu routing, kapasitas, dan keamanan.
Catatan: Bekal langsung untuk minggu 6 (simulasi) dan proyek akhir.

<!-- slide: agenda -->
kicker: ALUR 150 MENIT
judul: Tiga bagian dan satu sesi kuis
- Bagian 1: model mobilitas (50 menit) | Dari RWP sampai model berbasis jejak nyata.
- Bagian 2: propagasi radio (45 menit) | Free space, two-ray, shadowing, fading, dan dukungan simulator.
- Bagian 3: sisi positif mobilitas (35 menit) | Routing, kapasitas, dan keamanan.
- Kuis dan diskusi (20 menit) | Dikerjakan berpasangan di akhir pertemuan.
Catatan: Sisipkan jeda 10 menit setelah bagian 2. Cek pemahaman singkat ada di akhir tiap bagian.

<!-- slide: section -->
nomor: 01
judul: Pilihan model mengubah hasil
teks: Model mobilitas yang berbeda bisa membalik peringkat dua protokol yang sama.
Catatan: Bagian 1, sekitar 50 menit. Misra bab 10 subbab 10.3-10.4 (hlm. 240-250).

<!-- slide: points -->
kicker: TIGA CARA
judul: Model mobilitas menyesatkan bertingkat
teks: Misra subbab 10.4 (hlm. 249) memerinci tiga cara model mobilitas memengaruhi kesimpulan.
- Nilai mutlaknya | Overhead 5% di simulasi bisa menjadi 50% saat protokol dipasang di lapangan.
- Arah perubahannya | Di simulasi throughput naik saat jangkauan diperbesar, di lapangan justru turun.
- Peringkat protokol | Protokol A unggul di satu model, kalah di model yang lain.
Catatan: Misra hlm. 249. Karena MANET bergantung pada node perantara, pengaruh model mobilitas jauh lebih besar daripada di jaringan satu hop seperti WLAN dan seluler (hlm. 250).

<!-- slide: numbers -->
kicker: BUKTI
judul: AODV unggul di RWP, kalah di RPGM
- 84% | pengiriman AODV pada RWP kecepatan tinggi
- 59% | pengiriman DSDV pada skenario yang sama
- 97% | pengiriman DSDV pada RPGM (AODV sekitar 87%)
sumber: Misra, Woungang & Misra (2009), bab 10, hlm. 249
Catatan: Misra mengutip studi [7] di bab 10. Pesannya: kalau model mobilitasnya tidak cocok dengan skenario nyata, kesimpulan "protokol A lebih baik dari B" bisa terbalik saat diterapkan. Ini juga jadi masalah untuk kerja standardisasi IETF yang membandingkan usulan lewat simulasi.

<!-- slide: points -->
kicker: KLASIFIKASI
judul: Model mobilitas: acak sampai jejak nyata
teks: Misra subbab 10.2 (hlm. 238-240) menilai model dari realisme, kemudahan diversifikasi, dan kompleksitas.
- Stokastik | Gerak acak tanpa batasan, misalnya RWP. Mudah dipakai, tidak realistis.
- Hibrid | Model grup, model dengan halangan, dan model berbasis jejak.
- Detail dan jejak nyata | Dibangun untuk skenario tertentu atau direkam dari pengguna, misalnya koleksi CRAWDAD.
Catatan: Misra hlm. 239-240. Semakin realistis, semakin sulit dipakai ulang untuk skenario lain. Analisis teoretis dan model stokastik sederhana tetapi tidak realistis; testbed dan model detail realistis tetapi mahal dan sulit divariasikan.

<!-- slide: context -->
kicker: RANDOM WAYPOINT
judul: RWP: pilih titik, jalan, berhenti, ulangi
teks: Node memilih tujuan acak di dalam persegi panjang dan kecepatan acak antara vmin dan vmax. Setelah tiba, node berhenti selama waktu jeda acak, lalu memilih tujuan baru.
RWP adalah model yang paling banyak dipakai di literatur, karena sederhana dan tersedia di hampir semua simulator.
graf:
  simpul: W0@0,2 W1@2.5,0.5 W2@3.5,2.8 W3@1,3.2 W4@2,1.8
  sisi: W0-W1 W1-W2 W2-W3 W3-W4
  jalur: W0>W1>W2>W3>W4
  peran: W0=sumber
  keterangan: Satu node bergerak dari W0 melewati titik tujuan acak. Di setiap titik node berhenti sejenak.
Catatan: Misra subbab 10.3.1.1 (hlm. 240-241, Gambar 10.2). Diversifikasinya mudah: untuk berpindah dari mahasiswa di kampus ke taksi di kota, cukup ubah rentang kecepatan dan waktu jeda; untuk kampus lebih luas, perbesar persegi panjangnya.

<!-- slide: points -->
kicker: KELEMAHAN RWP
judul: Tiga cacat yang sudah terdokumentasi
teks: Misra hlm. 241 mendaftar kelemahan RWP beserta perbaikannya.
- Padat di tengah | Node lebih sering berada di tengah daripada di tepi; ambil posisi awal dari distribusi stasioner.
- Jebakan vmin nol | Node memilih kecepatan sangat kecil, jadi kecepatan rata-rata terus turun; batasi vmin.
- Waktu antarpertemuan | RWP menghasilkan peluruhan eksponensial, padahal jejak nyata mengikuti hukum pangkat.
Catatan: Misra hlm. 241. Menariknya, dengan menghapus batas persegi panjang atau membuatnya sangat besar, waktu antarpertemuan RWP ikut menjadi hukum pangkat, satu langkah menuju model yang lebih realistis.

<!-- slide: points -->
kicker: MODEL ACAK LAIN
judul: Tiga variasi gerak acak lainnya
teks: Misra subbab 10.3.1.2-10.3.1.4 (hlm. 241-244) menyebut tiga model stokastik selain RWP.
- Random walk | Arah dan kecepatan acak tiap langkah; mirip gerak Brown, node cenderung tetap dekat titik awal.
- Random direction | Node berjalan sampai tepi area lalu memilih arah baru; distribusi stasionernya seragam.
- Smooth mobility | Kecepatan dan arah berubah bertahap, dan dunianya berbentuk torus tanpa tepi.
Catatan: Misra hlm. 241-244. Saat mencapai tepi, node random walk bisa memantul atau berputar ke sisi seberang. Ketiganya sama tidak realistisnya dengan RWP, tetapi *smooth mobility* menghindari perubahan arah yang mendadak.

<!-- slide: compare -->
kicker: INDIVIDU VS GRUP
judul: RWP bergerak sendiri, RPGM berkelompok
kolom: Random Waypoint
- Setiap node bergerak sendiri-sendiri.
- Tersedia di hampir semua simulator.
- Sulit membayangkan skenario nyata yang cocok.
- Baik untuk uji awal, bukan untuk kesimpulan akhir.
kolom: Reference Point Group Mobility
- Node dibagi ke beberapa grup.
- Model grup mengatur gerak pusat grup.
- Model individu mengatur gerak node dalam grup.
- Cocok untuk militer, tim SAR, rombongan kampus.
Catatan: Misra subbab 10.3.2 (hlm. 244-245, Gambar 10.6). Pada RPGM, model individunya adalah RWP di dalam cakram di sekitar titik acuan grup, tanpa jeda, sementara pusat grup bergerak pada lintasan yang sudah ditentukan.

<!-- slide: points -->
kicker: SKENARIO RPGM
judul: Lintasan grup menentukan ceritanya
teks: Misra hlm. 244-245 menunjukkan tiga skenario yang bisa dibuat hanya dengan mengubah lintasan grup.
- Grup terpisah | Grup nyaris diam dan tidak bertemu: satuan militer yang bertugas di area berbeda.
- Lintasan bertumpang | Beberapa grup bekerja di area yang sama: skenario pemulihan bencana.
- Lintasan sama, beda waktu | Rombongan yang mengunjungi museum atau pameran satu per satu.
Catatan: Misra hlm. 244-245. Jenis node yang berbeda, misalnya infanteri dan pesawat nirawak, dimodelkan sebagai grup terpisah dengan kecepatan dan waktu jeda masing-masing. Model grup lain berbasis jejaring sosial: node cenderung menuju lokasi tempat "teman" berada.

<!-- slide: points -->
kicker: HALANGAN
judul: Gerak nyata dibatasi jalan dan gedung
teks: Misra subbab 10.3.3 (hlm. 245-246) menambahkan batasan lintasan ke dalam model.
- Diagram Voronoi | Gedung digambar sebagai poligon, dan node berjalan di jalur antargedung lewat rute terpendek.
- Manhattan | Node hanya boleh bergerak di grid; di persimpangan lurus dengan peluang 0,5 dan belok 0,25.
- Freeway | Node mengikuti lajur jalan, tidak boleh menyalip, dengan batas percepatan dan pengereman.
Catatan: Misra hlm. 245-246 (Gambar 10.7). Model kampus dengan halangan menghasilkan kinerja AODV yang berbeda jauh dibanding RWP dan RDM, karena gedung juga menghalangi sinyal.

<!-- slide: points -->
kicker: MODEL DETAIL
judul: Makin realistis, makin sempit gunanya
teks: Misra subbab 10.3.4-10.3.5 (hlm. 246-248) menutup daftar dengan model yang paling rinci.
- STRAW | Memakai peta jalan asli beserta batas kecepatan tiap ruas untuk gerak kendaraan.
- Simulator lalu lintas | CORSIM memodelkan pindah lajur, lampu lalu lintas, dan gaya mengemudi; TRANSIMS menambah pejalan kaki.
- Berbasis jejak | Statistik dari jejak nyata dipakai untuk membangkitkan jejak baru yang mirip.
Catatan: Misra hlm. 246-248. Pertanyaan terbuka yang dicatat Misra: parameter mana yang sebenarnya penting untuk ditiru, misalnya waktu antarkedatangan, keberadaan *hotspot*, ukuran grup, waktu antarpertemuan, distribusi jeda, dan distribusi kecepatan.

<!-- slide: table -->
kicker: MENGUKUR MODEL
judul: Metrik yang tidak bergantung protokol
| Metrik | Yang diukur |
|---|---|
| Ketergantungan spasial | Kemiripan kecepatan node yang berdekatan |
| Ketergantungan temporal | Kemiripan kecepatan satu node pada dua waktu berdekatan |
| Kecepatan relatif | Selisih kecepatan antara dua node |
| Jumlah perubahan link | Berapa kali link antara dua node terbentuk dan putus |
| Durasi link | Rata-rata lama sebuah link bertahan setelah terbentuk |
| Ketersediaan jalur | Porsi waktu ketika ada jalur antara sepasang node |
Catatan: Misra hlm. 249-250. Metrik ini diambil langsung dari jejak gerak, tanpa menjalankan protokol. Ketersediaan jalur yang rendah biasanya berujung pada throughput rendah atau delay tinggi. Kolom militer atau iring-iringan mobil punya ketergantungan spasial yang sangat tinggi.

<!-- slide: compare -->
kicker: DIKENDALIKAN ATAU TIDAK
judul: Menunggu gerak, atau mengatur gerak
kolom: Tidak dikendalikan
- Aplikasi menumpang gerak alami perangkat.
- Node menunggu sampai bertemu node lain.
- Pertemuan bisa jarang dan sulit diramalkan.
- Akibatnya: rasio pengiriman rendah, delay besar.
kolom: Dikendalikan
- Node sengaja mengubah lintasannya untuk komunikasi.
- Lintasan dihitung agar delay pengiriman minimal.
- Jumlah relay dibatasi lewat struktur lintasan berjenjang.
- Butuh node yang memang bisa diatur geraknya.
Catatan: Misra subbab 9.3.1 (hlm. 213-214, Gambar 9.2). Pada skema tidak terkendali seperti *epidemic routing*, pesan disebar ke mana-mana sehingga memperebutkan buffer dan menguras energi node.

<!-- slide: points -->
kicker: CEK PEMAHAMAN
judul: Jawab singkat sebelum lanjut
- Jebakan vmin | Apa yang terjadi pada simulasi RWP jika vmin = 0, dan apa perbaikannya?
- Pilih model | Skenario: 30 relawan SAR dalam 5 tim. RWP atau RPGM? Kenapa?
- Metrik | Metrik mana yang paling menjelaskan seringnya rute putus di sebuah skenario?
Catatan: Jawaban: (1) kecepatan rata-rata terus turun sepanjang simulasi; perbaikannya membatasi vmin pada nilai wajar; (2) RPGM, karena tim bergerak berkelompok; (3) durasi link dan ketersediaan jalur.

<!-- slide: section -->
nomor: 02
judul: Sinyal tidak berbentuk lingkaran
teks: Gelombang radio dipantulkan, dibelokkan, dan dihamburkan. Simulator sering menyederhanakannya jadi jangkauan berbentuk lingkaran.
Catatan: Bagian 2, sekitar 45 menit. Misra bab 11 subbab 11.3 dan 11.5 (hlm. 261-276).

<!-- slide: points -->
kicker: TIGA FENOMENA
judul: Apa yang terjadi pada gelombang
teks: Misra subbab 11.3 (hlm. 261-262, Gambar 11.1) menyebut tiga peristiwa perambatan yang paling penting.
- Refleksi | Gelombang memantul dari benda yang jauh lebih besar dari panjang gelombangnya.
- Difraksi | Gelombang membelok di tepi halangan, jadi node di balik halangan masih bisa terhubung.
- Scattering | Permukaan kasar menghamburkan energi ke segala arah.
Catatan: Misra hlm. 261-262. Di dalam gedung, lorong panjang berperan seperti pemandu gelombang. Banyaknya jalur dengan panjang berbeda inilah yang menimbulkan *fading*.

<!-- slide: compare -->
kicker: DUA KELOMPOK MODEL
judul: Skala besar dan skala kecil
kolom: Model skala besar
- Menggambarkan perubahan daya pada jarak jauh.
- Berlaku untuk rentang waktu yang panjang.
- Contoh: free space, two-ray ground, shadowing.
- Dipakai hampir semua simulator jaringan.
kolom: Model skala kecil
- Gerak sejauh satu panjang gelombang pun berpengaruh.
- Sinyal berubah walau node tidak bergerak.
- Contoh: Rayleigh dan Ricean fading.
- Sering disebut model fading.
Catatan: Misra hlm. 262-263 (Gambar 11.2). Dalam contoh buku, garis hitam menunjukkan prediksi two-ray ground di ns-2 dan area abu-abu menunjukkan sebaran akibat Ricean fading.

<!-- slide: table -->
kicker: MODEL PROPAGASI
judul: Empat model propagasi di simulator
| Model | Asumsi | Catatan dari buku |
|---|---|---|
| Free space | Daya turun sebanding kuadrat jarak | Paling sering dipakai karena sederhana |
| Two-ray ground | Jalur langsung + satu pantulan tanah | Daya turun dengan pangkat empat jarak; bergantung tinggi antena |
| Shadowing | Path loss logaritmik + variasi acak | Eksponen n bisa sampai 6 di dalam gedung |
| Fading | Variasi cepat akibat multipath | Rayleigh tanpa LOS dominan, Ricean dengan LOS |
Catatan: Misra subbab 11.3.1-11.3.4 (hlm. 262-264). Free space memperhitungkan daya pancar, penguatan antena, dan jarak; two-ray ground tidak bergantung frekuensi tetapi bergantung tinggi pengirim dan penerima.

<!-- slide: points -->
kicker: DI DALAM NS-2
judul: Dua model dipakai bergantian
teks: Misra hlm. 263-264 menjelaskan cara ns-2 menggabungkan dua model skala besar.
- Ambang crossover | Di bawah jarak ambang dipakai free space, di atasnya two-ray ground.
- Contoh angkanya | Untuk WLAN dengan perangkat setinggi 1,3 m, jarak crossover sekitar 170 m.
- Keterbatasannya | Di ns-2, pengirim dan penerima harus berada pada ketinggian yang sama.
Catatan: Misra hlm. 263-264. Angka 170 m ini berguna sebagai pemeriksaan kewajaran: jika area simulasi Anda jauh lebih kecil dari itu, praktis hanya model free space yang bekerja.

<!-- slide: points -->
kicker: SHADOWING
judul: Rata-ratanya turun, nilainya menyebar
teks: Model *log-normal shadowing* menambahkan keacakan di sekitar nilai rata-rata (Misra hlm. 264).
- Rumusnya | Path loss pada jarak d sama dengan nilai acuan ditambah 10n log (d dibagi d0).
- Eksponen n | Makin banyak halangan, makin besar n; untuk dalam gedung nilai sampai 6 masuk akal.
- Sebarannya | Sebuah peubah acak Gaussian dengan simpangan baku tertentu ditambahkan ke rumus itu.
Catatan: Misra hlm. 264. Pengukuran nyata menunjukkan nilai sebenarnya tersebar normal di sekitar nilai yang diprediksi, jadi node dekat pun bisa gagal menerima paket.

<!-- slide: points -->
kicker: SITE-SPECIFIC
judul: Ray tracing akurat tetapi lambat
teks: Misra subbab 11.3.5 (hlm. 264-265) membahas batas semua model di atas.
- Masalahnya | Jangkauan semua model tadi kurang lebih berbentuk lingkaran dan tidak bergantung lokasi.
- Solusinya | Halangan digambar di editor grafis, lalu algoritma *ray tracing* menghitung propagasinya.
- Harganya | Simulasi bisa melambat sampai seratus kali lipat.
Catatan: Misra hlm. 264-265. Kerangka CosMos yang dibahas bab 11 menggabungkan zona gerak dan zona halangan dalam satu skenario (hlm. 265-266).

<!-- slide: table -->
kicker: DUKUNGAN SIMULATOR
judul: Model propagasi yang tersedia
| Model | Dukungan di simulator populer |
|---|---|
| Free space | Tersedia di semua paket simulasi |
| Two-ray ground | Hampir semua, kecuali ns-3 dan kerangka mobilitas OMNeT++ |
| Shadowing | Hanya di sebagian paket |
| Ricean atau Rayleigh | Hanya di sebagian paket |
| Site-specific | Tidak ada yang mendukung asli; GloMoSim lewat matriks path loss |
Catatan: Misra Tabel 11.3 (hlm. 276). Konsekuensinya untuk proyek akhir: kalau Anda memakai ns-2, model shadowing tersedia, tetapi halangan nyata harus diatasi lewat penyesuaian parameter, bukan lewat model khusus.

<!-- slide: points -->
kicker: DUKUNGAN MODEL GERAK
judul: Simulator hanya punya yang sederhana
teks: Misra subbab 11.5.3 (hlm. 275) memeriksa model mobilitas yang tersedia langsung di paket simulasi.
- Yang tersedia | Umumnya hanya model acak paling sederhana, terutama Random Waypoint.
- Yang tidak | Model grup, halangan, dan berbasis sosial biasanya tidak didukung langsung.
- Risikonya | Peneliti menyusun skenario dari model yang kebetulan tersedia, dan hasilnya bisa bias.
Catatan: Misra hlm. 275 (Tabel 11.1). Jalan keluarnya: pakai jejak gerak dari alat luar, misalnya BonnMotion (mendukung Manhattan dan RPGM), ANSim, CosMos, MGP, atau OMM (hlm. 275-276).

<!-- slide: table -->
kicker: DAFTAR PERIKSA
judul: Yang wajib didokumentasikan
| Butir | Alasannya |
|---|---|
| Semua nilai parameter | Agar orang lain tahu persis skenario yang dijalankan |
| Perubahan pada simulator | Patch sebaiknya dibagikan agar hasil bisa direproduksi |
| Pilihan data masukan | Rentang nilai dan data keluaran perlu dibahas, bukan hanya ditampilkan |
| Jumlah replikasi | Termasuk cara replikasi dan jenis simulasinya |
| Seed pembangkit acak | Tanpa ini, simulasi tidak bisa diulang persis |
| Sebaran hasil | Pakai simpangan baku atau selang kepercayaan, bukan hanya rata-rata |
Catatan: Misra subbab 11.5.1 (hlm. 272-273). Daftar ini dipakai lagi di minggu 6 dan menjadi syarat laporan proyek akhir. Jika ruang publikasi terbatas, detailnya ditaruh di laporan teknis terpisah.

<!-- slide: points -->
kicker: CEK PEMAHAMAN
judul: Jawab singkat sebelum jeda
- Pilih propagasi | Simulasi di dalam gedung kampus: model mana yang paling tidak cocok?
- Crossover | Kenapa jarak crossover 170 m penting saat merancang area simulasi?
- Dokumentasi | Kenapa seed pembangkit bilangan acak wajib dicatat?
Catatan: Jawaban: (1) free space, karena tidak memodelkan halangan; shadowing dengan eksponen tinggi lebih masuk akal; (2) di bawah jarak itu hanya free space yang berlaku, jadi hasilnya terlalu optimistis; (3) tanpa seed, simulasi tidak bisa diulang persis oleh orang lain. Setelah ini, jeda 10 menit.

<!-- slide: section -->
nomor: 03
judul: Mobilitas tidak selalu merugikan
teks: Misra bab 9 membalik sudut pandang: gerak node bisa dimanfaatkan untuk routing, kapasitas, dan keamanan.
Catatan: Bagian 3, sekitar 35 menit. Misra bab 9 subbab 9.3.2-9.3.5 (hlm. 215-222).

<!-- slide: points -->
kicker: TIGA TINGKAT
judul: Yang bergerak bukan cuma node
teks: Misra subbab 9.3.2 (hlm. 215-216) membedakan tiga tingkat mobilitas dalam satu jaringan.
- Tingkat node | Node itu sendiri bergerak, misalnya dipasang di mobil atau pesawat nirawak.
- Tingkat informasi | Peristiwa yang dipantau yang bergerak, misalnya asap dari truk yang melaju.
- Tingkat pengguna | Penerima informasi ikut berpindah, jadi informasi yang relevan baginya berubah.
Catatan: Misra hlm. 215-216. Contoh tingkat pengguna: memantau kondisi lalu lintas menuju rumah sakit terdekat, yang berubah seiring posisi pengguna.

<!-- slide: points -->
kicker: JARINGAN JARANG
judul: Node pembawa menggantikan jalur
teks: Di jaringan jarang, jalur ujung ke ujung mungkin tidak pernah ada (Misra hlm. 216-217).
- Asumsi yang dilepas | Pengirim tidak pernah sejangkauan penerima dan tidak tahu posisinya.
- Node pembawa | Node perantara menyimpan pesan dulu, lalu menyerahkannya ke node berikutnya.
- Contohnya | *Epidemic routing* dan *message ferrying*.
Catatan: Misra hlm. 216-217. Tiga tujuan skema pembawa: menyebarkan pesan secara probabilistik, menekan sumber daya per pesan, dan memaksimalkan porsi pesan yang akhirnya sampai. Alternatif lain, memakai radio berjangkauan jauh, terlalu boros energi.

<!-- slide: points -->
kicker: KENAPA MEMBANTU
judul: Gerak menambah link yang logis
teks: Misra subbab 9.3.3.3 (hlm. 219-220) menjelaskan alasan mobilitas menaikkan peluang rute ditemukan.
- Dasar yang berbeda | Routing tradisional bertumpu pada link permanen, di sini pada pertemuan sesaat.
- Efeknya | Tiap pertemuan dihitung sebagai link logis, jadi jumlah link di graf dinamis bertambah.
- Hasilnya | Peluang adanya jalur logis antara dua node ikut naik.
Catatan: Misra hlm. 219-220. Di jaringan yang sering terpecah, skema berbasis link permanen memang tidak cocok, karena rute harus dicari ulang setiap kali link putus.

<!-- slide: points -->
kicker: KAPASITAS
judul: Node bergerak menaikkan throughput
teks: Misra subbab 9.3.4 (hlm. 220-221) merangkum dua hasil teoretis yang berlawanan.
- Jaringan statis | Gupta dan Kumar: throughput per node turun seiring akar jumlah node per satuan luas.
- Jaringan bergerak | Grossglauser dan Tse: dengan toleransi delay longgar, throughput per node bisa dijaga konstan.
- Harganya | Kenaikan kapasitas itu dibayar dengan delay yang lebih besar.
Catatan: Misra hlm. 220-221. Kuncinya transmisi jarak pendek: node menyerahkan paket ke node terdekat, dan paket diserahkan ke tujuan saat pembawanya kebetulan dekat.

<!-- slide: points -->
kicker: ALTERNATIFNYA
judul: Menambah relay jauh lebih mahal
teks: Misra hlm. 220 membandingkan dua cara menaikkan kapasitas jaringan.
- Menambah node relay | Kapasitas total naik, tetapi jumlah relay yang dibutuhkan sangat besar.
- Contoh angkanya | Untuk 100 pengirim, butuh setidaknya 4.476 node relay agar kapasitas naik lima kali.
- Menambah mobilitas | Tiap pasangan pengirim dan penerima bisa mendapat porsi tetap dari bandwidth.
Catatan: Misra hlm. 220-221. Syaratnya cukup ketat: posisi tujuan dianggap tetap, jumlah node bergerak harus cukup banyak, dan jumlah relay per paket harus dibatasi.

<!-- slide: points -->
kicker: KEAMANAN
judul: Berdekatan dulu, baru saling percaya
teks: Misra subbab 9.3.5 (hlm. 222) menunjukkan mobilitas juga membantu membangun hubungan aman.
- Tanpa otoritas | Tidak ada PKI, tidak ada server, bahkan pada tahap awal jaringan.
- Idenya | Dua node yang ingin berkomunikasi aman cukup saling mendekat untuk bertukar kredensial.
- Cakupannya | Cara ini berlaku di hampir semua lapisan, dari MAC sampai aplikasi.
Catatan: Misra hlm. 222. Gagasan ini meniru perilaku manusia: orang yang ingin bertukar rahasia mendekat lebih dulu. Trust dan *security association* dibahas lebih dalam di minggu 8.

<!-- slide: table -->
kicker: RINGKASAN
judul: Yang perlu dibawa ke minggu 6
| Gagasan | Intinya |
|---|---|
| Model menentukan hasil | Peringkat protokol bisa terbalik hanya karena model mobilitas |
| RWP | Mudah dipakai, tetapi padat di tengah dan rawan jebakan vmin |
| Model grup | Lintasan pusat grup menentukan skenario yang ditiru |
| Propagasi | Free space paling optimistis, shadowing lebih dekat kenyataan |
| Dokumentasi | Parameter, patch, seed, replikasi, dan sebaran hasil wajib dicatat |
Catatan: Minggu 6 memakai semua ini untuk menyusun skenario simulasi yang jujur, lalu membaca hasilnya dengan metrik yang tepat.

<!-- slide: points -->
kicker: KUIS
judul: Kerjakan berpasangan, 15 menit
- Pilih model | Skenario: 30 relawan SAR dalam 5 tim. RWP atau RPGM? Kenapa?
- Jebakan vmin | Apa yang terjadi pada simulasi RWP jika vmin = 0?
- Rancang | Untuk proyek akhir Anda, tulis model mobilitas dan model propagasi yang dipakai, beserta alasannya.
Catatan: Soal 3 tidak punya jawaban tunggal; nilai dari kesesuaian model dengan skenario yang mereka pilih dan dari kelengkapan parameter yang mereka sebutkan (rujuk daftar periksa dokumentasi tadi).

<!-- slide: closing -->
judul: Diskusi
teks: Sebelum pertemuan 6, baca Loo bab 3 dan 4.
Catatan: Pertemuan 6 membahas pemodelan, simulator, dan evaluasi kinerja.
