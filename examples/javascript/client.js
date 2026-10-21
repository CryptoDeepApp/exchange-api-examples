const DEFAULT_BASE_URL = 'https://api.cryptodeep.app';

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
    throw new CryptoDeepApiError('CRYPTODEEP_API_KEY is required.', {
      code: 'MISSING_API_KEY',
    });
  }

  return `Bearer ${apiKey.trim()}`;
}

export function createClient({
  apiKey = process.env.CRYPTODEEP_API_KEY,
  baseUrl = process.env.CRYPTODEEP_BASE_URL || DEFAULT_BASE_URL,
  fetchImpl = globalThis.fetch,
} = {}) {
  if (typeof fetchImpl !== 'function') {
    throw new CryptoDeepApiError('A fetch function is required.', {
      code: 'MISSING_FETCH',
    });
  }

  let apiBaseUrl;
  try {
    apiBaseUrl = new URL(baseUrl);
  } catch {
    throw new CryptoDeepApiError('CRYPTODEEP_BASE_URL must be a valid URL.', {
      code: 'INVALID_BASE_URL',
    });
  }

  const authorization = toAuthorizationHeader(apiKey);

  async function get(path, query = {}) {
    const url = new URL(path, apiBaseUrl);
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined && value !== null && value !== '') {
        url.searchParams.set(key, String(value));
      }
    }

    try {
      const response = await fetchImpl(url, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          Authorization: authorization,
        },
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
      throw new CryptoDeepApiError('CryptoDeepApp API network request failed.', {
        code: 'NETWORK_ERROR',
        cause: error,
      });
    }
  }

  return { get };
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
  if (!Number.isFinite(value) || value < 0) {
    throw new CryptoDeepApiError(`${name} must be a non-negative number.`, {
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

async function parseResponseBody(response) {
  const text = await response.text();
  if (text === '') return null;

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}
