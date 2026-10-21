# Authentication

The CryptoDeepApp Exchange API uses a static Bearer credential for every
request. The production API origin is:

```text
https://api.cryptodeep.app
```

Send the credential in the standard `Authorization` header:

```http
Authorization: Bearer YOUR_API_KEY
```

Do not add a second `Bearer` prefix. In the current key-management model, the
stored public value may already be presented as `Bearer <token>`. The JavaScript
client in this repository accepts either the token alone or the complete Bearer
value and normalizes it before sending a request.

## Configure the examples

Copy `.env.example` to `.env`, then set your own authorized credential:

```dotenv
CRYPTODEEP_BASE_URL=https://api.cryptodeep.app
CRYPTODEEP_API_KEY=YOUR_API_KEY
```

The `.env` file is ignored by Git. Never put a real credential in
`.env.example`, source code, documentation, Postman collections, screenshots,
or issue reports.

## What the server validates

The verified backend performs these checks for every `/api/v1` route:

1. The `Authorization` header must contain a Bearer token.
2. The token may contain letters, numbers, underscores, and hyphens.
3. The normalized Bearer value must match an API-key record.
4. That record must refer to an existing partner account.
5. The partner account must not be disabled.

The legacy `X-API-Public-Key`, `X-API-Payload`, and `X-API-Signature` headers
are not accepted.

Missing, malformed, or unknown credentials return HTTP `401`. A missing or
disabled partner account returns HTTP `403`.

## Authorization boundaries

Authentication does not currently provide endpoint-level scopes. A valid key
for an active partner can access all verified Exchange API routes, including
the state-changing `POST /api/v1/transaction` route.

Transaction reads are owner-scoped:

- `GET /api/v1/transaction` only returns a transaction linked to the current
  key's partner account.
- `GET /api/v1/transactions` only lists transactions linked to that partner.
- A missing transaction and a transaction owned by another partner both return
  HTTP `404`.

This owner filter protects one partner's records from another partner, but it
does not make a credential read-only. See [Demo API key](demo-api-key.md) before
considering any credential for public use.

## Rate limits

The current limiter is keyed by API-key record, not by client IP address. The
default limits in the verified source are:

| Window | Default limit |
|---|---:|
| One second | 10 requests |
| One minute | 100 requests |
| One hour | 10,000 requests |
| One day | 500,000 requests |

Limits can be overridden per key. Exceeding any configured window returns HTTP
`429`.

## Credential hygiene

- Use a different credential for each application or environment when the key
  management system permits it.
- Keep credentials in a secret manager or environment variable.
- Send credentials only over HTTPS outside local development.
- Do not print the `Authorization` header or the value of
  `CRYPTODEEP_API_KEY`.
- Revoke or rotate a credential immediately if it appears in a commit, log,
  screenshot, or public message.

