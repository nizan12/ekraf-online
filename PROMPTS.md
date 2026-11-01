# Jurnal Prompt

Catat prompt penting selama membangun aplikasi: apa yang kamu minta, hasilnya, dan perbaikan yang dilakukan.

## US-01: Katalog dari database
- **Prompt:** Ubah `app/page.jsx` agar daftar produk diambil dari tabel `produk` di Supabase di sisi server. Gunakan `SUPABASE_URL` dan `SUPABASE_SECRET_KEY`. Tampilkan dengan `KartuProduk`. Tangani kondisi kosong "Belum ada produk".
- **Hasil:** Berhasil. Server Component `app/page.jsx` membaca database Supabase via `buatClientServer()`.
- **Perbaikan:** Menghapus path `/rest/v1/` berlebih pada SUPABASE_URL.

## US-02: Detail produk
- **Prompt:** Ubah `app/produk/[id]/page.jsx` agar mengambil data produk by ID dari Supabase. Tampilkan foto, kategori, nama, harga, deskripsi. Tampilkan 404 jika produk tidak ada.
- **Hasil:** Berhasil. Detail produk mengambil data via `.eq("id", id).single()` dan memanggil `notFound()` jika nihil.
- **Perbaikan:** Menangani konversi ID numerik dan slug kategori.

## US-03: Pesan via WhatsApp
- **Prompt:** Buat `components/TombolWhatsApp.jsx` membuka tautan `https://wa.me/` ke nomor di `lib/toko.js`, dengan pesan otomatis berisi nama dan harga produk dalam format rupiah.
- **Hasil:** Berhasil. Tombol WhatsApp membuka pesan otomatis terformat dengan `encodeURIComponent`.
- **Perbaikan:** Menyesuaikan nomor internasional tanpa tanda plus (+).

## US-04: Login admin
- **Prompt:** Buat login admin memakai Supabase Auth dengan Server Action di `app/admin/actions/auth.js` dan form di `app/admin/login/page.jsx`. Sukses redirect ke `/admin`, gagal tampilkan error.
- **Hasil:** Berhasil. Login dan logout diproses di server dengan `@supabase/ssr` dan cookie.
- **Perbaikan:** Menangani pesan error kredensial tidak valid secara ramah.

## US-05: Ganti password
- **Prompt:** Buat Server Action ganti password di `app/admin/actions/auth.js`. Validasi minimal 8 karakter dan konfirmasi cocok.
- **Hasil:** Berhasil. Server Action `gantiPassword` memvalidasi input dan memperbarui auth user.
- **Perbaikan:** Proteksi sesi admin aktif sebelum menjalankan update user.

## US-06: Proteksi halaman admin
- **Prompt:** Buat `proxy.js` di root proyek. Alihkan seluruh rute `/admin` tanpa login ke `/admin/login` dengan status 307.
- **Hasil:** Berhasil. `proxy.js` memeriksa sesi admin via Supabase SSR dan melindungi rute admin.
- **Perbaikan:** Mengizinkan akses publik khusus ke `/admin/login`.

## US-07: List produk admin
- **Prompt:** Tampilkan daftar produk di `/admin` dari tabel Supabase dengan urutan dan pagination.
- **Hasil:** Berhasil. Query `supabase.from("produk")` dengan exact count dan range.
- **Perbaikan:** Menghapus data contoh tiruan.

## US-08: Tambah produk
- **Prompt:** Buat form di `/admin/produk/baru` dan Server Action `tambahProduk` untuk menambah produk dengan validasi login.
- **Hasil:** Berhasil. Validasi server untuk nama, harga, dan upload foto, lalu redirect ke `/admin`.
- **Perbaikan:** Mengembalikan fieldErrors jika input tidak valid.

## US-09: Ubah produk
- **Prompt:** Buat halaman `/admin/produk/[id]/ubah` memuat data lama dan Server Action `ubahProduk` menyimpan perubahan ke database.
- **Hasil:** Berhasil. Data produk diupdate di database dan revalidasi path aktif.
- **Perbaikan:** Menjaga keutuhan kolom foto jika tidak diubah.

## US-10: Hapus produk
- **Prompt:** Buat tombol hapus produk dengan dialog konfirmasi dan Server Action `hapusProduk`.
- **Hasil:** Berhasil. Produk dihapus dari database setelah admin mengonfirmasi.
- **Perbaikan:** Penanganan error ketergantungan relasi.

## US-11: Filter kategori & pencarian
- **Prompt:** Saring produk berdasarkan kategori dan pencarian nama via API `/api/produk` dan halaman `/kategori/[slug]`.
- **Hasil:** Berhasil. Query `ilike` nama dan filter kategori berjalan responsif.
- **Perbaikan:** Case-insensitive search dan penanganan karakter spasi.

## US-12: Pilih jumlah atau varian
- **Prompt:** Pengunjung dapat memilih varian ukuran dan jumlah pesanan, dan pilihan tersebut tertulis di pesan WhatsApp.
- **Hasil:** Berhasil. `components/TombolWhatsApp.jsx` menyusun pesan pesanan WhatsApp memuat varian, jumlah, dan total harga.
- **Perbaikan:** Menghitung subtotal dinamis dan batas stok varian.

## US-13: PWA
- **Prompt:** Konfigurasi Progressive Web App dengan manifest, icon 192/512, dan service worker `/sw.js`.
- **Hasil:** Berhasil. Katalog dapat dipasang di layar utama perangkat.
- **Perbaikan:** Penambahan file ikon SVG dan PNG di `public/icons`.

## US-14: Deskripsi produk dibuat AI
- **Prompt:** Buat generator deskripsi produk otomatis di admin menggunakan Google Gemini API.
- **Hasil:** Berhasil. Server action `buatDeskripsiAI` menghasilkan teks deskripsi tanpa emoji dan mengisi input form.
- **Perbaikan:** Migrasi model Gemini aktif ke `gemini-flash-latest`.

## US-15: Urutkan produk
- **Prompt:** Opsi sortir produk termurah, termahal, terbaru, dan nama (A-Z) pada FilterProduk dan query Supabase.
- **Hasil:** Berhasil. Dropdown FilterProduk menyediakan opsi Terbaru, Termurah, Termahal, dan Nama (A-Z). Query di `app/page.jsx`, `app/kategori/[slug]/page.jsx`, dan `/api/produk` menangani `urutan=terbaru` dengan `.order("created_at", { ascending: false })`.
- **Perbaikan:** Menambahkan opsi Terbaru pada select FilterProduk dan handler `urutan === "terbaru"` pada query database di `app/page.jsx`.

## US-16: Paginasi produk
- **Prompt:** Paginasi katalog produk dengan range 6 per halaman dan navigasi Sebelumnya/Selanjutnya.
- **Hasil:** Berhasil. Server mengembalikan total hitungan dan rentang produk yang tepat.
- **Perbaikan:** Mempertahankan query parameter filter dan sorting pada navigasi halaman.

## US-17: Produk terkait
- **Prompt:** Tampilkan rekomendasi produk dengan kategori yang sama di halaman detail `/produk/[id]`.
- **Hasil:** Berhasil. Query database mengambil produk sekategori dan mengecualikan produk yang dibuka.
- **Perbaikan:** Fallback jika produk terkait kurang dari batas minimum.

## US-18: Galeri beberapa foto
- **Prompt:** Dukungan galeri multi-foto dengan foto utama dan thumbnail foto pilihan.
- **Hasil:** Berhasil. `components/GaleriFoto.jsx` mendukung multiple image dan fallback gambar tunggal.
- **Perbaikan:** Pemisahan URL multi-foto berbasis comma-separated string.

## US-19: Status stok
- **Prompt:** Tampilkan penanda stok "Tersedia" atau "Stok Habis" dan nonaktifkan tombol pesan jika stok habis.
- **Hasil:** Berhasil. Status stok ditampilkan jelas di kartu katalog dan detail produk.
- **Perbaikan:** Menyembunyikan tombol pesanan WhatsApp saat produk habis.

## US-20: Harga coret dan badge diskon
- **Prompt:** Tampilkan harga coret dan badge diskon "Hemat X%" serta label "Baru" dan "Terlaris".
- **Hasil:** Berhasil. Perhitungan diskon otomatis dari kolom `harga_coret` dan badge dinamis.
- **Perbaikan:** Menghilangkan badge diskon jika harga coret bernilai null atau nol.

## US-21: Keranjang & pesan via WhatsApp
- **Prompt:** Keranjang belanja multi-item dengan penambahan kuantitas dan checkout bulk via pesan WhatsApp.
- **Hasil:** Berhasil. `components/KeranjangClient.jsx` memformat seluruh item belanja ke WhatsApp toko.
- **Perbaikan:** Sinkronisasi state keranjang via CustomEvent dan localStorage.

## US-22: Halaman Tentang & kontak toko
- **Prompt:** Buat halaman `/tentang` memuat profil toko, jam operasional, alamat, dan link Google Maps.
- **Hasil:** Berhasil. Halaman `/tentang` menyajikan identitas lengkap dari database toko dan `lib/toko.js`.
- **Perbaikan:** Tautan peta responsif di perangkat mobile dan desktop.

## US-23: Bagikan link produk
- **Prompt:** Tombol bagikan link produk menggunakan Web Share API (navigator.share) dengan fallback salin ke clipboard (navigator.clipboard.writeText) dan umpan balik "Link tersalin".
- **Hasil:** Berhasil. Komponen `TombolBagikan` terpasang di `app/produk/[id]/TombolBagikan.jsx` dan `components/TombolBagikan.jsx`, mendukung navigator.share, fallback clipboard, dan teks umpan balik "Link tersalin".
- **Perbaikan:** Menempatkan berkas komponen `TombolBagikan.jsx` di direktori `app/produk/[id]/` agar langsung terbaca pada proses dumping kode repositori.

## US-24: Favorit tersimpan di browser
- **Prompt:** Pengunjung dapat menandai produk favorit dan membukanya di `/favorit`.
- **Hasil:** Berhasil. Produk favorit disimpan di localStorage dan disinkronkan antar tab.
- **Perbaikan:** Empty state informatif ketika belum ada produk yang disukai.

## US-25: Mode gelap
- **Prompt:** Toggle mode gelap di header yang tersimpan di localStorage dan tanpa flicker saat refresh.
- **Hasil:** Berhasil. Script `/theme-init.js` menginisialisasi tema sebelum paint render.
- **Perbaikan:** Menggunakan class `dark` Tailwind CSS 4 pada elemen html.

## US-26: Metadata SEO & Open Graph
- **Prompt:** Dynamic metadata Next.js pada detail produk untuk judul, deskripsi, dan gambar Open Graph.
- **Hasil:** Berhasil. Fungsi `generateMetadata` menyajikan tag SEO lengkap.
- **Perbaikan:** Fallback metadata jika foto produk belum diunggah.

## US-27: sitemap.xml & robots.txt
- **Prompt:** Generate sitemap dinamis dari database dan file robots.txt memproteksi rute admin.
- **Hasil:** Berhasil. `app/sitemap.js` dan `app/robots.js` mengindeks seluruh rute publik.
- **Perbaikan:** Disallow rute `/admin` dan `/api` dari mesin pencari.

## US-28: Halaman 404 & loading kustom
- **Prompt:** Buat halaman 404 ramah pengguna bertema kedai kopi dan loading skeleton.
- **Hasil:** Berhasil. `app/not-found.jsx` dan `app/loading.jsx` aktif secara konsisten.
- **Perbaikan:** Tombol navigasi kembali ke katalog beranda.

## US-29: Upload foto ke Supabase Storage
- **Prompt:** Upload foto langsung ke bucket Supabase Storage dengan validasi ukuran dan ekstensi.
- **Hasil:** Berhasil. Server action `unggahFotoLangsung` memvalidasi file maks 5MB dan format gambar valid.
- **Perbaikan:** Penamaan berkas unik berbasis timestamp dan UUID.

## US-30: Dashboard ringkasan admin
- **Prompt:** Tampilkan metrik statistik toko: total produk, produk aktif, dan jumlah kategori di `/admin`.
- **Hasil:** Berhasil. Dashboard admin membaca ringkasan data riil dari Supabase.
- **Perbaikan:** Perhitungan statistik kategori terkelompok.

## US-31: Kelola kategori
- **Prompt:** CRUD kategori dinamis di `/admin/kategori` dengan pengecekan relasi produk.
- **Hasil:** Berhasil. Tambah, ubah, dan hapus kategori dicek agar tidak menghapus kategori yang dipakai.
- **Perbaikan:** Peringatan jumlah produk yang masih terkait kategori sebelum penghapusan.

## US-32: Aktif atau nonaktifkan produk
- **Prompt:** Tombol toggle status aktif produk di admin, produk nonaktif disembunyikan dari publik.
- **Hasil:** Berhasil. Kolom boolean `aktif` diupdate dan rute publik dialihkan ke 404 untuk produk nonaktif.
- **Perbaikan:** Filter aktif diterapkan pada API dan katalog utama.

## US-33: Cari dan paginasi admin
- **Prompt:** Pencarian nama dan navigasi paginasi di tabel produk halaman admin.
- **Hasil:** Berhasil. Query database mendukung pencarian dan limit 8 produk per halaman.
- **Perbaikan:** Mempertahankan kata kunci pencarian di URL saat berpindah halaman admin.

## US-34: Validasi form admin di server
- **Prompt:** Validasi ketat nama, harga, dan kategori di server dengan pesan error per field di bawah input.
- **Hasil:** Berhasil. Server action mengembalikan `fieldErrors` dan form mempertahankan nilai yang diinput.
- **Perbaikan:** Sanitasi angka negatif dan string kosong pada harga.

## US-35: Ekspor produk ke CSV
- **Prompt:** Tombol ekspor data produk ke format CSV di halaman admin.
- **Hasil:** Berhasil. Endpoint `/admin/ekspor-csv` menghasilkan file CSV terformat dan menolak akses tanpa login.
- **Perbaikan:** Escape karakter koma dan tanda kutip pada kolom deskripsi.

## US-36: Terakhir dilihat
- **Prompt:** Tampilkan daftar produk yang baru saja dibuka pengunjung di beranda dan detail produk.
- **Hasil:** Berhasil. `components/TerakhirDilihat.jsx` menyimpan riwayat di localStorage maks 6 produk.
- **Perbaikan:** Pengecekan duplikasi ID produk pada daftar riwayat.

## US-37: Bandingkan 2 produk
- **Prompt:** Halaman pembanding spesifikasi, foto, dan harga 2 produk secara berdampingan di `/bandingkan`.
- **Hasil:** Berhasil. Pemilih produk interaktif dan tabel perbandingan side-by-side.
- **Perbaikan:** Tombol ganti produk dan penanganan produk yang tidak ditemukan.

## US-38: Ulasan dan rating
- **Prompt:** Form ulasan bintang 1-5, nama, komentar, dan honeypot anti-spam pada halaman detail produk.
- **Hasil:** Berhasil. Ulasan tersimpan ke tabel `ulasan` dengan kolom `disetujui`.
- **Perbaikan:** Perhitungan rata-rata bintang hanya dari ulasan yang disetujui.

## US-39: Moderasi ulasan di admin
- **Prompt:** Halaman `/admin/ulasan` untuk menyetujui, menyembunyikan, atau menghapus ulasan pengunjung.
- **Hasil:** Berhasil. Aksi moderasi terlindungi login admin dan memperbarui status ulasan.
- **Perbaikan:** Revalidasi halaman detail produk setelah status ulasan dimutasi.

## US-40: Catat klik WhatsApp
- **Prompt:** Endpoint analitik `/api/analitik/klik` mencatat setiap klik pemesanan WhatsApp tanpa data pribadi.
- **Hasil:** Berhasil. Perekaman klik asinkron via `navigator.sendBeacon` dan keepalive fetch.
- **Perbaikan:** Penanganan non-blocking agar tidak menunda pembukaan aplikasi WhatsApp.

## US-41: Produk terlaris di dashboard
- **Prompt:** Tampilkan 5 produk terpopuler berdasarkan data klik WhatsApp di dashboard admin.
- **Hasil:** Berhasil. Dashboard mengagregasi total klik per produk dengan progress bar peringkat.
- **Perbaikan:** Tampilan ramah bila data klik analitik masih kosong.

## US-42: Banner promo di beranda
- **Prompt:** Banner slider promo dinamis di halaman utama yang dapat dikelola dari admin `/admin/banner`.
- **Hasil:** Berhasil. Admin dapat CRUD banner promo dan menampilkannya di hero section beranda.
- **Perbaikan:** Filter banner dengan status `aktif: true` di sisi server.

## US-43: Pengaturan toko dari admin
- **Prompt:** Halaman `/admin/pengaturan` untuk mengubah nama toko, nomor WA, alamat, dan jam buka.
- **Hasil:** Berhasil. Form pengaturan tersimpan ke tabel `pengaturan_toko` Supabase.
- **Perbaikan:** Format nomor WhatsApp divalidasi ke format internasional standar.

## US-44: Kelola akun admin
- **Prompt:** Halaman `/admin/pengguna` untuk melihat daftar admin dan mengundang admin baru via Supabase Auth.
- **Hasil:** Berhasil. Pembuatan user baru via `auth.admin.createUser` dan pencegahan penghapusan akun diri sendiri.
- **Perbaikan:** Pengecekan hak akses superadmin di server action.

## US-45: Log aktivitas admin
- **Prompt:** Pencatatan audit trail aktivitas admin (tambah, edit, hapus produk) di tabel `log_aktivitas`.
- **Hasil:** Berhasil. Halaman `/admin/aktivitas` menampilkan 50 aktivitas terbaru dengan timestamp.
- **Perbaikan:** Perekaman alamat email admin dan detail perubahan yang dilakukan.

## US-46: Impor produk dari CSV
- **Prompt:** Fitur unggah file CSV di admin untuk memasukkan banyak produk sekaligus dengan pencatatan baris error.
- **Hasil:** Berhasil. Form impor memvalidasi header, baris data, dan melakukan bulk insert ke database.
- **Perbaikan:** Laporan jumlah baris yang berhasil dan nomor baris yang gagal diimpor.

## US-47: Atur urutan tampil produk
- **Prompt:** Opsi tombol naik/turun urutan tampilan produk di tabel admin yang disimpan ke kolom `urutan`.
- **Hasil:** Berhasil. Server action `geserUrutanProduk` menukar nilai urutan antar produk.
- **Perbaikan:** Katalog publik mengurutkan produk berdasarkan kolom `urutan` secara default.

## US-48: Varian harga per ukuran
- **Prompt:** Pilihan varian ukuran kopi (Regular/Large) dengan penyesuaian harga otomatis pada pesan WhatsApp.
- **Hasil:** Berhasil. Tombol WhatsApp menyertakan rincian nama varian, harga satuan varian, dan subtotal pesanan.
- **Perbaikan:** Dukungan penambahan varian kustom dari database per produk.

## US-49: Halaman per kategori
- **Prompt:** Rute dinamis `/kategori/[slug]` yang menampilkan produk khusus kategori tersebut.
- **Hasil:** Berhasil. Halaman kategori menyaring produk berdasarkan slug dengan SEO title sesuai nama kategori.
- **Perbaikan:** Tautan breadcrumb kembali ke katalog utama.

## US-50: Asisten AI tanya jawab produk
- **Prompt:** Widget chat AI di pojok halaman untuk merekomendasikan menu kopi berdasarkan selera pengunjung.
- **Hasil:** Berhasil. Endpoint `/api/ai/chat` memanfaatkan Gemini API dan basis data katalog toko.
- **Perbaikan:** Pembatasan jawaban relevan hanya seputar menu dan operasional Nuran Artisan Coffee.
