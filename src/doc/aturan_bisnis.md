# Aturan Bisnis Aplikasi Praya (INAPORT Billing)

##%$# Alur Request Layanan

1. Customer membuat request (STATUS = OPEN/DRAFT)
2. Pihak terminal mereview dan menyetujui (STATUS = APPROVED)
3. Sistem membuat pranota/invoice tagihan (STATUS = CONFIRMED)
4. Customer melakukan pembayaran (PAYMENT_STATUS = Y, STATUS = PAID)
5. Layanan diproses di terminal

Jika request ditolak → STATUS = REJECT atau REJECTED
Jika request dibatalkan → STATUS = CANCEL

##%$# Aturan Pembayaran

- Customer harus lunas (PAYMENT_STATUS = Y) sebelum layanan dijalankan
- Pranota diterbitkan per request layanan
- Satu request bisa memiliki lebih dari satu pranota jika ada revisi tagihan
- AMOUNT di REQUEST_HEADER adalah total tagihan keseluruhan
- AMOUNT di PRANOTA_HEADER adalah total per invoice

##%$# Aturan Container

- Satu request bisa berisi banyak container (satu baris per container di REQUEST_DETAIL)
- Container diklasifikasikan berdasarkan: ukuran (20/40/45), tipe (DRY/REEFER/TANK), status isi (FULL/EMPTY)
- Container berbahaya (HZ=Y atau DG=Y) dikenakan tarif tambahan
- Container REEFER dikenakan biaya listrik tambahan

##%$# Aturan Terminal

- Setiap terminal memiliki TERMINAL_CODE unik (contoh: T009, T009D)
- JOIN ke terminal menggunakan kombinasi TERMINAL_ID + ORG_ID (bukan hanya TERMINAL_ID)
- Customer harus terdaftar aktif di CUSTOMER_MAPPING untuk bisa buat request di terminal tersebut
- STATUS_CUSTOMER = A artinya customer aktif di terminal tersebut

##%$# Aturan Tarif

- Tarif dihitung per komponen layanan (lihat PRANOTA_DETAIL)
- Komponen tarif dipengaruhi oleh: ukuran container, tipe container, EI (Export/Import), dan kegiatan (Load/Discharge)
- COMPONENT_CODE = LOLO artinya biaya bongkar/muat utama
- Tarif bisa berbeda per terminal dan per periode

##%$# Aturan Trade Type

- TRADE_TYPE = I : Import (barang masuk dari luar negeri ke Indonesia)
- TRADE_TYPE = E : Export (barang keluar dari Indonesia ke luar negeri)
- Tarif Import dan Export bisa berbeda

##%$# Aturan Kapal (Vessel)

- Satu request terikat ke satu kapal (VESSEL_NAME) dan voyage tertentu
- ETA = Estimated Time of Arrival (perkiraan kapal tiba)
- ETD = Estimated Time of Departure (perkiraan kapal berangkat)
- ATA/ATD = Actual Time of Arrival/Departure (waktu aktual)

##%$# Aturan Customer

- Customer diidentifikasi oleh CUSTOMER_CODE (unik)
- Satu customer bisa aktif di banyak terminal (lihat CUSTOMER_MAPPING)
- CREATED_BY di REQUEST_HEADER bisa berisi CUSTOMER_CODE (siapa yang buat request)
- Customer group PRIVA = perusahaan swasta

##%$# Komponen Biaya Umum

- LOLO : Lift On Lift Off (bongkar muat utama)
- STORAGE : biaya penumpukan container di terminal
- REEFER : biaya listrik container berpendingin
- ADMINFEE : biaya administrasi
- SEAL : biaya segel container
