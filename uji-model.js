const rumahkosModel = require('./models/rumahkosModel');

console.log('Semua rumah kos:', rumahkosModel.getAll());
console.log('Filter lokasi Depok:', rumahkosModel.getAll('Depok'));
console.log('Cari id 1:', rumahkosModel.getById(1));

const baru = rumahkosModel.create({
	nama: 'Kos Dahlia',
	alamat: 'Jl. Dahlia No. 2, Depok',
	hargaPerBulan: 1350000,
	fasilitas: ['Wi-Fi'],
});
console.log('Setelah create:', baru);

console.log('Update id 1:', rumahkosModel.update(1, { hargaPerBulan: 1250000 }));
console.log('Remove id 2:', rumahkosModel.remove(2));
console.log('Data akhir:', rumahkosModel.getAll());