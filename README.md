# CryptoDeepApp Exchange API Examples

Official integration examples for the CryptoDeepApp Exchange API. This repository contains dependency-free Node.js examples, cURL commands, a Postman collection, and focused API documentation.

The examples use the production API origin `https://api.cryptodeep.app`. Read the security notes before sending requests. No automated test or default collection run creates an exchange transaction; the optional manual Postman collection is explicitly state-changing and disabled by default.

## About CryptoDeepApp

[CryptoDeepApp](https://cryptodeep.app) provides instant cryptocurrency exchanges, Solana token analysis, portfolio tracking, and API integrations. This repository covers only the verified Exchange API routes.

## Verified features

- List supported currencies and networks.
- Request fixed or floating exchange quotes from a deposit amount.
- Calculate the required deposit for a desired receive amount.
- Read a transaction created by the authenticated partner.
- List and search the authenticated partner's transactions.
- Create an exchange transaction through a deliberately guarded, manual Postman request.

All routes require authentication. There is no separate estimate endpoint: both quote directions use `GET /api/v1/rate`.

## Quick start

Requirements: Node.js 20.6 or newer and an authorized CryptoDeepApp API key. The JavaScript examples are Node.js programs, not browser scripts; browser integrations also depend on the API's configured CORS allow-list.

```bash
git clone https://github.com/CryptoDeepApp/exchange-api-examples.git
cd exchange-api-examples
cp .env.example .env
```

On Windows PowerShell, use `Copy-Item .env.example .env` instead of `cp`.

Open `.env`, set `CRYPTODEEP_API_KEY`, and run the first read-only example:

```bash
npm run example:currencies
```

The JavaScript client accepts a bare token or the complete `Bearer <token>` value and normalizes it safely. The `.env` file is ignored by Git.

No runtime packages are required. Run the local validation suite with:

```bash
npm run check
```

## Available examples

| Command | Request | Notes |
|---|---|---|
| `npm run example:currencies` | `GET /api/v1/currencies` | Read-only; supports pagination and search. |
| `npm run example:rate` | `GET /api/v1/rate` | Uses `depositAmount`. |
| `npm run example:estimate` | `GET /api/v1/rate` | Uses `receiveAmount`. |
| `npm run example:status` | `GET /api/v1/transaction` | Requires `CRYPTODEEP_TRANSACTION_ID`; returns partner-owned transaction details. |
| `npm run example:transactions` | `GET /api/v1/transactions` | Returns private transaction history for the authenticated partner. |

See [the cURL examples](examples/curl/README.md) for shell-based requests.

## Authentication

Every request uses a static bearer value in the standard header:

```http
Authorization: Bearer YOUR_API_KEY
```

Do not add a second `Bearer` prefix if the key-management system supplied the complete header value. The examples do not use legacy `X-API-Public-Key`, `X-API-Payload`, or `X-API-Signature` headers.

The current backend has no per-key scopes. A valid key can reach the state-changing transaction route as well as read routes, so an ordinary key must not be published as a read-only demo credential. Details are in [Authentication](docs/authentication.md) and [Demo API key design](docs/demo-api-key.md).

## Postman collection

For normal API exploration, import these two files:

- `postman/CryptoDeepApp.postman_collection.json`
- `postman/CryptoDeepApp.postman_environment.json`

Select the imported environment and set `apiKey` to the complete `Bearer <token>` value. The environment contains no credential by default. Keep populated values inside Postman; never export them over the tracked example environment. Local environment exports matching the patterns in `.gitignore` are excluded from Git.

The main collection is strictly read-only: it contains five `GET` examples and no `POST` request.

The separate `postman/CryptoDeepApp.manual.postman_collection.json` file contains only the state-changing transaction-creation request. Do not import or run it as part of normal exploration, the Postman Collection Runner, Newman, CI, monitors, schedules, or other automation. If a real exchange must be created intentionally, import that collection separately, provide a valid `receiveAddress`, and set `allowStateChangingRequests` to the exact phrase documented on the request. Its guard immediately unsets the opt-in value before sending, so every deliberate manual request requires a fresh confirmation.

## Exchange statuses

The API currently defines these values:

| Status | Meaning |
|---|---|
| `created` | The exchange was created and is waiting for a deposit. |
| `confirmation` | The deposit is waiting for network confirmations. |
| `exchanging` | The exchange is in progress. |
| `sending` | The exchanged asset is being sent. |
| `success` | The exchange completed successfully. |
| `overdue` | The expected transaction window elapsed. |
| `error` | Processing encountered an error. |
| `pause` | Processing is paused. |
| `frozen` | The transaction is frozen. |
| `refunded` | Funds were refunded. |

The verified API service initializes transactions as `created`, but the status-transition implementation is outside the reviewed repository. Treat these as possible values, not as a guaranteed linear state machine. Late-deposit behavior was not verified.

## Documentation

- [Getting started](docs/getting-started.md)
- [Authentication](docs/authentication.md)
- [Endpoint reference](docs/endpoints.md)
- [Error handling](docs/error-handling.md)
- [Demo API key design](docs/demo-api-key.md)
- [Implementation analysis](docs/api-analysis.md)
- [Public API documentation](https://cryptodeep.app/api-docs)

During automated HTTP validation on October 21, 2026, the public documentation URL returned HTTP 404 even though a browser may still load client-rendered content. Confirm the route's HTTP behavior before publishing this repository; the examples themselves were checked against the backend implementation and safe live `GET` responses.

## Security

- Keep API keys in environment variables or a secret manager.
- Never commit `.env` or a populated Postman environment.
- Do not place credentials in URLs, logs, screenshots, or issue reports.
- Use HTTPS outside local development.
- Rotate or revoke a key immediately if it is exposed.
- Remember that transaction status and list responses can contain wallet addresses, transaction hashes, and partner-specific data.

No production credential is included in this repository. Automated tests use mock responses and never call the live API.

## Support

- Website: [cryptodeep.app](https://cryptodeep.app)
- GitHub: [github.com/CryptoDeepApp](https://github.com/CryptoDeepApp)
- API documentation: [cryptodeep.app/api-docs](https://cryptodeep.app/api-docs)

## Disclaimer

These examples are provided for educational and integration purposes. Cryptocurrency exchanges and blockchain transactions can involve financial, operational, and market risk. Review addresses, networks, amounts, rate modes, and provider responses before creating a transaction.

## License status

No license file is included yet. The repository owner should approve an open-source license before publication; MIT is a practical choice for example code.
