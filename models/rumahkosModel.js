let rumahkos = [
  {
    id: 1,
    nama: 'Kos Melati',
    alamat: 'Jl. Merdeka No. 10, Depok',
    hargaPerBulan: 1200000,
    fasilitas: ['Wi-Fi', 'Kamar mandi dalam'],
  },
  {
    id: 2,
    nama: 'Kos Anggrek',
    alamat: 'Jl. Kenanga No. 5, Jakarta',
    hargaPerBulan: 1500000,
    fasilitas: ['Wi-Fi', 'Parkir'],
  },
];
let nextId = 3;

function getAll(lokasi) {
  if (!lokasi) return rumahkos;
  const kataKunci = lokasi.toLowerCase();
  return rumahkos.filter((kos) => kos.alamat.toLowerCase().includes(kataKunci));
}

function getById(id) {
  return rumahkos.find((kos) => kos.id === id);
}

function create(data) {
  const baru = { id: nextId++, ...data };
  rumahkos.push(baru);
  return baru;
}

function update(id, data) {
  const index = rumahkos.findIndex((kos) => kos.id === id);
  if (index === -1) return null;
  rumahkos[index] = { ...rumahkos[index], ...data, id };
  return rumahkos[index];
}

function remove(id) {
  const index = rumahkos.findIndex((kos) => kos.id === id);
  if (index === -1) return false;
  rumahkos.splice(index, 1);
  return true;
}

module.exports = { getAll, getById, create, update, remove };