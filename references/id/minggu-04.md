---
minggu: 4
judul: Self-Organization, Kooperasi Node, dan Alokasi Alamat
dosen: Muhammad Ridho Kurniawan Pratama, M.T.I.
sumber:
  - Misra, Woungang & Misra (2009), *Guide to Wireless Ad Hoc Networks*, bab 2, 3, dan 14
---

# Minggu 4: Self-Organization, Kooperasi Node, dan Alokasi Alamat

Rujukan: Misra bab 2 (hlm. 27-42), bab 3 (hlm. 43-58), bab 14 (hlm. 333-354).
Durasi: 150 menit (3 SKS).

<!-- slide: cover -->
kicker: PERTEMUAN 4 · INTEGRASI JARINGAN MANDIRI/MOBILE
judul: Jaringan yang Mengatur Dirinya Sendiri
subjudul: Self-organization, kooperasi node, dan alokasi alamat · Pertemuan 4
Catatan: Minggu 2-3 berasumsi setiap node mau meneruskan paket dan sudah punya alamat unik. Hari ini kita uji kedua asumsi itu.

<!-- slide: disclosure -->

<!-- slide: agenda -->
kicker: TUJUAN PERTEMUAN
judul: Setelah pertemuan ini, Anda dapat:
- Menjelaskan masalah hidden terminal | Dan dua solusinya: RTS/CTS dan pembagian timeslot.
- Menjelaskan cara node membentuk cluster | Algoritma LCA: cluster head, gateway, node biasa.
- Membedakan insentif dan reputasi | Dua cara mendorong node egois untuk ikut meneruskan paket.
- Membandingkan skema alokasi alamat | Stateful, stateless, dan hibrid tanpa server DHCP.
Catatan: Tiga bab Misra, satu benang merah: MANET tidak punya pusat yang mengatur.

<!-- slide: agenda -->
kicker: ALUR 150 MENIT
judul: Tiga bagian dan satu sesi kuis
- Bagian 1: mengatur diri (45 menit) | Hidden terminal, clustering, dan pemulihan sendiri.
- Bagian 2: node egois (45 menit) | Nuglets, Sprite, CONFIDANT, CORE, OCEAN.
- Bagian 3: alokasi alamat (40 menit) | MANETconf, Buddy, Prophet, DAD, PACMAN.
- Kuis dan diskusi (20 menit) | Dikerjakan berpasangan di akhir pertemuan.
Catatan: Sisipkan jeda 10 menit setelah bagian 2. Cek pemahaman singkat ada di akhir tiap bagian.

<!-- slide: section -->
nomor: 01
judul: Mengatur diri tanpa pusat
teks: Self-configuring berarti node membentuk jaringan terhubung sendiri. Self-healing berarti struktur itu pulih saat node atau link gagal.
Catatan: Bagian 1, sekitar 45 menit. Misra bab 2 abstrak dan subbab 2.1-2.3 (hlm. 27-36).

<!-- slide: table -->
kicker: SISTEM OTONOM
judul: Empat sifat utama self-CHOP
| Sifat | Artinya |
|---|---|
| Self-configure | Mengubah relasi antarkomponen agar tetap hidup atau lebih cepat |
| Self-heal | Mendeteksi atau memperkirakan gangguan, lalu memperbaikinya sendiri |
| Self-optimize | Memantau komponen dan menyetel sumber daya secara otomatis |
| Self-protect | Mengantisipasi, mengenali, dan menangkal serangan |
Catatan: Misra hlm. 28-29, mengikuti istilah IBM untuk *autonomic system*. Empat sifat tambahan: *self-aware*, *self-adapt*, *self-evolve*, dan *self-anticipate*. Di MANET, energi bukan isu utama seperti pada jaringan sensor, karena baterainya bisa diisi ulang (hlm. 28).

<!-- slide: context -->
kicker: HIDDEN TERMINAL
judul: A dan C tidak tahu mereka bertabrakan
teks: A mengirim ke B, dan pada saat yang sama C mengirim ke D di kanal yang sama. A dan C tidak saling mendengar, jadi tidak ada yang tahu terjadi tabrakan.
Akibatnya B menerima pesan terpotong atau data rusak. Masalah ini menjadi jebakan umum bagi setiap skema *self-configuring* dan *self-healing*.
graf:
  simpul: A@0,0 B@1,0 C@2,0 D@3,0
  sisi: A-B B-C C-D
  jalur: A>B C>D
  peran: A=sumber C=sumber
  keterangan: A dan C berada di luar jangkauan satu sama lain.
Catatan: Misra subbab 2.2.1 (hlm. 30-31, Gambar 2.2), merujuk Tobagi dan Kleinrock. Istilah *terminal* di sini berarti node.

<!-- slide: compare -->
kicker: DUA SOLUSI
judul: Minta izin dulu, atau bagi jadwal
kolom: RTS/CTS
- A mengirim RTS, lalu menunggu CTS dari B.
- Dipakai pada standar IEEE 802.11.
- A mengulang sampai CTS datang atau waktu habis.
- Cocok untuk beban trafik yang tidak terduga.
kolom: Timeslot (TDMA)
- Setiap node punya jadwal kirim sendiri.
- Menjamin QoS untuk tiap node.
- Jadwal dihitung ulang saat node bergabung atau keluar.
- Cocok untuk beban per node yang seragam.
Catatan: Misra hlm. 30-31. Harga TDMA: waktu komputasi jadwal tinggi, dan pada jaringan padat jeda antara dua giliran kirim node yang sama menjadi panjang. Pendekatan serupa berlaku untuk pita frekuensi dan kode CDMA.

<!-- slide: points -->
kicker: SELF-CONFIGURING
judul: Kondisi yang harus diterima desainer
teks: Misra subbab 2.2.2 (hlm. 31) mendaftar isu desain jaringan yang mengonfigurasi dirinya.
- Penempatan acak | Node tidak tersusun rapi dalam grid atau pola teratur.
- Medium rawan galat | Kanal nirkabel lebih sering galat dan tabrakan dibanding kabel.
- Sumber daya terbatas | Baterai, memori, dan daya komputasi terbatas, jadi jumlah aksi node harus minimal.
Catatan: Misra hlm. 31. Jaringan yang mengatur dirinya punya dua mekanisme: menemukan rute antarnode, lalu memperbarui topologi dengan mendeteksi kegagalan node atau link dan mengoptimalkan rute hasil penemuan tadi (hlm. 29).

<!-- slide: context -->
kicker: CLUSTERING LCA
judul: ID tertinggi di sekitarnya jadi cluster head
teks: Baker dan Ephremides mengusulkan model dua tingkat. Node dengan ID tertinggi di antara tetangga yang belum punya cluster head menyatakan diri sebagai cluster head.
Node yang terhubung ke dua cluster head atau lebih menjadi gateway. Sisanya node biasa, satu hop dari cluster head-nya.
graf:
  simpul: 9@1,1 4@0,0 2@0,2 6@2,1 8@3,1 3@4,0 5@4,2
  sisi: 9-4 9-2 9-6 6-8 8-3 8-5
  peran: 9=mpr 8=mpr 6=relay
  keterangan: Cincin: cluster head 9 dan 8. Node 6 terhubung ke keduanya, jadi menjadi gateway.
Catatan: Misra hlm. 31-32. Memilih cluster head seminimal mungkin adalah masalah NP-hard, karena itu dipakai aturan ID. LCA dipasangkan dengan LAA (*link activation algorithm*) untuk menjadwalkan link antarnode. Variasinya memakai ID terendah atau node dengan tetangga terbanyak.

<!-- slide: points -->
kicker: PROTOKOL AWAL
judul: Buang semuanya, atau perbaiki bertahap
teks: Misra hlm. 31-32 membandingkan cara protokol menyesuaikan diri dengan perubahan.
- Bangun ulang berkala | LCA, DEA, dan Layer Net membuang informasi topologi lalu membangun dari nol.
- Penyesuaian bertahap | SWAN mencari koneksi baru di periode akses acak, lalu mencoret yang tidak menjawab.
- Struktur lain | DEA memakai partisi klik; Layer Net membangun pohon rentang berlapis dari node awal.
Catatan: Misra hlm. 31-32. Pada Layer Net, nomor lapisan sebuah node sama dengan jaraknya dari akar dalam jumlah hop, dan jadwal dibuat selapis demi selapis seperti penelusuran melebar.

<!-- slide: table -->
kicker: SELF-HEALING
judul: Lima langkah saat gangguan muncul
| Langkah | Yang dikerjakan sistem |
|---|---|
| Monitor | Mengamati perilaku sistem dan nilai indikator tertentu |
| Detect | Menetapkan kapan perilaku menyimpang dari rentang yang wajar |
| Diagnose | Menilai apakah penyimpangan itu memang sebuah gangguan |
| Decide | Mengubah atau memperbaiki gangguan yang sudah didiagnosis |
| Prevent | Mengantisipasi gangguan berikutnya dari indikator yang dipantau |
Catatan: Misra hlm. 34-35 (Gambar 2.4). Konsep *self-healing* terinspirasi dari studi sistem imun (Forrest dkk.). Sistem yang butuh campur tangan dari luar disebut *assisted-healing*.

<!-- slide: points -->
kicker: TIGA STATUS
judul: Dari sehat, terdegradasi, sampai gagal
teks: Misra hlm. 33-34 (Gambar 2.3) menggambarkan status yang dilalui sistem sepanjang hidupnya.
- Acceptable | Jaringan berfungsi sebagaimana mestinya.
- Degraded | Sebagian jaringan masih jalan, sebagian tidak, misalnya karena node pindah atau mati.
- Failed | Fungsi jaringan bergantung pada bagian yang gagal itu, jadi seluruhnya berhenti.
Catatan: Misra hlm. 33-34. Mekanisme pemulihan mengembalikan jaringan ke status *acceptable*, misalnya dengan memindahkan node ke bagian yang terdampak. Tiga isu kritis: menjaga kesehatan sistem, mendeteksi kegagalan, dan memulihkan diri.

<!-- slide: points -->
kicker: MENJAGA KESEHATAN
judul: Tiga cara sistem memantau dirinya
teks: Misra hlm. 34 menyebut cara sistem menjaga agar gangguan cepat terlihat.
- Redundansi | Komponen penting digandakan agar ada cadangan saat satu gagal.
- Probing | Komponen khusus mengumpulkan informasi terbaru tentang komponen lain.
- Analisis log | Sistem menilai kinerjanya sendiri dan memantau gejala yang khas.
Catatan: Misra hlm. 34. Pemulihan bisa lewat penggandaan komponen, isolasi komponen rusak lalu konfigurasi ulang, atau kesepakatan Byzantine dengan pemungutan suara hasil keluaran.

<!-- slide: points -->
kicker: BACKBONE
judul: Router sedikit hemat, tetapi cepat habis
teks: Misra subbab 2.3 (hlm. 35-36) membahas pilihan memakai sebagian node sebagai tulang punggung komunikasi.
- Sisi hematnya | Rute lebih sedikit menekan overhead routing dan redundansi broadcast.
- Node lain tidur | Node di luar tulang punggung bisa tidur dan bangun saat dibutuhkan.
- Harganya | Node router menghabiskan daya lebih cepat, jadi harus digantikan saat dayanya menipis.
Catatan: Misra hlm. 35-36. Pemilihan node tulang punggung bisa dimodelkan sebagai program linear dengan variabel biner per node. Misra juga mencatat struktur hierarkis seperti *link cluster* dan *dominating set* belum cukup cepat memberi redundansi untuk jaringan waktu nyata (hlm. 36).

<!-- slide: points -->
kicker: CEK PEMAHAMAN
judul: Jawab singkat sebelum lanjut
- Hidden terminal | Kenapa A dan C tidak bisa mengetahui sendiri bahwa terjadi tabrakan?
- Pilih solusi | Untuk jaringan dengan beban seragam per node, RTS/CTS atau TDMA?
- Peran node | Pada contoh LCA tadi, kenapa node 6 disebut gateway?
Catatan: Jawaban: (1) keduanya di luar jangkauan satu sama lain, jadi tidak saling mendengar; (2) TDMA, karena jadwalnya menjamin QoS dan bebannya memang seragam; (3) node 6 terhubung ke dua cluster head, yaitu 9 dan 8.

<!-- slide: section -->
nomor: 02
judul: Node yang egois
teks: Meneruskan paket orang lain menghabiskan baterai tanpa manfaat langsung. Di MANET sipil, perilaku egois adalah bentuk ketidakkooperatifan yang paling umum.
Catatan: Bagian 2, sekitar 45 menit. Misra bab 3 subbab 3.1-3.4 (hlm. 44-54).

<!-- slide: points -->
kicker: MOTIF
judul: Apa untungnya menjadi egois
teks: Misra hlm. 44-45 menyebut keuntungan yang dikejar node yang tidak kooperatif.
- Menumpang layanan | Memakai jasa node lain tanpa membalas memberi jasa.
- Menghemat sumber daya | Energi untuk mengirim, menerima, dan memproses trafik ikut terhemat.
- Merugikan yang lain | Mencegah node lain mendapat layanan yang semestinya.
Catatan: Misra hlm. 44-45. Node bisa juga mengeksploitasi skema insentif untuk keuntungan materi. Node di MANET dianggap rasional: mereka tidak selalu ingin melanggar protokol, tetapi juga tidak sukarela membuang sumber dayanya.

<!-- slide: compare -->
kicker: DUA PENDEKATAN
judul: Bayar penerus paket, atau catat reputasinya
kolom: Virtual currency
- Node dibayar untuk meneruskan paket.
- Contoh: Nuglets dan Sprite.
- Nuglets butuh *tamper-proof hardware* di tiap node.
- Node di pinggir jaringan sulit mendapat kredit.
kolom: Reputasi
- Tetangga mengamati perilaku node lain.
- Contoh: CONFIDANT, CORE, OCEAN.
- Node yang tidak kooperatif diisolasi dari rute.
- Rentan terhadap tuduhan palsu atau pujian palsu.
Catatan: Misra subbab 3.2 dan 3.3 (hlm. 45-53). Masalah node pinggir disebut *location privilege problem*: node di tengah lebih banyak mendapat paket untuk diteruskan, jadi lebih mudah mengumpulkan kredit.

<!-- slide: compare -->
kicker: NUGLETS
judul: Siapa yang membayar: sumber atau tujuan
kolom: Packet purse (sumber bayar)
- Sumber mengisi paket dengan nuglets.
- Tiap node perantara mengambil sebagian.
- Mencegah pengiriman data tak berguna.
- Sulit menaksir jumlah nuglets yang cukup.
kolom: Packet trade (tujuan bayar)
- Node perantara membeli dan menjual paket.
- Tujuan membayar total biaya penerusan.
- Sumber tidak perlu menaksir biaya.
- Tidak mencegah node membanjiri jaringan.
Catatan: Misra subbab 3.2.1.1 (hlm. 45-46). Pada *packet purse*, paket yang kehabisan nuglets di tengah jalan langsung dibuang. Besaran yang diambil tiap node bisa bergantung pada energi terpakai, status baterai, dan jumlah nuglets node itu.

<!-- slide: compare -->
kicker: MENENTUKAN TARIF
judul: Tarif tetap sederhana, lelang lebih hemat
kolom: Tarif tetap per hop
- Semua node penerus mendapat jumlah sama.
- Tidak melihat energi atau status baterai.
- Mudah ditambahkan ke protokol routing mana pun.
- Tidak fleksibel terhadap kondisi node.
kolom: Lelang
- Calon *next hop* mengajukan harga tertutup.
- Penawar terendah memenangkan penerusan.
- Konsumsi energi lebih merata, umur jaringan lebih panjang.
- Rumit, menambah overhead dan latensi.
Catatan: Misra hlm. 46. Lelang hanya bisa dipakai bersama protokol routing multipath, karena node perlu punya beberapa pilihan jalur ke tujuan yang sama.

<!-- slide: points -->
kicker: SPRITE
judul: Sprite membayar lewat lembaga kliring
teks: Sprite memakai kredit dan sebuah *Credit Clearance Service* (CCS) untuk menentukan siapa membayar dan siapa dibayar (Misra hlm. 46-48).
- Simpan tanda terima | Node yang menerima pesan menyimpan tanda terima, lalu melapor saat terhubung ke CCS.
- Sumber yang dibebani | Pengirim yang dibebani biaya, bukan tujuan, agar tujuan tidak bisa dibanjiri.
- Bayaran bersyarat | Node hanya dianggap berhasil meneruskan jika node berikutnya melapor ke CCS.
Catatan: Misra hlm. 46-48 (Gambar 3.2). Tiga kecurangan yang ditangani: menyimpan tanda terima tanpa meneruskan, tidak melaporkan tanda terima karena bersekongkol dengan pengirim, dan meneruskan tanda terima saja tanpa pesannya.

<!-- slide: points -->
kicker: CONFIDANT
judul: Empat komponen di setiap node
teks: CONFIDANT adalah perluasan protokol reaktif yang mendeteksi dan mengisolasi node tidak kooperatif (Misra hlm. 48-50).
- Monitor | Semacam ronda tetangga: mengamati perilaku menyimpang di sekitarnya.
- Trust manager | Mengelola tabel alarm, tingkat kepercayaan, dan daftar teman penerima alarm.
- Path manager | Menyusun ulang peringkat jalur dan menghapus jalur berisi node tidak kooperatif.
Catatan: Misra hlm. 48-50 (Gambar 3.3). Peringkat node hanya diubah jika buktinya cukup dan kejadiannya melewati ambang tertentu, supaya tabrakan biasa tidak dianggap kecurangan.

<!-- slide: points -->
kicker: CORE
judul: CORE memakai tiga jenis reputasi
teks: CORE mengukur sumbangan sebuah node terhadap operasi jaringan (Misra hlm. 50-51).
- Subjektif | Dihitung sendiri dari pengamatan langsung lewat mekanisme *watchdog*.
- Tidak langsung | Berasal dari node lain; hanya informasi positif yang disebarkan.
- Fungsional | Terkait fungsi tertentu, dan tiap fungsi diberi bobot kepentingannya.
Catatan: Misra hlm. 50-51. Nilai reputasi CORE dinormalkan dari minus satu sampai plus satu, jadi perilaku baik bisa diberi imbalan. Kelemahannya: node bisa menabung reputasi baik lebih dulu, lalu berhenti kooperatif selama beberapa waktu.

<!-- slide: points -->
kicker: OCEAN
judul: OCEAN menolak laporan dari pihak ketiga
teks: OCEAN hanya memakai pengamatan langsung terhadap tetangga, tanpa reputasi dari node lain (Misra hlm. 51-52).
- Penilaian | Mulai dari netral; aksi positif menambah satu, aksi negatif mengurangi dua.
- Daftar bermasalah | Node dengan nilai di bawah ambang dimasukkan ke daftar dan dihindari lewat *avoid-list* RREQ.
- Kesempatan kedua | Node dikeluarkan dari daftar setelah diam beberapa waktu, tetapi nilainya tidak dinaikkan.
Catatan: Misra hlm. 51-52. Ambang yang dipakai di paper aslinya adalah minus empat puluh. Karena tidak ada pertukaran reputasi, kerumitan manajemen kepercayaan hilang, tetapi node butuh waktu lebih lama untuk mengenali tetangga nakal.

<!-- slide: table -->
kicker: PERBANDINGAN
judul: Tiga sistem reputasi bersebelahan
| Sistem | Sumber penilaian | Rentang nilai |
|---|---|---|
| CONFIDANT | Pengamatan sendiri plus alarm dari teman | Hanya nilai negatif |
| CORE | Pengamatan sendiri plus reputasi positif dari node lain | Minus satu sampai plus satu |
| OCEAN | Hanya pengamatan langsung terhadap tetangga | Naik satu, turun dua, ada ambang |
Catatan: Misra hlm. 48-52. Tanyakan ke kelas: sistem mana yang paling tahan terhadap tuduhan palsu, dan apa harganya? Jawabannya OCEAN, dengan harga pengenalan node nakal yang lebih lambat.

<!-- slide: points -->
kicker: MASALAH PRAKTIS
judul: Kedua pendekatan punya lubang
teks: Misra subbab 3.3 (hlm. 52-53) menutup bab dengan kelemahan yang belum terselesaikan.
- Perangkat keras | Nuglets butuh *tamper-proof hardware* agar node tidak menambah saldonya sendiri.
- Server terpusat | CCS milik Sprite tidak cocok untuk jaringan mandiri dan menjadi titik gagal tunggal.
- Penilaian palsu | Tanpa hubungan kepercayaan awal, sistem reputasi bisa goyah oleh tuduhan atau pujian palsu.
Catatan: Misra hlm. 52-53. Isu lain untuk riset lanjutan: serangan Sybil, yaitu satu node memakai banyak identitas sekaligus (hlm. 53). Ini kita bahas lagi di minggu 8.

<!-- slide: points -->
kicker: PENGECUALIAN
judul: Kadang egois itu masuk akal
teks: Misra hlm. 54 mencatat bahwa perilaku hemat tidak selalu salah.
- Menyimpan daya | Node menahan diri agar dayanya cukup untuk aplikasi yang lebih kritis.
- Posisi kritis | Node yang menjadi satu-satunya penghubung dua grup punya alasan untuk memilih trafik.
- Konsekuensinya | Sistem insentif perlu menyeimbangkan dorongan kerja sama dan pemborosan sumber daya.
Catatan: Misra hlm. 54. Pertanyaan diskusi: bagaimana sistem reputasi bisa membedakan node yang benar-benar egois dari node yang sedang menghemat daya untuk tugas penting?

<!-- slide: points -->
kicker: CEK PEMAHAMAN
judul: Jawab singkat sebelum jeda
- Nuglets | Model mana yang lebih rawan disalahgunakan untuk membanjiri jaringan?
- Sprite | Kenapa pengirim yang dibebani biaya, bukan tujuan?
- Reputasi | Kenapa CORE hanya menyebarkan informasi reputasi yang positif?
Catatan: Jawaban: (1) *packet trade*, karena pengirim tidak dibebani biaya; (2) agar tujuan tidak bisa diserang dengan membanjirinya dengan trafik; (3) agar node jahat tidak bisa menyebarkan penilaian negatif palsu. Setelah ini, jeda 10 menit.

<!-- slide: section -->
nomor: 03
judul: Alamat unik tanpa DHCP
teks: Setiap node butuh alamat unik sebelum ikut routing. DHCP butuh server pusat, padahal server itu belum tentu terjangkau.
Catatan: Bagian 3, sekitar 40 menit. Misra bab 14 subbab 14.2-14.4 (hlm. 336-344).

<!-- slide: points -->
kicker: MASALAH
judul: Skema alamat tradisional tidak cocok
teks: Misra subbab 14.2.3 (hlm. 337).
- Stateful butuh server | Topologi berubah terus, dan server pusat belum tentu terjangkau.
- Stateless butuh satu hop | Skema ini menganggap semua node terjangkau lewat broadcast satu hop.
- MAC tidak selalu unik | Alamat MAC bisa diubah, tidak semua perangkat punya, dan membuka identitas node.
Catatan: Misra hlm. 337. Zeroconf melakukan *duplicate address detection* (DAD) lewat ARP, yang belum tentu bisa di MANET. Alamat MAC 48 bit juga terlalu panjang untuk alamat IPv4.

<!-- slide: compare -->
kicker: STATEFUL VS STATELESS
judul: MANETconf minta izin, QDAD mengecek duplikat
kolom: MANETconf (stateful)
- Node baru meminta alamat lewat *initiator*.
- Initiator meminta izin ke semua node.
- Semua setuju: alamat diberikan.
- Menangani partisi dan penggabungan jaringan.
kolom: Query-based DAD (stateless)
- Node memilih alamat acak.
- Node mengirim AREQ untuk alamat itu.
- Tidak ada AREP setelah beberapa kali: alamat dipakai.
- Gagal jika delay tak terbatas saat partisi.
Catatan: Misra subbab 14.3.1.1 dan 14.3.2.1 (hlm. 337-341). QDAD mengulang AREQ sampai batas percobaan; jika tetap tidak ada balasan, alamat dianggap aman dipakai.

<!-- slide: points -->
kicker: MANETCONF
judul: Dua tabel di setiap node terkonfigurasi
teks: MANETconf mencegah dua node mendapat alamat sama pada saat bersamaan (Misra hlm. 337-338).
- Tabel allocated | Berisi semua alamat yang sedang dipakai di dalam MANET.
- Tabel pending | Berisi alamat yang proses pemberiannya dimulai tetapi belum selesai.
- Satu suara menolak | Jika ada satu jawaban negatif, initiator mengulang proses dengan alamat lain.
Catatan: Misra hlm. 337-338. Node baru masuk dengan menyiarkan *Neighbor-Query*. Jika tidak ada jawaban, ia menganggap dirinya node pertama dan memberi alamat untuk dirinya sendiri.

<!-- slide: points -->
kicker: PARTISI DAN GABUNG
judul: Setiap partisi punya identitas sendiri
teks: MANETconf menangani jaringan yang terpecah lalu menyatu lagi (Misra hlm. 338).
- ID partisi | Pasangan alamat terendah yang dipakai dan sebuah UUID.
- Mendeteksi gabungan | Dua node yang bertemu menukar ID partisi; kalau berbeda, berarti terjadi penggabungan.
- Menyelesaikan konflik | Tabel alamat digabung; alamat yang muncul di keduanya harus diganti salah satunya.
Catatan: Misra hlm. 338. Yang disarankan mengalah adalah node dengan koneksi TCP lebih sedikit atau berumur pendek, agar komunikasi yang berjalan tidak terganggu.

<!-- slide: points -->
kicker: BUDDY
judul: Buddy membagi kolam alamat dua-dua
teks: Protokol Buddy memecah tabel alamat di antara semua node, jadi node tidak perlu minta izin (Misra hlm. 338-339).
- Pembelahan biner | Node yang didatangi memberi separuh kolam alamatnya ke node baru.
- Keluar baik-baik | Node yang pamit mengembalikan kolamnya ke tetangga untuk digabung lagi.
- Bocornya | Node yang hilang mendadak membawa kolamnya, jadi node perlu sinkronisasi berkala.
Catatan: Misra hlm. 338-339. Kelemahan utamanya: pemakaian ruang alamat tidak merata jika banyak node baru bergabung di satu area kecil. Penawarnya: alokasi jarak jauh dan pengumpulan alamat yang menganggur.

<!-- slide: points -->
kicker: PROPHET DAN PRIME DHCP
judul: Alamat dihitung, bukan ditanyakan
teks: Dua skema ini memberi alamat tanpa membanjiri jaringan dengan pertanyaan (Misra hlm. 339-341).
- Prophet | Node memakai fungsi barisan berkeadaan; tiap node baru menerima satu angka dan satu benih.
- Prime DHCP | Setiap node menjadi proksi DHCP dan memakai algoritma penomoran bilangan prima.
- Untungnya | Cukup broadcast satu hop, jadi overhead komunikasinya jauh lebih kecil.
Catatan: Misra hlm. 339-341 (Gambar 14.1). Pada PNAA, akar berlamat 1 dan membagikan bilangan prima; node beralamat X membagikan kelipatan X dengan faktor prima yang tidak lebih kecil dari faktor prima terbesar X. Pada Prophet, peluang tabrakan alamat tidak bisa dihilangkan sama sekali.

<!-- slide: compare -->
kicker: DUA VERSI DAD
judul: Weak DAD toleran, passive DAD hemat
kolom: Weak DAD
- Alamat kembar boleh ada, asal paket tidak salah alamat.
- Tiap node membuat kunci unik saat mulai.
- Kunci disebarkan bersama alamat di paket routing.
- Beban routing naik seiring panjang kunci.
kolom: Passive DAD
- Konflik dideteksi dari trafik routing yang sudah ada.
- Tidak menambah paket kontrol baru.
- Memanfaatkan aturan nomor urut paket link state.
- Perlu hati-hati saat nomor urut berputar kembali.
Catatan: Misra subbab 14.3.2.2 dan 14.3.2.3 (hlm. 341-343). *Strong DAD* tidak bisa dijamin jika delay antarnode tidak terbatas, dan itu justru sering terjadi saat jaringan terpecah lalu menyatu. Jika dua node kebetulan memilih alamat sekaligus kunci yang sama, *weak DAD* tidak bisa mendeteksinya.

<!-- slide: points -->
kicker: PACMAN
judul: PACMAN menggabungkan dua gagasan
teks: PACMAN memilih alamat secara probabilistik, lalu mendeteksi konflik secara pasif (Misra hlm. 343).
- Sisi stateless | Node memberi alamat untuk dirinya sendiri saat bergabung.
- Sisi stateful | Tabel alokasi alamat tetap dipelihara agar alamat hampir selalu unik.
- Menyelesaikan konflik | Pesan ACN dikirim *unicast* ke arah datangnya paket routing yang bentrok.
Catatan: Misra hlm. 343. Konflik baru mungkin terjadi saat banyak node bergabung sekaligus, misalnya ketika dua jaringan menyatu, sehingga tabel alokasi belum sempat mutakhir.

<!-- slide: table -->
kicker: MEMILIH SKEMA
judul: Empat metrik yang perlu diukur
| Metrik | Yang diukur |
|---|---|
| Latensi alokasi | Waktu dari mulai konfigurasi sampai node mendapat alamat |
| Overhead komunikasi | Jumlah paket kontrol, baik broadcast maupun unicast |
| Skalabilitas | Makin banyak komunikasi multihop, makin buruk skalabilitasnya |
| Kerumitan | Skema yang terlalu rumit tidak realistis untuk perangkat bergerak |
Catatan: Misra subbab 14.4 (hlm. 343-344). Kim dkk. menyusun model analitis untuk membandingkan QDAD, MANETconf, skema berbasis token, dan skema berbasis tetangga dengan dua metrik pertama.

<!-- slide: table -->
kicker: RINGKASAN
judul: Yang perlu dibawa ke minggu 5
| Gagasan | Intinya |
|---|---|
| Hidden terminal | Dua pengirim yang tidak saling mendengar bisa menabrak di penerima |
| LCA | Aturan ID sederhana cukup untuk membentuk cluster tanpa pusat |
| Self-healing | Pantau, deteksi, diagnosis, putuskan, cegah |
| Kooperasi | Insentif membayar jasa, reputasi mengisolasi yang tidak kooperatif |
| Alamat | Stateful minta izin, stateless mengecek duplikat, hibrid menggabungkan |
Catatan: Minggu 5 berpindah ke lapisan yang lebih bawah: bagaimana gerak node dan perambatan sinyal dimodelkan, dan apa akibatnya bagi semua protokol yang sudah kita bahas.

<!-- slide: points -->
kicker: KUIS
judul: Kerjakan berpasangan, 15 menit
- Hidden terminal | Kenapa CSMA biasa tidak cukup? Apa peran CTS?
- Partisi | Dua partisi MANETconf bergabung. Bagaimana konflik alamat diselesaikan?
- Pilih skema | Untuk jaringan 200 node yang sering terpecah, pilih MANETconf, Buddy, atau PACMAN? Beri alasan.
Catatan: Kunci soal 2: kedua node menukar tabel alamat; alamat yang muncul di keduanya konflik, dan salah satu node (sebaiknya yang koneksinya lebih sedikit) mengambil alamat baru (Misra hlm. 338). Soal 3 dinilai dari alasannya: MANETconf mahal di overhead untuk 200 node, Buddy rawan bocor alamat saat node hilang mendadak, PACMAN menekan overhead tetapi menerima kemungkinan konflik.

<!-- slide: closing -->
judul: Diskusi
teks: Sebelum pertemuan 5, baca Misra bab 9, 10, dan 11.
Catatan: Pertemuan 5 membahas model mobilitas dan propagasi radio.
