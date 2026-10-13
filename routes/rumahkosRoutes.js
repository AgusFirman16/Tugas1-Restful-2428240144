const express = require('express');
const router = express.Router();
const rumahkosController = require('../controllers/rumahkosController');
const cekApiKey = require('../middlewares/cekApiKey');

router.get('/', rumahkosController.getAll);
router.get('/:id', rumahkosController.getById);
router.post('/', cekApiKey, rumahkosController.create);
router.put('/:id', cekApiKey, rumahkosController.update);
router.delete('/:id', cekApiKey, rumahkosController.remove);

module.exports = router;