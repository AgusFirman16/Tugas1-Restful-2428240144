const express = require('express');
const createBoardingRoomsController = require('../controllers/boardingRoomsController');
const requireApiKey = require('../middlewares/requireApiKey');

function createBoardingRoomsRouter({ apiKey } = {}) {
  const router = express.Router();
  const controller = createBoardingRoomsController();

  router.use(requireApiKey(apiKey));
  router.get('/', controller.list);
  router.get('/:id', controller.getById);
  router.post('/', controller.create);
  router.put('/:id', controller.update);
  router.delete('/:id', controller.delete);

  return router;
}

module.exports = createBoardingRoomsRouter;
