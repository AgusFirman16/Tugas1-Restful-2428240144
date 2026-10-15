const rumahkosModel = require('../models/rumahkosModel');
const { errorHttp } = require('../middlewares/errorHandler');

exports.getAll = (req, res) => {
  const { lokasi } = req.query;
  res.json(rumahkosModel.getAll(lokasi));
};

exports.getById = (req, res, next) => {
  const id = parseInt(req.params.id);
  const data = rumahkosModel.getById(id);
  if (!data) return next(errorHttp(404, 'Data tidak ditemukan'));
  res.json(data);
};

exports.create = (req, res, next) => {
  const { nama, alamat, hargaPerBulan, fasilitas = [] } = req.body;
  if (!nama || !alamat || !Number.isFinite(hargaPerBulan) || hargaPerBulan <= 0) {
    return next(errorHttp(400, 'nama, alamat, dan hargaPerBulan yang valid wajib diisi'));
  }

  const baru = rumahkosModel.create({ nama, alamat, hargaPerBulan, fasilitas });
  res.status(201).json(baru);
};

exports.update = (req, res, next) => {
  const id = parseInt(req.params.id);
  const hasil = rumahkosModel.update(id, req.body);
  if (!hasil) return next(errorHttp(404, 'Data tidak ditemukan'));
  res.json(hasil);
};

exports.remove = (req, res, next) => {
  const id = parseInt(req.params.id);
  const berhasil = rumahkosModel.remove(id);
  if (!berhasil) return next(errorHttp(404, 'Data tidak ditemukan'));
  res.status(204).send();
};