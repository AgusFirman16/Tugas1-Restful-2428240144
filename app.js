const express = require('express');

const app = express();
const PORT = process.env.PORT || 3000;
const API_KEY = process.env.API_KEY || 'kunci-rahasia-paw2';

app.use(express.json());

// Data awal kamar kos untuk topik 26.
const boardingRooms = [
  {
    id: 1,
    nomorKamar: 'A-07',
    tipe: 'putri',
    hargaPerBulan: 1100000,
    fasilitas: ['AC', 'Kamar mandi dalam', 'Wi-Fi'],
    tersedia: true,
  },
  {
    id: 2,
    nomorKamar: 'B-02',
    tipe: 'putra',
    hargaPerBulan: 950000,
    fasilitas: ['Wi-Fi', 'Parkir'],
    tersedia: true,
  },
  {
    id: 3,
    nomorKamar: 'C-11',
    tipe: 'campur',
    hargaPerBulan: 1250000,
    fasilitas: ['AC', 'Dapur bersama'],
    tersedia: false,
  },
];
let nextId = 4;

function sendError(res, status, message) {
  return res.status(status).json({ status: 'error', message, data: null });
}

app.use('/boarding-rooms', (req, res, next) => {
  if (req.method === 'GET') return next();
  if (req.get('x-api-key') !== API_KEY) {
    return sendError(res, 401, 'API key tidak valid');
  }
  next();
});

function validateRoom(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return { error: 'Body harus berupa objek JSON' };
  }
  if (typeof body.nomorKamar !== 'string' || !body.nomorKamar.trim()) {
    return { error: 'Field nomorKamar wajib diisi' };
  }
  if (!['putra', 'putri', 'campur'].includes(body.tipe)) {
    return { error: 'Field tipe wajib diisi dengan putra, putri, atau campur' };
  }
  if (typeof body.hargaPerBulan !== 'number' || !Number.isFinite(body.hargaPerBulan)) {
    return { error: 'Field hargaPerBulan wajib berupa angka' };
  }

  const fasilitas = body.fasilitas === undefined ? [] : body.fasilitas;
  const tersedia = body.tersedia === undefined ? true : body.tersedia;
  if (!Array.isArray(fasilitas) || fasilitas.some((item) => typeof item !== 'string')) {
    return { error: 'Field fasilitas harus berupa array string' };
  }
  if (typeof tersedia !== 'boolean') {
    return { error: 'Field tersedia harus berupa boolean' };
  }

  return {
    data: {
      nomorKamar: body.nomorKamar.trim(),
      tipe: body.tipe,
      hargaPerBulan: body.hargaPerBulan,
      fasilitas,
      tersedia,
    },
  };
}

// GET /
app.get('/', (req, res) => {
  res.json({
    nama: 'Agus Firman',
    nim: '2428240144',
    topik: 26,
    resource: 'Kamar Kos',
    endpoints: [
      'GET /boarding-rooms',
      'GET /boarding-rooms/:id',
      'POST /boarding-rooms',
      'PUT /boarding-rooms/:id',
      'DELETE /boarding-rooms/:id',
      'GET /boarding-rooms?tipe=putri',
    ],
  });
});

// GET /boarding-rooms
// GET /boarding-rooms?tipe=putri
app.get('/boarding-rooms', (req, res) => {
  const { tipe } = req.query;
  const data = tipe === undefined
    ? boardingRooms
    : boardingRooms.filter((room) => room.tipe === tipe);
  res.json(data);
});

// GET /boarding-rooms/:id
app.get('/boarding-rooms/:id', (req, res) => {
  const id = Number(req.params.id);
  const room = Number.isInteger(id)
    ? boardingRooms.find((item) => item.id === id)
    : undefined;
  if (!room) return sendError(res, 404, `Data dengan id ${req.params.id} tidak ditemukan`);
  res.json(room);
});

// POST /boarding-rooms
// Body: { "nomorKamar": "A-07", "tipe": "putri", "hargaPerBulan": 1100000, "fasilitas": ["AC"], "tersedia": true }
app.post('/boarding-rooms', (req, res) => {
  const validation = validateRoom(req.body);
  if (validation.error) return sendError(res, 400, validation.error);

  const baru = { id: nextId++, ...validation.data };
  boardingRooms.push(baru);
  res.status(201).json({
    status: 'success',
    message: 'Data kamar kos berhasil ditambahkan',
    data: baru,
  });
});

// PUT /boarding-rooms/:id
// Body: { "nomorKamar": "A-07", "tipe": "putri", "hargaPerBulan": 1100000, "fasilitas": ["AC"], "tersedia": true }
app.put('/boarding-rooms/:id', (req, res) => {
  const id = Number(req.params.id);
  const index = Number.isInteger(id)
    ? boardingRooms.findIndex((room) => room.id === id)
    : -1;
  if (index === -1) return sendError(res, 404, `Data dengan id ${req.params.id} tidak ditemukan`);

  const validation = validateRoom(req.body);
  if (validation.error) return sendError(res, 400, validation.error);

  const updated = { id, ...validation.data };
  boardingRooms[index] = updated;
  res.status(200).json({
    status: 'success',
    message: 'Data kamar kos berhasil diperbarui',
    data: updated,
  });
});

// DELETE /boarding-rooms/:id
app.delete('/boarding-rooms/:id', (req, res) => {
  const id = Number(req.params.id);
  const index = Number.isInteger(id)
    ? boardingRooms.findIndex((room) => room.id === id)
    : -1;
  if (index === -1) return sendError(res, 404, `Data dengan id ${req.params.id} tidak ditemukan`);

  boardingRooms.splice(index, 1);
  res.status(200).json({
    status: 'success',
    message: `Data kamar kos dengan id ${id} berhasil dihapus`,
    data: null,
  });
});

// Catch-all 404 untuk endpoint yang tidak terdaftar.
app.use((req, res) => sendError(res, 404, 'Endpoint tidak ditemukan'));

// Error handler menjaga response tetap JSON, termasuk JSON request yang rusak.
app.use((err, req, res, next) => {
  if (err.type === 'entity.parse.failed') {
    return sendError(res, 400, 'Format JSON tidak valid');
  }
  console.error(err.stack);
  return sendError(res, 500, 'Terjadi kesalahan pada server');
});

if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server berjalan di http://localhost:${PORT}`);
  });
}

module.exports = app;