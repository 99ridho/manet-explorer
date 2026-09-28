---
minggu: 8
judul: Keamanan dan Trust, lalu Menuju Proyek Akhir
dosen: Muhammad Ridho Kurniawan Pratama, M.T.I.
sumber:
  - Misra, Woungang & Misra (2009), *Guide to Wireless Ad Hoc Networks*, bab 17, 18, 19, dan 20
  - Loo, Lloret & Ortiz (2012), *Mobile Ad Hoc Networks*, bab 13 dan 16
---

# Minggu 8: Keamanan dan Trust, lalu Menuju Proyek Akhir

Rujukan: Misra bab 17 (hlm. 427-454), bab 18 (hlm. 455-472), bab 19 (hlm. 473-502), bab 20 (hlm. 503-526); Loo bab 13 (hlm. 329-378), bab 16 (hlm. 425-448).
Durasi: 150 menit (3 SKS).

<!-- slide: cover -->
kicker: PERTEMUAN 8 · INTEGRASI JARINGAN MANDIRI/MOBILE
judul: Keamanan dan Trust, lalu Menuju Proyek Akhir
subjudul: Integrasi Jaringan Mandiri/Mobile · Pertemuan 8
Catatan: Pertemuan terakhir materi. Dua pertiga waktu untuk keamanan dan trust, sepertiga untuk brief proyek akhir.

<!-- slide: disclosure -->

<!-- slide: agenda -->
kicker: TUJUAN PERTEMUAN
judul: Setelah pertemuan ini, Anda dapat:
- Menjelaskan serangan pada routing | Black hole, gray hole, wormhole, dan elemen penyusunnya.
- Membandingkan teknik deteksi intrusi | Anomali, misuse, dan spesifikasi.
- Menjelaskan komponen sistem trust | Bukti, model, dan kebijakan.
- Memilih tema proyek akhir | VANET, wireless mesh, atau keamanan MANET.
Catatan: Bagian keamanan menyambung ke minggu 4: node egois adalah kasus ringan dari node yang tidak bisa dipercaya.

<!-- slide: agenda -->
kicker: ALUR 150 MENIT
judul: Tiga bagian dan brief proyek
- Bagian 1: serangan (45 menit) | Elemen serangan, black hole, wormhole, dan ancaman lain.
- Bagian 2: deteksi dan trust (45 menit) | IDS di MANET, watchdog, dan sistem trust.
- Bagian 3: menuju proyek akhir (40 menit) | Tiga arah tema beserta bacaan awalnya.
- Kuis dan diskusi (20 menit) | Dikerjakan berpasangan sebelum pembentukan kelompok.
Catatan: Sisipkan jeda 10 menit setelah bagian 2. Brief lengkap dan rubrik dibagikan terpisah.

<!-- slide: section -->
nomor: 01
judul: Serangan pada routing
teks: Protokol routing yang kita pelajari di minggu 2-3 menganggap semua node jujur. Penyerang memanfaatkan asumsi itu.
Catatan: Bagian 1, sekitar 45 menit. Misra bab 18 subbab 18.4 (hlm. 457-463).

<!-- slide: points -->
kicker: ELEMEN SERANGAN
judul: Serangan besar tersusun dari aksi kecil
teks: Misra membagi serangan ke tiga tingkat: skenario, perilaku, dan elemen (Gambar 18.1). Tiga elemen yang sering muncul:
- Sinking | Node sengaja membuang paket, untuk hemat baterai atau untuk merusak routing.
- Rushing | Khusus protokol reaktif: penyerang meneruskan RREQ lebih cepat agar masuk rute.
- Spoofing | Penyerang menyamar sebagai node lain dengan memalsukan alamat sumber.
Catatan: Dua elemen lain: *replay* (mengirim ulang pesan routing lama) dan *modifying* (mengubah isi pesan seperti nomor urut). Rushing bekerja karena node hanya meneruskan RREQ pertama yang diterima (ingat AODV di minggu 2).

<!-- slide: context -->
kicker: BLACK HOLE
judul: Black hole menarik rute lalu membuang paket
teks: M mengaku punya rute ke D, sehingga S mengirim data lewat M. M membuang semua paket tanpa jejak.
Varian *gray hole* hanya membuang sebagian trafik, sehingga lebih sulit dideteksi.
graf:
  simpul: S@0,1 A@1,0 M@1,2 B@2,0 D@3,1
  sisi: S-A S-M A-B B-D M-D
  putus: M-D
  jalur: S>M
  peran: S=sumber D=tujuan M=jahat
  keterangan: M (hitam) mengiklankan rute palsu ke D. Garis putus: rute yang diklaim M, tidak pernah dipakai untuk meneruskan.
Catatan: Misra subbab 18.4.3.1 (hlm. 460-461, Gambar 18.2). Misra juga memberi contoh M memalsukan identitas node lain, sehingga node jujur yang disalahkan.

<!-- slide: context -->
kicker: WORMHOLE
judul: Wormhole membuat dua area terasa bertetangga
teks: Dua node jahat di dua area berbeda membuat terowongan. Pesan routing dari satu area diputar ulang di area lain.
Node mengira rute lewat terowongan paling pendek, padahal semua trafik dikendalikan penyerang. Karena trafik ditunnel, enkripsi dan kontrol akses tidak mencegah serangan ini.
graf:
  simpul: S@0,1 A@1,0 M1@1,2 B@2,0 C@3,0 M2@3,2 D@4,1
  sisi: S-A A-B B-C C-D S-M1 M1-M2 M2-D
  putus: M1-M2
  jalur: S>M1>M2>D
  peran: S=sumber D=tujuan M1=jahat M2=jahat
  keterangan: Garis putus: terowongan M1-M2. Rute S, M1, M2, D terlihat lebih pendek dari S, A, B, C, D.
Catatan: Misra subbab 18.4.3.2 (hlm. 461-462, Gambar 18.3). Setelah menguasai link, penyerang bisa pasif (analisis trafik, pemantauan lokasi) atau aktif (membuang dan memanipulasi trafik). Serangan pasif sangat berbahaya untuk aplikasi militer.

<!-- slide: table -->
kicker: ANCAMAN LAIN
judul: Empat skenario serangan lainnya
| Skenario | Cara kerjanya |
|---|---|
| Network partitioning | Node jahat menghapus rute sehingga sebagian jaringan tidak terjangkau |
| Cache poisoning | Menambah, menghapus, atau mengubah rute di cache node tetangganya |
| Selfishness | Node menolak ikut meneruskan demi menghemat baterai dan bandwidth |
| Sleep deprivation | Membanjiri korban dengan pesan routing sampah sampai dayanya terkuras |
Catatan: Misra subbab 18.4.3.3-18.4.3.6 (hlm. 462-463). Deteksi partisi secara statistik sebenarnya mudah, tetapi penyerang bisa menyamarkannya lewat serangan lapisan bawah seperti *jamming* atau *MAC flooding*. Di jaringan padat, keegoisan hanya menurunkan efisiensi; di jaringan jarang, ia membuat sebagian area tidak terjangkau.

<!-- slide: points -->
kicker: ANALISIS ANCAMAN
judul: Tiga tahap memeriksa satu protokol
teks: Misra subbab 18.5 (hlm. 463-464) memberi kerangka analisis ancaman, dengan OLSR sebagai contoh.
- Tahap satu | Pelajari implementasinya: bagaimana informasi jahat menyebar dan sejauh mana tiap jenis pesan berlaku.
- Tahap dua | Turunkan hubungan sebab akibat antara perilaku serangan dan gangguan yang ditimbulkan.
- Tahap tiga | Nilai risiko tiap jenis pesan routing berdasarkan temuan tahap sebelumnya.
Catatan: Misra hlm. 463-464. Kerangka ini bisa dipakai mahasiswa untuk menganalisis protokol pilihan mereka di proyek akhir, bukan hanya mengukur penurunan kinerja.

<!-- slide: points -->
kicker: CEK PEMAHAMAN
judul: Jawab singkat sebelum lanjut
- Rushing | Kenapa rushing hanya berlaku untuk protokol reaktif?
- Wormhole | Kenapa enkripsi tidak mencegah serangan wormhole?
- Gray hole | Kenapa gray hole lebih sulit dideteksi daripada black hole?
Catatan: Jawaban: (1) node reaktif hanya meneruskan RREQ pertama untuk tiap pencarian; (2) trafiknya hanya ditunnel, bukan dibaca, jadi isi pesan tidak perlu dibuka; (3) ia tetap meneruskan sebagian paket, jadi perilakunya mirip link yang sekadar buruk.

<!-- slide: section -->
nomor: 02
judul: Deteksi dan trust
teks: Pencegahan saja tidak cukup. Node perlu mendeteksi perilaku menyimpang dan memutuskan siapa yang dipercaya.
Catatan: Bagian 2, sekitar 45 menit. Misra bab 17 (hlm. 428-446) dan bab 19 (hlm. 478-482).

<!-- slide: compare -->
kicker: DETEKSI INTRUSI
judul: Misuse lebih akurat, anomali lebih peka
kolom: Berbasis anomali
- Memodelkan perilaku normal sistem.
- Intrusi = penyimpangan dari perilaku normal.
- Bisa mendeteksi serangan yang belum dikenal.
- *False positive* bisa tinggi.
kolom: Berbasis misuse (signature)
- Mencocokkan aktivitas dengan signature serangan.
- Efisien dan *false positive* rendah.
- Tidak bisa mendeteksi serangan baru.
- Database signature harus sering diperbarui.
Catatan: Misra subbab 17.2 (hlm. 428-429). Pendekatan ketiga, *specification-based*, mendeteksi pelanggaran terhadap spesifikasi protokol; sudah diterapkan untuk banyak protokol routing MANET, termasuk AODV (hlm. 436).

<!-- slide: points -->
kicker: IDS DI MANET
judul: IDS konvensional tidak cocok untuk MANET
teks: Misra subbab 17.3 (hlm. 429-430).
- Tanpa titik pusat | Tidak ada router atau gateway tempat memantau semua trafik; tiap node hanya melihat sebagian.
- Mobilitas | Sulit membedakan node yang diretas dari node yang belum menerima pembaruan.
- Sumber daya terbatas | Agen IDS yang terdistribusi harus hemat bandwidth, prosesor, dan daya.
Catatan: Karena itu IDS di MANET umumnya terdistribusi dan kooperatif: tiap node menjalankan agen, lalu bertukar bukti dengan tetangga atau dengan cluster head.

<!-- slide: points -->
kicker: WATCHDOG
judul: Menguping apakah paket diteruskan
teks: Misra subbab 17.4.2.1 (hlm. 444-445) menjelaskan mekanisme deteksi node nakal yang paling awal.
- Cara kerjanya | Node menyimpan salinan paket, lalu menguping apakah node berikutnya benar meneruskannya.
- Ambang kegagalan | Jika hitungan kegagalan melewati ambang, node itu dilaporkan ke sumber.
- Pathrater | Memilih jalur paling andal, bukan paling pendek, berdasarkan penilaian tiap node.
Catatan: Misra hlm. 444-445. Hasil simulasinya: throughput naik 17% saat 40% node nakal pada mobilitas sedang, dengan overhead 9 sampai 17 persen. Kelemahannya: tidak bisa mendeteksi serangan kolaboratif dan pembuangan sebagian, dan hanya cocok untuk protokol *source routing*.

<!-- slide: points -->
kicker: BATAS PENGUPINGAN
judul: Kapan watchdog salah menilai
teks: Misra hlm. 444-445 mendaftar kondisi yang membuat pengupingan keliru.
- Tabrakan | Tabrakan yang ambigu atau tabrakan di penerima membuat penerusan tidak terdengar.
- Daya pancar diatur | Node bisa mengatur daya agar pengintai mengira paket sudah dikirim.
- Laporan palsu | Node bisa menuduh node lain berperilaku nakal.
Catatan: Misra hlm. 444-445. Kelemahan lain yang dicatat: watchdog tetap meneruskan paket milik node nakal, jadi justru menguntungkan mereka. Skema *nodes bearing grudges* menjawabnya dengan berhenti meneruskan paket node tersebut (hlm. 445-446).

<!-- slide: points -->
kicker: TRUST MANAGEMENT
judul: Sistem trust punya tiga komponen
teks: Trust adalah prediksi tindakan node di masa depan; reputasi adalah opini berdasarkan tindakan masa lalu (Misra subbab 19.3.1, hlm. 478-479).
- Pengelola bukti | Mengumpulkan dan mengelompokkan bukti perilaku node.
- Model matematis | Mengubah bukti menjadi opini, lalu memprediksi interaksi berikutnya.
- Pengelola kebijakan | Menetapkan aturan keputusan, misalnya ikutkan node dalam rute atau tidak.
Catatan: Misra subbab 19.3.2 (hlm. 479). CONFIDANT yang dibahas di minggu 4 adalah contoh sistem reputasi yang dianalisis di subbab 19.4.4.

<!-- slide: compare -->
kicker: JENIS BUKTI
judul: Bukti keras dan bukti perilaku
kolom: Hard evidence
- Berupa kredensial, misalnya sertifikat digital.
- Dievaluasi dengan kriptografi.
- Kebijakannya sederhana: identitas cocok atau tidak.
- Cocok untuk organisasi dengan otoritas terpusat.
kolom: Soft evidence
- Berupa bukti perilaku node yang diamati.
- Dikumpulkan lewat pemantauan pasif, pengakuan, atau IDS.
- Bisa menghadapi serangan jenis baru tanpa mengubah protokol.
- Menuntut model matematis untuk mengubahnya jadi opini.
Catatan: Misra hlm. 479-480. Karena MANET tidak punya hierarki dan otoritas pusat, sistem trust di MANET hampir selalu terdesentralisasi dan dipasang di tiap node.

<!-- slide: points -->
kicker: KEPUTUSAN TRUST
judul: Enam keputusan yang diambil node
teks: Misra hlm. 480 mendaftar keputusan sederhana yang dijalankan sistem trust.
- Soal rute | Menerima atau menolak rute yang baru ditemukan, dan jalur mana yang dipakai.
- Soal paket | Mengirim atau meneruskan paket atas nama node lain.
- Soal opini | Menerima atau mengabaikan rekomendasi, dan memperingatkan node lain atau tidak.
Catatan: Misra hlm. 480. Model matematis yang dipakai beragam: berbasis teori graf, berbasis entropi, dan berbasis logika Bayes. Rekomendasi antar-node membuat hubungan tak langsung, tanpa perlu otoritas yang lebih tinggi.

<!-- slide: points -->
kicker: CEK PEMAHAMAN
judul: Jawab singkat sebelum jeda
- Anomali atau misuse | Serangan baru muncul minggu ini. IDS mana yang punya peluang mendeteksinya?
- Watchdog | Sebutkan satu kondisi yang membuat watchdog salah menuduh node jujur.
- Trust | Apa beda bukti keras dan bukti perilaku?
Catatan: Jawaban: (1) berbasis anomali, karena tidak bergantung pada signature yang sudah dikenal; (2) tabrakan, pengaturan daya pancar, atau laporan palsu; (3) yang pertama kredensial kriptografis, yang kedua hasil pengamatan perilaku. Setelah ini, jeda 10 menit.

<!-- slide: section -->
nomor: 03
judul: Menuju proyek akhir
teks: Minggu 9-16 dipakai untuk proyek kelompok. Tema tidak harus dari kedua buku, tetapi tiga arah berikut sudah punya pijakan dari materi.
Catatan: Bagian 3, sekitar 40 menit. Brief lengkap dan rubrik dibagikan terpisah.

<!-- slide: table -->
kicker: PILIHAN TEMA
judul: Tiga arah proyek dan titik awal bacaan
| Tema | Contoh pertanyaan proyek | Titik awal |
|---|---|---|
| VANET | Seberapa cepat pesan peringatan menyebar antarkendaraan? | Misra bab 20, Loo bab 13 |
| Wireless mesh | Apakah metrik ETX memilih rute lebih baik daripada jumlah hop? | Loo bab 16 |
| Keamanan MANET | Seberapa besar PDR turun saat ada black hole? | Misra bab 18 |
Catatan: Semua tema bisa dikerjakan dengan simulator dari minggu 6, dan semuanya menuntut laporan sesuai daftar isi wajib yang sudah kita bahas.

<!-- slide: compare -->
kicker: TEMA 1: VANET
judul: Aplikasi keselamatan dan kenyamanan
kolom: Aplikasi keselamatan
- Peringatan tabrakan, bantuan belok, kondisi jalan.
- Tidak toleran terhadap delay maupun kehilangan paket.
- Pola kirimnya broadcast ke area tertentu (geocast).
- Pesan alarm berprioritas lebih tinggi daripada beacon.
kolom: Aplikasi kenyamanan
- Informasi lalu lintas, navigasi, tol elektronik, unduh peta.
- Perlakuannya mirip aplikasi jaringan biasa.
- Memakai unicast dan broadcast bergantian.
- Diperkirakan tumbuh cepat karena motif bisnis.
Catatan: Loo subbab 13.3 (hlm. 333-334). Pesan alarm dikirim saat ada kejadian, misalnya tabrakan atau permukaan licin; pesan beacon dikirim berkala untuk mencegah kejadian yang belum terjadi.

<!-- slide: points -->
kicker: TEMA 1: METRIK
judul: Rata-rata tidak cukup untuk keselamatan
teks: Loo subbab 13.4 (hlm. 334-335) menjelaskan kenapa evaluasi aplikasi keselamatan berbeda.
- Nilai terburuk | Yang dipantau nilai terburuk tiap kendaraan, bukan rata-rata seluruh jaringan.
- Alasannya | Satu kendaraan yang tidak menerima informasi segar menjadi ancaman bagi yang lain.
- Jarak | Jarak antara pengirim dan penerima menjadi metrik kinerja yang paling penting.
Catatan: Loo hlm. 334-335. Ini contoh bagus bahwa pilihan metrik mengikuti tujuan aplikasi, bukan kebiasaan. Bandingkan dengan metrik umum yang kita pakai di minggu 6.

<!-- slide: points -->
kicker: TEMA 1: MOBILITAS
judul: Model gerak kendaraan menentukan hasil
teks: Misra subbab 20.6 (hlm. 518-519) merangkum model mobilitas untuk VANET.
- RWP tidak cocok | Kendaraan terikat jalan, jadi polanya sama sekali berbeda.
- Berbasis peta | Model memakai peta jalan asli, lalu kendaraan menuju tujuan lewat jalur terpendek.
- STRAW | Menambahkan model ikut-mengikuti, kemacetan, dan pengendalian lalu lintas.
Catatan: Misra hlm. 518-519. Perbandingan AODV dan DSR pada STRAW dan RWP di Chicago dan Boston memberi hasil yang berbeda jauh. Tren berikutnya: memakai jejak kendaraan nyata, misalnya dari simulator lalu lintas mikroskopis.

<!-- slide: points -->
kicker: TEMA 2: WIRELESS MESH
judul: ETX diukur dengan paket probe
teks: Loo subbab 16.7.3 (hlm. 439-440) merinci metrik yang menggantikan jumlah hop.
- Rumusnya | ETX sama dengan satu dibagi hasil kali peluang sukses kirim frame dan peluang sukses ACK.
- Mengukurnya | Tiap node menyiarkan probe pada selang tetap, dan penerima menghitungnya dalam jendela waktu.
- Biaya jalur | ETX sebuah jalur adalah jumlah ETX tiap link di jalur itu.
Catatan: Loo hlm. 439-440. Selang probe divariasikan sampai 10% agar tidak terjadi sinkronisasi dan tabrakan. Karena probe dikirim secara broadcast, overhead ETX lebih kecil daripada metrik berbasis unicast.

<!-- slide: points -->
kicker: TEMA 2: TURUNANNYA
judul: ETT menambahkan ukuran paket
teks: Loo subbab 16.7.4 (hlm. 440) memperluas ETX untuk jaringan dengan bandwidth berbeda.
- ETT | ETX yang disesuaikan bandwidth: ETX dikali ukuran paket dibagi bandwidth link.
- Jalur satu kanal | ETT jalur adalah jumlah ETT tiap link.
- Multikanal | Dua hop di kanal sama saling mengganggu, jadi WCETT menambahkan koreksi.
Catatan: Loo hlm. 440. Untuk proyek akhir, perbandingan hop count, ETX, dan ETT pada topologi mesh yang sama sudah cukup menjadi satu studi utuh.

<!-- slide: points -->
kicker: TEMA 3: KEAMANAN
judul: Ukur dampaknya, bukan hanya jelaskan
teks: Arah ketiga memakai bab 17 dan 18 sebagai dasar, dengan pengukuran sebagai intinya.
- Rancangan | Jalankan skenario yang sama dengan dan tanpa node penyerang.
- Yang diukur | Penurunan PDR, kenaikan delay, dan perubahan overhead kontrol.
- Perluasannya | Tambahkan mekanisme deteksi, lalu ukur berapa banyak kerugian yang bisa dipulihkan.
Catatan: Angka pembanding dari Misra hlm. 445: watchdog dan pathrater menaikkan throughput 17% saat 40% node nakal, dengan overhead 9 sampai 17 persen. Mahasiswa bisa mengukur apakah hasil serupa muncul di skenario mereka.

<!-- slide: table -->
kicker: RINGKASAN
judul: Delapan minggu dalam satu tabel
| Minggu | Yang dibawa ke proyek |
|---|---|
| 1-2 | MANET tanpa infrastruktur; rute dibangun proaktif, reaktif, atau hibrid |
| 3-4 | Broadcast hemat, multicast, posisi, klaster, dan kooperasi node |
| 5-6 | Model mobilitas dan propagasi, simulator, serta metrik evaluasi |
| 7 | QoS, delay, kongesti, dan efisiensi energi |
| 8 | Serangan, deteksi, dan trust sebagai lapisan terakhir |
Catatan: Tekankan bahwa proyek akhir menuntut dua hal sekaligus: pertanyaan yang jelas dan metodologi yang bisa diperiksa ulang orang lain.

<!-- slide: points -->
kicker: KUIS
judul: Kerjakan berpasangan, 15 menit
- Rushing | Kenapa rushing hanya berlaku untuk protokol reaktif?
- Black hole atau gray hole | Mana yang lebih sulit dideteksi, dan kenapa?
- Rancang proyek | Tulis satu pertanyaan proyek, metrik yang akan diukur, dan skenario pembandingnya.
Catatan: Kunci soal 1: node reaktif hanya meneruskan RREQ pertama untuk tiap discovery; penyerang yang meneruskan paling cepat otomatis masuk rute. Soal 3 menjadi bahan awal proposal kelompok minggu depan.

<!-- slide: closing -->
judul: Menuju proyek
teks: Bentuk kelompok dan pilih tema sebelum pertemuan 9.
Catatan: Pertemuan 9 membuka fase proyek akhir: presentasi rencana tiap kelompok.
