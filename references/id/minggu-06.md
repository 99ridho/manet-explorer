---
minggu: 6
judul: Pemodelan, Simulasi, dan Evaluasi Kinerja
dosen: Muhammad Ridho Kurniawan Pratama, M.T.I.
sumber:
  - Loo, Lloret & Ortiz (2012), *Mobile Ad Hoc Networks*, bab 3 dan 4
  - Misra, Woungang & Misra (2009), *Guide to Wireless Ad Hoc Networks*, bab 1 dan 4
---

# Minggu 6: Pemodelan, Simulasi, dan Evaluasi Kinerja

Rujukan: Loo bab 3 (hlm. 37-70), Loo bab 4 (hlm. 71-102), Misra subbab 1.3.5 (hlm. 21-22) dan 4.3.4 (hlm. 87-88).
Durasi: 150 menit (3 SKS).

<!-- slide: cover -->
kicker: PERTEMUAN 6 · INTEGRASI JARINGAN MANDIRI/MOBILE
judul: Pemodelan, Simulasi, dan Evaluasi Kinerja
subjudul: Integrasi Jaringan Mandiri/Mobile · Pertemuan 6
Catatan: Pertemuan ini menyiapkan alat kerja untuk proyek akhir. Bawa laptop jika memungkinkan.

<!-- slide: disclosure -->

<!-- slide: agenda -->
kicker: TUJUAN PERTEMUAN
judul: Setelah pertemuan ini, Anda dapat:
- Memilih model jaringan | Unit disk graph dan alternatifnya, beserta asumsinya.
- Membandingkan simulator | ns-2, OMNeT++, OPNET, TOSSIM, dan kegunaannya.
- Menentukan metrik evaluasi | PDR, delay end-to-end, overhead kontrol.
- Menyusun skenario simulasi yang jujur | Daftar periksa sebelum menjalankan simulasi.
Catatan: Minggu 5 membahas model mobilitas dan propagasi; minggu ini menyatukannya di simulator.

<!-- slide: agenda -->
kicker: ALUR 150 MENIT
judul: Tiga bagian dan satu sesi kuis
- Bagian 1: model jaringan (50 menit) | Graf, topology control, dan keterbatasannya.
- Bagian 2: simulator (45 menit) | ns-2, TOSSIM, OPNET, OMNeT++, dan batasnya masing-masing.
- Bagian 3: membaca hasil (35 menit) | Metrik, studi kasus Loo bab 4, dan daftar periksa.
- Kuis dan diskusi (20 menit) | Dikerjakan berpasangan di akhir pertemuan.
Catatan: Sisipkan jeda 10 menit setelah bagian 2. Cek pemahaman singkat ada di akhir tiap bagian.

<!-- slide: section -->
nomor: 01
judul: Model menyederhanakan jaringan
teks: Model adalah representasi sederhana dari sistem nyata. Simulasi menjalankan model itu untuk mengamati perilakunya.
Catatan: Bagian 1, sekitar 50 menit. Loo bab 3 subbab 3.1-3.2 (hlm. 37-57).

<!-- slide: points -->
kicker: KENAPA SIMULASI
judul: Percobaan nyata sering tidak mungkin
teks: Loo hlm. 39 dan 58 menjelaskan alasan komunitas riset memakai simulator.
- Skalanya | MANET bisa berisi ratusan node yang bergerak di area luas.
- Biayanya | Tidak realistis membiayai percobaan harian dengan ratusan node bergerak.
- Kondisinya | Sebagian aplikasi memang tidak mungkin diuji langsung di lapangan.
Catatan: Loo hlm. 39 dan 58. Tantangan simulator adalah menyeimbangkan detail dan kecepatan; makin banyak lapisan OSI yang dimodelkan, makin lambat simulasinya.

<!-- slide: points -->
kicker: TANTANGAN
judul: Algoritma harus jalan tanpa peta
teks: Loo subbab 3.1.1 (hlm. 39) merangkum kesulitan memindahkan hasil teori graf ke MANET nyata.
- Masalahnya NP-complete | Mencari *dominating set* atau CDS minimum tidak bisa diselesaikan persis.
- Jadi dipakai aproksimasi | Solusi suboptimal dengan heuristik menjadi satu-satunya pilihan realistis.
- Syarat tambahannya | Algoritmanya harus terdistribusi, tanpa pengetahuan global, hanya lewat pesan ke tetangga.
Catatan: Loo hlm. 39. Contoh lain: *vertex cover* untuk menempatkan robot di sudut labirin agar tiap robot terlihat oleh robot lain. Pertimbangan nyata seperti umur baterai dan mobilitas ditambahkan belakangan sebagai penyesuaian.

<!-- slide: table -->
kicker: MODEL JARINGAN
judul: Lima model graf dan sifatnya
| Model | Yang ditangkap | Yang tidak ditangkap |
|---|---|---|
| Unit disk graph | Sifat geometri pancaran radio | Halangan, kualitas sinyal, bobot node |
| Quasi UDG | Link probabilistik lewat parameter q | Sisanya sama seperti UDG |
| Undirected graph | Cocok untuk banyak jenis jaringan | Sifat geometri; menganggap semua link dua arah |
| Directed graph | Node dengan jangkauan pancar berbeda | Sifat geometri, bobot node dan sisi |
| Weighted graph | Bobot node dan sisi, misalnya energi | Sifat geometri transmisi, jadi pesimistis |
Catatan: Loo subbab 3.2.1 (hlm. 40-43). Bobot node bisa berupa mobilitas, energi, atau derajat; bobot sisi bisa kekuatan sinyal atau jarak. Kadang istilah *cost* dipakai menggantikan bobot.

<!-- slide: points -->
kicker: UDG
judul: UDG sederhana tapi terlalu optimis
teks: Loo subbab 3.2.1.1 (hlm. 40-41) menjelaskan model yang paling banyak dipakai.
- Aturannya | Setiap node punya cakram berjari-jari 1, dan dua node terhubung jika jaraknya paling jauh 1.
- Kenapa populer | Sederhana, menangkap sifat siaran radio, dan terbuka untuk analisis teoretis.
- Kelemahannya | Halangan kecil saja sudah mengganggu, dan kualitas sinyal tidak dimodelkan.
Catatan: Loo hlm. 40-41 dan 68. UDG tetap populer untuk area tanpa halangan. Karena tidak memodelkan bobot node, UDG juga tidak cocok untuk memilih rute berdasarkan sisa energi.

<!-- slide: points -->
kicker: QUASI UDG
judul: Satu parameter menambah keraguan
teks: QUDG memberi tiap node dua cakram: jari-jari 1 dan jari-jari q (Loo hlm. 41-42).
- Jarak di bawah q | Pasti ada link antara dua node.
- Antara q dan 1 | Link mungkin ada, mungkin tidak: inilah bagian probabilistiknya.
- Di atas 1 | Tidak ada link sama sekali.
Catatan: Loo hlm. 41-42. Dengan mengatur q, pengaruh halangan kecil di area jaringan bisa ditiru. QUDG dengan q sama dengan 1 kembali menjadi UDG. Sinalgo termasuk simulator yang menyediakan UDG dan QUDG.

<!-- slide: points -->
kicker: TOPOLOGY CONTROL
judul: Struktur graf untuk mengurangi beban
teks: Model topology control dari Loo subbab 3.2.2 (hlm. 43-53). Semuanya mencari subset node atau link yang cukup untuk menjaga jaringan tetap bekerja.
- Independent set | Himpunan node yang tidak saling bertetangga.
- Dominating set | Setiap node berada di dalam himpunan atau bertetangga dengan anggotanya. Ingat CDS di minggu 3.
- Spanning tree | Pohon yang menghubungkan semua node tanpa siklus.
Catatan: Loo hlm. 43-48. Keterbatasan umum model-model ini: semuanya dipelajari di atas model jaringan yang sederhana (hlm. 68). Loo juga membahas *graph matching*, *vertex cover*, dan *Steiner tree*.

<!-- slide: points -->
kicker: INDEPENDENT SET
judul: Maximal belum tentu maximum
teks: Loo subbab 3.2.2.1 (hlm. 43-45) membedakan tiga bentuk himpunan bebas.
- Maximal | Tidak bisa ditambah lagi anggotanya, tetapi bukan yang terbesar.
- Maximum | Himpunan bebas dengan jumlah node terbanyak; mencarinya NP-hard.
- Berbobot | Yang dimaksimalkan total bobotnya, bukan jumlah anggotanya.
Catatan: Loo hlm. 43-45 (Gambar 3.6). Dipakai untuk penempatan fasilitas dan pembentukan tulang punggung; node terpilih bisa menjadi *cluster head*. Algoritma Chatterjee memakai perbandingan ID dan pesan IamInTheSet serta NotInTheSet.

<!-- slide: points -->
kicker: DOMINATING SET
judul: Tiga kelas dominating set
teks: Loo subbab 3.2.2.2 (hlm. 45-46) membagi *dominating set* menurut hubungan antaranggotanya.
- Independent DS | Tidak ada anggota yang bertetangga, jadi tidak ada cluster head berdampingan.
- Weakly connected DS | Subgraf yang diinduksi lemah tetap terhubung; dipakai agar cluster head bisa berkomunikasi.
- Connected DS | Anggotanya saling terhubung; mudah untuk broadcast dan tulang punggung virtual.
Catatan: Loo hlm. 45-46 (Gambar 3.8). Algoritma Wu tiga langkah: tiap node mencari himpunan tetangganya, menukarnya dengan tetangga, lalu menandai dirinya masuk CDS jika punya dua tetangga yang tidak saling bertetangga.

<!-- slide: points -->
kicker: SPANNING TREE
judul: Pohon dibangun dari serpihan
teks: Loo subbab 3.2.2.3 (hlm. 46-48) membahas pohon rentang dan versi minimumnya.
- Gunanya | Mengantar data dari sumber ke sink dan untuk multicast.
- Algoritma Gallager | Tiap node mulai sebagai serpihan sendiri, lalu serpihan digabung lewat sisi keluar terkecil.
- Aturan penggabungan | Serpihan berlevel lebih rendah langsung diserap; yang setara bergabung menjadi level berikutnya.
Catatan: Loo hlm. 46-48 (Gambar 3.10 dan 3.11). Algoritma Erciyes membangun pohon berklaster dari node akar dengan parameter *depth* yang mengatur diameter klaster: penerima pesan dengan nhops nol menjadi subroot, di bawah depth menjadi node antara, dan sama dengan depth menjadi daun.

<!-- slide: compare -->
kicker: INTERFERENSI
judul: Hitung dari pengirim, atau dari penerima
kolom: Sender-centric
- Pertanyaannya: berapa node terganggu oleh satu link?
- Cakupan sisi dihitung dari gabungan dua cakram.
- LIFE mengaktifkan sisi mulai dari cakupan terkecil.
- LISE menambahkan faktor jarak agar link tidak terlalu panjang.
kolom: Receiver-centric
- Pertanyaannya: berapa node yang bisa mengganggu satu node?
- Interferensi diukur dari jumlah cakram yang memuat node itu.
- Terbukti menghasilkan topologi dengan interferensi lebih rendah.
- NCC menghubungkan komponen ke tetangga terdekatnya.
Catatan: Loo hlm. 50-51 (Gambar 3.15 dan 3.16). Dugaan lama bahwa derajat node rendah otomatis menekan interferensi ternyata salah, jadi algoritma baru menangani interferensi secara eksplisit. Tren terbaru memakai model SINR, bukan model teori graf.

<!-- slide: points -->
kicker: CEK PEMAHAMAN
judul: Jawab singkat sebelum lanjut
- UDG di gedung | Kenapa UDG kurang cocok untuk simulasi di dalam gedung kampus?
- Pilih model | Jaringan dengan node berjangkauan pancar berbeda: model graf mana yang dipakai?
- CDS | Apa keunggulan connected dominating set dibanding independent dominating set?
Catatan: Jawaban: (1) halangan kecil pun mengganggu transmisi, dan UDG tidak memodelkan kualitas sinyal; (2) graf berarah, karena link bisa satu arah; (3) anggotanya saling terhubung, jadi bisa dipakai sebagai tulang punggung dan mempermudah broadcast.

<!-- slide: section -->
nomor: 02
judul: Memilih simulator
teks: Simulator menyeimbangkan detail dan kecepatan. Semakin detail lapisan bawahnya, semakin lambat simulasinya.
Catatan: Bagian 2, sekitar 45 menit. Loo subbab 3.3 (hlm. 57-68).

<!-- slide: table -->
kicker: SIMULATOR
judul: Simulator yang dibahas Loo bab 3
| Simulator | Ciri utama | Catatan |
|---|---|---|
| ns-2 | C++ untuk protokol, OTcl untuk skenario | Event-driven, satu thread; punya kelas *mobilenode* |
| TOSSIM | Simulator untuk aplikasi TinyOS | Fokus pada jaringan sensor; hanya platform mica |
| OPNET | Simulator komersial, lisensi gratis untuk pendidikan | Dipakai Loo bab 4 membandingkan AODV, DSR, OLSR |
| OMNeT++ | Modul C++ bersarang, diatur dengan bahasa NED | IDE berbasis Eclipse; mendukung simulasi paralel |
| GloMoSim | Ditulis dengan Parsec, berlapis seperti OSI | Belum mendukung jaringan kabel |
| Sinalgo | Fokus pada verifikasi algoritma jaringan | Sanggup lebih dari 100.000 node; punya UDG dan QUDG |
Catatan: Loo subbab 3.3.3-3.3.7 (hlm. 59-65). Untuk praktikum dan proyek, dosen dapat memakai ns-3, penerus ns-2; ns-3 disebut di Loo hlm. 66 tetapi tidak dibahas rinci di buku ini.

<!-- slide: points -->
kicker: NS-2
judul: Tiga langkah menjalankan simulasi
teks: Loo subbab 3.3.3.2 (hlm. 60) memerinci cara kerja ns-2, simulator paling banyak dipakai.
- Tulis protokolnya | Kode C++ dan OTcl ditambahkan ke basis sumber ns-2.
- Tulis skenarionya | Skrip OTcl memuat node, gerak, dan waktu mulai serta selesai simulasi.
- Ambil hasilnya | Lewat berkas trace bawaan atau keluaran yang dicetak protokol sendiri.
Catatan: Loo hlm. 60. Dua cara pemantauan bawaan: *trace* mencatat tiap paket yang tiba, pergi, atau dibuang, sedangkan *monitor* mencatat besaran agregat seperti jumlah paket dan byte.

<!-- slide: points -->
kicker: SKRIP OTCL
judul: Yang harus Anda tentukan sendiri
teks: Loo hlm. 60 mendaftar parameter yang wajib diisi saat menyiapkan node di ns-2.
- Lapisan fisik | Jenis kanal, model propagasi radio, jenis antarmuka jaringan, dan model antena.
- Lapisan bawah | Jenis MAC, jenis dan ukuran antrean antarmuka, serta jenis link layer.
- Skenario | Posisi awal node, pola gerak, luas area, dan waktu mulai serta selesai.
Catatan: Loo hlm. 60. Daftar ini sekaligus menjadi daftar yang wajib dilaporkan di proyek akhir, sejalan dengan daftar dokumentasi Misra bab 11 di minggu 5.

<!-- slide: points -->
kicker: BATAS NS-2
judul: Yang tidak dimodelkan ns-2
teks: Loo subbab 3.3.8 (hlm. 65-66) menyebut keterbatasan yang perlu Anda sadari sebelum menyimpulkan.
- Lingkungan kosong | Area dianggap datar dan kosong, tanpa gedung, orang, atau kendaraan.
- Jangkauan mendadak | Kapasitas transmisi turun dari penuh ke nol begitu node keluar area cakupan.
- Skalanya | Simulasi menjadi sangat berat di atas beberapa ratus node; Loo menyebut batas sekitar 500 node.
Catatan: Loo hlm. 65-66 (Tabel 3.6). Kelemahan lain: hierarki kelas ns-2 rumit, mempelajarinya bisa makan waktu berminggu-minggu, dan penelusuran hasil menuntut penguraian berkas keluaran.

<!-- slide: points -->
kicker: SIMULATOR LAIN
judul: Tiap simulator punya langit-langit
teks: Loo hlm. 65-67 membandingkan batas praktis beberapa simulator.
- TOSSIM | Sanggup ribuan node sensor dan memodelkan interferensi di tingkat bit, tetapi tanpa mobilitas di versi 2.x.
- OMNeT++ | Mudah dikembangkan lewat IDE Eclipse, tetapi terbatas sekitar 2.000 node.
- OPNET | Mesin simulasi cepat dan lengkap, tetapi komersial dan kurang mengikuti jaringan nirkabel terbaru.
Catatan: Loo hlm. 65-67. TOSSIM punya kemampuan *bridging*: kode yang diuji bisa langsung dijalankan di perangkat mote. Semua simulator ini sama-sama lemah dalam memodelkan pengaruh lingkungan terhadap propagasi sinyal.

<!-- slide: compare -->
kicker: BUAT SENDIRI
judul: Buat sendiri: cepat, sulit dibandingkan
kolom: Kelebihan
- Cocok saat simulator yang ada tidak memadai.
- Implementasinya sederhana: tiap node satu *thread*.
- Komunikasi antarnode lewat memori bersama.
- Topologi disimpan sebagai matriks ketetanggaan.
kolom: Kekurangan
- Tidak ada lingkungan yang baku.
- Studi perbandingan jadi kurang tepercaya.
- Perlu menangani masalah *mutual exclusion*.
- Skenario gerak harus dibuat sendiri dari nol.
Catatan: Loo subbab 3.3.2 (hlm. 58-59). Skenario mobilitas ditiru dengan mengubah matriks tetangga secara wajar. Untuk proyek akhir, pilihan ini hanya masuk akal jika tujuannya menguji satu algoritma, bukan membandingkan protokol.

<!-- slide: points -->
kicker: CEK PEMAHAMAN
judul: Jawab singkat sebelum jeda
- Pilih simulator | Untuk 1.500 node bergerak, ns-2 atau OMNeT++? Apa pertimbangannya?
- Batas ns-2 | Sebutkan satu hal di dunia nyata yang tidak dimodelkan ns-2.
- Trace | Apa beda *trace* dan *monitor* di ns-2?
Catatan: Jawaban: (1) OMNeT++ masih sanggup sampai sekitar 2.000 node, ns-2 berat di atas beberapa ratus; (2) gedung, orang, kendaraan, dan penurunan sinyal bertahap; (3) trace mencatat tiap paket, monitor mencatat besaran agregat. Setelah ini, jeda 10 menit.

<!-- slide: section -->
nomor: 03
judul: Membaca hasil evaluasi
teks: Protokol yang unggul di satu skenario bisa kalah di skenario lain. Metrik dan skenario harus jelas sebelum membandingkan.
Catatan: Bagian 3, sekitar 35 menit. Loo subbab 4.5 (hlm. 81-97) dan Misra subbab 4.3.4 (hlm. 86-87).

<!-- slide: points -->
kicker: METRIK
judul: Tiga metrik yang paling sering dipakai
teks: Misra subbab 4.3.4 (hlm. 86-87) menyebut kriteria umum pembanding protokol routing.
- Packet delivery ratio | Seberapa andal protokol mengantar data dari sumber ke tujuan.
- Delay end-to-end | Waktu paket dari sumber sampai tujuan, termasuk waktu mencari rute.
- Overhead kontrol | Jumlah pesan routing yang dikirim untuk merawat rute.
Catatan: Misra juga menyebut overhead pemrosesan dan kebutuhan memori. Untuk mobilitas, Misra bab 10 (hlm. 250) menambah metrik yang tidak bergantung protokol: durasi link dan ketersediaan jalur.

<!-- slide: points -->
kicker: STUDI KASUS
judul: Test bench Loo bab 4 secara rinci
teks: Loo subbab 4.5.1 (hlm. 81-82) memerinci skenario yang dipakai membandingkan AODV, DSR, dan OLSR.
- Ukuran jaringan | 50 node di area 500 m persegi, 100 node di 750 m persegi, 250 node di 1 km persegi.
- Perangkatnya | Prosesor 40 MHz, memori 512 KB, kanal di bawah 1 Mbps, frekuensi 2,4 GHz, jangkauan 50 m.
- Trafiknya | Poisson dengan rata-rata antarkedatangan 30 detik, ukuran paket eksponensial rata-rata 1024 bit.
Catatan: Loo hlm. 81-82. Trafik disuntikkan 100 detik setelah simulasi dimulai, dan alamat tujuannya acak. Kegagalan node sengaja dipaksakan agar perilaku jaringan terhadap perubahan topologi ikut terukur.

<!-- slide: compare -->
kicker: HASILNYA
judul: OLSR menang di satu sisi, kalah di sisi lain
kolom: Yang dimenangkan OLSR
- Trafik routing paling stabil dan paling rendah.
- Tetap stabil walau node banyak dan sering gagal.
- Menurut Loo, paling cocok untuk hampir semua parameter.
- Tidak bergantung pada jumlah node di jaringan.
kolom: Yang dikalahkan OLSR
- Beban MAC paling tinggi karena sifat proaktifnya.
- Throughput terpakai paling besar di antara ketiganya.
- Pada 100 node: 110 Kbps, sedangkan AODV dan DSR 80 Kbps.
- AODV terbaik saat trafik data disuntikkan.
Catatan: Loo subbab 4.5.3-4.5.5 dan 4.6 (hlm. 84-97). Pada 250 node, beban MAC menjadi 200 Kbps untuk OLSR dan 180 Kbps untuk dua lainnya, jadi selisihnya mengecil saat jaringan membesar. Diskusikan: kenapa satu protokol bisa terbaik dan terburuk sekaligus? Jawabannya tergantung metrik yang dilihat.

<!-- slide: points -->
kicker: MEMBACA KRITIS
judul: Dua angka delay di buku yang sama
teks: Loo bab 4 memberi dua pernyataan berbeda tentang delay, dan keduanya perlu Anda sikapi.
- Di subbab 4.5.6 | DSR dan OLSR mendekati nol, sedangkan AODV bertahan sekitar 1 detik setelah konvergen.
- Di kesimpulan 4.6 | Disebut semua protokol mendekati nol, dengan kasus terburuk 1 sampai 3 milidetik.
- Pelajarannya | Periksa bagian hasil, bukan hanya kesimpulan, dan sebutkan sumbernya saat mengutip.
Catatan: Loo hlm. 94 dan 97. Perbedaan ini kemungkinan karena bagian hasil membahas topologi 250 node bergerak dengan kegagalan, sementara kesimpulan merangkum seluruh skenario. Ini contoh bagus untuk melatih mahasiswa membaca laporan simulasi dengan hati-hati.

<!-- slide: points -->
kicker: DAFTAR PERIKSA
judul: Periksa ini sebelum menjalankan simulasi
teks: Diadaptasi dari saran Misra subbab 1.3.5 (hlm. 22).
- Kehilangan paket | Protokol harus tahan terhadap paket hilang. Jika tidak, perbaiki protokolnya.
- Model propagasi | Parameter path loss dan shadowing harus sesuai skenario, termasuk tinggi antena.
- Topologi hasil | Periksa kepadatan, diameter, partisi, dan keberadaan bridge sebelum mengambil kesimpulan.
Catatan: Misra hlm. 22 juga menyarankan menguji protokol dengan berbagai beban dan distribusi trafik, serta memeriksa apakah skenario yang dimasukkan ke simulator memang skenario yang ingin diuji. Ingat data Berlin di minggu 1.

<!-- slide: table -->
kicker: UNTUK PROYEK AKHIR
judul: Isi wajib laporan simulasi
| Bagian | Yang harus ada |
|---|---|
| Model jaringan | Jenis graf atau model propagasi, beserta alasan pemilihannya |
| Skenario | Jumlah node, luas area, jangkauan pancar, pola gerak, dan pola trafik |
| Parameter simulator | Versi simulator, semua nilai parameter, dan perubahan yang Anda buat |
| Pengulangan | Jumlah replikasi, seed acak, dan cara replikasi dilakukan |
| Hasil | Metrik dengan sebarannya, bukan hanya nilai rata-rata |
| Keterbatasan | Hal yang tidak dimodelkan dan pengaruhnya terhadap kesimpulan |
Catatan: Gabungan Loo hlm. 60 dan 81-82 dengan Misra hlm. 22 dan 272-273. Bagikan tabel ini sebagai kerangka bab metodologi laporan proyek akhir.

<!-- slide: table -->
kicker: RINGKASAN
judul: Yang perlu dibawa ke minggu 7
| Gagasan | Intinya |
|---|---|
| Model itu pilihan | Tiap model graf menangkap sesuatu dan mengabaikan yang lain |
| Topology control | Independent set, dominating set, dan spanning tree menekan beban |
| Simulator punya batas | Jumlah node, detail propagasi, dan kemudahan pengembangan |
| Metrik menentukan pemenang | PDR, delay, dan overhead bisa menunjuk protokol berbeda |
| Dokumentasi | Tanpa parameter dan seed, hasil tidak bisa diperiksa ulang |
Catatan: Minggu 7 memakai metrik ini lagi, tetapi dari sisi jaminan layanan: QoS, delay, kongesti, dan energi.

<!-- slide: points -->
kicker: KUIS
judul: Kerjakan berpasangan, 15 menit
- UDG di gedung | Kenapa UDG kurang cocok untuk simulasi di dalam gedung kampus?
- OLSR terbaik? | Di studi Loo bab 4, pada metrik apa OLSR unggul dan pada metrik apa kalah?
- Rancang skenario | Tulis lima parameter simulasi yang wajib Anda laporkan untuk proyek akhir.
Catatan: Soal 3 jadi bahan awal proposal proyek akhir; minta mereka memakai tabel isi wajib laporan tadi sebagai acuan.

<!-- slide: closing -->
judul: Diskusi
teks: Sebelum pertemuan 7, baca Misra bab 12, 13, dan 15, serta Loo bab 8.
Catatan: Pertemuan 7 membahas QoS, delay, kongesti, dan efisiensi energi.
