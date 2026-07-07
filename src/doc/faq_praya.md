# FAQ Aplikasi Praya (INAPORT Billing)

##%$#Q: Apa itu aplikasi Praya?
A: Praya adalah aplikasi billing kepelabuhanan untuk mengelola layanan petikemas di terminal pelabuhan Indonesia. Digunakan untuk request layanan, penagihan (invoice/pranota), dan monitoring kapal, container, customer, serta terminal.

##%$#Q: Apa itu request layanan?
A: Request layanan adalah permohonan dari customer untuk melakukan kegiatan bongkar muat petikemas di terminal. Ada dua jenis utama: RECEIVING (barang masuk terminal) dan DELIVERY (barang keluar terminal).

##%$#Q: Apa bedanya RECEIVING dan DELIVERY?
A: RECEIVING = container masuk ke terminal dari luar (gate in). DELIVERY = container keluar dari terminal ke customer (gate out).

##%$#Q: Apa itu pranota?
A: Pranota adalah invoice atau nota tagihan yang diterbitkan kepada customer atas layanan yang sudah diberikan. Berisi rincian komponen biaya seperti LOLO (Lift On Lift Off), storage, dan lainnya.

##%$#Q: Apa itu LOLO?
A: LOLO adalah singkatan dari Lift On Lift Off, yaitu biaya bongkar muat container menggunakan crane atau alat angkat di terminal.

##%$#Q: Bagaimana cara cek status request?
A: Status request ada di kolom STATUS pada tabel REQUEST_HEADER. Status yang ada: OPEN/DRAFT (baru dibuat), APPROVED (disetujui), CONFIRMED (menunggu bayar), PAID (sudah lunas), REJECT/REJECTED (ditolak), CANCEL (dibatalkan).

##%$#Q: Apa arti status CONFIRMED?
A: CONFIRMED artinya request sudah disetujui oleh pihak terminal dan sedang menunggu pembayaran dari customer.

##%$#Q: Apa arti status PAID?
A: PAID artinya request sudah lunas dibayar oleh customer dan layanan sudah bisa diproses.

##%$#Q: Apa arti PAYMENT_STATUS Y atau N?
A: PAYMENT_STATUS Y = sudah bayar, N = belum bayar. Kolom ini ada di REQUEST_HEADER dan PRANOTA_HEADER.

##%$#Q: Apa itu voyage?
A: Voyage adalah kode perjalanan kapal. Setiap kapal punya kode voyage berbeda untuk setiap pelayaran. Di aplikasi ada VOYAGE_IN (voyage saat kapal masuk) dan VOYAGE_OUT (voyage saat kapal keluar).

##%$#Q: Apa itu EI pada container?
A: EI adalah singkatan Export/Import. E = Export (barang keluar negeri), I = Import (barang masuk dari luar negeri).

##%$#Q: Apa itu DISCH_LOAD?
A: DISCH_LOAD adalah jenis kegiatan container. Load = muat (container naik ke kapal), Discharge = bongkar (container turun dari kapal).

##%$#Q: Bagaimana cara cari request milik customer tertentu?
A: Gunakan kolom CUSTOMER_CODE atau CUSTOMER_NAME di tabel REQUEST_HEADER. Contoh: cari semua request customer dengan kode 2X000175.

##%$#Q: Apa itu CUSTOMER_MAPPING?
A: CUSTOMER_MAPPING adalah tabel yang menyimpan daftar customer yang aktif di terminal tertentu. Satu customer bisa aktif di banyak terminal.

##%$#Q: Bagaimana cara tahu terminal mana saja yang pakai Praya?
A: Terminal yang sudah memakai Praya adalah terminal yang memiliki data di tabel REQUEST_HEADER. Bisa di-query dengan JOIN REQUEST_HEADER ke MST_TERMINAL.

##%$#Q: Apa itu BRANCH_ID?
A: BRANCH_ID adalah ID cabang/branch dari terminal. Digunakan sebagai penghubung antara MST_TERMINAL dan CUSTOMER_MAPPING.

##%$#Q: Apa itu ORG_ID?
A: ORG_ID adalah ID organisasi. Digunakan bersama TERMINAL_ID sebagai kombinasi kunci untuk JOIN ke MST_TERMINAL.

##%$#Q: Berapa ukuran container yang umum?
A: Ukuran container yang umum: 20 feet, 40 feet, dan 45 feet. Disimpan di kolom CONTAINER_SIZE.

##%$#Q: Apa itu container REEFER?
A: REEFER adalah container berpendingin (refrigerated) untuk barang yang butuh suhu dingin seperti makanan segar atau obat-obatan. Tipe ini ada di kolom CONTAINER_TYPE.

##%$#Q: Apa itu HZ dan DG pada container?
A: HZ = Hazardous (berbahaya), DG = Dangerous Goods (barang berbahaya). Keduanya bernilai Y/N. hehe
