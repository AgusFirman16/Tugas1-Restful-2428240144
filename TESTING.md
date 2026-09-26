# Skenario Pengujian API

Jalankan server dengan `npm run dev`, lalu kirim request ke `http://localhost:3000`. Untuk deployment, ganti alamat dasar dengan URL Vercel. Request tanpa body memakai header `Accept: application/json`; request POST/PUT memakai `Accept: application/json` dan `Content-Type: application/json`.

Jalankan skenario berurutan dari awal server. Data awal mempunyai ID 1, 2, dan 3; POST berhasil pada skenario 5 mendapat ID 4. PUT mengubah ID 1, sedangkan DELETE menghapus ID 3.

## 1. GET Semua Kamar

- Method dan URL: `GET http://localhost:3000/boarding-rooms`
- Headers: `Accept: application/json`
- Body: tidak ada
- Expected status: `200 OK`
- Contoh response:

```json
[
  { "id": 1, "nomorKamar": "A-01", "tipe": "putra", "hargaPerBulan": 850000, "fasilitas": ["WiFi", "lemari", "kipas angin"], "tersedia": true },
  { "id": 2, "nomorKamar": "B-03", "tipe": "putri", "hargaPerBulan": 1100000, "fasilitas": ["AC", "kamar mandi dalam", "WiFi"], "tersedia": true },
  { "id": 3, "nomorKamar": "C-02", "tipe": "campur", "hargaPerBulan": 950000, "fasilitas": ["WiFi", "meja belajar"], "tersedia": false }
]
```

## 2. GET ID yang Ada

- Method dan URL: `GET http://localhost:3000/boarding-rooms/1`
- Headers: `Accept: application/json`
- Body: tidak ada
- Expected status: `200 OK`
- Contoh response:

```json
{ "id": 1, "nomorKamar": "A-01", "tipe": "putra", "hargaPerBulan": 850000, "fasilitas": ["WiFi", "lemari", "kipas angin"], "tersedia": true }
```

## 3. GET ID 99

- Method dan URL: `GET http://localhost:3000/boarding-rooms/99`
- Headers: `Accept: application/json`
- Body: tidak ada
- Expected status: `404 Not Found`
- Contoh response:

```json
{ "status": "error", "message": "Kamar kos tidak ditemukan.", "data": null }
```

## 4. GET Filter Tipe Putri

- Method dan URL: `GET http://localhost:3000/boarding-rooms?tipe=putri`
- Headers: `Accept: application/json`
- Body: tidak ada
- Expected status: `200 OK`
- Contoh response:

```json
[
  { "id": 2, "nomorKamar": "B-03", "tipe": "putri", "hargaPerBulan": 1100000, "fasilitas": ["AC", "kamar mandi dalam", "WiFi"], "tersedia": true }
]
```

## 5. POST Berhasil

- Method dan URL: `POST http://localhost:3000/boarding-rooms`
- Headers: `Accept: application/json`; `Content-Type: application/json`
- Body:

```json
{
  "nomorKamar": "A-07",
  "tipe": "putri",
  "hargaPerBulan": 1100000,
  "fasilitas": ["AC", "kamar mandi dalam", "WiFi"],
  "tersedia": true
}
```

- Expected status: `201 Created`
- Contoh response:

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

## 6. POST Field Wajib Kosong/Tidak Valid

- Method dan URL: `POST http://localhost:3000/boarding-rooms`
- Headers: `Accept: application/json`; `Content-Type: application/json`
- Body:

```json
{ "nomorKamar": "", "tipe": "lain", "hargaPerBulan": "murah" }
```

- Expected status: `400 Bad Request`
- Contoh response:

```json
{
  "status": "error",
  "message": "nomorKamar wajib berupa string yang tidak kosong. tipe wajib diisi dengan salah satu nilai: putra, putri, atau campur. hargaPerBulan wajib berupa angka lebih dari 0.",
  "data": null
}
```

## 7. PUT Berhasil

- Method dan URL: `PUT http://localhost:3000/boarding-rooms/1`
- Headers: `Accept: application/json`; `Content-Type: application/json`
- Body:

```json
{
  "nomorKamar": "A-01",
  "tipe": "putra",
  "hargaPerBulan": 900000,
  "fasilitas": ["WiFi"],
  "tersedia": false
}
```

- Expected status: `200 OK`
- Contoh response:

```json
{
  "status": "success",
  "message": "Kamar kos berhasil diperbarui.",
  "data": {
    "id": 1,
    "nomorKamar": "A-01",
    "tipe": "putra",
    "hargaPerBulan": 900000,
    "fasilitas": ["WiFi"],
    "tersedia": false
  }
}
```

## 8. PUT ID 99

- Method dan URL: `PUT http://localhost:3000/boarding-rooms/99`
- Headers: `Accept: application/json`; `Content-Type: application/json`
- Body:

```json
{ "nomorKamar": "A-99", "tipe": "putra", "hargaPerBulan": 900000 }
```

- Expected status: `404 Not Found`
- Contoh response:

```json
{ "status": "error", "message": "Kamar kos tidak ditemukan.", "data": null }
```

## 9. DELETE Berhasil

- Method dan URL: `DELETE http://localhost:3000/boarding-rooms/3`
- Headers: `Accept: application/json`
- Body: tidak ada
- Expected status: `200 OK`
- Contoh response:

```json
{
  "status": "success",
  "message": "Kamar kos berhasil dihapus.",
  "data": {
    "id": 3,
    "nomorKamar": "C-02",
    "tipe": "campur",
    "hargaPerBulan": 950000,
    "fasilitas": ["WiFi", "meja belajar"],
    "tersedia": false
  }
}
```

## 10. DELETE ID 99

- Method dan URL: `DELETE http://localhost:3000/boarding-rooms/99`
- Headers: `Accept: application/json`
- Body: tidak ada
- Expected status: `404 Not Found`
- Contoh response:

```json
{ "status": "error", "message": "Kamar kos tidak ditemukan.", "data": null }
```

## Mencatat Hasil Aktual

Saat menyusun laporan, tambahkan kolom status aktual dan hasil (Berhasil/Gagal) setelah menjalankan setiap request. Jangan mengisi status aktual hanya dari contoh di atas; gunakan hasil Postman/Thunder Client lokal dan ulangi pengujian pada URL Vercel setelah deployment.
