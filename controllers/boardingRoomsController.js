const BoardingRoom = require('../models/BoardingRoomsModel');
const MAX_LIMIT = 50;
const ROOM_FIELDS = new Set([
  '_id',
  'id',
  'nomorKamar',
  'tipe',
  'hargaPerBulan',
  'fasilitas',
  'tersedia',
  'createdAt',
  'updatedAt',
]);
const SORT_FIELDS = new Set([
  '_id',
  'id',
  'nomorKamar',
  'tipe',
  'hargaPerBulan',
  'tersedia',
]);

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

function positiveIntegerQuery(value, name, defaultValue) {
  if (value === undefined) return defaultValue;
  if (typeof value !== 'string' || !/^\d+$/.test(value)) {
    return { error: `Query ${name} harus berupa bilangan bulat positif` };
  }

  const parsed = Number(value);
  if (!Number.isSafeInteger(parsed) || parsed < 1) {
    return { error: `Query ${name} harus berupa bilangan bulat positif` };
  }
  return parsed;
}

function parseFields(value) {
  if (value === undefined) return undefined;
  if (typeof value !== 'string') {
    return { error: 'Query fields harus berupa daftar field yang dipisahkan koma' };
  }

  const fields = value.split(',').map((field) => field.trim());
  if (
    fields.some((field) => !field || !ROOM_FIELDS.has(field))
    || new Set(fields).size !== fields.length
  ) {
    return { error: 'Query fields berisi field yang tidak valid atau duplikat' };
  }

  return Object.fromEntries(fields.map((field) => [field, 1]));
}

function parseSort(value) {
  if (value === undefined) return { id: 1 };
  if (typeof value !== 'string' || !value) {
    return { error: 'Query sort harus berisi nama field' };
  }

  const descending = value.startsWith('-');
  const field = descending ? value.slice(1) : value;
  if (!SORT_FIELDS.has(field)) {
    return { error: 'Query sort menggunakan field yang tidak didukung' };
  }
  return { [field]: descending ? -1 : 1 };
}

function createBoardingRoomsController(roomModel = BoardingRoom) {
  return {
    getRooms() {
      return roomModel.find().select('-_id -__v').lean();
    },

    async list(req, res) {
      const { tipe } = req.query;
      if (tipe !== undefined && typeof tipe !== 'string') {
        return sendError(res, 400, 'Query tipe harus berupa satu nilai');
      }

      const page = positiveIntegerQuery(req.query.page, 'page', 1);
      if (page.error) return sendError(res, 400, page.error);

      const requestedLimit = positiveIntegerQuery(req.query.limit, 'limit', 10);
      if (requestedLimit.error) return sendError(res, 400, requestedLimit.error);
      const limit = Math.min(requestedLimit, MAX_LIMIT);
      const skip = (page - 1) * limit;
      if (!Number.isSafeInteger(skip)) {
        return sendError(res, 400, 'Query page terlalu besar');
      }

      const sort = parseSort(req.query.sort);
      if (sort.error) return sendError(res, 400, sort.error);

      const projection = parseFields(req.query.fields);
      if (projection && projection.error) {
        return sendError(res, 400, projection.error);
      }

      const filter = tipe === undefined ? {} : { tipe };
      let query = roomModel.find(filter);
      query = query.sort(sort).skip(skip).limit(limit);
      query = projection
        ? query.select(projection)
        : query.select('-_id -__v');

      const [data, total] = await Promise.all([
        query.lean(),
        roomModel.countDocuments(filter),
      ]);
      return res.json({
        data,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      });
    },

    async getById(req, res) {
      const id = Number(req.params.id);
      if (!Number.isSafeInteger(id) || id < 1) {
        return sendError(res, 400, 'Parameter id harus berupa bilangan bulat positif');
      }

      const room = await roomModel.findOne({ id }).select('-_id -__v').lean();
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
        { returnDocument: 'after', runValidators: true }
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
