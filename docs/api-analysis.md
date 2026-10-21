# Verified API analysis

Analysis date: 2026-10-21

This document records the Exchange API behavior verified from the available
backend implementation and its local documentation. No real exchange was
created during the analysis, and no supplied credential is included in this
repository.

## Sources and verification boundary

The implementation inspected was the existing reference NestJS backend,
including its controller, middleware, DTOs, services, schemas, tests, and local
API documentation.

The intended production base URL is:

```text
https://api.cryptodeep.app
```

The advertised public documentation URL,
`https://cryptodeep.app/api-docs`, returned HTTP `404` to automated HTTP
validation on 2026-10-21, although client-rendered content may still appear in
a browser. The backend source therefore remained the primary source of truth
for this repository. No production state-changing request was made.

## Framework and architecture

- NestJS 11 and TypeScript 5.7
- MongoDB through Mongoose
- Redis-backed throttling through `rate-limiter-flexible`
- Axios/RxJS integration with the exchange provider
- Global class-validator/class-transformer request validation
- Jest and Supertest tests

The application installs a global validation pipe with transformation,
whitelisting, and rejection of non-whitelisted properties. The Exchange API is
implemented by one controller with the `/api/v1` prefix. Authentication and
rate-limiting middleware are attached to the entire controller.

## Verified endpoint inventory

| Method | Route | Classification |
|---|---|---|
| `POST` | `/api/v1/transaction` | Creates a real exchange; state-changing |
| `GET` | `/api/v1/transaction` | Reads one partner-owned transaction |
| `GET` | `/api/v1/transactions` | Lists partner-owned transactions |
| `GET` | `/api/v1/rate` | Read-only exchange quote/estimate |
| `GET` | `/api/v1/currencies` | Read-only currency/network catalogue |

No separate estimate, withdrawal, payout, balance, or administrative endpoint
exists in the inspected Exchange API controller.

## Authentication and key lifecycle

Every route requires a static Bearer value in `Authorization`. The server
normalizes the scheme and performs an exact lookup against the API-key record's
`public` value. It then loads the linked partner and rejects missing or disabled
partners.

The inspected API-key schema contains metadata, a linked user, request limits,
and provider/platform selection. It contains no endpoint scopes, read-only
flag, explicit active flag, expiry, or revocation timestamp.

Key generation, rotation, and revocation workflows are not present in this
repository. Removing a key record makes lookup fail, and disabling its linked
partner causes HTTP `403`, but the management system responsible for those
operations could not be verified here.

## Current permissions

There is one effective permission tier: a valid key for an active partner can
reach every route in the controller. Consequently, an ordinary key is not safe
to publish as a read-only demo credential.

Transaction reads are additionally filtered by the linked partner ID. This
prevents one partner from reading another partner's transaction, but the
response is still private data and should not be exposed through a shared demo
account.

## Rate limiting

Each request consumes limits for four windows. Defaults are:

| Window | Requests |
|---|---:|
| Second | 10 |
| Minute | 100 |
| Hour | 10,000 |
| Day | 500,000 |

Limits may be customized on each API-key record. The limiter identity is the
key record ID, so limits are shared by all clients using that key rather than
separated by IP address.

## Request and response findings

- Create and rate requests require exactly one of `depositAmount` and
  `receiveAmount`.
- `rateMode` accepts only `fixed` and `float`.
- Create rejects an identical coin-and-network combination on both sides.
- Rate networks are optional in the DTO but recommended to select an
  unambiguous pair.
- The rate response is intentionally reduced to coin symbols, calculated
  amounts, rate, and optional `withdrawMax`.
- Transaction responses are flat public DTOs rather than the backend's nested
  database objects.
- Create returns no `profit`; transaction GET responses return
  `profit` as a number or `null`.
- Single and list transaction reads include only records linked to the current
  partner.
- Currency results include active coins and active networks, with pagination.

The create DTO still recognizes the legacy properties `sourse`, `refCode`,
`partner`, and `alt`, while the rate DTO recognizes `refCode`, `partnerId`, and
`alt`. The current services do not use these values. They are intentionally
excluded from public examples.

The create DTO rejects negative amounts but permits zero at this validation
layer; the provider can enforce a higher minimum. The rate DTO validates an
amount as numeric but does not declare a local minimum. Examples should always
use sensible positive amounts and handle provider minimum/maximum errors.

## Transaction statuses

The verified enum permits:

```text
created
confirmation
exchanging
sending
success
overdue
error
pause
frozen
refunded
```

This API creates a transaction with `created`. The process that later updates
statuses is outside the inspected repository, so exact transitions, including
late-deposit behavior after `overdue`, were not verified.

## Error behavior

Verified and documented status categories include:

- `400` for DTO and business validation
- `401` for a missing, malformed, or unknown key
- `403` for a missing or disabled linked partner
- `404` for an absent or foreign transaction
- `422` for an unavailable exchange pair
- `429` for an exceeded API-key limit
- `500` for provider configuration or unexpected internal failures

Minimum and maximum rate errors use a provider-derived object with `status`
rather than the usual NestJS `statusCode` property. Consumers should branch on
the HTTP status first and retain the response body for details.

## Swagger, OpenAPI, and sandbox status

No Swagger dependency, `SwaggerModule` setup, OpenAPI JSON/YAML document, or
generated API specification exists in the inspected project. The live public
documentation URL was unavailable as noted above.

No sandbox or testnet base URL is configured in the source. The existing test
suite uses mocks and controller-level test applications; it does not constitute
a remotely accessible sandbox and does not verify the production deployment.

## Notable environment discrepancies

- Local documentation uses `http://localhost:3000`; this examples repository
  uses the provided production origin `https://api.cryptodeep.app`.
- The backend configuration defaults to port `3000`, while its `.env_example`
  specifies port `4443`.
- Local tests verify route mapping and response contracts with mocked services,
  not live provider behavior.

These differences do not change the public route paths documented here, but
they are reasons to avoid claiming a successful production integration until
authorized read-only requests are verified.

## Security conclusion

The repository can safely demonstrate authenticated requests using a developer's
own `CRYPTODEEP_API_KEY`. It cannot safely ship the offered shared key under the
current backend authorization model. A public demo should use a separate
sandbox or new route-level read scopes, per-IP controls, revocation, monitoring,
and an explicit denial of transaction creation and transaction-history access.

