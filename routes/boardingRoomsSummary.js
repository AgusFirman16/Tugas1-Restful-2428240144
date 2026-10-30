const express = require('express');
const createBoardingRoomsSummaryController = require('../controllers/boardingRoomsSummaryController');

function createBoardingRoomsSummaryRouter({ getRooms } = {}) {
  const router = express.Router();
  const controller = createBoardingRoomsSummaryController({ getRooms });

  router.get('/', controller.getSummary);

  return router;
}

module.exports = createBoardingRoomsSummaryRouter;
