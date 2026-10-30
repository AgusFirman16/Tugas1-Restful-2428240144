# RESTful API Data Kamar Kos

REST API untuk pengelolaan kamar kos, sesuai topik 26. Data kamar disimpan di
MongoDB menggunakan Mongoose.

## Teknologi dan struktur

- Node.js 22 atau lebih baru
- Express 5
- `seed.js`: upsert tiga data awal kamar kos ke MongoDB
- `routes/boardingRooms.js`: route resource kamar kos
- `controllers/boardingRoomsController.js`: validasi dan operasi CRUD MongoDB
- `middlewares/requireApiKey.js`: proteksi operasi tulis
- `test/boardingRooms.test.js`: pengujian HTTP end-to-end dengan runner bawaan Node.js

## Menjalankan aplikasi

1. Pasang dependensi: `npm install`
2. Salin `.env.example` menjadi `.env` (PowerShell: `Copy-Item .env.example .env`),
   lalu isi `API_KEY` dengan nilai acak dan `DB_URI` dengan URI MongoDB Anda.
   Jangan membagikan atau meng-commit nilai rahasia di `.env`.
3. Isi database awal dengan `npm run seed`. Seed hanya menambah kamar yang
   belum ada berdasarkan `id`, tanpa mengubah atau menghapus data yang ada.
4. Jalankan server: `npm start` (atau `npm run dev` untuk mode pengembangan).
5. Jalankan pengujian: `npm test`.

Endpoint GET dapat digunakan tanpa API key. Semua operasi tulis pada
`/boarding-rooms` memerlukan header `x-api-key` yang nilainya sama dengan
`API_KEY`. Jika API key belum dikonfigurasi, operasi tulis mengembalikan
`503 Service Unavailable`; key yang hilang atau salah mengembalikan `401`.

## Endpoint

| Method | Path | Keterangan |
| --- | --- | --- |
| GET | `/` | Identitas API dan daftar endpoint |
| GET | `/boarding-rooms` | Daftar semua kamar |
| GET | `/boarding-rooms/summary` | Ringkasan jumlah kamar, ketersediaan, tipe, dan potensi pendapatan bulanan |
| GET | `/boarding-rooms?tipe=putri` | Filter berdasarkan tipe (`putra`, `putri`, `campur`) |
| GET | `/boarding-rooms/:id` | Detail kamar |
| POST | `/boarding-rooms` | Tambah kamar |
| PUT | `/boarding-rooms/:id` | Ganti data kamar |
| DELETE | `/boarding-rooms/:id` | Hapus kamar |

Body untuk POST dan PUT:

```json
{
  "nomorKamar": "A-07",
  "tipe": "putri",
  "hargaPerBulan": 1100000,
  "fasilitas": ["AC", "Wi-Fi"],
  "tersedia": true
}
```

`nomorKamar` wajib berupa teks, `tipe` harus salah satu nilai yang tersedia,
`hargaPerBulan` harus angka non-negatif, `fasilitas` berupa array string, dan
`tersedia` berupa boolean. `fasilitas` default ke array kosong dan `tersedia`
default ke `true` jika tidak diberikan.
Ringkasan menghitung potensi pendapatan bulanan dari harga kamar yang tersedia
dan membaca data terbaru dari MongoDB.

Respons GET mempertahankan bentuk data resource yang sudah digunakan API.
Operasi tulis yang berhasil mengembalikan objek `{ status, message, data }`;
kesalahan API juga menggunakan `{ status, message, data: null }`.

## Penyimpanan

Server membuka koneksi MongoDB dari `DB_URI` sebelum mulai menerima permintaan.
Perubahan melalui endpoint tersimpan di database dan tetap ada setelah server
berhenti.
