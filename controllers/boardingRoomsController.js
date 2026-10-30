const BoardingRoom = require('../models/BoardingRoomsModel');

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

function withoutMongoFields(room) {
  if (!room) return room;
  const data = typeof room.toObject === 'function' ? room.toObject() : room;
  const { _id, __v, ...result } = data;
  return result;
}

function createBoardingRoomsController(roomModel = BoardingRoom) {
  return {
    getRooms() {
      return roomModel.find().select('-_id -__v').lean();
    },

    async list(req, res) {
      const { tipe } = req.query;
      const filter = tipe === undefined ? {} : { tipe };
      const data = await roomModel.find(filter).select('-_id -__v').lean();
      return res.json(data);
    },

    async getById(req, res) {
      const id = Number(req.params.id);
      const room = Number.isInteger(id)
        ? await roomModel.findOne({ id }).select('-_id -__v').lean()
        : undefined;
      if (!room) {
        return sendError(res, 404, `Data dengan id ${req.params.id} tidak ditemukan`);
      }
      return res.json(room);
    },

    async create(req, res) {
      const validation = validateRoom(req.body);
      if (validation.error) return sendError(res, 400, validation.error);

      const highestId = await roomModel.findOne()
        .sort({ id: -1 })
        .select('id')
        .lean();
      const room = withoutMongoFields(
        await roomModel.create({
          id: (highestId?.id || 0) + 1,
          ...validation.data,
        })
      );
      return res.status(201).json({
        status: 'success',
        message: 'Data kamar kos berhasil ditambahkan',
        data: room,
      });
    },

    async update(req, res) {
      const id = Number(req.params.id);
      if (!Number.isInteger(id)) {
        return sendError(res, 404, `Data dengan id ${req.params.id} tidak ditemukan`);
      }

      const validation = validateRoom(req.body);
      if (validation.error) return sendError(res, 400, validation.error);

      const updated = await roomModel.findOneAndUpdate(
        { id },
        validation.data,
        { new: true, runValidators: true }
      ).select('-_id -__v').lean();
      if (!updated) {
        return sendError(res, 404, `Data dengan id ${req.params.id} tidak ditemukan`);
      }

      return res.status(200).json({
        status: 'success',
        message: 'Data kamar kos berhasil diperbarui',
        data: updated,
      });
    },

    async delete(req, res) {
      const id = Number(req.params.id);
      if (!Number.isInteger(id)) {
        return sendError(res, 404, `Data dengan id ${req.params.id} tidak ditemukan`);
      }

      const deleted = await roomModel.findOneAndDelete({ id });
      if (!deleted) {
        return sendError(res, 404, `Data dengan id ${req.params.id} tidak ditemukan`);
      }

      return res.status(200).json({
        status: 'success',
        message: `Data kamar kos dengan id ${id} berhasil dihapus`,
        data: null,
      });
    },
  };
}

module.exports = createBoardingRoomsController;
