# Demo API key assessment

## Current conclusion

The verified backend does **not** support a safely restricted public demo key.
Do not publish a current partner API key in this repository, its documentation,
a Postman environment, or an example command.

The reason is structural: the current API-key record has no endpoint scopes or
read-only permission flag. Once a key and its linked partner pass
authentication, that key can call every route in the Exchange API controller,
including the state-changing `POST /api/v1/transaction` route.

The key can also read transactions linked to its partner account. Those
responses can contain deposit and receive addresses, blockchain transaction
hashes, explorer links, amounts, and partner profit. They are not suitable as
generic public demo data.

## Current controls and their limits

The existing implementation provides:

- exact Bearer-key lookup;
- linked-partner validation and partner disable flags;
- partner ownership filters on transaction reads;
- per-key request limits;
- effective denial when a key record is removed or its partner is disabled.

It does not provide:

- read-only or route-specific key scopes;
- a dedicated demo-key type;
- per-IP limiting for a shared public credential;
- sandbox or testnet isolation;
- an API-key expiration or revocation-state field in this service;
- a public key-management endpoint in this repository.

The current default limits—10 per second, 100 per minute, 10,000 per hour, and
500,000 per day—are keyed by API-key record. They do not enforce the proposed
public-demo limits independently for each client IP.

## Recommended design

A separate sandbox is the preferred design. It should use test data or a mock
provider, never create a funded exchange, and return synthetic transaction
records that contain no customer information.

If a production-backed demo credential is still required, backend authorization
must be changed before issuing it. At minimum:

1. Add explicit scopes to API-key records.
2. Enforce scopes at each route before invoking a service or provider.
3. Allow only `GET /api/v1/currencies` and `GET /api/v1/rate` for the demo
   scope.
4. Deny `POST /api/v1/transaction` unconditionally.
5. Deny both transaction-read routes because they expose partner-owned data.
6. Apply limits by both demo credential and source IP.
7. Add expiration, immediate revocation, rotation, and audit events.
8. Monitor abuse without logging the raw credential or sensitive response
   content.

Suggested initial limits from the project requirements are 10 requests per
minute per IP and 100 requests per day per IP. These are recommendations, not
the behavior of the current backend, and should be validated against expected
traffic before deployment.

## Proposed scope matrix

The following is a recommendation, not an existing permission model:

| Route | Public demo decision | Reason |
|---|---|---|
| `GET /api/v1/currencies` | Allow | Read-only reference data |
| `GET /api/v1/rate` | Allow | Read-only quote; still requires abuse limits |
| `GET /api/v1/transaction` | Deny | Partner-owned transaction details |
| `GET /api/v1/transactions` | Deny | Partner history and private data |
| `POST /api/v1/transaction` | Deny | Creates a real provider exchange |

## Until a secure demo exists

Developers must use their own authorized credential through
`CRYPTODEEP_API_KEY`. The repository must keep that variable empty in
`.env.example` and must not contain a fallback key.

Automated tests should mock API responses. Live verification, when explicitly
authorized, should be limited to read-only routes and should never include the
transaction-creation route.

