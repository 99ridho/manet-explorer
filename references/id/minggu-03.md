---
minggu: 3
judul: Broadcast, Multicast, dan Geographic Routing
dosen: Muhammad Ridho Kurniawan Pratama, M.T.I.
sumber:
  - Misra, Woungang & Misra (2009), *Guide to Wireless Ad Hoc Networks*, bab 5, 6, dan 7
---

# Minggu 3: Broadcast, Multicast, dan Geographic Routing

Rujukan: Misra bab 5 (hlm. 97-120), bab 6 (hlm. 121-150), bab 7 (hlm. 151-188).
Durasi: 150 menit (3 SKS).

<!-- slide: cover -->
kicker: PERTEMUAN 3 · INTEGRASI JARINGAN MANDIRI/MOBILE
judul: Broadcast, Multicast, dan Geographic Routing
subjudul: Integrasi Jaringan Mandiri/Mobile · Pertemuan 3
Catatan: Minggu lalu fokus ke unicast: satu sumber, satu tujuan. Hari ini tiga pola lain yang tetap bergantung pada broadcast di level radio.

<!-- slide: disclosure -->

<!-- slide: agenda -->
kicker: TUJUAN PERTEMUAN
judul: Setelah pertemuan ini, Anda dapat:
- Menjelaskan broadcast storm | Kenapa *blind flooding* boros dan bagaimana heuristik menguranginya.
- Menjalankan pemilihan MPR | Algoritma *greedy set cover* pada topologi kecil.
- Membedakan multicast tree dan mesh | Efisiensi bandwidth dibanding ketahanan terhadap link putus.
- Menelusuri greedy forwarding | Termasuk apa yang terjadi saat paket menemui *void*.
Catatan: Semua materi hari ini dari Misra bab 5-7.

<!-- slide: agenda -->
kicker: ALUR 150 MENIT
judul: Tiga bagian dan satu sesi kuis
- Bagian 1: broadcast (50 menit) | Broadcast storm, heuristik, MPR, dominating set, kendali daya.
- Bagian 2: multicast (45 menit) | Tree dan mesh, ODMRP, MOLSR, MAODV, MOST, kriteria pemilihan.
- Bagian 3: geographic routing (35 menit) | Greedy forwarding, void handling, geocast.
- Kuis dan diskusi (20 menit) | Dikerjakan berpasangan di akhir pertemuan.
Catatan: Sisipkan jeda 10 menit setelah bagian 2. Cek pemahaman singkat ada di akhir tiap bagian.

<!-- slide: points -->
kicker: POLA PENGIRIMAN
judul: Tiga cara mengirim satu pesan
teks: Misra bab 5 (hlm. 97) membedakan pengiriman menurut jumlah penerimanya.
- Unicast | Satu tujuan. Contoh: interaksi klien dan server web.
- Broadcast | Semua node di jaringan. Contoh: pengumuman bahwa jaringan akan tidak tersedia.
- Multicast | Sebagian node yang tergabung dalam grup. Contoh: siaran video langsung untuk penonton tertentu.
Catatan: Misra Gambar 5.1 (hlm. 98): dengan unicast, sumber mengirim tiga aliran terpisah ke tiga penerima. Dengan multicast, sumber cukup mengirim satu aliran dan node perantara menyalinnya.

<!-- slide: section -->
nomor: 01
judul: Broadcast tanpa badai
teks: Broadcast adalah dasar komunikasi di jaringan ad hoc, termasuk untuk route discovery. Masalahnya ada pada cara paling sederhana melakukannya.
Catatan: Bagian 1, sekitar 50 menit. Misra bab 6 subbab 6.1-6.4 (hlm. 121-142).

<!-- slide: context -->
kicker: BLIND FLOODING
judul: Blind flooding memicu broadcast storm
teks: Pada *blind flooding*, setiap node yang menerima paket untuk pertama kali langsung menyiarkannya ulang. Di jaringan CSMA/CA, ini menimbulkan tiga masalah:
**Siaran ulang redundan:** semua tetangga sudah menerima paketnya.
**Perebutan medium:** node tetangga berebut kanal di saat yang sama.
**Tabrakan paket:** broadcast tidak memakai RTS/CTS, jadi tabrakan lebih mungkin.
graf:
  simpul: A@0,1 B@1,0 C@1,2 D@2,1
  sisi: A-B A-C B-C B-D C-D
  jalur: A>B>D A>C>D
  peran: A=sumber
  keterangan: B dan C sama-sama menyiarkan ulang, jadi D menerima dua salinan. Cukup dua siaran (A lalu B) agar semua node menerima.
Catatan: Contoh ini mengikuti Misra Gambar 6.1 (hlm. 122-123). Tanyakan: di mana B dan C bisa bertabrakan? Jawaban: di D, jika keduanya memancar hampir bersamaan.

<!-- slide: points -->
kicker: SIFAT MEDIUM
judul: Radio membuat broadcast mahal
teks: Misra hlm. 99 menyebut sifat jaringan nirkabel yang membuat protokol jaringan kabel tidak cocok dipindah begitu saja.
- Semi-broadcast | Satu pancaran hanya sampai ke node di dalam jangkauan, jadi pesan tetap harus diteruskan.
- Area interferensi | Satu pengiriman memakan bandwidth sampai sejauh dua kali jangkauan pancar.
- Sumber daya terbatas | Bandwidth, daya proses, dan energi node jauh lebih kecil daripada di jaringan kabel.
Catatan: Misra hlm. 99. Konsekuensinya: menghitung jumlah pengiriman ulang jauh lebih penting di sini daripada di jaringan kabel.

<!-- slide: compare -->
kicker: DUA PENDEKATAN
judul: Solusi global mahal, solusi lokal realistis
kolom: Pendekatan global
- Butuh informasi topologi seluruh jaringan.
- Mencari pohon broadcast paling hemat energi.
- Menghitung pohon optimal itu NP-hard.
- Biaya pemeliharaannya tidak realistis.
kolom: Pendekatan lokal
- Hanya perlu informasi tetangga satu atau dua hop.
- Sifatnya terdistribusi, tiap node memutuskan sendiri.
- Bisa menyesuaikan diri saat topologi berubah.
- Kinerjanya mendekati pendekatan global.
Catatan: Misra subbab 6.1.2 (hlm. 123-124) dan kesimpulan bab (hlm. 145). Seluruh mekanisme yang dibahas hari ini adalah pendekatan lokal.

<!-- slide: points -->
kicker: HEURISTIK
judul: Heuristik memutuskan siapa yang diam
teks: Ni dkk. dan Tseng dkk. mengusulkan heuristik sederhana untuk memutuskan perlu tidaknya siaran ulang (Misra hlm. 124).
- Berbasis counter | Node tidak menyiarkan ulang jika sudah mendengar paket yang sama sebanyak ambang tertentu.
- Berbasis jarak/lokasi | Node menghitung tambahan area yang bisa dijangkau. Butuh GPS atau kekuatan sinyal.
- Berbasis probabilitas | Siaran ulang diputuskan secara acak, bisa dipengaruhi kepadatan node atau sisa baterai.
Catatan: Misra hlm. 124. Makin sering sebuah node mendengar paket yang sama, makin kecil tambahan jangkauan yang ia berikan jika ikut menyiarkan. Kinerja heuristik sangat bergantung pada pilihan parameter dan ambang.

<!-- slide: points -->
kicker: NEIGHBOR COVERAGE
judul: Diam kalau tetangga sudah tercakup
teks: Node j yang menerima paket dari node i menghitung himpunan cakupan Cj = Nj dikurangi Ni dikurangi {i} (Misra hlm. 125).
- Self-pruning | Jika Cj kosong, semua tetangga j sudah dijangkau i, jadi j tidak perlu menyiarkan ulang.
- SBA | Node dengan tetangga terbanyak mendapat giliran lebih dulu lewat penundaan DNmaks dibagi Dj.
- Dominant pruning | Pengirim menempelkan daftar node yang wajib meneruskan ke paket broadcast.
Catatan: Misra hlm. 125-126. Mencari daftar penerus minimum setara dengan *minimum set cover* yang NP-complete, jadi dipakai heuristik serakah. Informasi dua hop diperoleh lewat *beacon*, dan Misra mencatat enam masalah yang membuat informasi ini kurang akurat (hlm. 125).

<!-- slide: context -->
kicker: MULTIPOINT RELAY
judul: MPR dipilih dengan set cover serakah
teks: Node A ingin broadcast. Tetangga satu hop: B, D, E. Tetangga dua hop: C, G, F.
**Langkah 1:** pilih tetangga yang menjadi satu-satunya jalan ke node dua hop. C hanya lewat B, jadi B jadi MPR.
**Langkah 2:** dari sisanya, pilih yang menutup node dua hop terbanyak. D menutup G dan F.
**Langkah 3:** semua node dua hop sudah tertutup. E tidak perlu jadi MPR.
graf:
  simpul: A@1,1 B@0,0 D@2,0 E@2,2 C@0,-1 G@3,-1 F@3,1
  sisi: A-B A-D A-E B-C D-G D-F E-F
  peran: A=sumber B=mpr D=mpr
  keterangan: Cincin kuning: MPR milik A. Hanya B dan D yang meneruskan broadcast dari A.
Catatan: Heuristik dan contoh dari Misra hlm. 126-127 (Gambar 6.2). Node disebut tercakup oleh A jika ia menerima pesan yang berasal dari A, langsung atau lewat penerusan. OLSR memakai mekanisme ini (minggu 2).

<!-- slide: table -->
kicker: ALGORITMA MPR
judul: Empat langkah greedy set cover
| Langkah | Yang dikerjakan |
|---|---|
| 1 | Cari node dua hop yang hanya terjangkau lewat satu tetangga; tetangga itu jadi MPR |
| 2 | Tentukan himpunan tercakup oleh MPR yang sudah dipilih |
| 3 | Dari tetangga tersisa, pilih yang menutup node dua hop belum tercakup terbanyak |
| 4 | Ulangi dari langkah 2 sampai semua node dua hop tercakup |
Catatan: Misra hlm. 126-127. Latihan di kelas: gambar topologi lain di papan dan minta mahasiswa menjalankan keempat langkah ini. Kelemahan MPR: pemilihannya bergantung sumber, jadi node relay harus tahu siapa yang menyiarkan sebelumnya (hlm. 128).

<!-- slide: points -->
kicker: DOMINATING SET
judul: Hanya node gateway yang bicara
teks: *Dominating set* adalah himpunan yang membuat setiap node jaringan berada di dalamnya atau bertetangga dengan anggotanya (Misra hlm. 128-129).
- Node intermediate | Node yang punya dua tetangga yang tidak saling bertetangga.
- Aturan penyingkiran | Node dibuang dari himpunan jika tetangganya sudah tercakup tetangga lain berID lebih besar.
- Derajat sebagai kunci | Memakai derajat tetangga, bukan ID, memperkecil ukuran himpunan.
Catatan: Misra subbab 6.2.3 (hlm. 128-129), aturan 1 dan 2 dari Wu dan Li. Node yang punya tetangga unik selalu terpilih, sama seperti pada MPR. Istilah CDS muncul lagi di minggu 6 sebagai model *topology control*.

<!-- slide: compare -->
kicker: CLUSTER
judul: Klaster aktif cepat, klaster pasif hemat
kolom: Active clustering
- Node bertukar pesan kontrol untuk memilih clusterhead.
- Klaster terbentuk tanpa menunggu trafik data.
- Tidak ada penundaan pembentukan klaster.
- Overhead kontrolnya paling besar.
kolom: Passive clustering
- Pembentukan klaster menumpang trafik data yang ada.
- Informasi tetangga diambil dari penerimaan promiscuous.
- Tidak ada klaster sebelum ada trafik.
- Hemat, tetapi ada jeda sebelum klaster terbentuk.
Catatan: Misra subbab 6.2.6 (hlm. 129-131, Gambar 6.3). Dalam broadcast berbasis klaster, hanya *clusterhead* dan *gateway* yang menyiarkan ulang. Pemilihan clusterhead bisa memakai algoritma ID terendah atau tertinggi. Minggu 4 membahas pembentukan klaster lebih dalam.

<!-- slide: points -->
kicker: KENDALI DAYA
judul: Berbisik lebih baik daripada berteriak
teks: Misra subbab 6.3 (hlm. 133-134) membahas broadcast dengan radius pancar yang bisa diatur.
- Daya dan jarak | Daya yang dibutuhkan sebanding jarak pangkat alfa, dengan alfa antara 2 dan 6.
- Untungnya | Lebih sedikit node yang mendengar, jadi duplikat, perebutan medium, dan tabrakan berkurang.
- Harganya | Satu pancaran berdaya besar berganti menjadi dua atau lebih pancaran kecil.
Catatan: Misra hlm. 134 memakai analogi: di ruangan penuh orang, lebih baik semua berbisik daripada berteriak. Mekanisme ini butuh koordinat node, dari GPS atau perkiraan lewat kekuatan sinyal *beacon*.

<!-- slide: points -->
kicker: GRAF UNTUK BROADCAST
judul: RNG dan MST memangkas link
teks: Dua struktur graf dipakai untuk menentukan siapa yang perlu didengar (Misra hlm. 134-137).
- RNG | Dua node terhubung jika *lune* di antara keduanya tidak memuat node lain.
- MST | Graf terhubung dengan total bobot sisi terkecil; jalur broadcast lebih hemat daripada RNG.
- Hubungannya | MST adalah subgraf RNG, dan MST lokal berada di antara keduanya.
Catatan: Misra hlm. 134-137 (Gambar 6.4-6.7). MST murni tidak punya jalur alternatif, jadi tidak toleran kegagalan; MST lokal mengembalikan sebagian toleransi itu. Radius pancar minimum agar jaringan tetap terhubung sama dengan sisi terpanjang di MST (hlm. 137).

<!-- slide: points -->
kicker: KEANDALAN
judul: Broadcast hemat justru lebih rapuh
teks: Misra subbab 6.4 (hlm. 139-142) mencatat sisi lain dari optimasi broadcast.
- Redundansi punya guna | *Blind flooding* lebih andal justru karena semua node mengulang paket.
- Efek trafik latar | Keandalan broadcast teroptimasi turun tajam saat ada trafik latar.
- Penawarnya | Skema seperti DCB memakai node penerus ganda dan pengiriman ulang sampai batas percobaan.
Catatan: Misra hlm. 139-142. RMST memakai MST lokal plus pengiriman *unicast* 802.11 agar dapat RTS/CTS dan pengakuan MAC, tanpa mengubah standar. Jumlah pengiriman ulang sebelum *timeout* biasanya 4 sampai 7 kali.

<!-- slide: points -->
kicker: CEK PEMAHAMAN
judul: Jawab singkat sebelum lanjut
- Tiga akibat | Sebutkan tiga akibat *blind flooding* di jaringan CSMA/CA.
- Self-pruning | Kapan node memutuskan diam menurut rumus himpunan cakupan?
- MPR setelah link putus | Pada contoh MPR tadi, link D-F putus. Siapa saja MPR A sekarang?
Catatan: Jawaban: (1) siaran ulang redundan, perebutan medium, tabrakan paket; (2) saat Cj kosong, yaitu semua tetangganya sudah tetangga pengirim; (3) F kini hanya lewat E, jadi E wajib jadi MPR; MPR A menjadi B, D, dan E.

<!-- slide: section -->
nomor: 02
judul: Multicast di jaringan bergerak
teks: Multicast mengirim satu aliran data ke grup penerima. Pertanyaannya: struktur apa yang menghubungkan sumber dan penerima?
Catatan: Bagian 2, sekitar 45 menit. Misra bab 5 subbab 5.2-5.4 (hlm. 100-110).

<!-- slide: points -->
kicker: GABUNG DAN KELUAR
judul: Grup multicast diatur pesan join
teks: Misra hlm. 98-99 menjelaskan cara keanggotaan grup multicast bekerja.
- Pesan join | Node yang ingin menerima aliran tertentu menyatakan diri ke jaringan.
- Pesan leave | Node yang tidak lagi berminat keluar dari grup dengan pesan ini.
- Protokol kabel | PIM, DVMRP, CBT, dan MOSPF dirancang untuk jaringan kabel, bukan MANET.
Catatan: Misra hlm. 98-99. Protokol kabel tidak menangani sifat MANET: tidak ada infrastruktur, sifat semi-broadcast, interferensi radio, sumber daya terbatas, topologi yang berubah cepat, dan dukungan mobilitas.

<!-- slide: compare -->
kicker: STRUKTUR MULTICAST
judul: Tree hemat bandwidth, mesh tahan link putus
kolom: Tree-based
- Satu jalur dari sumber ke tiap penerima.
- *Source tree*: satu pohon per pasangan sumber dan grup.
- *Shared tree*: satu pohon untuk seluruh grup.
- Rentan: beberapa link putus bisa memutus sebagian besar pohon.
kolom: Mesh-based
- Beberapa jalur dari pengirim ke tiap penerima.
- Data bisa tiba lewat jalur berbeda.
- Lebih tahan terhadap perubahan topologi.
- Konsumsi bandwidth lebih besar daripada tree.
Catatan: Misra subbab 5.3.1 (hlm. 102-104). Pada *shared tree*, sumber tidak harus menjadi bagian struktur; ia hanya butuh titik masuk, misalnya akar pohon atau anggota pohon terdekat. Misra bab 4 menambahkan: protokol tree memberi delay ujung ke ujung lebih kecil daripada mesh.

<!-- slide: compare -->
kicker: FLAT ATAU OVERLAY
judul: Semua node ikut, atau hanya anggota
kolom: Struktur flat
- Semua node bisa ikut membangun struktur multicast.
- Semua node harus mengenal protokol multicast.
- Data multicast dikirim dengan broadcast.
- Contoh: ODMRP, MOLSR, MAODV.
kolom: Struktur overlay
- Hanya anggota grup yang membangun struktur virtual.
- Node lain cukup meneruskan data terbungkus.
- Memakai *tunnel unicast* yang ada pengakuannya.
- Contoh: MOST dan AMRoute.
Catatan: Misra hlm. 103. Keunggulan overlay: lebih tahan dan lebih andal, karena komunikasi unicast punya mekanisme pengakuan yang tidak dimiliki broadcast.

<!-- slide: table -->
kicker: KLASIFIKASI
judul: Empat protokol dan strukturnya
| Protokol | Struktur | Flat atau overlay | Berdiri sendiri |
|---|---|---|---|
| MOLSR | Source tree | Flat | Tidak, perlu OLSR |
| MAODV | Shared tree | Flat | Tidak, perlu AODV |
| ODMRP | Mesh | Flat | Ya |
| MOST | Shared tree | Overlay | Tidak, perlu OLSR |
Catatan: Misra Tabel 5.1 (hlm. 104). Tabel aslinya juga memuat FGMP dan MCEDAR (mesh, flat), AMRoute (shared tree, overlay), dan DDM (source tree, flat).

<!-- slide: context -->
kicker: ODMRP
judul: ODMRP membangun mesh lewat Join Query
teks: Sumber S membanjiri jaringan dengan Join Query secara berkala. Tiap node mencatat dari mana query datang.
Penerima R1 dan R2 membalas dengan Join Reply menyusuri jalur balik. Node yang dilewati Join Reply menjadi *forwarding group*: hanya mereka yang meneruskan data multicast.
Tidak ada pesan keluar grup. Penerima cukup berhenti membalas, dan node yang tidak lagi disegarkan keluar dari mesh.
graf:
  simpul: S@0,1 A@1,0 B@1,2 C@2,1 R1@3,0 R2@3,2
  sisi: S-A S-B A-C B-C A-R1 C-R1 C-R2 B-R2
  jalur: R1>A>S R2>B>S
  peran: S=sumber R1=tujuan R2=tujuan A=relay B=relay
  keterangan: Panah: Join Reply. A dan B (bercincin) menjadi forwarding group.
Catatan: Misra subbab 5.3.2.1 (hlm. 104-105, Gambar 5.2). ODMRP berdiri sendiri, tidak butuh protokol unicast di bawahnya, dan juga bisa dipakai untuk unicast. Node hanya memproses Join Reply jika alamatnya ada di daftar *next hop* pesan itu.

<!-- slide: points -->
kicker: MOLSR
judul: MOLSR menumpang topologi OLSR
teks: MOLSR membangun satu pohon untuk tiap pasangan sumber dan grup, memakai pengetahuan topologi dari OLSR (Misra hlm. 105-106).
- SOURCE_CLAIM | Sumber mengumumkan diri lewat flooding teroptimasi milik OLSR.
- CONFIRM_PARENT | Anggota grup memilih *next hop* ke sumber sebagai induknya, lalu mengirim pesan ini.
- LEAVE | Daun yang keluar memberi tahu induknya; cabang tak terpakai terhapus sendiri.
Catatan: Misra hlm. 105-106 (Gambar 5.3). Cabang dibangun mundur dari anggota grup ke sumber. Perubahan topologi terdeteksi lewat pesan kontrol OLSR, jadi pembaruan pohon terpicu otomatis.

<!-- slide: points -->
kicker: MAODV
judul: MAODV memakai RREQ, RREP, dan MACT
teks: MAODV membangun satu *shared tree* per grup, memakai format pesan yang mirip AODV (Misra hlm. 106-108).
- Tiga pesan | RREQ mencari pohon, RREP membalas, MACT mengaktifkan rute terpilih.
- Pemimpin grup | Memegang dan menyiarkan nomor urut grup lewat pesan Group Hello.
- Perbaikan cabang | Node hilir mencari ulang dengan *expanding ring search* ke anggota yang lebih dekat pemimpin.
Catatan: Misra hlm. 106-108 (Gambar 5.4). Node yang meminta bergabung tetapi tidak dibalas setelah sejumlah percobaan akan mengangkat dirinya sendiri menjadi pemimpin grup. Hanya node daun yang boleh memangkas diri.

<!-- slide: points -->
kicker: MOST
judul: Tiap node menghitung pohon yang sama
teks: MOST adalah protokol overlay yang dibangun di atas OLSR (Misra hlm. 108-109).
- Prim di tiap node | Setiap anggota menghitung sendiri *minimum shared spanning tree* untuk grupnya.
- Syaratnya | Semua anggota harus punya pandangan topologi yang sama, jadi daftar tetangga diumumkan.
- Keluar bertahap | Node yang keluar tetap meneruskan data selama masa transisi agar pohon tidak putus.
Catatan: Misra hlm. 108-109. Sisi pohon overlay adalah *tunnel unicast*. Pohon dihitung ulang berkala agar perubahan topologi ikut tertangkap.

<!-- slide: points -->
kicker: MEMILIH PROTOKOL
judul: Ukuran masalah dulu, protokol kemudian
teks: Misra subbab 5.2 (hlm. 100-101) menyarankan mendefinisikan masalahnya sebelum memilih protokol.
- Ukuran masalah | Jumlah grup, kepadatan klien per grup, jumlah sumber, dan laju trafiknya.
- Tuntutan layanan | Kebutuhan QoS, keandalan pengiriman, dan dukungan mobilitas yang diperlukan.
- Ketergantungan | Apakah protokol berdiri sendiri atau menuntut protokol unicast tertentu.
Catatan: Misra hlm. 100-101. Jika hampir semua node menjadi anggota grup, broadcast teroptimasi justru lebih baik daripada multicast. Banyak grup dan banyak sumber merugikan protokol yang membangun struktur per pasangan sumber dan grup.

<!-- slide: points -->
kicker: MENGUKUR
judul: Empat ukuran kinerja multicast
teks: Misra hlm. 101-102 menyebut kriteria pembanding antarprotokol multicast.
- Pengiriman | Rasio paket sampai dan throughput yang bisa dipertahankan.
- Delay | Waktu tempuh paket dari sumber ke penerima.
- Overhead | Diukur di bandwidth, memori penyimpan informasi kontrol, dan kerumitan algoritma.
Catatan: Misra hlm. 101-102. Kriteria keempat: waktu yang dibutuhkan protokol untuk menambah anggota baru, mengeluarkan anggota, dan pulih dari perubahan topologi. Misra juga mencatat belum ada dokumen IETF yang merekomendasikan satu protokol multicast MANET (hlm. 109).

<!-- slide: points -->
kicker: CEK PEMAHAMAN
judul: Jawab singkat sebelum jeda
- Tree atau mesh | Untuk siaran video di kelas yang node-nya hampir diam, mana yang Anda pilih?
- Keluar grup ODMRP | Bagaimana penerima ODMRP keluar dari grup tanpa pesan khusus?
- Overlay | Kenapa struktur overlay disebut lebih andal daripada struktur flat?
Catatan: Jawaban: (1) tree, karena hemat bandwidth dan link jarang putus; (2) berhenti mengirim Join Reply, lalu node forwarding group berhenti disegarkan; (3) datanya lewat tunnel unicast yang punya pengakuan. Setelah ini, jeda 10 menit.

<!-- slide: section -->
nomor: 03
judul: Routing dengan koordinat
teks: Geographic routing memakai posisi node, bukan tabel rute, untuk memindahkan paket makin dekat ke tujuan.
Catatan: Bagian 3, sekitar 35 menit. Misra bab 7 subbab 7.2-7.4 (hlm. 153-177).

<!-- slide: points -->
kicker: DUA ASUMSI
judul: Semua bergantung pada posisi
teks: Misra hlm. 154-155 menyebut dua asumsi yang harus dipenuhi sebelum geographic routing bisa jalan.
- Node tahu posisinya | Dari GPS, atau koordinat relatif hasil teknik lokalisasi.
- Sumber tahu posisi tujuan | Posisi itu ditulis di header paket agar node perantara ikut tahu.
- Location service | Layanan yang menjaga posisi node tetap mutakhir, terpusat atau terdistribusi.
Catatan: Misra hlm. 154-155. Tanpa *location service*, sumber bisa membanjiri jaringan dengan paket pencarian, dan tujuan membalas dengan posisinya. Pada jaringan sensor, sink yang diam cukup menyiarkan posisinya sekali.

<!-- slide: points -->
kicker: LOKALISASI
judul: Tiga jangkar menentukan satu posisi
teks: Node yang tidak punya GPS memperkirakan posisinya dari node lain (Misra hlm. 154-155).
- Anchor | Node yang tahu posisinya, disebut juga *beacon* atau *landmark*.
- Lateration | Butuh jarak ke tiga anchor yang tidak segaris untuk posisi 2D, empat untuk 3D.
- Pengukuran jarak | Dari kekuatan sinyal atau selisih waktu tiba sinyal.
Catatan: Misra hlm. 154-155 (Gambar 7.1). Jika tidak ada anchor sama sekali, node membangun sistem koordinat lokal lewat hubungan trigonometri antarnode.

<!-- slide: context -->
kicker: GREEDY FORWARDING
judul: Greedy memilih tetangga yang paling maju
teks: S mengetahui posisi tetangga dari *beacon* berkala dan posisi D dari header paket. Kriteria pemilihan *next hop* antara lain:
**MFR:** tetangga dengan kemajuan terbesar ke arah D (di sini A).
**NFP:** tetangga terdekat yang masih maju (di sini B).
**Acak:** salah satu tetangga yang maju, dipilih acak.
graf:
  simpul: S@0,2 A@1.8,1.2 B@0.9,2.7 C@-1,1.1 E@0.4,3.6 D@3.6,2
  sisi: S-A S-B S-C S-E S-D
  putus: S-D
  jalur: S>A
  peran: S=sumber D=tujuan
  keterangan: Garis putus: arah ke D, bukan link. C tidak maju ke arah D, jadi tidak dipilih.
Catatan: Kriteria dari Misra hlm. 157-158 (Gambar 7.2). Topologi di slide ini ilustrasi sendiri, bukan salinan gambar buku. MFR meminimalkan jumlah hop; NFP mengurangi peluang tabrakan jika daya pancar bisa diatur.

<!-- slide: table -->
kicker: KRITERIA NEXT HOP
judul: Enam kriteria dan tujuannya
| Kriteria | Dasar pemilihan | Tujuan |
|---|---|---|
| MFR | Kemajuan terbesar | Menekan jumlah hop |
| NFP | Terdekat yang masih maju | Menekan peluang tabrakan |
| Acak | Acak di antara yang maju | Menyeimbangkan kemajuan dan keandalan |
| Compass | Arah paling dekat garis S-D | Menekan jarak tempuh spasial |
| MAR | Kemajuan jarak terbesar | Menekan jumlah hop, bebas loop |
| NC | Terdekat yang lebih dekat tujuan | Menekan tabrakan, bebas loop |
Catatan: Misra hlm. 157-161 dan Tabel 7.1 (hlm. 162). Perbedaan *progress* dan *advance*: progress diukur dari proyeksi ke garis S-D, advance dari selisih jarak ke tujuan. Kriteria lain di tabel buku memakai sisa energi dan laju galat paket.

<!-- slide: context -->
kicker: PERINGATAN
judul: Kriteria berbasis progress bisa berputar
teks: A dan B saling bertetangga dan keduanya punya *progress* positif terhadap satu sama lain. A memilih B, B memilih A, dan paket berputar di situ.
Kriteria berbasis *advance* seperti MAR dan NC tidak punya masalah ini, karena jarak ke tujuan selalu mengecil di setiap hop.
graf:
  simpul: A@0,2 B@1,0.6 D@3,1
  sisi: A-B B-D
  jalur: A>B B>A
  peran: D=tujuan
  keterangan: Panah dua arah: loop A-B-A yang bisa terbentuk pada kriteria berbasis progress.
Catatan: Misra hlm. 158-159 (Gambar 7.3). Jaminan pengiriman di sini hanya di tingkat topologi; tabrakan di MAC dan kongesti tidak ikut diperhitungkan.

<!-- slide: context -->
kicker: VOID HANDLING
judul: Saat greedy buntu, paket memutari void
teks: S lebih dekat ke D dibanding semua tetangganya, jadi greedy tidak bisa maju. Padahal jalur S, A, B, C, E, D ada.
Solusi berbasis graf planar memakai aturan tangan kanan untuk menyusuri tepi *face* graf. Graf nirkabel perlu diplanarkan dulu, misalnya dengan RNG atau Gabriel Graph.
GPSR memakai cara ini sebagai *perimeter routing*.
graf:
  simpul: S@2,2 F@1.2,2.6 A@1.4,1 B@2.2,0.2 C@3.4,0.3 E@4.3,1.1 D@4,2
  sisi: S-F S-A A-B B-C C-E E-D
  jalur: S>A>B>C>E>D
  peran: S=sumber D=tujuan
  keterangan: Tidak ada link langsung dari S ke arah D. Paket memutar lewat A, B, C, E, lalu kembali ke mode greedy.
Catatan: Misra subbab 7.3.2 (hlm. 161-165, Gambar 7.4-7.6). Mode greedy dilanjutkan begitu paket tiba di node yang lebih dekat ke D daripada node tempat void terjadi. Ada enam kategori solusi void: berbasis graf planar, topologi, pembalikan link, geometris, heuristik, dan hibrid.

<!-- slide: points -->
kicker: SEBELUM MEMUTAR
judul: Pastikan dulu void-nya bukan sesaat
teks: Misra hlm. 161-162 mengingatkan bahwa tidak semua kebuntuan perlu ditangani dengan mode khusus.
- Void sesaat | Muncul karena node sedang tidur, tabrakan, atau node belum masuk jangkauan.
- Dampaknya | Void sesaat hanya menambah delay, dan hilang sendiri saat kondisi berubah.
- Flooding | Cara paling sederhana mengatasi void, dijamin sampai tetapi boros sumber daya.
Catatan: Misra hlm. 161-162. Planarisasi dibutuhkan karena graf jaringan nirkabel umumnya tidak planar; tanpa itu, jalur hasil penyusuran bisa mengandung loop.

<!-- slide: points -->
kicker: TOPIK LANJUT
judul: Koordinat juga dipakai untuk grup
teks: Misra subbab 7.4 (hlm. 173-177) memperluas gagasan tadi ke pengiriman ke banyak tujuan.
- Geographic multicast | Paket disalin di node perantara; pohonnya terbentuk sambil jalan, bukan disiapkan lebih dulu.
- Geocast | Penerimanya semua node di dalam satu wilayah; header cukup memuat koordinat wilayah itu.
- Di dalam wilayah | Setelah paket masuk wilayah, biasanya disebarkan dengan *region flooding*.
Catatan: Misra hlm. 173-177 (Gambar 7.12 dan 7.13). Pada multicast geografis, satu node bisa menjadi *void node* untuk satu tujuan tetapi tidak untuk tujuan lain. Protokol geocast berbasis flooding: LBM dan GeoGRID; berbasis unicast: GeoTORA dan GAMER. Geocast banyak dipakai untuk menyebar query di jaringan sensor.

<!-- slide: table -->
kicker: RANGKUMAN
judul: Topologi atau koordinat: apa yang dibayar
| Aspek | Berbasis topologi (AODV, OLSR) | Geographic routing |
|---|---|---|
| Informasi yang dipakai | Konektivitas link | Posisi node dan tujuan |
| Tabel rute | Perlu | Tidak perlu, cukup tabel tetangga |
| Saat topologi berubah | Rute harus diperbarui | Hanya berpengaruh jika tetangga pengirim berubah |
| Kebutuhan tambahan | Pesan kontrol untuk rute | GPS atau lokalisasi, plus *location service* |
| Titik lemah | Overhead kontrol | *Void* dan galat posisi |
Catatan: Dirangkum dari Misra subbab 7.2 (hlm. 153-154). Misra juga mencatat bahwa merancang *location service* untuk node yang sangat mobil bisa lebih sulit daripada geographic forwarding itu sendiri.

<!-- slide: table -->
kicker: RINGKASAN
judul: Yang perlu dibawa ke minggu 4
| Gagasan | Intinya |
|---|---|
| Broadcast storm | Blind flooding boros, tetapi paling andal |
| Pendekatan lokal | Info satu sampai dua hop sudah cukup untuk menekan siaran ulang |
| MPR dan dominating set | Dua cara memilih siapa yang boleh meneruskan |
| Tree dan mesh | Hemat bandwidth dibanding tahan terhadap link putus |
| Greedy dan void | Posisi menggantikan tabel rute, dengan harga void handling |
Catatan: Minggu 4 melanjutkan gagasan klaster dan dominating set dari sisi lain: bagaimana node mengatur dirinya sendiri, dan apa yang terjadi jika ada node yang tidak mau bekerja sama.

<!-- slide: points -->
kicker: KUIS
judul: Kerjakan berpasangan, 15 menit
- Broadcast storm | Sebutkan tiga akibat *blind flooding* di jaringan CSMA/CA dan satu cara menekannya.
- Pilih struktur | Aplikasi peringatan bencana ke seluruh node di satu kecamatan: multicast, geocast, atau broadcast?
- Kenapa greedy gagal | Gambarkan topologi di mana greedy buntu padahal jalur ke tujuan ada.
Catatan: Kunci soal 2: geocast, karena penerimanya ditentukan wilayah dan header cukup memuat koordinat wilayah (Misra hlm. 175-176). Kunci soal 3: node sumber lebih dekat ke tujuan daripada semua tetangganya, tetapi ada jalur memutar.

<!-- slide: closing -->
judul: Diskusi
teks: Sebelum pertemuan 4, baca Misra bab 2, 3, dan 14.
Catatan: Pertemuan 4 membahas self-organization, kooperasi node, dan alokasi alamat.
