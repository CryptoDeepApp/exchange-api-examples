const DEFAULT_BASE_URL = 'https://api.cryptodeep.app';
const DEFAULT_TIMEOUT_MS = 15_000;

export class CryptoDeepApiError extends Error {
  constructor(message, { status = null, body = null, code = null, cause } = {}) {
    super(message, { cause });
    this.name = 'CryptoDeepApiError';
    this.status = status;
    this.body = body;
    this.code = code;
  }
}

export function toAuthorizationHeader(apiKey) {
  if (typeof apiKey !== 'string' || apiKey.trim() === '') {
    throw new CryptoDeepApiError(
      'CRYPTODEEP_API_KEY is required. Copy .env.example to .env and add an authorized API key.',
      { code: 'MISSING_API_KEY' },
    );
  }

  const trimmed = apiKey.trim();
  const token = trimmed.replace(/^Bearer\s+/i, '').trim();
  if (!/^[A-Za-z0-9_-]+$/.test(token)) {
    throw new CryptoDeepApiError(
      'CRYPTODEEP_API_KEY must be a Bearer token containing only letters, numbers, underscores, or hyphens.',
      { code: 'INVALID_API_KEY' },
    );
  }

  return `Bearer ${token}`;
}

export function createClient({
  apiKey = process.env.CRYPTODEEP_API_KEY,
  baseUrl = process.env.CRYPTODEEP_BASE_URL || DEFAULT_BASE_URL,
  timeoutMs = process.env.CRYPTODEEP_TIMEOUT_MS || DEFAULT_TIMEOUT_MS,
  fetchImpl = globalThis.fetch,
} = {}) {
  if (typeof fetchImpl !== 'function') {
    throw new CryptoDeepApiError('A fetch implementation is required.', {
      code: 'MISSING_FETCH',
    });
  }

  const authorization = toAuthorizationHeader(apiKey);
  const normalizedBaseUrl = normalizeBaseUrl(baseUrl);
  const parsedTimeoutMs = Number(timeoutMs);
  if (!Number.isInteger(parsedTimeoutMs) || parsedTimeoutMs <= 0) {
    throw new CryptoDeepApiError(
      'CRYPTODEEP_TIMEOUT_MS must be a positive integer.',
      { code: 'INVALID_TIMEOUT' },
    );
  }

  async function request(path, { method = 'GET', query, body } = {}) {
    const url = buildUrl(normalizedBaseUrl, path, query);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), parsedTimeoutMs);

    try {
      const response = await fetchImpl(url, {
        method,
        headers: {
          Accept: 'application/json',
          Authorization: authorization,
          ...(body === undefined ? {} : { 'Content-Type': 'application/json' }),
        },
        ...(body === undefined ? {} : { body: JSON.stringify(body) }),
        signal: controller.signal,
      });

      const responseBody = await parseResponseBody(response);
      if (!response.ok) {
        throw new CryptoDeepApiError(
          `CryptoDeepApp API request failed with HTTP ${response.status}.`,
          { status: response.status, body: responseBody, code: 'HTTP_ERROR' },
        );
      }

      return responseBody;
    } catch (error) {
      if (error instanceof CryptoDeepApiError) throw error;
      if (error?.name === 'AbortError') {
        throw new CryptoDeepApiError(
          `CryptoDeepApp API request timed out after ${parsedTimeoutMs} ms.`,
          { code: 'TIMEOUT', cause: error },
        );
      }
      throw new CryptoDeepApiError('CryptoDeepApp API network request failed.', {
        code: 'NETWORK_ERROR',
        cause: error,
      });
    } finally {
      clearTimeout(timeout);
    }
  }

  return {
    get(path, query) {
      return request(path, { method: 'GET', query });
    },
    request,
  };
}

export function readString(name, fallback, { required = false } = {}) {
  const value = process.env[name]?.trim() || fallback;
  if (required && !value) {
    throw new CryptoDeepApiError(`${name} is required.`, {
      code: 'MISSING_ENVIRONMENT_VARIABLE',
    });
  }
  return value;
}

export function readInteger(name, fallback, { min = 1, max } = {}) {
  const value = Number(process.env[name] || fallback);
  if (!Number.isInteger(value) || value < min || (max !== undefined && value > max)) {
    const range = max === undefined ? `at least ${min}` : `between ${min} and ${max}`;
    throw new CryptoDeepApiError(`${name} must be an integer ${range}.`, {
      code: 'INVALID_ENVIRONMENT_VARIABLE',
    });
  }
  return value;
}

export function readNumber(name, fallback) {
  const value = Number(process.env[name] || fallback);
  if (!Number.isFinite(value) || value <= 0) {
    throw new CryptoDeepApiError(`${name} must be a positive finite number.`, {
      code: 'INVALID_ENVIRONMENT_VARIABLE',
    });
  }
  return value;
}

export function readRateMode() {
  const rateMode = readString('CRYPTODEEP_RATE_MODE', 'fixed');
  if (!['fixed', 'float'].includes(rateMode)) {
    throw new CryptoDeepApiError(
      'CRYPTODEEP_RATE_MODE must be either "fixed" or "float".',
      { code: 'INVALID_ENVIRONMENT_VARIABLE' },
    );
  }
  return rateMode;
}

export function printJson(value) {
  console.log(JSON.stringify(value, null, 2));
}

export function handleCliError(error) {
  if (error instanceof CryptoDeepApiError) {
    console.error(error.message);
    if (error.body !== null && error.body !== undefined) {
      console.error(JSON.stringify(error.body, null, 2));
    }
  } else {
    console.error('Unexpected error while running the example.');
  }
  process.exitCode = 1;
}

function normalizeBaseUrl(baseUrl) {
  let url;
  try {
    url = new URL(baseUrl);
  } catch {
    throw new CryptoDeepApiError('CRYPTODEEP_BASE_URL must be a valid URL.', {
      code: 'INVALID_BASE_URL',
    });
  }

  const isLocalhost = ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname);
  if (url.protocol !== 'https:' && !(url.protocol === 'http:' && isLocalhost)) {
    throw new CryptoDeepApiError(
      'CRYPTODEEP_BASE_URL must use HTTPS, except for local development.',
      { code: 'INSECURE_BASE_URL' },
    );
  }
  if (
    url.username ||
    url.password ||
    url.pathname !== '/' ||
    url.search ||
    url.hash
  ) {
    throw new CryptoDeepApiError(
      'CRYPTODEEP_BASE_URL must be an origin without credentials, a path, query parameters, or a fragment.',
      { code: 'INVALID_BASE_URL' },
    );
  }

  return url.href.replace(/\/$/, '');
}

function buildUrl(baseUrl, path, query = {}) {
  if (typeof path !== 'string' || !path.startsWith('/api/v1/')) {
    throw new CryptoDeepApiError('API paths must start with /api/v1/.', {
      code: 'INVALID_API_PATH',
    });
  }

  const url = new URL(path, `${baseUrl}/`);
  if (
    url.origin !== new URL(baseUrl).origin ||
    !url.pathname.startsWith('/api/v1/')
  ) {
    throw new CryptoDeepApiError(
      'API path must remain under /api/v1/ on the configured origin.',
      {
        code: 'INVALID_API_PATH',
      },
    );
  }

  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.set(key, String(value));
    }
  }
  return url;
}

async function parseResponseBody(response) {
  const text = await response.text();
  if (text === '') return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}
