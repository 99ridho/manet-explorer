---
minggu: 1
judul: Pengantar MANET
dosen: Muhammad Ridho Kurniawan Pratama, M.T.I.
sumber:
  - Loo, Lloret & Ortiz (2012), *Mobile Ad Hoc Networks*, bab 1
  - Misra, Woungang & Misra (2009), *Guide to Wireless Ad Hoc Networks*, bab 1
---

# Minggu 1: Pengantar MANET

Rujukan: Loo bab 1 (hlm. 3-18), Misra bab 1 (hlm. 1-26).
Durasi: 150 menit (3 SKS).

<!-- slide: cover -->
kicker: PERTEMUAN 1 · INTEGRASI JARINGAN MANDIRI/MOBILE
judul: Mengenal MANET: Jaringan Tanpa Infrastruktur
subjudul: Integrasi Jaringan Mandiri/Mobile · Pertemuan 1
Catatan: Pertemuan pertama: rencana semester, lalu konsep dasar MANET.

<!-- slide: disclosure -->

<!-- slide: agenda -->
kicker: TUJUAN PERTEMUAN
judul: Setelah pertemuan ini, Anda dapat:
- Membedakan jaringan infrastruktur dan ad hoc | Siapa yang meneruskan paket, dan apa yang terjadi jika satu node pergi.
- Menjelaskan karakteristik MANET | Terdistribusi, topologi dinamis, bandwidth dan energi terbatas.
- Mengelompokkan jaringan ad hoc | Dari cara komunikasi, topologi, konfigurasi node, dan cakupan area.
- Membaca hasil simulasi dengan kritis | Model sederhana bisa berbeda jauh dari jaringan nyata.
Catatan: Tujuan 1 dan 2 dibahas di bagian 1, tujuan 3 di bagian 2, tujuan 4 di bagian 3.

<!-- slide: agenda -->
kicker: ALUR 150 MENIT
judul: Tiga bagian dan satu sesi kuis
- Bagian 1: dasar MANET (45 menit) | Jaringan nirkabel, definisi, multihop, sejarah.
- Bagian 2: penerapan dan klasifikasi (45 menit) | Contoh pemakaian, lima sifat, empat dasar klasifikasi.
- Bagian 3: teori dan praktik (40 menit) | Model simulasi dibandingkan dengan jaringan Berlin dan Leipzig.
- Kuis dan diskusi (20 menit) | Dikerjakan berpasangan di akhir pertemuan.
Catatan: Sisipkan jeda 10 menit setelah bagian 2. Cek pemahaman singkat ada di akhir tiap bagian.

<!-- slide: table -->
kicker: RENCANA SEMESTER
judul: Materi di minggu 1-8, proyek di 9-16
| Minggu | Topik | Bacaan utama |
|---|---|---|
| 1 | Pengantar MANET | Loo 1, Misra 1 |
| 2-3 | Routing unicast, broadcast, multicast, geografis | Loo 2, Misra 4-7 |
| 4 | Self-organization, kooperasi, alokasi alamat | Misra 2, 3, 14 |
| 5-6 | Mobilitas, propagasi, simulasi dan evaluasi | Misra 9-11, Loo 3-4 |
| 7-8 | QoS dan energi; keamanan dan trust | Misra 12-19, Loo 8 |
| 9-16 | Proyek akhir | Ditentukan bersama |
Catatan: Minggu 9-16 tidak terikat pada kedua buku. Brief proyek dibagikan di akhir minggu 8.

<!-- slide: section -->
nomor: 01
judul: Jaringan tanpa access point
teks: Pada MANET tidak ada access point, base station, atau router tetap. Node-node itu sendiri yang membentuk jaringan.
Catatan: Bagian 1, sekitar 45 menit. Rujukan utama: Loo subbab 1.1-1.5 (hlm. 3-8).

<!-- slide: compare -->
kicker: DUA JENIS JARINGAN NIRKABEL
judul: Infrastruktur memakai AP, ad hoc tidak
kolom: Berbasis infrastruktur
- Klien terhubung lewat *access point*.
- AP menjembatani jaringan nirkabel dan kabel.
- Contoh: WLAN kantor, rumah, bandara.
- Klien tidak meneruskan paket milik klien lain.
kolom: Ad hoc (tanpa infrastruktur)
- Node berkomunikasi langsung, *peer-to-peer*.
- Tidak butuh AP atau jaringan kabel.
- Contoh: antarkendaraan, antarkapal, antargedung.
- Setiap node siap meneruskan paket node lain.
Catatan: Loo subbab 1.2 (hlm. 4-5, Gambar 1.1 dan 1.2). Loo menjelaskan bahwa kata *ad hoc* di sini tidak bermakna negatif; ia hanya menggambarkan situasi jaringan yang dinamis.

<!-- slide: points -->
kicker: KANAL NIRKABEL
judul: Kanal radio membatasi semua desain
teks: Loo subbab 1.2 (hlm. 5) menyebut sifat kanal yang harus diingat sepanjang mata kuliah ini.
- Rentang spektrum | 802.11a memakai 5,15-5,35 GHz; 802.11b dan 802.11g memakai 2,4-2,58 GHz.
- Sinyal melemah | Di atas jarak tertentu, daya terima turun sampai penerimaan tidak mungkin lagi.
- Lapisan MAC | Bluetooth memakai 802.15, WLAN memakai 802.11, untuk mengatur pemakaian medium.
Catatan: Angka frekuensi dari Loo hlm. 5. Tekankan bahwa jangkauan bukan garis tegas; minggu 5 membahas model propagasi yang lebih realistis.

<!-- slide: quote -->
kutipan: Jaringan ad hoc nirkabel adalah kumpulan dua atau lebih perangkat nirkabel yang dapat saling berkomunikasi tanpa bantuan administrator terpusat. Setiap node berfungsi sebagai host sekaligus router.
sumber: Diterjemahkan dari Loo, Lloret & Ortiz (2012), hlm. 5
Catatan: Tekankan kalimat kedua. Seluruh materi routing di minggu 2 dan 3 berangkat dari fakta bahwa setiap node juga router.

<!-- slide: points -->
kicker: KONSEKUENSI DEFINISI
judul: Node harus menemukan sendiri
teks: Karena tidak ada pihak yang mendaftarkan node, semua hal berikut dikerjakan node sendiri (Loo hlm. 5-6).
- Menemukan tetangga | Node mengumumkan kehadirannya dan mendengarkan pengumuman node lain.
- Mengenali layanan | Node perlu tahu jenis layanan yang tersedia beserta atributnya.
- Memperbarui rute | Jumlah node berubah terus, jadi informasi routing ikut berubah.
Catatan: Loo subbab 1.3 (hlm. 5-6). Bandingkan dengan DHCP dan DNS di jaringan kampus: keduanya butuh server. Minggu 4 membahas cara node mendapat alamat tanpa server.

<!-- slide: context -->
kicker: MULTIHOP
judul: Node di tengah meneruskan paket tetangganya
teks: A dan C berada di luar jangkauan pancar satu sama lain. B berada di jangkauan keduanya, jadi B meneruskan paket dari A ke C.
Tidak ada administrasi terpusat. Jika satu node keluar dari jangkauan, node yang terdampak cukup meminta rute baru; delay naik sedikit tetapi jaringan tetap berjalan.
graf:
  simpul: A@0,0 B@1,0 C@2,0
  sisi: A-B B-C
  jalur: A>B>C
  peran: A=sumber C=tujuan
  keterangan: B berperan sebagai router bagi A dan C.
Catatan: Loo subbab 1.3 dan Gambar 1.3 (hlm. 6-7). Loo menulis bahwa jaringan tidak runtuh hanya karena satu node bergerak keluar jangkauan.

<!-- slide: points -->
kicker: PENYUSUN JARINGAN
judul: Tidak semua node ad hoc bergerak
teks: Loo hlm. 6 mencatat bahwa node ad hoc boleh diam, bergerak, atau setengah bergerak.
- Node bergerak | Laptop dan PDA yang saling berkomunikasi langsung.
- Node diam | Jaringan sensor: perangkat tersebar di area luas dan tidak berpindah.
- Node setengah bergerak | Titik relay yang dipasang sementara di area yang membutuhkan.
Catatan: Loo menyebut jaringan sensor sebagai *fixed ad hoc network*: topologinya berubah bukan karena gerak, melainkan karena sensor kehabisan daya.

<!-- slide: points -->
kicker: DESAIN PROTOKOL
judul: Tiap protokol routing berkorban
teks: Loo hlm. 6 menyebut empat hal yang menyulitkan desain protokol routing MANET.
- Sumber kesulitan | Medium yang dinamis, perubahan topologi yang cepat dan sulit diramal, baterai terbatas, mobilitas.
- Pola solusi | Kebanyakan usulan mengejar satu tujuan, misalnya menekan delay atau overhead.
- Harganya | Tujuan lain dikorbankan, misalnya skalabilitas atau keandalan rute.
Catatan: Loo hlm. 6. Ini yang membuat minggu 2 dan 3 berisi banyak protokol, bukan satu protokol pemenang. Simpan pertanyaan "apa yang dikorbankan" untuk tiap protokol yang kita bahas.

<!-- slide: points -->
kicker: SEJARAH SINGKAT
judul: Dari radio paket militer ke 802.11
teks: Loo subbab 1.4 (hlm. 7) membagi perkembangan jaringan ad hoc ke tiga generasi.
- 1972: PRNET | *Packet radio network* diuji untuk kebutuhan komunikasi di medan tempur.
- 1980-an: SURAN | Proyek *Survivable Adaptive Radio Networks*: perangkat kecil, murah, hemat daya.
- 1990-an: komersial | Laptop dan perangkat bergerak meluas; subkomite IEEE 802.11 memakai istilah *ad hoc network*.
Catatan: PRNET dipakai bersama ALOHA dan sejenis distance vector routing. SURAN menargetkan skalabilitas dan daya tahan. Pada 1990-an muncul GloMo dan NTDR sebagai kelanjutan riset militer (Loo hlm. 7).

<!-- slide: points -->
kicker: CEK PEMAHAMAN
judul: Jawab singkat sebelum lanjut
- Satu perbedaan | Sebutkan satu hal yang dilakukan node ad hoc tetapi tidak dilakukan klien WLAN biasa.
- Jika B pergi | Pada contoh A, B, C tadi, apa yang terjadi jika B keluar jangkauan?
- Sensor | Kenapa jaringan sensor disebut jaringan ad hoc walau node-nya diam?
Catatan: Jawaban: (1) meneruskan paket milik node lain; (2) node terdampak meminta rute baru, delay naik sedikit, jaringan tetap jalan; (3) tidak ada infrastruktur dan node mengatur dirinya sendiri, topologi berubah saat sensor kehabisan daya.

<!-- slide: section -->
nomor: 02
judul: Dipakai di mana, dan berbentuk apa
teks: MANET dipakai justru saat infrastruktur tidak ada. Bentuknya bermacam-macam, dari jaringan sekitar tubuh sampai jaringan kota.
Catatan: Bagian 2, sekitar 45 menit. Rujukan: Loo subbab 1.6-1.8 (hlm. 8-17).

<!-- slide: points -->
kicker: PENERAPAN
judul: MANET dipakai saat infrastruktur absen
teks: Contoh dari Loo subbab 1.6 (hlm. 8-10).
- Militer | Komunikasi antarprajurit, kendaraan, dan markas yang terus bergerak.
- Tanggap darurat | Tim medis di lokasi bencana tidak sempat memasang kabel dan perangkat jaringan.
- Jaringan lokal sementara | Berbagi data di rapat, konferensi, atau kelas tanpa jaringan terpasang.
Catatan: Loo hlm. 8-9. Tanyakan ke kelas: contoh situasi di Indonesia di mana infrastruktur tidak tersedia?

<!-- slide: points -->
kicker: MEDAN TEMPUR
judul: Militer menuntut empat syarat
teks: Loo hlm. 8 menjelaskan kenapa lingkungan militer cocok sekaligus menuntut.
- Dibentuk tanpa perencanaan | Jaringan bisa berdiri cepat tanpa infrastruktur, cocok saat pasukan berpindah.
- Objek bergerak cepat | Pesawat, tank, dan kapal perang menuntut komunikasi yang cepat dan andal.
- Syarat yang diminta | Keandalan, efisiensi, keamanan, dan dukungan multicast routing.
Catatan: Loo hlm. 8, Gambar 1.4. Multicast dibahas di minggu 3, keamanan di minggu 8.

<!-- slide: context -->
kicker: TANGGAP DARURAT
judul: Rantai node memperluas jangkauan WLAN
teks: Pada operasi pencarian dan penyelamatan, paket diteruskan dari satu perangkat klien ke klien berikutnya sampai mencapai gateway.
Loo mencatat jangkauan WLAN bisa meluas dari ratusan kaki menjadi beberapa mil, bergantung pada kerapatan pengguna nirkabel.
graf:
  simpul: T@0,0 R1@1,0 R2@2,0 R3@3,0 G@4,0
  sisi: T-R1 R1-R2 R2-R3 R3-G
  jalur: T>R1>R2>R3>G
  peran: T=sumber G=tujuan R1=relay R2=relay R3=relay
  keterangan: Tim medis (T) mencapai gateway (G) lewat tiga node relay.
Catatan: Loo hlm. 8-9, Gambar 1.5. Komunikasi suara mendominasi di skenario ini, jadi kebutuhan real-time tinggi. Hubungkan dengan QoS di minggu 7.

<!-- slide: numbers -->
kicker: PERSONAL AREA NETWORK
judul: Piconet Bluetooth punya batas jelas
- 8 | perangkat aktif dalam satu piconet, satu master dan sisanya slave
- 255 | perangkat yang bisa terhubung dalam mode parked
- 10 m | jangkauan khas piconet, hingga 100 m pada kondisi ideal
sumber: Loo, Lloret & Ortiz (2012), bab 1, hlm. 9
Catatan: Loo hlm. 9-10, Gambar 1.6. PAN berpusat pada satu orang, sedangkan WLAN melayani banyak pengguna. Perangkat pertama dalam piconet menjadi master.

<!-- slide: table -->
kicker: KARAKTERISTIK
judul: Lima sifat MANET dan akibatnya
| Sifat | Akibat bagi desain protokol |
|---|---|
| Operasi terdistribusi | Routing dan keamanan dikerjakan bersama oleh semua node |
| Bandwidth rendah, bit error tinggi | Pesan kontrol harus hemat; fading dan interferensi memengaruhi kanal |
| Energi dari baterai | Setiap pengiriman dan penerusan menguras daya |
| Rentan terhadap serangan | Penyadapan, *spoofing*, dan *denial of service* lebih mudah |
| Topologi dinamis | Link putus dan terbentuk tanpa bisa diprediksi |
Catatan: Loo subbab 1.7 (hlm. 10-11). Loo juga mencatat sisi positifnya: jaringan bisa dibentuk cepat tanpa base station dan tanpa administrasi sistem.

<!-- slide: points -->
kicker: SISI POSITIF
judul: Yang didapat dari ketiadaan AP
teks: Loo hlm. 11 menutup daftar karakteristik dengan keunggulan MANET dibanding jaringan nirkabel lain.
- Mudah digelar | Tidak ada perangkat infrastruktur yang perlu dipasang lebih dulu.
- Cepat digelar | Jaringan terbentuk seketika saat perangkat dinyalakan berdekatan.
- Tidak bergantung | Ketergantungan pada infrastruktur tetap berkurang.
Catatan: Loo hlm. 11. Ini alasan MANET tetap dikaji walau tantangannya banyak.

<!-- slide: table -->
kicker: KLASIFIKASI
judul: Jaringan ad hoc dipilah dari 4 sisi
| Dasar | Kelas |
|---|---|
| Cara komunikasi | *Single-hop*, *multihop* |
| Topologi | *Flat*, hierarkis (cluster), *aggregate* (zona) |
| Konfigurasi node | Homogen, heterogen |
| Cakupan area | BAN, PAN, LAN, MAN, WAN |
Catatan: Loo subbab 1.8 (hlm. 11-16). Loo menyebut belum ada klasifikasi yang diakui umum di literatur. Empat slide berikut membahas satu per satu.

<!-- slide: compare -->
kicker: CARA KOMUNIKASI
judul: Single-hop mudah, multihop menantang
kolom: Single-hop
- Semua node saling berada dalam jangkauan.
- Tidak butuh node perantara.
- Node boleh bergerak asal tetap sejangkauan.
- Kelas jaringan ad hoc yang paling sederhana.
kolom: Multihop
- Sebagian node terlalu jauh untuk langsung.
- Trafik diteruskan node perantara.
- Kelas yang paling banyak dikaji literatur.
- Masalah utamanya mobilitas node.
Catatan: Loo subbab 1.8.1 (hlm. 11-12, Gambar 1.7 dan 1.8). Pada single-hop seluruh jaringan bisa berpindah sebagai satu grup tanpa mengubah relasi komunikasi. Multihop menuntut protokol routing yang adaptif terhadap perubahan topologi cepat.

<!-- slide: compare -->
kicker: TOPOLOGI
judul: Flat sederhana, hierarkis lebih scalable
kolom: Flat
- Semua node punya tanggung jawab sama.
- Pesan kontrol disebar ke seluruh jaringan.
- Cocok untuk topologi yang sangat dinamis.
- Skalabilitas turun saat jumlah node besar.
kolom: Hierarkis (cluster)
- Jaringan dibagi menjadi beberapa cluster.
- Master node mengurus dan menyambung cluster.
- Lebih cocok untuk mobilitas rendah.
- Lebih scalable, tetapi master jadi titik lemah.
Catatan: Loo subbab 1.8.2 (hlm. 12-14). Kelas ketiga, *aggregate*, membagi jaringan ke zona: tiap node punya ID node dan ID zona, dan tiap zona bisa flat atau hierarkis (hlm. 14). Pembentukan cluster dibahas di minggu 4.

<!-- slide: context -->
kicker: TITIK LEMAH HIERARKIS
judul: Cluster head yang mati memutus klusternya
teks: Pada topologi flat, satu node mati tidak membuat bagian lain kehilangan jalur. Pada topologi hierarkis, seluruh cluster bergantung pada master-nya.
Selama master mati, cluster itu tidak bisa mengirim atau menerima pesan dari bagian jaringan yang lain.
graf:
  simpul: N1@0,1 N2@0,-1 M1@1,0 M2@3,0 N3@4,1 N4@4,-1
  sisi: N1-M1 N2-M1 M1-M2 M2-N3 M2-N4
  putus: M1-M2
  peran: M1=mpr M2=mpr
  keterangan: M1 dan M2 adalah master. Garis putus: satu-satunya jalur antarcluster.
Catatan: Loo hlm. 13-14. Loo menyebut ketiadaan titik gagal tunggal penting, dan justru di sinilah pendekatan hierarkis berbeda dari flat.

<!-- slide: compare -->
kicker: KONFIGURASI NODE
judul: Perangkat seragam atau bermacam-macam
kolom: Homogen
- Semua node punya konfigurasi perangkat sama.
- Prosesor, memori, dan periferal seragam.
- Contoh utamanya jaringan sensor nirkabel.
- Lokalisasi lebih mudah karena node seragam.
kolom: Heterogen
- Konfigurasi perangkat tiap node berbeda.
- Sumber daya dan kebijakan tiap node berbeda.
- Tidak semua node bisa memberi layanan sama.
- Desain protokol harus menoleransi perbedaan.
Catatan: Loo subbab 1.8.3 (hlm. 14-15, Gambar 1.12 dan 1.13). Konfigurasi node sangat bergantung pada aplikasi yang dituju.

<!-- slide: table -->
kicker: CAKUPAN AREA
judul: Dari sekitar tubuh sampai skala kota
| Kelas | Jangkauan dan teknologi |
|---|---|
| BAN | 1-2 m, menghubungkan perangkat yang dikenakan di tubuh |
| PAN | Hingga 10 m, pita 2,4-10,6 GHz |
| LAN | WLAN 802.11 di rumah, kantor, dan ruang publik |
| MAN | WiMAX 802.16, jangkauan hingga 50 km, hingga 70 Mbps |
| WAN | MBWA 802.20, hingga 100 Mbps, mobilitas sangat tinggi |
Catatan: Loo subbab 1.8.4 (hlm. 15-17, Gambar 1.14). Loo mencatat MAN dan WAN multihop nirkabel masih menyisakan masalah pengalamatan, routing, manajemen lokasi, dan keamanan, sehingga ketersediaannya belum dekat.

<!-- slide: points -->
kicker: CEK PEMAHAMAN
judul: Jawab singkat sebelum jeda
- Pilih kelas | Jaringan antarmahasiswa dalam satu ruang kelas masuk kelas apa di empat dasar tadi?
- Cluster head | Sebutkan satu keuntungan dan satu kerugian topologi hierarkis.
- Piconet | Berapa perangkat aktif dalam satu piconet, dan berapa yang bisa parked?
Catatan: Jawaban: (1) bisa single-hop, flat, heterogen, kelas LAN atau PAN; (2) lebih scalable, tetapi cluster head jadi titik gagal; (3) delapan aktif, 255 parked. Setelah ini, jeda 10 menit.

<!-- slide: section -->
nomor: 03
judul: Teori dan praktik bisa berbeda
teks: Misra bab 1 membandingkan model simulasi yang umum dipakai dengan pengukuran di jaringan multihop nyata di Berlin dan Leipzig.
Catatan: Bagian 3, sekitar 40 menit. Jaringan ini adalah jaringan komunitas terbuka (Freifunk), bukan testbed laboratorium.

<!-- slide: points -->
kicker: TIGA CARA MENGUJI
judul: Simulator, emulator, atau testbed
teks: Misra subbab 1.2 (hlm. 4-5) membandingkan tiga cara menguji protokol.
- Simulator | Murah dan cepat, jadi dipakai di tahap awal. Hasilnya bergantung penuh pada model.
- Emulator | Node nyata menjalankan perangkat lunak nyata, tetapi pengiriman paket tetap dihitung.
- Testbed | Paling dekat dengan kenyataan, tetapi mahal dan terbatas jumlah node-nya.
Catatan: Misra hlm. 4-5. Contoh testbed: MIT Roofnet 30-40 node, UCSB mesh 25 node, Dartmouth 33 node. Emulator ORBIT memakai grid 20x20 node dalam ruangan.

<!-- slide: points -->
kicker: PERINGATAN
judul: Model yang meleset sulit terlihat
teks: Misra Contoh 1.1 (hlm. 4) menceritakan studi IBM pada node Mote.
- Rencananya | Menjalankan IEEE 802.15.4 di node Mote untuk jaringan manajemen logistik.
- Kenyataannya | Prosesor node tidak sanggup melayani semua interupsi dari lapisan MAC.
- Akibatnya | Di atas 1 paket per node per detik jaringan runtuh, dan ini tidak terlihat di simulator.
Catatan: Misra hlm. 4. Simulator umumnya tidak memodelkan kecepatan proses tiap node. Ini contoh asumsi tersembunyi yang baru ketahuan di perangkat nyata.

<!-- slide: table -->
kicker: MODEL SIMULASI
judul: Model jaringan punya enam bagian
| Sub-model | Yang didefinisikan |
|---|---|
| Node | Jumlah antarmuka, sumber energi, memori, ada tidaknya GPS |
| Penempatan dan mobilitas | Posisi awal node dan pola geraknya |
| Radio | Frekuensi, bandwidth, daya pancar, ambang penerimaan, fungsi MAC |
| Propagasi sinyal | Cara sinyal melemah dan pengaruh lingkungan terhadap kualitasnya |
| Kehilangan paket | Paket hilang karena sifat kanal, tabrakan, atau model galat tambahan |
| Trafik | Node mana yang mengirim, ke siapa, dengan pola apa |
Catatan: Misra subbab 1.1 (hlm. 2-3). Model gabungan dibentuk dengan menyusun keenamnya, misalnya 100 node uniform di area 1 km persegi, kanal Rayleigh fading, kartu 802.11b, 10 aliran FTP. Minggu 5 dan 6 memakai daftar ini lagi.

<!-- slide: points -->
kicker: PENEMPATAN NODE
judul: Tiga model penempatan yang umum
teks: Misra subbab 1.3.1.1 (hlm. 6-7) menjelaskan model yang dipakai kebanyakan studi.
- Uniform | Node disebar acak merata di area tertentu.
- Grid | Node diletakkan di titik potong kotak; tidak ada bridge atau articulation point.
- Random waypoint | Node menuju titik acak, berhenti sejenak, lalu memilih tujuan baru.
Catatan: Misra hlm. 6-7. Dua anggapan awal tentang RWM ternyata salah: distribusi node tidak tetap uniform, dan kecepatan rata-rata jauh di bawah rata-rata aritmetik vmin dan vmax. RWM memadatkan node di tengah area. Detailnya di minggu 5.

<!-- slide: compare -->
kicker: PROPAGASI
judul: Path loss tegas, shadowing acak
kolom: Model path loss
- Daya turun sebanding jarak pangkat alfa.
- Alfa bernilai 2 di ruang hampa, lebih besar jika ada halangan.
- Link ada jika jarak di bawah radius R, selain itu tidak ada.
- Perkiraan kasar terhadap kenyataan.
kolom: Model shadowing
- Menambahkan variasi acak berdistribusi normal.
- Node dekat pun bisa gagal menerima paket.
- Node jauh bisa tetap terhubung jika ada garis pandang.
- Tidak menangani shadowing yang berkorelasi.
Catatan: Misra subbab 1.3.1.2 (hlm. 8-9). Contoh shadowing berkorelasi: gedung beton tebal memotong semua link yang melewatinya, sementara ruang terbuka di sebelahnya justru memberi jangkauan panjang (Contoh 1.2, hlm. 9).

<!-- slide: context -->
kicker: ISTILAH GRAF
judul: Bridge dan articulation point
teks: *Bridge* adalah link yang jika dihapus menambah jumlah komponen jaringan. *Articulation point* adalah node yang jika dihapus menambah jumlah komponen.
Keduanya menentukan ketahanan jaringan: selama satu-satunya jalur itu putus, dua bagian jaringan tidak bisa saling menghubungi.
graf:
  simpul: A@0,1 B@0,-1 C@1,0 D@3,0 E@4,1 F@4,-1
  sisi: A-B A-C B-C C-D D-E D-F E-F
  putus: C-D
  peran: C=relay D=relay
  keterangan: C-D adalah bridge. C dan D adalah articulation point.
Catatan: Misra Definisi 1.4 (hlm. 6). Node berderajat satu disebut *pendant vertex*; menghapusnya tidak memecah jaringan. Istilah ini dipakai lagi di minggu 3 saat membahas broadcast.

<!-- slide: numbers -->
kicker: TOPOLOGI NYATA
judul: Jaringan nyata lebih renggang
- 4,02 | derajat rata-rata node jaringan Berlin
- 7,62 | derajat rata-rata node pada model random waypoint
- 23,8% | node Berlin yang berstatus articulation point
sumber: Misra, Woungang & Misra (2009), bab 1, hlm. 14-15
Catatan: Misra Tabel 1.2 dan subbab 1.3.4.2 (hlm. 14-15). Porsi bridge di Berlin 12-20% dari seluruh link, sedangkan model uniform hanya sekitar 2% dan grid tidak punya bridge sama sekali. Sampel Berlin rata-rata 315 node, Leipzig 587 node (Tabel 1.1, hlm. 10).

<!-- slide: points -->
kicker: KENAPA BEGITU
judul: Alasannya sosial, bukan teknis
teks: Misra hlm. 17 menjelaskan mengapa jaringan komunitas punya bentuk seperti itu.
- Bergabung ke yang ramai | Peserta baru memilih area yang konektivitasnya sudah bagus.
- Cukup satu sambungan | Peserta umumnya puas dengan satu link ke jaringan, jadi node pendant banyak.
- Kualitas disaring sendiri | Pengguna menolak link buruk, misalnya ETX di atas 10.
Catatan: Misra hlm. 17. Karena alasannya sosiologis, penulis menduga pola serupa muncul di jaringan multihop terbuka lain, misalnya Hanover.

<!-- slide: points -->
kicker: KUALITAS LINK
judul: ETX menghitung ongkos satu link
teks: Misra Definisi 1.5 dan 1.6 (hlm. 6) memakai peluang paket sampai di tiap arah.
- Kualitas link | w(p,q) adalah peluang paket dari p sampai di q dalam satu siklus tanpa pengulangan.
- Siklus lengkap | Peluang siklus kirim dan balasan berhasil adalah w(p,q) dikali w(q,p).
- ETX | Perkiraan jumlah pengiriman adalah 1 dibagi hasil perkalian tadi.
Catatan: Latihan di kelas: jika w(p,q) = 0,8 dan w(q,p) = 0,5, maka ETX = 1 / 0,4 = 2,5 pengiriman. Di Berlin, 5,3% bridge punya kualitas link di bawah 0,1 dan 22,6% di bawah 0,5 (hlm. 22). ETX dipakai lagi di minggu 8 sebagai metrik proyek.

<!-- slide: numbers -->
kicker: DATA DARI JARINGAN NYATA
judul: Route discovery Berlin jauh dari model
- 300+ | node di jaringan multihop terbuka Berlin
- <30% | node yang rata-rata terjangkau pada route discovery pertama
- 0,469 | peluang menemukan rute setelah empat percobaan
sumber: Misra, Woungang & Misra (2009), bab 1, hlm. 16 dan 22
Catatan: Penyebabnya: jaringan nyata punya banyak *bridge*, dan sebagian bridge berkualitas rendah. Di literatur simulasi, angka jangkauan route discovery pertama sekitar 60% bahkan pada mobilitas dan beban tertinggi, dan di atas 80% pada skenario lain. Dengan unicast RREQ melewati bridge, peluang menemukan rute naik ke atas 0,9 (hlm. 22).

<!-- slide: points -->
kicker: TRAFIK
judul: Beban nyata tidak merata
teks: Misra subbab 1.3.4.4 (hlm. 19-21) membandingkan trafik gateway Berlin dengan skenario simulasi.
- Rata-rata per node | Sekitar 1,3 GB per bulan di gateway utama Berlin.
- Satu node ekstrem | Satu node menghasilkan 55 GB dalam satu bulan.
- Di simulasi | Dari empat studi yang dibandingkan, hanya satu yang bebannya setara jaringan nyata.
Catatan: Misra Tabel 1.3 dan 1.4 (hlm. 19-20). Sekitar 75% node Berlin memakai kurang dari 1 GB per bulan, jadi beban terpusat pada sebagian kecil node. Saran penulis: pakai jenis trafik yang beragam dan distribusi yang tidak merata.

<!-- slide: points -->
kicker: LATIHAN
judul: Beban puncak bisa menipu
teks: Misra Contoh 1.5 (hlm. 20-21). Dua skenario, masing-masing 4 aliran, diamati selama 100 detik. Hitung total paketnya.
- Skenario intensif | Tiap aliran 100 paket per detik selama 10 detik.
- Skenario seimbang | Tiap aliran 35 paket per detik selama 100 detik.
- Pertanyaan | Mana yang sebenarnya membebani jaringan lebih berat?
Catatan: Jawaban: intensif 4 x 100 x 10 = 4.000 paket; seimbang 4 x 35 x 100 = 14.000 paket. Karena waktu mulai aliran intensif acak, pada lebih dari 70% kasus beban puncaknya justru lebih kecil daripada skenario seimbang (Misra hlm. 21).

<!-- slide: points -->
kicker: PELAJARAN
judul: Simulasi hanya sebaik modelnya
teks: Temuan Misra bab 1 menjadi bekal untuk minggu 5, 6, dan proyek akhir.
- Topologi nyata | Kepadatan node rendah, banyak bridge dan *articulation point*.
- Trafik nyata | Distribusi trafik antarnode sangat tidak simetris.
- Konsekuensi | Protokol yang bagus di simulasi bisa berperilaku lain di lapangan.
Catatan: Misra abstrak bab 1 (hlm. 1) dan subbab 1.4 (hlm. 23). Daftar periksa lengkap sebelum menjalankan simulasi dibahas di minggu 6.

<!-- slide: table -->
kicker: RINGKASAN
judul: Yang perlu dibawa ke minggu 2
| Gagasan | Intinya |
|---|---|
| Tanpa infrastruktur | Tidak ada AP; node menjadi host sekaligus router |
| Multihop | Node perantara meneruskan paket bagi node yang berjauhan |
| Lima sifat | Terdistribusi, bandwidth rendah, hemat energi, rawan serangan, topologi dinamis |
| Empat dasar klasifikasi | Cara komunikasi, topologi, konfigurasi node, cakupan area |
| Simulasi bukan kenyataan | Topologi dan trafik nyata berbeda jauh dari model umum |
Catatan: Minggu 2 melanjutkan dari baris pertama: kalau setiap node adalah router, bagaimana rute dibentuk dan dipelihara?

<!-- slide: points -->
kicker: KUIS
judul: Kerjakan berpasangan, 15 menit
- Infrastruktur atau ad hoc | Sebutkan dua hal yang dilakukan node ad hoc tetapi tidak dilakukan klien WLAN biasa.
- Bridge | Kenapa bridge membuat route discovery sering gagal di jaringan Berlin?
- Rancang | Jaringan untuk tim SAR di lereng gunung: pilih kelas topologi dan cakupan area, lalu beri alasan.
Catatan: Soal 2 menghubungkan ke data Berlin: flooding RREQ harus melewati satu-satunya jalur, dan jika link itu buruk, RREQ tidak sampai ke sisi lain. Soal 3 tidak punya jawaban tunggal; nilai alasannya.

<!-- slide: closing -->
judul: Diskusi
teks: Sebelum pertemuan 2, baca Loo bab 2 dan Misra bab 4.
Catatan: Pertemuan 2 membahas protokol routing proaktif, reaktif, dan hibrid.
