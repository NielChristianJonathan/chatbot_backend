# Schema Database Aplikasi Praya (INAPORT Billing)

Aplikasi billing kepelabuhanan untuk mengelola layanan petikemas, penagihan, kapal, customer, dan terminal.

---

## Tabel customer
Data dari customer

Kolom penting:
- ID_REQ: Nomor request unik (contoh: REC202100005468, DEL202100000004)
- REQUEST_TYPE: Jenis request (RECEIVING, DELIVERY, dll)
- TRX_NUMBER: Nomor transaksi
- ORG_ID: ID organisasi
- TERMINAL_ID: ID terminal pelabuhan
- CUSTOMER_CODE: Kode customer pemohon
- CUSTOMER_NAME: Nama customer
- VESSEL_ID: ID kapal
- VESSEL_NAME: Nama kapal (contoh: CTP GOLDEN)
- VOYAGE: Kode voyage lengkap
- VOYAGE_IN: Kode voyage masuk
- VOYAGE_OUT: Kode voyage keluar
- SERVICE_CODE: Kode layanan (REC=Receiving, DEL=Delivery)
- STATUS: Status request (PAID, dll)
- PAYMENT_STATUS: Status pembayaran (Y=sudah bayar, N=belum)
- PAYMENT_DATE: Tanggal pembayaran
- AMOUNT: Total jumlah
- TRADE_TYPE: Tipe perdagangan (I=Import, E=Export)
- CREATED_BY: Dibuat oleh (customer_code atau username)
- MODIFIED_BY: Diubah terakhir oleh
- CREATED_DATE, MODIFIED_DATE: Tanggal buat/ubah
- APPROVAL: Status approval (Y/N)
- APPROVAL_BY, APPROVAL_DATE: Info approval
- ETA, ETD, ETB, ATA, ATD, ATB: Estimasi/aktual waktu kapal

JOIN ke terminal: REQUEST_HEADER.TERMINAL_ID = MST_TERMINAL.TERMINAL_ID AND REQUEST_HEADER.ORG_ID = MST_TERMINAL.ORG_ID
JOIN ke container: REQUEST_HEADER.ID_REQ = REQUEST_DETAIL.ID_REQ

---

## Tabel REQUEST_DETAIL
Detail item/container dalam satu request.

Kolom penting:
- ID_REQ_DETAIL: ID detail unik
- ID_REQ: Nomor request (foreign key ke REQUEST_HEADER)
- CONTAINER_NO: Nomor container (contoh: SMRS1001004)
- CONTAINER_SIZE: Ukuran container (20, 40, 45)
- CONTAINER_TYPE: Tipe (DRY, REEFER, TANK, dll)
- CONTAINER_STATUS: Status isi (FULL, EMPTY)
- CONTAINER_DETAIL: Deskripsi lengkap (contoh: 20 DRY FULL)
- DISCH_LOAD: Kegiatan (Load=muat, Discharge=bongkar)
- EI: Export/Import (E=Export, I=Import)
- OPERATOR_CODE, OPERATOR_NAME: Operator container
- CARRIER_CODE, CARRIER_NAME: Carrier/pelayaran
- TRADE_TYPE: Tipe perdagangan
- GATE_IN_DATE: Tanggal gate in
- GATE_OUT_DATE: Tanggal gate out
- START_DATE, END_DATE: Tanggal mulai/selesai layanan
- ISO_CODE: Kode ISO container
- HZ: Hazardous (Y/N)
- DG: Dangerous Goods (Y/N)

---

## Tabel PRANOTA_HEADER
Header invoice/nota tagihan (pranota) kepada customer.

Kolom penting:
- BILLER_REQ_ID: Nomor request (sama dengan ID_REQ di REQUEST_HEADER)
- TRX_NUMBER: Nomor transaksi/faktur
- TERMINAL_CODE: Kode terminal (langsung, tanpa perlu JOIN untuk kode)
- ORG_CODE: Kode organisasi
- CUSTOMER_CODE, CUSTOMER_NAME: Data customer
- SERVICE_CODE, SERVICE_NAME: Kode dan nama layanan
- SERVICE_GROUP_CODE, SERVICE_GROUP_NAME: Grup layanan (contoh: PTKM=PETIKEMAS)
- AMOUNT: Total tagihan
- CURRENCY: Mata uang (IDR)
- STATUS: Status pranota (S=submitted, dll)
- PAYMENT_STATUS: Status bayar (Y/N)
- PAYMENT_DATE: Tanggal bayar
- TRADE_TYPE: Import/Export (I/E)
- VESSEL_NAME, VESSEL_VOYAGE: Info kapal
- CREATED_BY, CREATED_DATE: Info pembuat

JOIN ke terminal name: PRANOTA_HEADER.TERMINAL_CODE = MST_TERMINAL.TERMINAL_CODE

---

## Tabel PRANOTA_DETAIL
Detail komponen/item tagihan dalam satu pranota.

Kolom penting:
- BILLER_REQ_ID: Nomor request (foreign key ke PRANOTA_HEADER)
- LINE_NUMBER: Nomor urut baris
- COMPONENT_CODE: Kode komponen tarif (contoh: LOLO)
- COMPONENT_NAME: Nama komponen (contoh: LIFT ON LIFT OFF)
- DESCRIPTION: Deskripsi item
- QUANTITY: Jumlah
- TARIF: Tarif satuan
- AMOUNT: Total amount komponen
- CONTAINER_SIZE, CONTAINER_TYPE, CONTAINER_STATUS: Spesifikasi container
- EI: Export/Import
- HZ, DG, SLING, OD: Flag khusus container
- START_DATE, END_DATE: Periode layanan

---

## Tabel MST_TERMINAL
Master data terminal pelabuhan.

Kolom penting:
- TERMINAL_ID: ID terminal (dipakai JOIN dari REQUEST_HEADER)
- BRANCH_ID: ID branch (dipakai JOIN dari CUSTOMER_MAPPING)
- TERMINAL_CODE: Kode terminal (contoh: T009, T009D)
- TERMINAL_NAME: Nama terminal (contoh: Tanjung Priok 1 Zona 1)
- ORG_ID: ID organisasi
- PORT_CODE: Kode pelabuhan (contoh: IDJKT)
- STATUS: Status terminal (Active/Inactive)
- TRADE_TYPE: Tipe perdagangan terminal
- TIMEZONE: Zona waktu terminal

---

## Tabel MST_CUSTOMER
Master data customer/pelanggan.

Kolom penting:
- CUSTOMER_ID: ID unik customer
- CUSTOMER_CODE: Kode customer (contoh: 2X000175)
- CUSTOMER_LABEL / NAME: Nama customer
- ADDRESS: Alamat
- NPWP: Nomor NPWP
- EMAIL, PHONE: Kontak
- COMPANY_TYPE: Tipe perusahaan (PT, CV, dll)
- CUSTOMER_GROUP: Grup customer (PRIVA=swasta, dll)
- STATUS_CUSTOMER: Status (A=Active)
- IS_SHIPPING_AGENT, IS_SHIPPING_LINE, IS_PBM, IS_FF, IS_EMKL: Flag jenis usaha
- PROVINCE, CITY: Lokasi

JOIN dari REQUEST_HEADER.CREATED_BY = MST_CUSTOMER.CUSTOMER_CODE untuk info siapa yang buat request.

---

## Tabel CUSTOMER_MAPPING
Mapping customer aktif di terminal tertentu.

Kolom penting:
- CUSTOMER_ID: ID customer (foreign key ke MST_CUSTOMER)
- BRANCH_ID: ID branch terminal (foreign key ke MST_TERMINAL.BRANCH_ID)
- STATUS_CUSTOMER: Status customer di terminal (A=Active)
- TOP: Terms of Payment
- AUTO_APPROVE: Flag auto approval (Y/N)

Untuk cari customer aktif di terminal tertentu:
SELECT c.* FROM MST_CUSTOMER c
JOIN CUSTOMER_MAPPING cm ON c.CUSTOMER_ID = cm.CUSTOMER_ID
JOIN MST_TERMINAL t ON cm.BRANCH_ID = t.BRANCH_ID
WHERE t.TERMINAL_CODE = 'T009' AND cm.STATUS_CUSTOMER = 'A'

---

## status request
Untuk melihat status request itu menggunakan kolom STATUS pada table REQUEST_HEADER,

aturan: 
- CANCEL: Request di tolak atau di cancel
- REJECT / REJECTED: Request di toalk atau di reject
- OPEN / DRAFT: Request baru dibuat
- APPROVED: Reqeust belom di setujui
- CONFIRMED: Request sudah di setujui dan menunggu pembayaran
- PAID: Request lunas dan sudah di bayarkan