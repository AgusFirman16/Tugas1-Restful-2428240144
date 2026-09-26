# RESTful API Kamar Kos

API praktikum Node.js dan Express.js untuk mengelola kamar kos. Data disimpan sementara dalam array di memory, tanpa database.

## Identitas

- Nama: Agus Firman
- NIM: [NIM SAYA]
- Nomor absen/topik: 26
- Topik: Rumah Kos
- Resource: Kamar Kos

## Menjalankan

Gunakan Node.js LTS, lalu jalankan:

```bash
npm install
npm run dev
```

Server lokal tersedia di `http://localhost:3000`. Untuk menjalankan tanpa Nodemon, gunakan `npm start`.

Rincian sepuluh skenario beserta body dan contoh response tersedia di [TESTING.md](TESTING.md). Draft bagian hasil dan pembahasan laporan tersedia di [LAPORAN-DRAFT.md](LAPORAN-DRAFT.md).

## Endpoint

| Method | URL | Keterangan |
| --- | --- | --- |
| GET | `/` | Identitas dan daftar endpoint |
| GET | `/boarding-rooms` | Semua kamar |
| GET | `/boarding-rooms?tipe=putri` | Filter kamar berdasarkan tipe |
| GET | `/boarding-rooms/:id` | Detail kamar |
| POST | `/boarding-rooms` | Menambahkan kamar |
| PUT | `/boarding-rooms/:id` | Mengganti data kamar |
| DELETE | `/boarding-rooms/:id` | Menghapus kamar |

Untuk POST dan PUT, gunakan header `Content-Type: application/json` dan body JSON. Field wajib: `nomorKamar`, `tipe`, dan `hargaPerBulan`. Tipe yang diperbolehkan: `putra`, `putri`, atau `campur`. `fasilitas` dan `tersedia` opsional, masing-masing default ke `[]` dan `true`.

Contoh body:

```json
{
  "nomorKamar": "A-07",
  "tipe": "putri",
  "hargaPerBulan": 1100000,
  "fasilitas": ["AC", "kamar mandi dalam", "WiFi"],
  "tersedia": true
}
```

## Catatan deployment

`app.js` mengekspor aplikasi Express agar dapat ditemukan Vercel dan hanya membuka listener saat dijalankan langsung secara lokal. Karena data berada di memory, perubahan data tidak dijamin tetap ada setelah instance serverless berhenti atau berganti.
