const mahasiswaModel = require('./models/rumahkosModel');

console.log('Semua data:', mahasiswaModel.getAll());
console.log('Filter Informatika:', mahasiswaModel.getAll('Informatika'));
console.log('Cari id 1:', mahasiswaModel.getById(1));

const baru = mahasiswaModel.create({ nama: 'Dewi', jurusan: 'Sistem Informasi' });
console.log('Setelah create:', baru);

console.log('Update id 1:', mahasiswaModel.update(1, { jurusan: 'Teknik Informatika' }));
console.log('Remove id 2:', mahasiswaModel.remove(2));
console.log('Data akhir:', mahasiswaModel.getAll());