const TIPE_KAMAR = ['putra', 'putri', 'campur'];

function createBoardingRoomsSummaryModel() {
  return {
    summarize(rooms) {
      if (!Array.isArray(rooms)) {
        throw new TypeError('Data kamar harus berupa array');
      }

      const jumlahPerTipe = Object.fromEntries(TIPE_KAMAR.map((tipe) => [tipe, 0]));
      let jumlahTersedia = 0;
      let potensiPendapatanBulanan = 0;

      for (const room of rooms) {
        if (Object.hasOwn(jumlahPerTipe, room.tipe)) {
          jumlahPerTipe[room.tipe] += 1;
        }

        if (room.tersedia) {
          jumlahTersedia += 1;
          potensiPendapatanBulanan += room.hargaPerBulan;
        }
      }

      return {
        totalKamar: rooms.length,
        jumlahTersedia,
        jumlahTerisi: rooms.length - jumlahTersedia,
        jumlahPerTipe,
        potensiPendapatanBulanan,
      };
    },
  };
}

module.exports = createBoardingRoomsSummaryModel;
