# Error handling

Treat every non-2xx response as a failed API operation. Preserve the HTTP
status and response body for application-level handling, but do not log the API
key or full `Authorization` header.

The example client throws `CryptoDeepApiError` for HTTP failures, timeouts,
network failures, and local configuration errors. For an HTTP failure, the
error exposes the status as `error.status` and the parsed response as
`error.body`.

## HTTP status codes

| Status | Meaning in the verified Exchange API |
|---:|---|
| `200` | A GET request completed successfully |
| `201` | A transaction was created successfully |
| `400` | Request validation or business validation failed |
| `401` | The API key is missing, malformed, or unknown |
| `403` | The linked partner is missing or disabled |
| `404` | A transaction is absent or belongs to another partner |
| `422` | The requested exchange pair is unavailable |
| `429` | An API-key rate limit was exceeded |
| `500` | Provider configuration or another internal operation failed |

The state-changing create route can also propagate an exchange-provider error
status. Do not assume that every provider rejection has an identical response
body.

## Validation errors

The server rejects unknown body and query properties. Class-validator failures
normally use the NestJS validation shape:

```json
{
  "message": [
    "rateMode must be one of the following values: fixed, float"
  ],
  "error": "Bad Request",
  "statusCode": 400
}
```

Business validation also returns HTTP `400`, for example when:

- neither amount is supplied;
- both `depositAmount` and `receiveAmount` are supplied;
- a transaction uses the same coin and network on both sides;
- the selected provider is temporarily disabled.

## Authentication and authorization errors

An invalid credential is documented as:

```json
{
  "message": "Invalid API key",
  "statusCode": 401
}
```

HTTP `403` distinguishes a missing or disabled partner from an invalid key. Do
not repeatedly retry either response without correcting the credential or
account state.

## Transaction lookup errors

The same HTTP `404` response is used when a transaction does not exist and when
it belongs to another partner:

```json
{
  "message": "Transaction not found",
  "error": "Not Found",
  "statusCode": 404
}
```

This intentionally avoids revealing another partner's transaction ownership.

## Rate quote errors

Minimum and maximum amount failures from `/api/v1/rate` use a specialized body:

```json
{
  "message": "Min swap",
  "minOrMaxAmount": 0.01,
  "receiveAmount": 0,
  "status": 400
}
```

`message` can be `Min swap` or `Max swap`. Use `minOrMaxAmount` to correct the
request. Notice that this verified body uses `status`, not `statusCode`.

An unavailable pair returns HTTP `422`. The rate service reports the message
`Exchange pair is unavailable` and a zero receive amount.

## Rate-limit errors

The current backend applies limits per API key across one-second, one-minute,
one-hour, and one-day windows. Exceeding any window returns:

```json
{
  "message": "You have exceeded your request limit. Please try again later.",
  "statusCode": 429
}
```

Use bounded exponential backoff for retryable reads. A retry must still respect
the longer windows; immediately repeating a request can extend pressure without
making progress. Never retry `POST /api/v1/transaction` automatically because
an uncertain network result could lead to an unintended duplicate exchange.

## Network and timeout failures

When no HTTP response is available, distinguish:

- a local timeout;
- DNS, TLS, or connectivity failure;
- an HTTP response with a non-JSON body.

For an uncertain state-changing request, do not resubmit automatically. First
determine whether a transaction was created through an authoritative,
partner-owned lookup or support channel.

