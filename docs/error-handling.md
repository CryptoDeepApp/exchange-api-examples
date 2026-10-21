# Errors

## HTTP status codes

| Code | Meaning |
|---:|---|
| `200` | GET request completed successfully |
| `201` | Transaction created successfully |
| `400` | Parameter or business validation error |
| `401` | API key is missing or invalid |
| `403` | Partner was not found or is disabled |
| `404` | Transaction was not found or belongs to another user |
| `422` | Exchange pair is unavailable |
| `429` | API key request limit exceeded |
| `500` | Unexpected internal error |

## Validation error

```json
{
  "message": [
    "rateMode must be one of the following values: fixed, float"
  ],
  "error": "Bad Request",
  "statusCode": 400
}
```

## Authentication error

```json
{
  "message": "Invalid API key",
  "statusCode": 401
}
```

## Missing transaction

```json
{
  "message": "Transaction not found",
  "error": "Not Found",
  "statusCode": 404
}
```

## Minimum or maximum amount error

```json
{
  "message": "Min swap",
  "minOrMaxAmount": 0.01,
  "receiveAmount": 0,
  "status": 400
}
```

## Rate limit error

```json
{
  "message": "You have exceeded your request limit. Please try again later.",
  "statusCode": 429
}
```
