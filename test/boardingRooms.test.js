const assert = require('node:assert/strict');
const { once } = require('node:events');
const test = require('node:test');
const appModule = require('../app');
const initialRooms = require('../seed');

const API_KEY = 'test-api-key';
const validRoom = {
  nomorKamar: 'D-04',
  tipe: 'putri',
  hargaPerBulan: 1000000,
  fasilitas: ['Wi-Fi'],
  tersedia: true,
};

async function startServer(app) {
  const server = app.listen(0, '127.0.0.1');
  await once(server, 'listening');
  return {
    server,
    baseUrl: `http://127.0.0.1:${server.address().port}`,
  };
}

async function closeServer(server) {
  server.close();
  await once(server, 'close');
}

function createMemoryRoomModel(sourceRooms = initialRooms) {
  let rooms = structuredClone(sourceRooms);
  const matches = (room, filter) => Object.entries(filter).every(
    ([key, value]) => room[key] === value
  );
  const query = (resolve) => {
    let sortBy;
    let offset = 0;
    let limit;
    let projection;
    const result = {
      select(value) {
        projection = value;
        return result;
      },
      sort(value) {
        sortBy = value;
        return result;
      },
      skip(value) {
        offset = value;
        return result;
      },
      limit(value) {
        limit = value;
        return result;
      },
      lean() {
        return Promise.resolve().then(
          () => resolve({ sortBy, offset, limit, projection })
        );
      },
    };
    return result;
  };

  return {
    find(filter = {}) {
      return query(({ sortBy, offset, limit, projection }) => {
        let results = rooms.filter((room) => matches(room, filter)).map((room) => ({ ...room }));
        if (sortBy) {
          const [[field, direction]] = Object.entries(sortBy);
          results.sort((a, b) => {
            if (a[field] === b[field]) return 0;
            return (a[field] < b[field] ? -1 : 1) * direction;
          });
        }
        results = results.slice(offset, limit === undefined ? undefined : offset + limit);
        if (projection && typeof projection === 'object') {
          results = results.map((room) => Object.fromEntries(
            Object.keys(projection)
              .filter((field) => projection[field] === 1 && room[field] !== undefined)
              .map((field) => [field, room[field]])
          ));
        }
        return results;
      });
    },
    countDocuments(filter = {}) {
      return Promise.resolve(rooms.filter((room) => matches(room, filter)).length);
    },
    findOne(filter = {}) {
      return query(({ sortBy }) => {
        const found = rooms.filter((room) => matches(room, filter));
        if (sortBy) found.sort((a, b) => (a.id - b.id) * sortBy.id);
        return found[0] ? { ...found[0] } : null;
      });
    },
    async create(room) {
      const created = structuredClone(room);
      rooms.push(created);
      return created;
    },
    findOneAndUpdate(filter, update) {
      return query(() => {
        const index = rooms.findIndex((room) => matches(room, filter));
        if (index === -1) return null;
        rooms[index] = { ...rooms[index], ...update };
        return { ...rooms[index] };
      });
    },
    async findOneAndDelete(filter) {
      const index = rooms.findIndex((room) => matches(room, filter));
      if (index === -1) return null;
      return rooms.splice(index, 1)[0];
    },
  };
}

test('boarding room API supports discovery, filtering, validation, and CRUD', async (t) => {
  const app = appModule.createApp({
    apiKey: API_KEY,
    roomModel: createMemoryRoomModel(),
  });
  const { server, baseUrl } = await startServer(app);
  t.after(() => closeServer(server));

  const request = (path, { method = 'GET', body, apiKey } = {}) => {
    const headers = {};
    if (body !== undefined) headers['content-type'] = 'application/json';
    if (apiKey) headers['x-api-key'] = apiKey;
    return fetch(`${baseUrl}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  };

  const rootResponse = await request('/');
  assert.equal(rootResponse.status, 200);
  assert.equal((await rootResponse.json()).resource, 'Kamar Kos');

  const listResponse = await request('/boarding-rooms');
  assert.equal(listResponse.status, 200);
  assert.deepEqual((await listResponse.json()).pagination, {
    page: 1,
    limit: 10,
    total: 3,
    totalPages: 1,
  });
  assert.equal((await (await request('/boarding-rooms?limit=2')).json()).data.length, 2);

  const summaryResponse = await request('/boarding-rooms/summary');
  assert.equal(summaryResponse.status, 200);
  assert.deepEqual((await summaryResponse.json()).data, {
    totalKamar: 3,
    jumlahTersedia: 2,
    jumlahTerisi: 1,
    jumlahPerTipe: { putra: 1, putri: 1, campur: 1 },
    potensiPendapatanBulanan: 2050000,
  });

  const filteredResponse = await request('/boarding-rooms?tipe=putri');
  assert.deepEqual(
    (await filteredResponse.json()).data.map((room) => room.nomorKamar),
    ['A-07']
  );
  const noMatchingType = await (await request('/boarding-rooms?tipe=lainnya')).json();
  assert.deepEqual(noMatchingType.data, []);
  assert.equal(noMatchingType.pagination.total, 0);

  const selectedFields = await (
    await request('/boarding-rooms?sort=nomorKamar&fields=id,nomorKamar')
  ).json();
  assert.deepEqual(selectedFields.data[0], { id: 1, nomorKamar: 'A-07' });
  assert.equal((await request('/boarding-rooms?limit=0')).status, 400);

  const detailResponse = await request('/boarding-rooms/2');
  assert.equal((await detailResponse.json()).nomorKamar, 'B-02');
  assert.equal((await request('/boarding-rooms/abc')).status, 400);
  assert.equal((await request('/boarding-rooms/999')).status, 404);

  const unauthorizedResponse = await request('/boarding-rooms', {
    method: 'POST',
    body: validRoom,
  });
  assert.equal(unauthorizedResponse.status, 401);

  const invalidKeyResponse = await request('/boarding-rooms', {
    method: 'POST',
    body: validRoom,
    apiKey: 'invalid-api-key',
  });
  assert.equal(invalidKeyResponse.status, 401);

  const missingFieldResponse = await request('/boarding-rooms', {
    method: 'POST',
    body: {},
    apiKey: API_KEY,
  });
  assert.equal(missingFieldResponse.status, 400);

  const invalidResponse = await request('/boarding-rooms', {
    method: 'POST',
    body: { ...validRoom, hargaPerBulan: -1 },
    apiKey: API_KEY,
  });
  assert.equal(invalidResponse.status, 400);
  assert.match((await invalidResponse.json()).message, /tidak boleh negatif/);

  const createResponse = await request('/boarding-rooms', {
    method: 'POST',
    body: validRoom,
    apiKey: API_KEY,
  });
  assert.equal(createResponse.status, 201);
  const created = (await createResponse.json()).data;
  assert.equal(created.id, 4);
  const updatedSummaryResponse = await request('/boarding-rooms/summary');
  assert.equal(
    (await updatedSummaryResponse.json()).data.potensiPendapatanBulanan,
    3050000
  );

  const updateResponse = await request(`/boarding-rooms/${created.id}`, {
    method: 'PUT',
    body: { ...validRoom, hargaPerBulan: 1200000 },
    apiKey: API_KEY,
  });
  assert.equal(updateResponse.status, 200);
  assert.equal((await updateResponse.json()).data.hargaPerBulan, 1200000);
  assert.equal((await request('/boarding-rooms/999', {
    method: 'PUT',
    body: validRoom,
    apiKey: API_KEY,
  })).status, 404);

  const deleteResponse = await request(`/boarding-rooms/${created.id}`, {
    method: 'DELETE',
    apiKey: API_KEY,
  });
  assert.equal(deleteResponse.status, 200);
  assert.equal((await request(`/boarding-rooms/${created.id}`)).status, 404);

  const malformedResponse = await fetch(`${baseUrl}/boarding-rooms`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': API_KEY,
    },
    body: '{"nomorKamar":',
  });
  assert.equal(malformedResponse.status, 400);
  assert.match((await malformedResponse.json()).message, /Format JSON tidak valid/);

  const notFoundResponse = await request('/route-tidak-ada');
  assert.equal(notFoundResponse.status, 404);
});

test('boarding room listing supports pagination, sorting, field selection, filters, and limit cap', async (t) => {
  const rooms = Array.from({ length: 25 }, (_, index) => ({
    id: index + 1,
    nomorKamar: `K-${String(index + 1).padStart(2, '0')}`,
    tipe: index < 9 ? 'putri' : 'putra',
    hargaPerBulan: 500000 + index,
    fasilitas: [],
    tersedia: true,
  }));
  const app = appModule.createApp({
    apiKey: API_KEY,
    roomModel: createMemoryRoomModel(rooms),
  });
  const { server, baseUrl } = await startServer(app);
  t.after(() => closeServer(server));

  const defaultResponse = await (await fetch(`${baseUrl}/boarding-rooms`)).json();
  assert.equal(defaultResponse.data.length, 10);
  assert.deepEqual(defaultResponse.pagination, {
    page: 1,
    limit: 10,
    total: 25,
    totalPages: 3,
  });

  const lastPage = await (
    await fetch(`${baseUrl}/boarding-rooms?page=3`)
  ).json();
  assert.equal(lastPage.data.length, 5);

  const descending = await (
    await fetch(`${baseUrl}/boarding-rooms?sort=-nomorKamar&limit=1`)
  ).json();
  assert.equal(descending.data[0].nomorKamar, 'K-25');

  const filtered = await (
    await fetch(`${baseUrl}/boarding-rooms?tipe=putri`)
  ).json();
  assert.equal(filtered.pagination.total, 9);

  const emptyFilter = await (
    await fetch(`${baseUrl}/boarding-rooms?tipe=campur`)
  ).json();
  assert.deepEqual(emptyFilter.data, []);
  assert.equal(emptyFilter.pagination.total, 0);

  const cappedLimit = await (
    await fetch(`${baseUrl}/boarding-rooms?limit=999999`)
  ).json();
  assert.equal(cappedLimit.data.length, 25);
  assert.equal(cappedLimit.pagination.limit, 50);
});

test('write operations report missing API key configuration', async (t) => {
  const app = appModule.createApp({
    apiKey: '',
    roomModel: createMemoryRoomModel(),
  });
  const { server, baseUrl } = await startServer(app);
  t.after(() => closeServer(server));

  const response = await fetch(`${baseUrl}/boarding-rooms`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(validRoom),
  });

  assert.equal(response.status, 503);
  assert.match((await response.json()).message, /belum dikonfigurasi/);
});
