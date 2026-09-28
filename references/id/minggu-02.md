---
minggu: 2
judul: Routing pada MANET
dosen: Muhammad Ridho Kurniawan Pratama, M.T.I.
sumber:
  - Loo, Lloret & Ortiz (2012), *Mobile Ad Hoc Networks*, bab 2
  - Misra, Woungang & Misra (2009), *Guide to Wireless Ad Hoc Networks*, bab 4
---

# Minggu 2: Routing pada MANET

Rujukan: Loo bab 2 (hlm. 19-36), Misra bab 4 (hlm. 59-96).
Durasi: 150 menit (3 SKS).

<!-- slide: cover -->
kicker: PERTEMUAN 2 · INTEGRASI JARINGAN MANDIRI/MOBILE
judul: Routing pada MANET: Proaktif, Reaktif, dan Hibrid
subjudul: Integrasi Jaringan Mandiri/Mobile · Pertemuan 2
Catatan: Pertemuan 1 membahas apa itu MANET. Hari ini kita menjawab pertanyaan berikutnya: kalau tidak ada router tetap, bagaimana paket sampai ke tujuan?

<!-- slide: disclosure -->

<!-- slide: agenda -->
kicker: TUJUAN PERTEMUAN
judul: Setelah pertemuan ini, Anda dapat:
- Menjelaskan kenapa routing kabel tidak cukup | Topologi MANET berubah, link bisa satu arah, dan tidak ada pusat kendali.
- Membedakan proaktif, reaktif, dan hibrid | Kapan rute disiapkan, dan berapa ongkos overhead-nya.
- Menelusuri route discovery AODV | Dari RREQ yang di-*flood* sampai RREP yang kembali ke sumber.
- Memilih protokol untuk skenario tertentu | Berdasarkan mobilitas, ukuran jaringan, dan pola trafik.
Catatan: Empat tujuan ini jadi kerangka kuis di akhir sesi.

<!-- slide: agenda -->
kicker: ALUR 150 MENIT
judul: Tiga bagian dan satu sesi kuis
- Bagian 1: kenapa routing MANET sulit (40 menit) | Contoh kecil, tuntutan desain, dan taksonomi protokol.
- Bagian 2: proaktif dan reaktif (50 menit) | DSDV, WRP, CGSR, FSR, OLSR, lalu AODV, DSR, TORA.
- Bagian 3: hibrid dan pemilihan (40 menit) | ZRP, SHARP, kriteria evaluasi, dan cara memilih.
- Kuis dan diskusi (20 menit) | Dikerjakan berpasangan di akhir pertemuan.
Catatan: Sisipkan jeda 10 menit setelah bagian 2. Cek pemahaman singkat ada di akhir tiap bagian.

<!-- slide: section -->
nomor: 01
judul: Setiap node juga router
teks: Di MANET tidak ada router khusus. Node yang mengirim data juga meneruskan paket milik node lain.
Catatan: Bagian 1, sekitar 40 menit. Loo bab 2 subbab 2.6 (hlm. 31-32): semua host berperan sebagai router dan ikut menemukan serta merawat rute.

<!-- slide: context -->
kicker: KASUS PALING SEDERHANA
judul: Tiga node: informasi tetangga sudah cukup
teks: A dan B saling bertetangga, B dan C juga. A dan C tidak, karena jangkauan pancar keduanya tidak saling menutupi.
A tahu B, C juga tahu B, jadi keduanya cukup memakai B sebagai perantara. Di sini belum perlu protokol routing.
graf:
  simpul: A@0,0 B@1,0 C@2,0
  sisi: A-B B-C
  jalur: A>B>C
  peran: A=sumber C=tujuan
  keterangan: Hanya ada satu pilihan jalur, jadi tidak ada keputusan yang perlu diambil.
Catatan: Misra Contoh 4.1 (hlm. 61-62, Gambar 4.2). Mulai dari sini supaya mahasiswa melihat bahwa routing baru jadi masalah ketika pilihan jalur bertambah.

<!-- slide: context -->
kicker: TAMBAH SATU NODE
judul: Empat node, empat pilihan jalur
teks: Dengan tambahan node D, paket dari A ke C bisa lewat A-B-C, A-D-C, A-D-B-C, atau A-B-D-C.
Di sinilah protokol routing dibutuhkan: memilih satu jalur terbaik dan memperbaruinya saat node bergerak.
graf:
  simpul: A@0,1 B@1,2 D@1,0 C@2,1
  sisi: A-B A-D B-C D-C B-D
  peran: A=sumber C=tujuan
  keterangan: Empat jalur mungkin dari A ke C. Protokol routing yang memilih.
Catatan: Misra Contoh 4.2 (hlm. 62-63, Gambar 4.3). Misra menekankan bahwa memberi seluruh informasi topologi ke setiap node tidak efisien untuk MANET.

<!-- slide: points -->
kicker: TUNTUTAN DESAIN (1)
judul: Routing MANET bekerja tanpa pusat
teks: Misra subbab 4.3.1 (hlm. 63-64) mendaftar sifat yang diharapkan. Tiga yang paling menentukan:
- Terdistribusi | Setiap node mengambil keputusan routing bersama tetangganya. Tidak ada entitas pusat yang bisa ditunggu.
- Siap untuk link satu arah | Kondisi fisik radio bisa membuat link hanya bekerja satu arah, jadi protokol tidak boleh menganggap semua link dua arah.
- Hemat daya | Beban routing sebaiknya dibagi rata ke node yang ikut serta, karena semua memakai baterai.
Catatan: Misra hlm. 63. Misra menambahkan bahwa protokol yang terdistribusi tetapi secara virtual terpusat bisa jadi ide yang baik.

<!-- slide: points -->
kicker: TUNTUTAN DESAIN (2)
judul: Tiga tuntutan yang sering terlupa
teks: Tiga sifat berikutnya dari daftar yang sama (Misra hlm. 64).
- Sadar keamanan | Medium nirkabel mudah diserang, jadi perlu autentikasi, nirsangkal, dan enkripsi.
- Condong ke hibrid | Misra menyarankan protokol lebih reaktif daripada proaktif untuk menekan overhead.
- Sadar QoS | Protokol perlu tahu delay dan throughput rute, serta memperkirakan umur rute itu.
Catatan: Misra hlm. 64. Keamanan dibahas di minggu 8, QoS di minggu 7. Catat bahwa tidak ada satu protokol yang memenuhi semuanya sekaligus.

<!-- slide: points -->
kicker: TEKNIK PENENTUAN JALUR
judul: Tiga teknik di balik semua protokol
teks: Loo subbab 2.1 (hlm. 20) memakai teknik ini untuk membedakan protokol.
- Hop count | Tiap node menyimpan informasi *next hop* menuju tujuan di tabel rutenya.
- Link state | Tiap node menyimpan topologi lengkap, lalu menghitung jalur terpendek dari biaya link.
- Source routing | Setiap paket data membawa informasi rutenya sendiri di header.
Catatan: Loo hlm. 20, Gambar 2.1. Dua algoritma dasarnya: Bellman-Ford untuk distance vector dan Dijkstra untuk link state (Loo hlm. 32).

<!-- slide: compare -->
kicker: DUA STRATEGI DASAR
judul: Proaktif menyiapkan rute, reaktif mencarinya
kolom: Proaktif (*table-driven*)
- Rute ke semua tujuan selalu tersedia di tabel.
- Topologi disebar berkala dan saat ada perubahan.
- Overhead kontrol tinggi, tetap jalan walau tidak ada data.
- Cocok untuk jaringan dengan mobilitas rendah.
kolom: Reaktif (*on-demand*)
- Rute dicari hanya saat sumber punya data.
- *Route discovery* memakai *flooding* RREQ.
- Overhead rendah, tapi ada jeda sebelum paket pertama terkirim.
- Rute dirawat lewat *route maintenance* sampai tak dipakai.
Catatan: Ringkasan dari Loo subbab 2.2-2.3 (hlm. 20-22) dan Misra subbab 4.3.2 (hlm. 64-65). Loo menyebut pendekatan proaktif paling cocok untuk jaringan yang node-nya jarang atau tidak bergerak.

<!-- slide: table -->
kicker: PERBANDINGAN DASAR
judul: Tiga kelas protokol berdampingan
| Aspek | Proaktif | Reaktif | Hibrid |
|---|---|---|---|
| Organisasi jaringan | Flat atau hierarkis | Flat | Hierarkis |
| Penyebaran topologi | Berkala | Saat dibutuhkan | Keduanya |
| Latensi rute | Selalu tersedia | Ada jeda pencarian | Keduanya |
| Penanganan mobilitas | Update berkala | *Route maintenance* | Keduanya |
| Overhead komunikasi | Tinggi | Rendah | Sedang |
Catatan: Loo Tabel 2.1 (hlm. 23). Minta mahasiswa menebak kolom mana yang paling cocok untuk kelas ini jika semua laptop mahasiswa membentuk MANET.

<!-- slide: points -->
kicker: CARA LAIN MENGELOMPOKKAN
judul: Dilihat dari siapa penerimanya
teks: Misra subbab 4.3.2 (hlm. 65) mengelompokkan protokol dari cara paket dikirim.
- Unicast | Satu sumber mengirim ke satu tujuan. Fokus pertemuan hari ini.
- Multicast | Satu pengiriman untuk sekelompok tujuan; salinan dibuat hanya saat jalur bercabang.
- Geocast | Penerimanya semua node di dalam satu wilayah geografis tertentu.
Catatan: Misra hlm. 65-66. Protokol multicast dibagi lagi menjadi berbasis pohon dan berbasis mesh: mesh memakai beberapa rute, pohon hanya satu dan delay-nya lebih kecil. Minggu 3 membahas ketiganya.

<!-- slide: points -->
kicker: CEK PEMAHAMAN
judul: Jawab singkat sebelum lanjut
- Empat jalur | Pada contoh A, B, C, D tadi, jalur mana yang dipilih protokol berbasis jumlah hop?
- Biaya proaktif | Kenapa protokol proaktif tetap mengirim pesan walau tidak ada data sama sekali?
- Link satu arah | Kenapa protokol tidak boleh menganggap semua link nirkabel dua arah?
Catatan: Jawaban: (1) A-B-C atau A-D-C, keduanya dua hop; (2) tabel topologi harus tetap mutakhir, jadi update berkala tetap jalan (Loo hlm. 22); (3) kondisi fisik radio bisa membuat link hanya terbuka satu arah (Misra hlm. 63).

<!-- slide: section -->
nomor: 02
judul: Protokol proaktif
teks: DSDV, WRP, CGSR, FSR, dan OLSR menjaga rute ke semua tujuan setiap saat. Bedanya ada pada cara menyebarkan informasi topologi.
Catatan: Bagian 2 bagian pertama, sekitar 25 menit. Loo subbab 2.5.4-2.5.5; Misra subbab 4.3.3.1 (hlm. 66-74).

<!-- slide: points -->
kicker: DSDV
judul: Nomor urut membuat DSDV bebas rute basi
teks: DSDV adalah Bellman-Ford yang diadaptasi untuk MANET (Misra hlm. 66-67; Loo hlm. 28).
- Tabel semua tujuan | Setiap node menyimpan semua tujuan beserta jumlah hop dan *sequence number* yang dibuat oleh node tujuan.
- Nomor urut terbaru menang | Rute dengan *sequence number* lebih baru menggantikan rute lama. Ini mencegah loop dan rute basi.
- Update berkala atau terpicu | Tabel dikirim berkala, dan langsung dikirim begitu ada perubahan penting.
Catatan: Kelemahan yang ditulis Loo (hlm. 28): overhead besar, sehingga DSDV tidak cocok untuk jaringan besar. DSDV juga hanya bekerja dengan link dua arah.

<!-- slide: table -->
kicker: CONTOH TABEL DSDV
judul: Isi tabel penerusan node M2
| Tujuan | Next hop | Metrik | Nomor urut |
|---|---|---|---|
| M1 | M1 | 1 | S593_M1 |
| M2 | M2 | 0 | S983_M2 |
| M3 | M3 | 1 | S193_M3 |
| M4 | M4 | 1 | S233_M4 |
| M5 | M4 | 2 | S243_M5 |
| M6 | M4 | 2 | S053_M6 |
Catatan: Misra Contoh 4.3, Tabel 1.1 (hlm. 67). Tabel aslinya juga punya kolom *install time* untuk menghapus rute basi dan *stable data*. Jika M3 pindah mendekat ke M6, hanya baris M3 yang berubah; M2 mengetahuinya lewat M4.

<!-- slide: compare -->
kicker: DUA JENIS UPDATE DSDV
judul: Full dump atau incremental, pilih situasinya
kolom: Full dump
- Seluruh tabel rute dikirim ke tetangga.
- Dikirim jarang saat node tidak berpindah.
- Dipakai lagi saat node sering bergerak.
- Ukurannya besar, jadi mahal di bandwidth.
kolom: Incremental
- Hanya entri yang berubah yang dikirim.
- Cocok saat jaringan relatif stabil.
- Menghindari trafik tambahan yang tidak perlu.
- Membengkak mendekati ukuran NPDU saat mobilitas tinggi.
Catatan: Misra hlm. 66. Ini jawaban soal 3 di daftar pertanyaan Misra (hlm. 92): saat node sering bergerak, incremental membesar mendekati NPDU, jadi full dump lebih masuk akal.

<!-- slide: points -->
kicker: WRP
judul: WRP menyimpan empat struktur data
teks: WRP termasuk kelas *path-finding*, yaitu algoritma jalur terpendek yang juga menyimpan hop kedua dari terakhir (Misra hlm. 67-69).
- Tabel jarak dan rute | Jarak ke tiap tujuan lewat tiap tetangga, plus pendahulu dan penerus jalur terpilih.
- Tabel biaya link | Biaya relay lewat tiap tetangga dan berapa lama sejak pesan terakhir diterima.
- Daftar retransmisi (MRL) | Mencatat tetangga yang belum mengakui pesan update agar bisa dikirim ulang.
Catatan: Misra hlm. 68. Menyimpan pendahulu dan penerus membantu mendeteksi loop dan menghindari masalah *count-to-infinity*. Jika tidak ada perubahan, tetangga cukup mengirim Hello kosong untuk menandakan masih terhubung.

<!-- slide: points -->
kicker: CGSR
judul: CGSR merutekan lewat cluster head
teks: CGSR memandang jaringan sebagai kumpulan cluster, bukan jaringan flat (Misra hlm. 69-70).
- Cluster head | Dipilih dengan algoritma pemilihan; tiap node menyimpan tabel anggota cluster.
- Gateway | Node yang berada dalam jangkauan dua cluster head atau lebih.
- Jalur paket | Node ke cluster head-nya, ke gateway, ke cluster head berikutnya, sampai tujuan.
Catatan: Misra Contoh 4.4 (hlm. 69-70, Gambar 4.5). CGSR memakai DSDV di bawahnya, jadi overhead-nya sama dengan DSDV. Kelemahannya: pemilihan cluster head yang sering berubah memakan sumber daya.

<!-- slide: points -->
kicker: GSR DAN FSR
judul: Fisheye mengirim yang jauh lebih jarang
teks: GSR menukar vektor link state hanya dengan tetangga, tanpa *flooding*. FSR dibangun di atas GSR (Misra hlm. 70-71).
- Ide fisheye | Node punya informasi paling akurat untuk node terdekat, makin jauh makin jarang diperbarui.
- Lingkup (scope) | Himpunan node yang terjangkau dalam sejumlah hop tertentu dari node pusat.
- Untungnya | Saat paket mendekati tujuan, informasi rute yang tersedia makin akurat.
Catatan: Misra Contoh 4.5 (hlm. 70-71, Gambar 4.6) menggambarkan tiga lingkup: satu, dua, dan tiga hop. FSR menekan ukuran pesan update tanpa menghilangkan sifat proaktif.

<!-- slide: context -->
kicker: OLSR
judul: OLSR hanya meneruskan lewat MPR
teks: Setiap node mengirim pesan Hello dengan TTL 1 untuk mengenal tetangga satu hop. Dari situ node memilih *multipoint relay* (MPR): sebagian tetangga yang cukup untuk menjangkau semua tetangga dua hop.
Hanya MPR yang meneruskan informasi topologi. Setiap node lalu menghitung jalur terpendek dengan algoritma Dijkstra.
graf:
  simpul: A@1,1 B@0,0 D@2,0 E@2,2 C@0,-1 G@3,-1 F@3,1
  sisi: A-B A-D A-E B-C D-G D-F E-F
  peran: A=sumber B=mpr D=mpr
  keterangan: A memilih B dan D sebagai MPR. E tidak perlu meneruskan karena F sudah terjangkau lewat D.
Catatan: Loo subbab 2.5.4 (hlm. 26-28); Misra hlm. 73-74. MPR dipilih dari tetangga satu hop yang link-nya dua arah.

<!-- slide: points -->
kicker: PERAN MPR
judul: Dua optimasi yang menghemat bandwidth
teks: Loo hlm. 28 menyebut dua peran MPR dan efeknya masing-masing.
- Meneruskan broadcast | Dari semua tetangga, hanya MPR yang meneruskan paket broadcast si pemilih.
- Mengumumkan selector | MPR menyiarkan daftar node yang memilihnya ke seluruh jaringan.
- Hasilnya | Peran pertama menekan jumlah pengiriman ulang, peran kedua menekan ukuran paket.
Catatan: Loo hlm. 28. Node yang memilih MPR disebut *selector*. Inilah alasan OLSR jauh lebih hemat daripada link state murni yang membanjiri semua link.

<!-- slide: section -->
nomor: 03
judul: Protokol reaktif
teks: AODV, DSR, dan TORA baru mencari rute ketika sumber punya data. Ongkosnya pindah dari pesan berkala ke jeda pencarian.
Catatan: Bagian 2 bagian kedua, sekitar 25 menit. Loo subbab 2.5.1-2.5.3; Misra subbab 4.3.3.2 (hlm. 73-79).

<!-- slide: context -->
kicker: AODV · LANGKAH 1
judul: RREQ menyebar dan mencatat jalur balik
teks: S ingin mengirim ke D tetapi belum punya rute. S menyiarkan RREQ. Setiap node yang menerima RREQ pertama kali mencatat dari tetangga mana RREQ itu datang, lalu menyiarkannya lagi.
Salinan RREQ berikutnya dibuang. Catatan tadi menjadi *reverse path* menuju S.
graf:
  simpul: S@0,1 A@1,0 B@1,2 C@2,0 E@2,2 D@3,1
  sisi: S-A S-B A-B A-C B-E C-D E-D
  jalur: S>A>C>D S>B>E
  peran: S=sumber D=tujuan
  keterangan: Panah: RREQ yang pertama diterima tiap node. Anggap salinan dari C tiba lebih dulu di D; salinan lewat E dibuang.
Catatan: Misra hlm. 78 (Contoh 4.11) dan Loo hlm. 23. Tanyakan ke kelas: berapa kali RREQ dipancarkan pada topologi ini? Jawaban: setiap node selain D memancarkan sekali.

<!-- slide: context -->
kicker: AODV · LANGKAH 2
judul: RREP pulang lewat jalur yang dicatat
teks: D membalas dengan RREP secara *unicast* menyusuri *reverse path*: D ke C ke A ke S. Setiap node di jalur itu kini menyimpan *next hop* menuju D.
Kalau link di tengah putus, node di ujung link mengirim RERR. Sumber lalu memulai *route discovery* baru.
graf:
  simpul: S@0,1 A@1,0 B@1,2 C@2,0 E@2,2 D@3,1
  sisi: S-A S-B A-B A-C B-E C-D E-D
  jalur: D>C>A>S
  peran: S=sumber D=tujuan
  keterangan: Panah: RREP unicast dari D ke S. Data berikutnya mengalir S, A, C, D.
Catatan: AODV memakai *destination sequence number* untuk memilih rute terbaru. Loo (hlm. 23) mencatat kelemahannya: node perantara bisa menyimpan entri basi jika nomor urutnya lebih tinggi tetapi bukan yang terbaru.

<!-- slide: points -->
kicker: AODV · PERAWATAN RUTE
judul: AODV tidak menambal rute secara lokal
teks: Loo hlm. 23 menjelaskan apa yang terjadi saat sebuah link di tengah rute putus.
- Dua node mengirim RERR | Node di kedua ujung link yang putus memberi tahu node ujung rute.
- Entri dihapus | Node ujung menghapus entri rute yang memakai link itu dari tabelnya.
- Sumber mengulang | Sumber memulai pencarian lagi dengan broadcast ID baru dan nomor urut tujuan sebelumnya.
Catatan: Loo hlm. 23. Bandingkan dengan CBRP dan NAMP di Misra yang justru memperbaiki rute secara lokal (hlm. 77 dan 83). Entri rute yang tidak segera dipakai akan dihapus oleh timer.

<!-- slide: compare -->
kicker: AODV VS DSR
judul: DSR membawa rute lengkap, AODV tidak
kolom: AODV
- Setiap node menyimpan *next hop* per tujuan.
- Entri rute dihapus jika tidak dipakai dalam batas waktu.
- Memakai Hello untuk mengenali tetangga.
- Nomor urut tujuan memilih rute terbaru.
kolom: DSR
- Header paket memuat rute lengkap (*source routing*).
- *Route cache* mengurangi *flooding* ulang.
- Node perantara bisa menjawab RREQ dari cache.
- Header membesar seiring panjang rute.
Catatan: Loo subbab 2.5.1-2.5.2 (hlm. 23-25); Misra hlm. 77-79. Di DSR, node hanya memproses RREQ jika belum pernah memprosesnya dan alamatnya belum ada di rekaman rute.

<!-- slide: context -->
kicker: DSR
judul: Rekaman rute menumpuk di header RREQ
teks: Setiap node yang meneruskan RREQ menambahkan alamatnya ke rekaman rute di header. Tujuan menerima permintaan lewat dua jalur, lalu memilih satu berdasarkan rekaman itu.
Balasan dikirim menyusuri jalur terbalik, dan sumber menyimpan rute lengkap di *route cache*-nya.
graf:
  simpul: S1@0,1 S2@1,2 S3@1,0 S4@2,2 S5@3,2 S6@2,0 S7@4,1
  sisi: S1-S2 S1-S3 S2-S4 S4-S5 S5-S7 S3-S6 S6-S7
  jalur: S1>S2>S4>S5>S7
  peran: S1=sumber S7=tujuan
  keterangan: Rute terpilih pada contoh Misra: S1, S2, S4, S5, S7.
Catatan: Misra Contoh 4.10 (hlm. 77-78, Gambar 4.10). Di tiap hop disimpan rute terbaik dengan hop paling sedikit. Kelemahan DSR: header membesar dan *flooding* RREQ bisa mencapai semua node (Loo hlm. 25).

<!-- slide: points -->
kicker: TORA
judul: TORA memberi arah lewat tinggi node
teks: TORA memakai algoritma *link reversal* dan membentuk graf berarah tanpa siklus (DAG) yang berakar di tujuan (Loo hlm. 25-26).
- Metrik tinggi | Link diberi arah naik atau turun berdasar tinggi relatif node tetangga.
- Tiga fungsi | Pembuatan rute, perawatan rute, dan penghapusan rute.
- Harga yang dibayar | Semua node dianggap punya jam tersinkron, dan bisa terjadi osilasi.
Catatan: Loo hlm. 25-26, Gambar 2.6. Pesan kontrol hanya dikirim ke sedikit node di dekat perubahan topologi. Misra (hlm. 76) menambahkan bahwa TORA sering memilih rute yang paling praktis, bukan yang terpendek. Masalah osilasinya mirip *count-to-infinity*.

<!-- slide: points -->
kicker: METRIK SELAIN HOP
judul: Stabilitas link juga bisa jadi metrik
teks: Dua protokol reaktif di Misra memilih rute bukan dari jumlah hop (hlm. 73-76).
- ABR | Menghitung *associativity tick* dari beacon; nilai tinggi berarti node relatif diam.
- SSA | Memilih rute lewat kanal yang kuat berdasarkan kekuatan sinyal tetangga.
- Kalau seri | Pada ABR, jika beberapa rute sama stabilnya, dipilih yang jumlah hop-nya paling sedikit.
Catatan: Misra hlm. 73-76 (ABR Contoh 4.8, SSA hlm. 75-76). ABR mereset *associativity tick* saat tetangga keluar dari jangkauan. Metrik kualitas link kita temui lagi lewat ETX di minggu 1 dan minggu 8.

<!-- slide: points -->
kicker: CEK PEMAHAMAN
judul: Jawab singkat sebelum jeda
- Salinan RREQ | Kenapa salinan RREQ kedua dan seterusnya dibuang node perantara?
- Cache DSR | Apa untungnya node perantara boleh menjawab RREQ dari cache-nya?
- Tinggi TORA | Apa yang diukur oleh metrik tinggi pada TORA?
Catatan: Jawaban: (1) agar tidak ada loop dan banjir pengiriman ulang; jalur balik sudah dicatat dari salinan pertama; (2) *flooding* berhenti lebih awal sehingga overhead turun (Loo hlm. 25); (3) jarak node penjawab menuju tujuan (Loo hlm. 25). Setelah ini, jeda 10 menit.

<!-- slide: section -->
nomor: 04
judul: Hibrid dan cara memilih
teks: Protokol hibrid memakai pendekatan proaktif di dekat node dan reaktif untuk tujuan yang jauh. Di akhir bagian ini kita pakai kriteria untuk memilih.
Catatan: Bagian 3, sekitar 40 menit. Loo subbab 2.4 dan 2.5.6; Misra subbab 4.3.3.3 dan 4.3.4.

<!-- slide: points -->
kicker: HIBRID
judul: ZRP: proaktif di zona, reaktif di luar
teks: Zona tiap node diukur dalam jumlah hop dari node itu (Loo hlm. 28-29).
- Radius zona | Satu parameter ini menentukan seberapa besar bagian jaringan yang dirawat secara proaktif.
- IARP di dalam zona | Protokol *link state* menjaga rute ke semua node dalam zona, jadi rute dekat langsung tersedia.
- Query ke node pinggir | Tujuan di luar zona dicari dengan mengirim query ke *peripheral node*, bukan *flooding* ke semua node.
Catatan: Misra hlm. 80-81 menambahkan mekanisme *query control*: node yang sudah tercakup zona lain ditandai agar query tidak berputar di area yang sama.

<!-- slide: context -->
kicker: ZRP
judul: Query berjalan dari satu pinggir ke pinggir
teks: Node pinggir (*peripheral node*) adalah node yang jaraknya persis sejauh radius zona. Saat tujuan tidak ada di dalam zona, sumber mengirim query ke node pinggirnya.
Node pinggir memeriksa zonanya sendiri. Kalau tujuan tetap tidak ada, query diteruskan ke node pinggir berikutnya, sampai tujuan ditemukan.
graf:
  simpul: S@0,0 X@1,1 Y@1,-1 A@2,1 B@2,-1 D@4,0
  sisi: S-X S-Y X-A Y-B A-D B-D
  jalur: S>X>A>D
  peran: S=sumber D=tujuan A=mpr B=mpr
  keterangan: A dan B adalah node pinggir zona S. Query diteruskan lewat mereka, bukan lewat flooding.
Catatan: Loo subbab 2.5.6 (hlm. 28-29, Gambar 2.8). Balasan dikirim *unicast* ke sumber. Loo mencatat ZRP menekan delay sekaligus jumlah overhead routing.

<!-- slide: points -->
kicker: SHARP
judul: Zona proaktif tumbuh di tujuan populer
teks: SHARP mengatur sendiri seberapa banyak informasi rute yang disebar proaktif (Misra hlm. 81-82).
- Zona ikut permintaan | Zona proaktif otomatis terbentuk di sekitar tujuan yang sering dicari.
- Ukuran menyesuaikan | Tujuan dengan panggilan terbanyak mendapat zona proaktif terbesar.
- Radius sebagai kenop | Radius zona mengatur campuran proaktif dan reaktif untuk tiap tujuan.
Catatan: Misra Contoh 4.12 (hlm. 81-82, Gambar 4.12). Tujuan yang jarang dipakai tidak mendapat zona proaktif sama sekali, jadi rutenya dicari secara reaktif.

<!-- slide: points -->
kicker: HIBRID LAIN
judul: Dua cara lain mencampur dua pendekatan
teks: Misra hlm. 79-80 menyebut dua protokol hibrid dengan ide berbeda.
- DHAR | Jaringan dipartisi jadi cluster; routing dua tingkat, dan update tingkat dua hanya sampai cluster tetangga.
- ADV | Frekuensi dan ukuran update disesuaikan dengan beban dan mobilitas jaringan.
- Penerima aktif | ADV hanya mengumumkan rute ke node yang sedang menjadi penerima koneksi aktif.
Catatan: Misra hlm. 79-80. ADV memakai paket *init-connection* dan *end-connection* untuk menandai kapan sebuah penerima mulai dan berhenti aktif.

<!-- slide: table -->
kicker: RANGKUMAN PROTOKOL
judul: Tujuh protokol dari dua buku
| Protokol | Tipe | Informasi rute | Kelemahan menurut buku |
|---|---|---|---|
| DSDV | Proaktif | Tabel semua tujuan + nomor urut | Overhead besar, tidak cocok jaringan besar |
| WRP | Proaktif | Empat tabel, termasuk MRL | Empat struktur data di tiap node |
| FSR | Proaktif | Link state dengan lingkup fisheye | Info node jauh kurang akurat |
| OLSR | Proaktif | Topologi lewat MPR, Dijkstra | Pesan kontrol tetap jalan tanpa data |
| AODV | Reaktif | *Next hop* per tujuan | Entri basi di node perantara |
| DSR | Reaktif | Rute lengkap di header | Header membesar sesuai panjang rute |
| ZRP | Hibrid | Proaktif di zona, reaktif di luar | Kinerja bergantung pada radius zona |
Catatan: Kolom kelemahan dirangkum dari Loo subbab 2.3 dan 2.5 (hlm. 21-29) dan Misra hlm. 66-81.

<!-- slide: table -->
kicker: PROFIL PEMAKAIAN
judul: Ukuran jaringan dan mobilitas
| Protokol | Mekanisme rute | Ukuran jaringan | Mobilitas |
|---|---|---|---|
| AODV | Next hop | Besar | Baik |
| DSR | Source routing | Kecil | Buruk |
| TORA | Next hop | Sedang | Buruk |
| OLSR | Next hop | Besar | Baik |
| DSDV | Next hop | Besar | Baik |
| ZRP | Campuran | Besar | Baik |
Catatan: Loo Tabel 2.2 (hlm. 24). Di tabel itu hanya TORA yang menyediakan rute cadangan, dan hanya AQOR yang mendukung QoS. Tidak satu pun dari protokol ini punya dukungan keamanan bawaan.

<!-- slide: points -->
kicker: KRITERIA EVALUASI
judul: Lima ukuran pembanding protokol
teks: Misra subbab 4.3.4 (hlm. 86-87) menyebut kriteria yang umum dipakai untuk membandingkan protokol routing.
- Delay dan overhead | Delay ujung ke ujung dan jumlah pesan kontrol yang dikirim.
- Beban node | Overhead pemrosesan dan kebutuhan memori di tiap node.
- Rasio pengiriman paket | Ukuran keandalan: makin kecil paket hilang, makin baik protokolnya.
Catatan: Misra hlm. 86-87. Metrik ini kita pakai lagi di minggu 6 saat membaca hasil simulasi, dan menjadi metrik wajib laporan proyek akhir.

<!-- slide: points -->
kicker: FAKTOR MOBILITAS
judul: Gerak node mengubah peringkat protokol
teks: Misra subbab 4.3.4.1 (hlm. 86-87) memerinci sisi mobilitas yang memengaruhi kinerja.
- Kecepatan | Tidak ada batas kecepatan node, dan kecepatan tinggi menurunkan kinerja banyak protokol.
- Arah gerak | Node bisa menjauh dari semua tetangga; deteksinya bisa *hard state* atau *soft state*.
- Grup atau sendiri | MANET militer bergerak berkelompok; LANMAR dan OLSR disebut cocok untuk itu.
Catatan: Misra hlm. 86-87. *Hard state*: node memberi tahu kepergiannya. *Soft state*: kepergian dideteksi lewat *time out*. Model mobilitas dibahas tuntas di minggu 5.

<!-- slide: points -->
kicker: FAKTOR KANAL
judul: Daya dan bandwidth ikut menentukan
teks: Misra subbab 4.3.4.2 (hlm. 87) menyebut sisi komunikasi nirkabel yang membatasi protokol.
- Konsumsi daya | Aktivitas jaringan memakan sekitar 10% daya laptop dan sampai 50% pada perangkat genggam.
- Bandwidth | Protokol yang baik menekan jumlah pengiriman paket dan overhead perawatan jaringan.
- Laju galat | Komunikasi nirkabel rawan galat, jadi strategi routing harus menekan dampak paket hilang.
Catatan: Angka daya dari Misra hlm. 87, mengutip percobaan Kravets dan Krishnan (1998). Angka ini muncul lagi di minggu 7 saat membahas routing hemat energi.

<!-- slide: points -->
kicker: MEMILIH PROTOKOL
judul: Mobilitas dan trafik yang menentukan
teks: Misra subbab 4.4 (hlm. 88-89) memberi panduan pemilihan.
- Jaringan relatif statis | Protokol proaktif efisien karena menyimpan topologi memang berguna.
- Mobilitas naik | Protokol reaktif bekerja lebih baik; saat trafik padat, reaktif juga lebih disukai.
- Ukuran jaringan | AODV, DSR, dan OLSR untuk jaringan kecil; TORA, LANMAR, dan ZRP untuk yang besar.
Catatan: Misra hlm. 88-89. Kesimpulan Misra: tidak ada satu protokol yang cocok untuk semua situasi, dan pendekatan hibrid sering lebih tepat. Loo hlm. 33-34 menutup bab dengan daftar fitur yang seharusnya dimiliki protokol baru, termasuk jalur cadangan.

<!-- slide: table -->
kicker: RINGKASAN
judul: Yang perlu dibawa ke minggu 3
| Gagasan | Intinya |
|---|---|
| Tiga kelas | Proaktif siap pakai, reaktif hemat, hibrid campuran |
| Tiga teknik | Hop count, link state, dan source routing |
| Ongkos yang dipindah | Proaktif membayar di pesan berkala, reaktif membayar di jeda pencarian |
| MPR | Menekan pengiriman ulang dan ukuran paket broadcast |
| Pemilihan | Ditentukan mobilitas, ukuran jaringan, dan pola trafik |
Catatan: Minggu 3 memakai gagasan MPR lagi saat membahas cara menekan *flooding* pada broadcast, lalu lanjut ke multicast dan geographic routing.

<!-- slide: points -->
kicker: KUIS
judul: Kerjakan berpasangan, 15 menit
- DSDV saat node bergerak | Update jenis apa yang lebih tepat, *full dump* atau *incremental*? Kenapa? (Misra soal 3)
- OLSR saat *broadcast* | Bagaimana MPR mengurangi jumlah pengiriman ulang? (Misra soal 8)
- AODV saat link putus | Pada contoh tadi, link C-D putus. Siapa mengirim RERR, dan apa yang dilakukan S?
Catatan: Soal 1 dan 2 diambil dari daftar pertanyaan Misra bab 4 (hlm. 92). Kunci soal 1: saat node sering bergerak, update incremental membesar mendekati ukuran NPDU, sehingga full dump lebih masuk akal (Misra hlm. 66). Kunci soal 3: node C dan D mengirim RERR ke ujung rute, entri dihapus, lalu S memulai pencarian baru dengan broadcast ID baru.

<!-- slide: closing -->
judul: Diskusi
teks: Sebelum pertemuan 3, baca Misra bab 5, 6, dan 7.
Catatan: Pertemuan 3 membahas broadcast, multicast, dan geographic routing.
