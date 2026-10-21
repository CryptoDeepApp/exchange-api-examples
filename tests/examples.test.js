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

test('normalizes bare and prefixed API keys', () => {
  assert.equal(toAuthorizationHeader('demo_token-1'), 'Bearer demo_token-1');
  assert.equal(
    toAuthorizationHeader('bearer   demo_token-1'),
    'Bearer demo_token-1',
  );
});

test('requires positive amounts in runnable rate examples', () => {
  assert.equal(readNumber('CRYPTODEEP_TEST_UNSET_AMOUNT', 0.01), 0.01);
  assert.throws(() => readNumber('CRYPTODEEP_TEST_UNSET_AMOUNT', 0), {
    code: 'INVALID_ENVIRONMENT_VARIABLE',
  });
  assert.throws(() => readNumber('CRYPTODEEP_TEST_UNSET_AMOUNT', -1), {
    code: 'INVALID_ENVIRONMENT_VARIABLE',
  });
});

test('rejects missing or malformed API keys without printing them', () => {
  assert.throws(() => toAuthorizationHeader(''), {
    name: 'CryptoDeepApiError',
    code: 'MISSING_API_KEY',
  });
  assert.throws(() => toAuthorizationHeader('Bearer token with spaces'), {
    name: 'CryptoDeepApiError',
    code: 'INVALID_API_KEY',
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

test('supports both verified /rate amount directions', async () => {
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

test('preserves a non-JSON error body for diagnostics', async () => {
  const client = createClient({
    apiKey: 'test_token',
    fetchImpl: async () => new Response('upstream unavailable', { status: 502 }),
  });

  await assert.rejects(
    client.get('/api/v1/rate'),
    (error) => error.status === 502 && error.body === 'upstream unavailable',
  );
});

test('wraps network failures without including the API key in the message', async () => {
  const apiKey = 'never_echo_this_token';
  const client = createClient({
    apiKey,
    fetchImpl: async () => {
      throw new Error('socket closed');
    },
  });

  await assert.rejects(client.get('/api/v1/currencies'), (error) => {
    assert.equal(error.code, 'NETWORK_ERROR');
    assert.equal(error.message.includes(apiKey), false);
    return true;
  });
});

test('refuses insecure remote base URLs and paths outside /api/v1', async () => {
  assert.throws(
    () => createClient({ apiKey: 'test_token', baseUrl: 'http://example.com' }),
    { code: 'INSECURE_BASE_URL' },
  );
  assert.throws(
    () =>
      createClient({
        apiKey: 'test_token',
        baseUrl: 'https://api.cryptodeep.app/api',
      }),
    { code: 'INVALID_BASE_URL' },
  );

  const client = createClient({
    apiKey: 'test_token',
    fetchImpl: async () => new Response('{}'),
  });
  await assert.rejects(client.get('https://example.com/steal'), {
    code: 'INVALID_API_PATH',
  });
  await assert.rejects(client.get('/api/v1/../health'), {
    code: 'INVALID_API_PATH',
  });
  await assert.rejects(client.get('/api/v1/%2e%2e/health'), {
    code: 'INVALID_API_PATH',
  });
});

test('published configuration separates read-only and one-time manual Postman requests', async () => {
  const envExample = await readFile('.env.example', 'utf8');
  const postmanEnvironment = JSON.parse(
    await readFile('postman/CryptoDeepApp.postman_environment.json', 'utf8'),
  );
  const readOnlyCollectionText = await readFile(
    'postman/CryptoDeepApp.postman_collection.json',
    'utf8',
  );
  const manualCollectionText = await readFile(
    'postman/CryptoDeepApp.manual.postman_collection.json',
    'utf8',
  );
  const readOnlyCollection = JSON.parse(readOnlyCollectionText);
  const manualCollection = JSON.parse(manualCollectionText);
  const readOnlyRequests = collectPostmanRequests(readOnlyCollection.item);
  const manualRequests = collectPostmanRequests(manualCollection.item);
  const apiKeyVariable = postmanEnvironment.values.find(
    ({ key }) => key === 'apiKey',
  );
  const stateChangingFlag = postmanEnvironment.values.find(
    ({ key }) => key === 'allowStateChangingRequests',
  );

  assert.match(envExample, /^CRYPTODEEP_API_KEY=\s*$/m);
  assert.doesNotMatch(envExample, /Bearer\s+[A-Za-z0-9_-]{40,}/);
  assert.equal(apiKeyVariable?.value, '');
  assert.equal(apiKeyVariable?.type, 'secret');
  assert.equal(stateChangingFlag?.value, '');

  assert.equal(readOnlyRequests.length, 5);
  assert.ok(readOnlyRequests.every(({ request }) => request.method === 'GET'));
  assert.doesNotMatch(readOnlyCollectionText, /"method"\s*:\s*"POST"/);
  assert.doesNotMatch(
    readOnlyCollectionText,
    /I_UNDERSTAND_THIS_CREATES_A_REAL_EXCHANGE/,
  );

  assert.equal(manualRequests.length, 1);
  assert.equal(manualRequests[0].request.method, 'POST');
  assert.equal(
    manualRequests[0].request.url.raw,
    '{{baseUrl}}/api/v1/transaction',
  );
  assert.match(manualCollectionText, /pm\.execution\.skipRequest\(\)/);
  assert.match(
    manualCollectionText,
    /pm\.environment\.unset\('allowStateChangingRequests'\)/,
  );
  assert.match(
    manualCollectionText,
    /I_UNDERSTAND_THIS_CREATES_A_REAL_EXCHANGE/,
  );
  assert.match(manualCollectionText, /receiveAddress/);
  assert.ok(
    manualCollectionText.indexOf(
      "pm.environment.unset('allowStateChangingRequests')",
    ) < manualCollectionText.indexOf('if (suppliedConfirmation'),
  );

  assert.doesNotMatch(
    `${readOnlyCollectionText}\n${manualCollectionText}`,
    /Bearer\s+[A-Za-z0-9_-]{40,}/,
  );
});
