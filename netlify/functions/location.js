const { getStore } = require('@netlify/blobs');

// Egyszerű védelem: csak az tud írni, aki ismeri a "jelszót" (ugyanaz, mint a Peti belépőkód).
const WRITE_TOKEN = 'Vani';

exports.handler = async (event) => {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers };
  }

  const store = getStore('hajtovadaszat');

  if (event.httpMethod === 'POST') {
    let body;
    try {
      body = JSON.parse(event.body || '{}');
    } catch (e) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid JSON' }) };
    }

    if (body.token !== WRITE_TOKEN) {
      return { statusCode: 401, headers, body: JSON.stringify({ error: 'Unauthorized' }) };
    }

    const payload = {
      lat: body.lat,
      lng: body.lng,
      accuracy: body.accuracy || 0,
      timestamp: body.timestamp || Date.now()
    };

    await store.setJSON('groom-location', payload);
    return { statusCode: 200, headers, body: JSON.stringify({ ok: true }) };
  }

  if (event.httpMethod === 'GET') {
    const data = await store.get('groom-location', { type: 'json' });
    return { statusCode: 200, headers, body: JSON.stringify(data || null) };
  }

  return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
};
