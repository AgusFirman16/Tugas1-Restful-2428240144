const INITIAL_ROOMS = [
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

function sendError(res, status, message) {
  return res.status(status).json({ status: 'error', message, data: null });
}

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
  if (body.hargaPerBulan < 0) {
    return { error: 'Field hargaPerBulan tidak boleh negatif' };
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

function createBoardingRoomsController(initialRooms = INITIAL_ROOMS) {
  const rooms = structuredClone(initialRooms);
  let nextId = rooms.reduce((highestId, room) => Math.max(highestId, room.id), 0) + 1;

  return {
    list(req, res) {
      const { tipe } = req.query;
      const data = tipe === undefined
        ? rooms
        : rooms.filter((room) => room.tipe === tipe);
      return res.json(data);
    },

    getById(req, res) {
      const id = Number(req.params.id);
      const room = Number.isInteger(id)
        ? rooms.find((item) => item.id === id)
        : undefined;
      if (!room) {
        return sendError(res, 404, `Data dengan id ${req.params.id} tidak ditemukan`);
      }
      return res.json(room);
    },

    create(req, res) {
      const validation = validateRoom(req.body);
      if (validation.error) return sendError(res, 400, validation.error);

      const room = { id: nextId++, ...validation.data };
      rooms.push(room);
      return res.status(201).json({
        status: 'success',
        message: 'Data kamar kos berhasil ditambahkan',
        data: room,
      });
    },

    update(req, res) {
      const id = Number(req.params.id);
      const index = Number.isInteger(id)
        ? rooms.findIndex((room) => room.id === id)
        : -1;
      if (index === -1) {
        return sendError(res, 404, `Data dengan id ${req.params.id} tidak ditemukan`);
      }

      const validation = validateRoom(req.body);
      if (validation.error) return sendError(res, 400, validation.error);

      const updated = { id, ...validation.data };
      rooms[index] = updated;
      return res.status(200).json({
        status: 'success',
        message: 'Data kamar kos berhasil diperbarui',
        data: updated,
      });
    },

    delete(req, res) {
      const id = Number(req.params.id);
      const index = Number.isInteger(id)
        ? rooms.findIndex((room) => room.id === id)
        : -1;
      if (index === -1) {
        return sendError(res, 404, `Data dengan id ${req.params.id} tidak ditemukan`);
      }

      rooms.splice(index, 1);
      return res.status(200).json({
        status: 'success',
        message: `Data kamar kos dengan id ${id} berhasil dihapus`,
        data: null,
      });
    },
  };
}

module.exports = createBoardingRoomsController;
