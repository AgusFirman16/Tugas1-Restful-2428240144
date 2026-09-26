# Draft Laporan Praktikum RESTful API

## Identitas

- Nama: Agus Firman
- NIM: [NIM SAYA]
- Nomor absen/topik: 26
- Judul: RESTful API Data Kamar Kos dengan Node.js dan Express.js
- URL deployment: [URL VERCEL SETELAH DEPLOY]

## Hasil Pengujian

Pengujian lokal dilakukan pada `http://localhost:3000` dengan server Nodemon. Sepuluh skenario utama dijalankan berurutan dari kondisi data awal. Semua request memperoleh status HTTP sesuai spesifikasi.

| No. | Skenario | Method dan endpoint | Status diharapkan | Status aktual | Hasil |
| --- | --- | --- | --- | --- | --- |
| 1 | Mendapatkan semua kamar | `GET /boarding-rooms` | 200 | 200 | Berhasil |
| 2 | Mendapatkan kamar ID 1 | `GET /boarding-rooms/1` | 200 | 200 | Berhasil |
| 3 | Mendapatkan ID yang tidak ada | `GET /boarding-rooms/99` | 404 | 404 | Berhasil |
| 4 | Filter tipe putri | `GET /boarding-rooms?tipe=putri` | 200 | 200 | Berhasil |
| 5 | Menambahkan kamar dengan data valid | `POST /boarding-rooms` | 201 | 201 | Berhasil |
| 6 | Menambahkan kamar dengan field wajib tidak valid | `POST /boarding-rooms` | 400 | 400 | Berhasil |
| 7 | Memperbarui seluruh field wajib | `PUT /boarding-rooms/1` | 200 | 200 | Berhasil |
| 8 | Memperbarui ID yang tidak ada | `PUT /boarding-rooms/99` | 404 | 404 | Berhasil |
| 9 | Menghapus kamar ID 3 | `DELETE /boarding-rooms/3` | 200 | 200 | Berhasil |
| 10 | Menghapus ID yang tidak ada | `DELETE /boarding-rooms/99` | 404 | 404 | Berhasil |

Request dengan body dikirim menggunakan `Content-Type: application/json`. Pengujian tambahan memastikan endpoint yang tidak terdaftar mengembalikan 404 JSON dan body JSON yang rusak mengembalikan 400 JSON. Contoh request dan response per skenario tercantum di [TESTING.md](TESTING.md). Setelah pengujian Postman/Thunder Client dan Vercel dilakukan, tambahkan bukti atau tangkapan layar serta ganti status aktual jika hasilnya berbeda.

Contoh response ketika data berhasil dibuat:

```json
{
  "status": "success",
  "message": "Kamar kos berhasil ditambahkan.",
  "data": {
    "id": 4,
    "nomorKamar": "A-07",
    "tipe": "putri",
    "hargaPerBulan": 1100000,
    "fasilitas": ["AC", "kamar mandi dalam", "WiFi"],
    "tersedia": true
  }
}
```

Contoh response ketika data tidak ditemukan:

```json
{
  "status": "error",
  "message": "Kamar kos tidak ditemukan.",
  "data": null
}
```

## Pembahasan

API dibuat menggunakan Node.js dan Express.js. Data kamar disimpan dalam array di memory sehingga aplikasi tidak memerlukan database. ID dibuat otomatis menggunakan variabel `nextId`. Middleware `express.json()` membaca body JSON untuk request POST dan PUT.

Endpoint GET koleksi mengembalikan array secara langsung. Filter tipe membaca `req.query.tipe`, sedangkan operasi satu kamar menggunakan parameter `:id`. POST menambahkan data dan menghasilkan status 201. PUT mengganti data pada ID yang dituju dan memerlukan seluruh field wajib. DELETE menghapus kamar dari array. Respons operasi tulis dan error memakai object dengan `status`, `message`, dan `data`.

Validasi menolak `nomorKamar` kosong, tipe selain `putra`, `putri`, atau `campur`, serta harga yang bukan angka positif. Jika dikirim, `fasilitas` harus berupa array string dan `tersedia` harus berupa boolean. Field opsional tersebut menggunakan nilai awal `[]` dan `true` bila tidak dicantumkan. Data/endpoint yang tidak ditemukan menghasilkan status 404 dengan response JSON; body JSON tidak valid menghasilkan status 400 JSON.

Aplikasi mengekspor Express app untuk deployment Vercel dan hanya membuka listener ketika dijalankan langsung secara lokal. Di Vercel, API berjalan sebagai function serverless. Karena array berada di memory, perubahan POST, PUT, dan DELETE tidak persisten dan dapat hilang ketika instance berubah atau dimulai kembali. Dengan demikian, penyimpanan memory sesuai batasan tugas tanpa database, tetapi tidak cocok sebagai penyimpanan permanen untuk aplikasi produksi.

## Kesimpulan

API kamar kos telah menyediakan operasi baca, filter, tambah, ubah, dan hapus beserta validasi dan penanganan 404 JSON. Sepuluh skenario lokal menunjukkan status response sesuai spesifikasi. Lengkapi URL Vercel, identitas NIM, dan bukti uji Postman/Thunder Client sebelum dokumen ini diekspor menjadi PDF.
