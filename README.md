# CryptoDeepApp Exchange API Examples

JavaScript, cURL, and Postman examples for the CryptoDeepApp Exchange API.

- Base URL: `https://api.cryptodeep.app`
- API documentation: [cryptodeep.app/api-docs](https://cryptodeep.app/api-docs)

## About CryptoDeepApp

The CryptoDeepApp Exchange API helps cryptocurrency wallets, Web3
applications, fintech products, and partner platforms integrate exchange
functionality.

## Verified Features

The examples and local checks cover:

- Bearer-authenticated API requests
- Supported currencies and networks
- Fixed and floating exchange rates
- Calculations from either a deposit amount or a receive amount
- Transaction status and transaction history
- The documented transaction-creation request in a separate manual collection

`npm run check` validates JavaScript syntax, Postman JSON, and request behavior
with local mocked responses. It does not send requests to the production API.

## Try the CryptoDeepApp Exchange API

Want to explore the CryptoDeepApp Exchange API before building an integration?

This repository provides ready-to-use JavaScript examples, cURL commands, and
a Postman collection to help developers test API functionality and understand
how exchange integrations work.

### What Can You Test?

With an authorized API key, you can explore:

- **Supported currencies and networks** — retrieve available cryptocurrencies
  and network information.
- **Exchange quotes** — request fixed and floating exchange rates.
- **Exchange calculations** — calculate expected receive amounts or required
  deposit amounts.
- **Transaction tracking** — retrieve the status and details of transactions
  associated with your API credentials.
- **Transaction history** — retrieve and search transactions associated with
  your API credentials.

### Get Started

1. Review the [API documentation](https://cryptodeep.app/api-docs).
2. Configure your authorized API key using `.env` or a Postman environment.
3. Run the provided JavaScript examples or import the Postman collection.
4. Explore API responses and test your integration workflow.

Start with read-only requests. You can retrieve supported currencies and
exchange quotes without creating a transaction.

### Ready to Integrate?

Explore the examples, test the endpoints, and build your integration.

[View API Documentation →](https://cryptodeep.app/api-docs)

## Quick Start

### Requirements

- Node.js 20.6 or newer
- An authorized CryptoDeepApp API key

### 1. Clone the repository

```bash
git clone https://github.com/CryptoDeepApp/exchange-api-examples.git
cd exchange-api-examples
```

### 2. Configure the API key

On Linux or macOS:

```bash
cp .env.example .env
```

On Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

Set your key in `.env`:

```dotenv
CRYPTODEEP_API_KEY=YOUR_API_KEY
```

### 3. Run the recommended first request

```bash
npm run example:currencies
```

The command prints the JSON response containing supported currencies and
networks.

### 4. Try Postman

Import the main collection and environment from the `postman` directory,
select the imported environment, set `apiKey`, and send **Get currencies**.

## Available Examples

| Command | Endpoint | Source |
|---|---|---|
| `npm run example:currencies` | `GET /api/v1/currencies` | [JavaScript](examples/javascript/get-currencies.js) |
| `npm run example:rate` | `GET /api/v1/rate` with `depositAmount` | [JavaScript](examples/javascript/get-exchange-rate.js) |
| `npm run example:estimate` | `GET /api/v1/rate` with `receiveAmount` | [JavaScript](examples/javascript/get-exchange-estimate.js) |
| `npm run example:status` | `GET /api/v1/transaction` | [JavaScript](examples/javascript/get-exchange-status.js) |
| `npm run example:transactions` | `GET /api/v1/transactions` | [JavaScript](examples/javascript/get-transactions.js) |

For command-line HTTP examples, see
[examples/curl/README.md](examples/curl/README.md).

## Authentication

Every request requires an authorized API key:

```http
Authorization: Bearer YOUR_API_KEY
```

Keep the key in `.env` for JavaScript examples or in the `apiKey` Postman
environment variable. Do not commit local credentials.

See [Authentication](docs/authentication.md) for details.

## Postman Collection

For read-only requests, import:

- [Main collection](postman/CryptoDeepApp.postman_collection.json)
- [Environment](postman/CryptoDeepApp.postman_environment.json)

The main collection contains only GET requests.

Transaction creation is available separately in the
[manual collection](postman/CryptoDeepApp.manual.postman_collection.json).
This request creates a real exchange transaction. Complete the request
variables, then set
`confirmTransactionCreation` to `CREATE_REAL_TRANSACTION` immediately before
sending it. The confirmation resets to `false` after one attempt.

## Exchange Statuses

| Status | Meaning |
|---|---|
| `created` | Waiting for a deposit |
| `confirmation` | Waiting for network confirmations |
| `exchanging` | Exchange in progress |
| `sending` | Exchange result is being sent |
| `success` | Exchange completed |
| `overdue` | Waiting period expired |
| `error` | Exchange error |
| `pause` | Processing paused |
| `frozen` | Transaction frozen |
| `refunded` | Funds refunded |

## Documentation

- [Official API documentation](https://cryptodeep.app/api-docs)
- [Getting started](docs/getting-started.md)
- [Authentication](docs/authentication.md)
- [Endpoints](docs/endpoints.md)
- [Errors](docs/error-handling.md)

## Security

- No API credentials are distributed with this repository.
- `.env` files are ignored by Git.
- JavaScript examples, the main Postman collection, and local tests are
  read-only.
- The separate transaction-creation collection requires an explicit one-time
  confirmation.

Use only credentials authorized for your integration and never commit them to
the repository.

## Support

For API behavior and request formats, use the
[API documentation](https://cryptodeep.app/api-docs). For problems with these
examples, open a [GitHub issue](https://github.com/CryptoDeepApp/exchange-api-examples/issues).

## Disclaimer

These examples are provided for integration and testing. Review all addresses,
assets, networks, and amounts before manually creating a transaction.

## License

The example code and repository materials are distributed under the
[MIT License](LICENSE).
