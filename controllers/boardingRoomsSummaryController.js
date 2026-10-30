const createBoardingRoomsSummaryModel = require('../models/BoardingRoomsSummaryModel');

function createBoardingRoomsSummaryController({
  getRooms,
  summaryModel = createBoardingRoomsSummaryModel(),
} = {}) {
  if (typeof getRooms !== 'function') {
    throw new TypeError('getRooms harus berupa fungsi');
  }

  return {
    async getSummary(req, res) {
      const summary = summaryModel.summarize(await getRooms());
      return res.json({
        status: 'success',
        message: 'Ringkasan kamar kos berhasil diambil',
        data: summary,
      });
    },
  };
}

module.exports = createBoardingRoomsSummaryController;
