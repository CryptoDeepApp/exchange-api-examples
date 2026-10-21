# Getting started

These examples use Node.js native `fetch` and ES modules. They do not depend on
the private CryptoDeepApp backend source.

They are Node.js programs, not browser scripts. A browser integration also
depends on whether its origin is included in the API's CORS allow-list.

## Requirements

- Node.js 20.6 or newer
- An authorized CryptoDeepApp Exchange API key
- Network access to `https://api.cryptodeep.app`

The examples use Node's `--env-file` option, which is why Node.js 20.6 or newer
is required.

## Install the repository

After the repository is published, clone it and enter its directory:

```bash
git clone https://github.com/CryptoDeepApp/exchange-api-examples.git
cd exchange-api-examples
```

There are no runtime package dependencies. You can still run `npm install` to
verify the lockfile and prepare the standard npm workflow. Confirm your Node.js
version separately with `node --version`:

```bash
npm install
```

## Configure your environment

On macOS or Linux:

```bash
cp .env.example .env
```

On PowerShell:

```powershell
Copy-Item .env.example .env
```

Open `.env` and set your own credential:

```dotenv
CRYPTODEEP_BASE_URL=https://api.cryptodeep.app
CRYPTODEEP_API_KEY=YOUR_API_KEY
```

The example client accepts the token with or without the `Bearer` prefix and
sends exactly one normalized prefix. Never commit `.env`.

## Run a read-only example

Start with the currencies request:

```bash
npm run example:currencies
```

It calls:

```http
GET /api/v1/currencies
```

The default query comes from `.env.example`. Change `CRYPTODEEP_PAGE`,
`CRYPTODEEP_LIMIT`, or `CRYPTODEEP_SEARCH` in `.env` to explore other pages.

## Request a quote

Quote a known deposit amount:

```bash
npm run example:rate
```

This sends `CRYPTODEEP_DEPOSIT_AMOUNT` to `GET /api/v1/rate`.

Estimate the required deposit for a desired receive amount:

```bash
npm run example:estimate
```

This uses the same verified `/rate` endpoint but sends
`CRYPTODEEP_RECEIVE_AMOUNT` instead. The API requires exactly one of
`depositAmount` and `receiveAmount` in a single request.

## Read transaction information

The transaction examples only work for records belonging to the partner linked
to your API key.

Set an existing transaction ID before checking its current status:

```dotenv
CRYPTODEEP_TRANSACTION_ID=YOUR_TRANSACTION_ID
```

```bash
npm run example:status
```

List the current partner's transactions:

```bash
npm run example:transactions
```

Optionally set `CRYPTODEEP_TRANSACTION_SEARCH` to a partial transaction ID.
These responses contain partner-specific transaction details and should not be
treated as public demo data.

## Safety boundary

This repository intentionally does not provide an automated transaction-
creation example. `POST /api/v1/transaction` creates a real provider exchange
and is state-changing. Do not call it while exploring the API or running an
automated collection unless you deliberately intend to create an exchange.

## Validate the repository

Run all local syntax, JSON, and mocked tests:

```bash
npm run check
```

The automated tests do not contact the production API and do not create an
exchange.

## Common setup errors

- `CRYPTODEEP_API_KEY is required`: add your authorized credential to `.env`.
- HTTP `401`: check that the key is valid and that it has only one Bearer
  prefix.
- HTTP `403`: the key's partner account is missing or disabled.
- HTTP `429`: wait for the applicable API-key rate-limit window to reset.
- A timeout or network error: confirm the base URL, HTTPS access, and local
  network policy before retrying.

