import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import {
  CryptoDeepApiError,
  createClient,
  readNumber,
  toAuthorizationHeader,
} from '../examples/javascript/client.js';

function collectPostmanRequests(items = []) {
  return items.flatMap((item) =>
    item.request ? [item] : collectPostmanRequests(item.item),
  );
}

function getBearerToken(collection) {
  return collection.auth?.bearer?.find(({ key }) => key === 'token')?.value;
}

test('builds the documented Bearer authorization header', () => {
  assert.equal(toAuthorizationHeader('test_token-1'), 'Bearer test_token-1');
});

test('accepts non-negative numeric values', () => {
  assert.equal(readNumber('CRYPTODEEP_TEST_UNSET_AMOUNT', 0.01), 0.01);
  assert.equal(readNumber('CRYPTODEEP_TEST_UNSET_AMOUNT', 0), 0);
  assert.throws(() => readNumber('CRYPTODEEP_TEST_UNSET_AMOUNT', -1), {
    code: 'INVALID_ENVIRONMENT_VARIABLE',
  });
});

test('rejects a missing API key', () => {
  assert.throws(() => toAuthorizationHeader(''), {
    name: 'CryptoDeepApiError',
    code: 'MISSING_API_KEY',
  });
});

test('builds an authenticated GET request and omits empty query values', async () => {
  let captured;
  const client = createClient({
    apiKey: 'test_token',
    baseUrl: 'https://api.cryptodeep.app',
    fetchImpl: async (url, options) => {
      captured = { url, options };
      return new Response(JSON.stringify({ coins: [] }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    },
  });

  const result = await client.get('/api/v1/currencies', {
    page: 1,
    limit: 20,
    search: '',
  });

  assert.deepEqual(result, { coins: [] });
  assert.equal(
    captured.url.href,
    'https://api.cryptodeep.app/api/v1/currencies?page=1&limit=20',
  );
  assert.equal(captured.options.headers.Authorization, 'Bearer test_token');
  assert.equal(captured.options.method, 'GET');
});

test('surfaces structured non-success responses', async () => {
  const client = createClient({
    apiKey: 'test_token',
    fetchImpl: async () =>
      new Response(
        JSON.stringify({ message: 'Invalid API key', statusCode: 401 }),
        { status: 401, headers: { 'Content-Type': 'application/json' } },
      ),
  });

  await assert.rejects(
    client.get('/api/v1/currencies'),
    (error) =>
      error instanceof CryptoDeepApiError &&
      error.status === 401 &&
      error.body.message === 'Invalid API key',
  );
});

test('supports both documented /rate amount directions', async () => {
  const requestedUrls = [];
  const client = createClient({
    apiKey: 'test_token',
    fetchImpl: async (url) => {
      requestedUrls.push(url.href);
      return new Response(
        JSON.stringify({
          depositCoin: 'BTC',
          receiveCoin: 'XMR',
          depositAmount: 0.01,
          receiveAmount: 1,
          rate: 100,
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      );
    },
  });

  await client.get('/api/v1/rate', {
    depositCoin: 'BTC',
    receiveCoin: 'XMR',
    depositAmount: 0.01,
    rateMode: 'fixed',
  });
  await client.get('/api/v1/rate', {
    depositCoin: 'BTC',
    receiveCoin: 'XMR',
    receiveAmount: 1,
    rateMode: 'fixed',
  });

  assert.match(requestedUrls[0], /depositAmount=0\.01/);
  assert.doesNotMatch(requestedUrls[0], /receiveAmount=/);
  assert.match(requestedUrls[1], /receiveAmount=1/);
  assert.doesNotMatch(requestedUrls[1], /depositAmount=/);
});

test('Postman files contain the documented requests', async () => {
  const envExample = await readFile('.env.example', 'utf8');
  const postmanEnvironment = JSON.parse(
    await readFile('postman/CryptoDeepApp.postman_environment.json', 'utf8'),
  );
  const getCollectionText = await readFile(
    'postman/CryptoDeepApp.postman_collection.json',
    'utf8',
  );
  const createCollectionText = await readFile(
    'postman/CryptoDeepApp.manual.postman_collection.json',
    'utf8',
  );
  const getCollection = JSON.parse(getCollectionText);
  const createCollection = JSON.parse(createCollectionText);
  const getRequests = collectPostmanRequests(getCollection.item);
  const createRequests = collectPostmanRequests(createCollection.item);
  const apiKeyVariable = postmanEnvironment.values.find(
    ({ key }) => key === 'apiKey',
  );

  assert.match(envExample, /^CRYPTODEEP_API_KEY=\s*$/m);
  assert.equal(apiKeyVariable?.value, '');
  assert.equal(apiKeyVariable?.type, 'secret');

  assert.equal(getBearerToken(getCollection), '{{apiKey}}');
  assert.equal(getRequests.length, 5);
  assert.ok(getRequests.every(({ request }) => request.method === 'GET'));

  assert.equal(getBearerToken(createCollection), '{{apiKey}}');
  assert.equal(createRequests.length, 1);
  assert.equal(createRequests[0].request.method, 'POST');
  assert.equal(
    createRequests[0].request.url.raw,
    '{{baseUrl}}/api/v1/transaction',
  );
  assert.match(createRequests[0].request.body.raw, /"receiveAddress"/);
  assert.match(createRequests[0].request.body.raw, /"rateMode"/);
});
