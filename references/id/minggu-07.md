---
minggu: 7
judul: QoS, Delay, Kongesti, dan Energi
dosen: Muhammad Ridho Kurniawan Pratama, M.T.I.
sumber:
  - Misra, Woungang & Misra (2009), *Guide to Wireless Ad Hoc Networks*, bab 4, 12, 13, dan 15
  - Loo, Lloret & Ortiz (2012), *Mobile Ad Hoc Networks*, bab 8
---

# Minggu 7: QoS, Delay, Kongesti, dan Energi

Rujukan: Misra bab 12 (hlm. 281-310), bab 13 (hlm. 311-332), bab 15 (hlm. 355-390), subbab 4.3.4.2; Loo bab 8 (hlm. 201-230).
Durasi: 150 menit (3 SKS).

<!-- slide: cover -->
kicker: PERTEMUAN 7 · INTEGRASI JARINGAN MANDIRI/MOBILE
judul: QoS, Delay, Kongesti, dan Energi
subjudul: Integrasi Jaringan Mandiri/Mobile · Pertemuan 7
Catatan: Sampai minggu 6 fokusnya "apakah paket sampai". Minggu ini: seberapa cepat, seberapa stabil, dan berapa ongkos energinya.

<!-- slide: disclosure -->

<!-- slide: agenda -->
kicker: TUJUAN PERTEMUAN
judul: Setelah pertemuan ini, Anda dapat:
- Menjelaskan kenapa QoS sulit di MANET | Enam tantangan dari Misra bab 12.
- Membedakan IntServ dan DiffServ | Status per aliran dibanding kelas layanan agregat.
- Menjelaskan alarm kongesti palsu | Kenapa TCP salah membaca paket hilang di jaringan nirkabel.
- Membandingkan routing hemat energi | Satu metrik biaya dibanding vektor biaya.
Catatan: Materi ini bahan pilihan topik proyek akhir yang berfokus pada kinerja.

<!-- slide: agenda -->
kicker: ALUR 150 MENIT
judul: Tiga bagian dan satu sesi kuis
- Bagian 1: QoS (50 menit) | Tantangan, model layanan, signaling, dan QoS routing.
- Bagian 2: delay dan kongesti (45 menit) | Kendali delay lintas lapis dan alarm kongesti palsu.
- Bagian 3: energi (35 menit) | Single-cost, multicost, dan multicast hemat energi.
- Kuis dan diskusi (20 menit) | Dikerjakan berpasangan di akhir pertemuan.
Catatan: Sisipkan jeda 10 menit setelah bagian 2. Cek pemahaman singkat ada di akhir tiap bagian.

<!-- slide: quote -->
kutipan: QoS adalah tingkat kinerja layanan yang diberikan jaringan kepada pengguna.
sumber: Diterjemahkan dari Misra, Woungang & Misra (2009), bab 12, hlm. 281
Catatan: Permintaan layanan biasanya dinyatakan dengan bandwidth minimum, delay maksimum, variasi delay maksimum, dan laju kehilangan paket maksimum (Misra hlm. 282).

<!-- slide: section -->
nomor: 01
judul: Menjanjikan layanan tanpa jaminan
teks: QoS berarti jaringan menjanjikan tingkat layanan tertentu. Di MANET, hampir semua bahan untuk janji itu berubah-ubah.
Catatan: Bagian 1, sekitar 50 menit. Misra bab 12 subbab 12.2-12.8 (hlm. 284-302).

<!-- slide: points -->
kicker: UKURAN LAYANAN
judul: Empat besaran yang dijanjikan
teks: Misra hlm. 282-284 menyebut besaran yang dipakai saat aplikasi meminta layanan.
- Bandwidth dan delay | Bandwidth minimum dan delay maksimum yang masih bisa diterima aplikasi.
- Jitter | Variasi delay antarpaket akibat antrean yang berubah-ubah di tiap node.
- Kehilangan paket | Laju paket hilang maksimum yang masih ditoleransi.
Catatan: Misra hlm. 283-284. Untuk aplikasi sangat interaktif seperti telepon IP, delay ujung ke ujung di bawah 150 milidetik tidak terasa oleh pendengar.

<!-- slide: compare -->
kicker: MENYIMPAN STATUS
judul: Hard state kaku, soft state menyesuaikan
kolom: Hard state
- Rute dan reservasi tetap selama sesi berlangsung.
- Menjamin QoS selama waktu sesi itu.
- Cocok untuk jaringan kabel dengan jalur tetap.
- Terlalu kaku untuk topologi yang berubah.
kolom: Soft state
- Reservasi disegarkan oleh paket data yang lewat.
- Jika tidak ada paket sampai timer habis, sumber daya dilepas.
- Pelepasan terjadi sepenuhnya terdistribusi.
- Cocok untuk MANET yang jalurnya berubah cepat.
Catatan: Misra subbab 12.2.7 (hlm. 284). Pada soft state, paket data yang tiba di router tanpa reservasi justru memicu kontrol penerimaan dan reservasi baru. Masa berlaku sambungan ditentukan timer, bukan durasi sesi.

<!-- slide: table -->
kicker: TANTANGAN QOS
judul: Enam penyebab QoS sulit dijamin di MANET
| Tantangan | Akibatnya |
|---|---|
| Topologi dinamis | Jalur sering putus; sesi QoS harus dibangun ulang dan paket melewati tenggat |
| Kanal rawan galat | Atenuasi, interferensi, dan fading menyulitkan jaminan rasio pengiriman |
| Tanpa koordinasi pusat | Protokol hanya memakai informasi lokal; overhead naik |
| Informasi state tidak presisi | Keputusan routing bisa keliru |
| Sumber daya terbatas | Memori dan baterai membatasi state QoS yang bisa disimpan |
| Hidden terminal | Tabrakan memaksa retransmisi, tidak cocok untuk aliran ketat |
Catatan: Misra subbab 12.3 (hlm. 284-286). Hidden terminal sudah dibahas di minggu 4. Misra juga mencatat banyak persoalan QoS routing bersifat NP-complete, sehingga menuntut heuristik yang membebani prosesor node.

<!-- slide: points -->
kicker: FAKTOR PENGUJIAN
judul: Yang mengubah hasil uji protokol QoS
teks: Misra subbab 12.4 (hlm. 286-287) mendaftar parameter yang paling memengaruhi hasil evaluasi.
- Mobilitas node | Kecepatan minimum dan maksimum, pola kecepatan, dan waktu jeda.
- Ukuran dan trafik | Makin besar jaringan, makin sulit menyebarkan state; jumlah dan jenis sumber trafik ikut menentukan.
- Daya pancar | Daya lebih besar menambah tetangga, tetapi juga menambah interferensi dan link satu arah.
Catatan: Misra hlm. 286-287. Daftar ini bersambung dengan minggu 5 dan 6: parameter yang sama menentukan apakah hasil simulasi bisa dipercaya.

<!-- slide: compare -->
kicker: MODEL QOS
judul: IntServ per aliran, DiffServ per kelas
kolom: IntServ
- Status disimpan untuk setiap aliran di tiap router.
- Dua kelas: *Guaranteed* dan *Controlled Load*.
- Memakai RSVP sebagai protokol signaling.
- Jaminan kuantitatif per aliran, sulit diskalakan.
kolom: DiffServ
- Jumlah kelas layanan terbatas dan agregat.
- Router tepi menandai field DS di header IP.
- Router inti meneruskan berdasarkan PHB.
- Router inti tidak menyimpan status per aliran.
Catatan: Misra subbab 12.5.1-12.5.2 (hlm. 287-290). Keduanya dirancang untuk Internet, jadi perlu disesuaikan sebelum dipakai di MANET.

<!-- slide: points -->
kicker: FQMW
judul: Model pertama khusus untuk MANET
teks: FQMW menggabungkan sifat per aliran milik IntServ dan pembedaan layanan milik DiffServ (Misra hlm. 290-292).
- Idenya | Prioritas tertinggi dilayani per aliran, kelas lain dilayani per kelas.
- Tiga peran node | Ingress mengirim, core meneruskan, egress menerima; perannya tidak terkait posisi fisik.
- Masalah yang tersisa | Berapa banyak sesi yang bisa dilayani per aliran, dan field DS hanya 8 bit.
Catatan: Misra hlm. 290-292 (Gambar 12.4). Di node ingress dipasang *traffic conditioner* yang menandai ulang, membuang, atau membentuk paket sesuai profil trafik. FQMW kemudian dikembangkan menjadi skema RBSD.

<!-- slide: points -->
kicker: SWAN
judul: Umpan balik SWAN adalah delay MAC
teks: SWAN menangani pembedaan layanan tanpa menyimpan status per aliran (Misra hlm. 292-293).
- Tiga komponen | Pengendali penerimaan, pengklasifikasi paket, dan pengendali laju.
- Cara kerjanya | Trafik *best effort* ditahan agar aliran waktu nyata mendapat bandwidth yang dibutuhkan.
- Bedanya dari TCP | Umpan baliknya delay MAC, bukan paket hilang.
Catatan: Misra hlm. 292-293 (Gambar 12.5). Kelemahannya: jaminannya lemah, uji penerimaan hanya di sumber lewat paket probe, dan perhitungan bandwidth tidak memperhitungkan trafik best effort.

<!-- slide: points -->
kicker: INSIGNIA
judul: Signaling menumpang paket data
teks: INSIGNIA adalah protokol signaling pertama yang dirancang khusus untuk MANET (Misra hlm. 294-295).
- In-band | Informasi kontrol dibawa di opsi IP setiap paket data, bukan paket kontrol terpisah.
- Kenapa begitu | Signaling terpisah seperti RSVP terlalu berat dan berebut kanal dengan paket data.
- Saat sumber daya kurang | Aliran diturunkan menjadi layanan best effort, tanpa pesan penolakan.
Catatan: Misra hlm. 294-295 (Gambar 12.6 dan 12.7). Status aliran dikelola secara *soft state* dan disegarkan pesan signaling yang lewat. Penjadwalan paketnya memakai *weighted round-robin* yang memperhitungkan kondisi kanal.

<!-- slide: context -->
kicker: QOS ROUTING
judul: Jalur terpendek belum tentu memenuhi syarat
teks: Angka pada tiap link adalah bandwidth yang tersedia. Aliran dari A ke E meminta jaminan 3 Mbps.
Jalur A-D-E lebih pendek, tetapi kapasitasnya tidak cukup. QoS routing memilih A-B-C-E meskipun jumlah hop-nya lebih banyak.
graf:
  simpul: A@0,1 B@1,2 C@2,2 D@1,0 E@3,1
  sisi: A-B B-C C-E A-D D-E
  jalur: A>B>C>E
  peran: A=sumber E=tujuan
  keterangan: Jalur terpilih A, B, C, E memenuhi syarat 3 Mbps; A, D, E tidak.
Catatan: Misra subbab 12.8 (hlm. 298, Gambar 12.9). Definisi QoS routing: mencari jalur layak terbaik dari sumber ke tujuan yang memenuhi sekumpulan batasan. Kesulitannya: overhead penyimpanan state, informasi link yang cepat basi, dan rute yang bisa putus setelah reservasi dibuat.

<!-- slide: table -->
kicker: KELAS PROTOKOL
judul: QoS routing dilihat dari lapisan MAC
| Kelas | Yang diandalkan | Jaminan yang bisa diberikan |
|---|---|---|
| Bergantung MAC bebas tabrakan | TDMA atau sejenisnya | Pseudo-hard: keras kecuali saat kanal atau node berubah |
| Bergantung MAC berebut | Perkiraan statistik sumber daya | Lunak, berdasarkan peluang |
| Tidak bergantung MAC | Perkiraan keadaan node dan link | Tidak ada janji; hanya rata-rata yang lebih baik |
Catatan: Misra subbab 12.8.1 (hlm. 299-300, Gambar 12.10). Jaminan QoS yang benar-benar keras hanya mungkin di jaringan kabel. Misra juga mengelompokkan protokol menjadi *coupled* dan *decoupled* terhadap mekanisme penyedia QoS (hlm. 300-301).

<!-- slide: points -->
kicker: CEK PEMAHAMAN
judul: Jawab singkat sebelum lanjut
- IntServ di MANET | Kenapa menyimpan status per aliran di tiap node sulit dipertahankan saat topologi berubah?
- Soft state | Apa yang membuat reservasi soft state terlepas dengan sendirinya?
- QoS routing | Kenapa jalur dengan hop paling sedikit belum tentu dipilih?
Catatan: Jawaban: (1) rute berubah terus, jadi status ikut basi dan harus dibangun ulang; (2) tidak ada paket data yang menyegarkannya sampai timer habis; (3) jalur itu bisa tidak memenuhi syarat bandwidth atau delay.

<!-- slide: section -->
nomor: 02
judul: Delay dan kongesti yang disalahpahami
teks: Di jaringan kabel, paket hilang hampir selalu berarti antrean penuh. Di jaringan multihop nirkabel, tidak selalu.
Catatan: Bagian 2, sekitar 45 menit. Misra bab 13 (hlm. 311-315) dan bab 15 subbab 15.4-15.5 (hlm. 362-370).

<!-- slide: numbers -->
kicker: ANGKA DARI BUKU
judul: Delay dan energi punya batas nyata
- 400 ms | batas atas delay satu arah untuk telepon (rentang 25-400 ms)
- 10% | porsi konsumsi daya laptop untuk aktivitas jaringan
- 50% | porsi yang sama pada perangkat genggam
sumber: Misra bab 13, hlm. 311 (delay); Misra bab 4, hlm. 87, mengutip Kravets dan Krishnan 1998 (daya)
Catatan: Rentang 25 sampai 400 milidetik bergantung pada kualitas suara yang diinginkan dan ada tidaknya peredam gema. Angka daya berasal dari eksperimen tahun 1998; perangkat sekarang berbeda, tetapi pesannya tetap: jaringan memakan porsi besar energi perangkat kecil.

<!-- slide: points -->
kicker: MENGENDALIKAN DELAY
judul: Tiga hal yang menyulitkan
teks: Misra subbab 13.1 (hlm. 311) menyebut kesulitan mengendalikan delay ujung ke ujung di jaringan 802.11.
- Bandwidth terbatas | Jauh lebih sempit dibanding jaringan kabel yang setara.
- Kanal berubah-ubah | Sifat galat dan kapasitas yang berubah membuat jaminan keras hampir mustahil.
- Mobilitas | Gerak pengguna memicu *fading*, dan kualitas layanan bisa turun cepat.
Catatan: Misra hlm. 311. Karena itu pendekatan yang dipilih bab ini adalah adaptasi: menyesuaikan kelas layanan aplikasi memakai teori kendali umpan balik, bukan menjanjikan angka tetap.

<!-- slide: table -->
kicker: LINTAS LAPIS
judul: Kendali delay di tiga lapisan
| Lapisan dan komponennya | Tugasnya |
|---|---|
| Middleware: Classifier, Monitor, Priority Adaptor | Memetakan prioritas ke kelas layanan dan memantau pelanggaran delay |
| Jaringan: Queue Management | Mengatur buffer, menandai atau membuang paket |
| Jaringan: Differentiated Scheduler | Memilih paket yang dikirim dan membagi bandwidth antar-aliran |
| MAC: penjadwal MAC | Mengatur giliran akses kanal antarnode |
Catatan: Misra subbab 13.3 (hlm. 313-314). Penjadwal MAC dan penjadwal lapisan jaringan dirancang bersama karena keduanya saling terikat. Delay diukur dengan menempelkan *timestamp* pada paket, lalu merata-ratakan sejumlah pengukuran waktu pulang pergi (hlm. 314-315).

<!-- slide: points -->
kicker: ALARM PALSU
judul: TCP salah membaca paket yang hilang
teks: Misra subbab 15.4.1 (hlm. 363-364) menjelaskan kenapa mekanisme kongesti konvensional tidak efektif.
- Mobilitas | Rute putus saat node bergerak. Delay pencarian rute baru dibaca TCP sebagai kongesti.
- Galat kanal | Paket bisa hilang karena kanal, bukan karena antrean penuh.
- Trafik meledak | CSMA/CA tidak adil dalam jangka pendek, sehingga paket dikirim bergelombang.
Catatan: TCP menganggap ada kongesti bila tidak menerima ACK untuk tiga paket data atau saat *timeout*. Setelah itu ia mundur agresif dan memulai *slow start*, padahal rutenya mungkin sudah pulih.

<!-- slide: points -->
kicker: ELFN
judul: Beri tahu TCP bahwa link yang putus
teks: Misra subbab 15.5.1.1 (hlm. 367) menjelaskan penawar alarm palsu yang paling dikenal.
- Cara kerjanya | Lapisan MAC yang gagal mengirim ulang memberi tahu lapisan routing, yang mengirim ELFN ke sumber.
- Yang dilakukan TCP | Membekukan variabel kongesti, termasuk ukuran jendela, sampai rute pulih.
- Kelemahannya | Semua kegagalan pengiriman ulang dianggap akibat mobilitas, padahal bisa jadi kongesti sungguhan.
Catatan: Misra hlm. 367. Contoh kasus kongesti sungguhan yang disalahartikan: skenario hidden terminal. ATP mengambil pendekatan berbeda: laju kirim ditentukan umpan balik delay, bukan jendela, sehingga trafik tidak bergelombang (hlm. 368).

<!-- slide: context -->
kicker: KONGESTI ITU LOKAL
judul: Aliran di tengah bisa nyaris tidak kebagian
teks: Link A-B dan E-F bisa mengirim bersamaan, tetapi link C-D hanya bisa mengirim saat keduanya diam.
Jika semua link jenuh, C-D nyaris tidak pernah mendapat giliran. Simulasi yang dikutip Misra menunjukkan throughput-nya hanya sekitar 1% dari total.
graf:
  simpul: A@0,0 B@1,0 C@2,0 D@3,0 E@4,0 F@5,0
  sisi: A-B B-C C-D D-E E-F
  jalur: C>D
  peran: C=sumber D=tujuan
  keterangan: Masalah flow-in-the-middle: aliran C ke D terjepit dua aliran tetangganya.
Catatan: Misra subbab 15.4.2.2 (hlm. 365-366, Gambar 15.2). Pelajarannya: kongesti di MANET tidak merata seperti di LAN kabel, melainkan bergantung posisi node. Pergeseran posisi kecil saja bisa menghilangkan ketidakadilan ini.

<!-- slide: points -->
kicker: METRIK LINK
judul: ETX mengalahkan jumlah hop
teks: Misra subbab 15.5.2 (hlm. 368-369) menjelaskan kenapa metrik kualitas link lebih baik daripada jumlah hop.
- Masalah hop count | Hop lebih sedikit berarti hop lebih panjang, dan kualitas link menurun dengan jarak.
- Rumus ETX | Satu dibagi hasil kali peluang sukses arah maju dan arah balik.
- Cara mengukurnya | Tiap node menyiarkan paket probe berkala, lalu menghitung laju paket hilang dari catatan tetangga.
Catatan: Misra hlm. 368-369. ETX menghasilkan hop yang lebih pendek dan jumlah hop lebih banyak, tetapi throughput TCP-nya tetap lebih baik daripada routing berbasis jumlah hop. Kita sudah memakai ETX di minggu 1 untuk membaca data Berlin.

<!-- slide: points -->
kicker: MEMILIH PENDEKATAN
judul: Jaringan bergerak dan jaringan diam beda
teks: Misra subbab 15.6.1 (hlm. 370) memberi panduan praktis memilih mekanisme kendali kongesti.
- Jaringan bergerak | Rawan alarm palsu, jadi perlu pesan kontrol seperti ELFN.
- Jaringan diam | Putus karena jarak jarang terjadi; routing sadar kualitas link sudah cukup.
- Konsekuensinya | Di jaringan diam, TCP standar bisa dipakai tanpa banyak modifikasi.
Catatan: Misra hlm. 370. Misra juga menyerukan standardisasi aliran informasi kontrol dari lapisan routing ke TCP, karena protokol routing MANET sangat beragam.

<!-- slide: points -->
kicker: CEK PEMAHAMAN
judul: Jawab singkat sebelum jeda
- Alarm palsu | Beri satu kejadian di MANET yang membuat TCP salah mengira ada kongesti.
- ELFN | Apa yang dilakukan TCP setelah menerima pesan ELFN?
- ETX | Kenapa rute dengan hop paling sedikit bisa justru lebih lambat?
Catatan: Jawaban: (1) rute putus karena node bergerak, atau paket hilang karena galat kanal; (2) membekukan variabel kongesti sampai rute pulih, sehingga tidak perlu slow start; (3) hop panjang berarti link lemah, jadi banyak pengiriman ulang. Setelah ini, jeda 10 menit.

<!-- slide: section -->
nomor: 03
judul: Routing hemat energi
teks: Tanpa infrastruktur, energi menjadi sumber daya yang langsung membatasi kinerja jaringan.
Catatan: Bagian 3, sekitar 35 menit. Loo bab 8 subbab 8.1-8.3 (hlm. 202-210).

<!-- slide: points -->
kicker: DUA TUJUAN
judul: Hemat total, atau panjang umur
teks: Loo hlm. 203 membedakan dua sudut pandang efisiensi energi yang sering tertukar.
- Total energi | Meminimalkan seluruh energi yang dipakai untuk satu tugas komunikasi.
- Umur jaringan | Memaksimalkan waktu sampai node pertama kehabisan daya.
- Kesamaannya | Keduanya mencari jalur yang meminimalkan suatu metrik biaya terkait energi.
Catatan: Loo hlm. 203. Perbedaan ini penting untuk proyek akhir: jalur yang paling hemat total energi bisa saja menghabiskan satu node kritis lebih cepat.

<!-- slide: points -->
kicker: SINGLE-COST
judul: Empat cara memakai satu metrik
teks: Loo subbab 8.2.1 (hlm. 203-204) meringkas pendekatan yang memakai satu metrik skalar.
- Sisa energi | Biaya link ditentukan energi awal dan energi node pengirim saat ini.
- Menghindari node kritis | Node yang energinya hampir habis dikeluarkan dari pemilihan rute.
- Kendali daya dan tidur | Daya pancar diatur, dan node bisa memilih tidur atau ikut jadi tulang punggung.
Catatan: Loo hlm. 203-204, merujuk Chang dan Tassiulas, Toh, LEAR, dan Span. Metrik lain yang disebut: sisa baterai dikombinasikan dengan jumlah tetangga, serta perkiraan jumlah pengiriman ulang untuk pengiriman andal.

<!-- slide: compare -->
kicker: SINGLE-COST VS MULTICOST
judul: Satu angka biaya atau vektor biaya
kolom: Single-cost
- Setiap link diberi satu metrik skalar.
- Metrik bisa gabungan beban, energi, interferensi.
- Biasanya menghasilkan satu jalur per pasangan node.
- Sulit mendukung pembedaan QoS.
kolom: Multicost
- Setiap link diberi vektor beberapa parameter biaya.
- Jalur kandidat yang tidak didominasi dikumpulkan.
- Jalur terbaik dipilih dengan fungsi optimasi.
- Konsumsi energi lebih seimbang menurut hasil Loo.
Catatan: Loo subbab 8.1 dan 8.3 (hlm. 202-210). Biaya jalur diperoleh dengan menerapkan operator asosiatif pada tiap komponen vektor biaya link, lalu jalur optimal dipilih dengan meminimalkan fungsi optimasi.

<!-- slide: points -->
kicker: HARGANYA
judul: Multicost lebih mahal untuk dihitung
teks: Loo hlm. 204 mencatat bahwa pendekatan multicost tidak gratis.
- Kerumitannya | Mencari jalur dengan dua batasan biaya atau lebih umumnya NP-complete.
- Jalan keluarnya | Algoritma yang ada memakai heuristik dan aproksimasi berwaktu polinomial.
- Di jaringan nirkabel | Masalah multicost justru kurang dipelajari, padahal batasan energinya nyata.
Catatan: Loo hlm. 204. Ini titik masuk yang baik untuk proyek akhir bertema kinerja: bandingkan satu metrik gabungan dengan vektor dua parameter pada skenario yang sama.

<!-- slide: points -->
kicker: MULTICAST HEMAT ENERGI
judul: Pohon dibangun dari penambahan termurah
teks: Loo subbab 8.2.2 (hlm. 204-205) meringkas algoritma dasar untuk broadcast dan multicast hemat energi.
- MST dan SPT | Pohon rentang berenergi minimum, dan pohon jalur terpendek lewat Dijkstra.
- BIP | Node ditambahkan satu per satu, dipilih yang biaya tambahannya paling kecil.
- Turunannya | BAIP menambah beberapa node sekaligus; GPBE memakai jumlah node baru per satuan daya.
Catatan: Loo hlm. 204-205. Kelompok algoritma ini disebut *augmentation*: dimulai dari himpunan kosong lalu diperbesar menjadi pohon multicast atau broadcast.

<!-- slide: points -->
kicker: PENCARIAN LOKAL
judul: Perbaiki pohon yang sudah ada
teks: Kelompok kedua memperbaiki topologi awal selangkah demi selangkah (Loo hlm. 205-206).
- Sweep | Membuang pengiriman yang tidak perlu karena sifat siaran nirkabel.
- EWMA dan LESS | Menaikkan daya satu node bila itu membuat node lain berhenti memancar.
- r-shrink | Memperkecil radius pancar tiap node sampai pendengarnya kurang dari r.
Catatan: Loo hlm. 205-206. Algoritma berhenti ketika tidak ada lagi perbaikan yang bisa didapat. Sebagian besar algoritma ini menganggap daya pancar node bisa diatur.

<!-- slide: table -->
kicker: RINGKASAN
judul: Yang perlu dibawa ke minggu 8
| Gagasan | Intinya |
|---|---|
| QoS itu janji | Bandwidth, delay, jitter, dan kehilangan paket, semuanya berubah di MANET |
| Soft state | Reservasi disegarkan trafik, bukan dikunci selama sesi |
| Alarm palsu | Paket hilang di MANET belum tentu berarti antrean penuh |
| ETX | Kualitas link mengalahkan jumlah hop sebagai metrik |
| Energi | Hemat total dan umur jaringan adalah dua tujuan berbeda |
Catatan: Minggu 8 menambahkan satu lapis lagi ke semua ini: apa yang terjadi kalau ada node yang sengaja berbohong, dan bagaimana kita memutuskan siapa yang dipercaya.

<!-- slide: points -->
kicker: KUIS
judul: Kerjakan berpasangan, 15 menit
- IntServ di MANET | Kenapa menyimpan status per aliran di setiap node sulit dipertahankan saat topologi berubah?
- Alarm palsu | Beri satu kejadian di MANET yang membuat TCP salah mengira ada kongesti, dan satu cara mengatasinya.
- Multicost | Sebutkan dua parameter biaya yang masuk akal untuk vektor biaya, dan jelaskan alasannya.
Catatan: Soal 3 tidak punya satu jawaban benar; contoh yang baik: sisa energi node dan jumlah hop, atau ETX dan sisa baterai. Nilai alasannya, bukan pilihannya.

<!-- slide: closing -->
judul: Diskusi
teks: Sebelum pertemuan 8, baca Misra bab 17 sampai 20.
Catatan: Pertemuan 8 membahas keamanan dan trust, lalu brief proyek akhir.
