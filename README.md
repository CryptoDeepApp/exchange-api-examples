# CryptoDeepApp Exchange API Examples

JavaScript, cURL, and Postman examples for the CryptoDeepApp Exchange API.

- Base URL: `https://api.cryptodeep.app`
- API documentation: [cryptodeep.app/api-docs](https://cryptodeep.app/api-docs)

## Requirements

- Node.js 20.6 or newer
- CryptoDeepApp API key

## Quick start

```bash
git clone https://github.com/CryptoDeepApp/exchange-api-examples.git
cd exchange-api-examples
cp .env.example .env
```

On Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

Set `CRYPTODEEP_API_KEY` in `.env`, then run:

```bash
npm run example:currencies
```

## Examples

| Command | Endpoint |
|---|---|
| `npm run example:currencies` | `GET /api/v1/currencies` |
| `npm run example:rate` | `GET /api/v1/rate` with `depositAmount` |
| `npm run example:estimate` | `GET /api/v1/rate` with `receiveAmount` |
| `npm run example:status` | `GET /api/v1/transaction` |
| `npm run example:transactions` | `GET /api/v1/transactions` |

## Authentication

Every request uses:

```http
Authorization: Bearer YOUR_API_KEY
```

## API routes

| Method | Path | Description |
|---|---|---|
| `POST` | `/api/v1/transaction` | Create a transaction |
| `GET` | `/api/v1/transaction` | Get a transaction by `uniqueId` |
| `GET` | `/api/v1/transactions` | Get transactions |
| `GET` | `/api/v1/rate` | Get an exchange rate |
| `GET` | `/api/v1/currencies` | Get currencies and networks |

## Postman

Import:

- `postman/CryptoDeepApp.postman_collection.json`
- `postman/CryptoDeepApp.postman_environment.json`

Set the `apiKey` environment variable before sending requests. The separate
`postman/CryptoDeepApp.manual.postman_collection.json` file contains the
documented `POST /api/v1/transaction` request.

## cURL

See [examples/curl/README.md](examples/curl/README.md).

## Local validation

```bash
npm run check
```

## Reference

- [Getting started](docs/getting-started.md)
- [Authentication](docs/authentication.md)
- [Endpoints](docs/endpoints.md)
- [Errors](docs/error-handling.md)
