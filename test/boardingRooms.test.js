const assert = require('node:assert/strict');
const { once } = require('node:events');
const test = require('node:test');
const appModule = require('../app');

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

test('boarding room API supports discovery, filtering, validation, and CRUD', async (t) => {
  const app = appModule.createApp({ apiKey: API_KEY });
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
  assert.equal((await listResponse.json()).length, 3);

  const filteredResponse = await request('/boarding-rooms?tipe=putri');
  assert.deepEqual(
    (await filteredResponse.json()).map((room) => room.nomorKamar),
    ['A-07']
  );
  assert.deepEqual(await (await request('/boarding-rooms?tipe=lainnya')).json(), []);

  const detailResponse = await request('/boarding-rooms/2');
  assert.equal((await detailResponse.json()).nomorKamar, 'B-02');
  assert.equal((await request('/boarding-rooms/invalid')).status, 404);

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

test('write operations report missing API key configuration', async (t) => {
  const app = appModule.createApp({ apiKey: '' });
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
