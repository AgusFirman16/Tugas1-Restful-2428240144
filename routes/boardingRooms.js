const express = require('express');
const createBoardingRoomsController = require('../controllers/boardingRoomsController');
const createBoardingRoomsSummaryRouter = require('./boardingRoomsSummary');
const cekApiKey = require('../middlewares/cekApiKey');

function createBoardingRoomsRouter({ apiKey, roomModel } = {}) {
  const router = express.Router();
  const controller = createBoardingRoomsController(roomModel);

  router.use(cekApiKey(apiKey));
  router.get('/', controller.list);
  router.use('/summary', createBoardingRoomsSummaryRouter({
    getRooms: controller.getRooms,
  }));
  router.get('/:id', controller.getById);
  router.post('/', controller.create);
  router.put('/:id', controller.update);
  router.delete('/:id', controller.delete);

  return router;
}

module.exports = createBoardingRoomsRouter;
