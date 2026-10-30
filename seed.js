require('dotenv').config();

const mongoose = require('mongoose');
const BoardingRoom = require('./models/BoardingRoomsModel');

const initialRooms = [
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

async function seedDatabase() {
  if (!process.env.DB_URI) {
    throw new Error('DB_URI belum dikonfigurasi');
  }

  await mongoose.connect(process.env.DB_URI);
  try {
    await BoardingRoom.init();
    const result = await BoardingRoom.bulkWrite(
      initialRooms.map((room) => ({
        updateOne: {
          filter: { id: room.id },
          update: { $setOnInsert: room },
          upsert: true,
        },
      })),
      { ordered: true }
    );

    console.log(
      `Seed berhasil: ${result.upsertedCount} kamar ditambahkan; data yang sudah ada tidak diubah.`
    );
  } finally {
    await mongoose.disconnect();
  }
}

if (require.main === module) {
  seedDatabase().catch((err) => {
    console.error(
      `Seed MongoDB gagal (${err.name || 'Error'}${err.code ? `, kode ${err.code}` : ''}).`
    );
    process.exitCode = 1;
  });
}

module.exports = initialRooms;
