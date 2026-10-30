const mongoose = require('mongoose');
const TIPE_KAMAR = ['putra', 'putri', 'campur'];
const boardingRoomSchema = new mongoose.Schema(
  {
    id: {
      type: Number,
      required: true,
      unique: true,
      min: 1,
    },
    nomorKamar: {
      type: String,
      required: [true, 'Field nomorKamar wajib diisi'],
      trim: true,
      unique: true,
    },
    tipe: {
      type: String,
      required: [true, 'Field tipe wajib diisi'],
      enum: {
        values: TIPE_KAMAR,
        message: 'Field tipe harus berisi putra, putri, atau campur',
      },
    },
    hargaPerBulan: {
      type: Number,
      required: [true, 'Field hargaPerBulan wajib diisi'],
      min: [0, 'Field hargaPerBulan tidak boleh negatif'],
    },
    fasilitas: {
      type: [String],
      default: [],
    },
    tersedia: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Koleksi di MongoDB akan bernama "boardingrooms".
const BoardingRoom = mongoose.model('BoardingRoom', boardingRoomSchema);

module.exports = BoardingRoom;
module.exports.TIPE_KAMAR = TIPE_KAMAR;