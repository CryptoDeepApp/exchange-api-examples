# Authentication

Base URL:

```text
https://api.cryptodeep.app
```

Every request requires an API key in the `Authorization` header:

```http
Authorization: Bearer YOUR_API_KEY
```

For the JavaScript examples, set the key in `.env`:

```dotenv
CRYPTODEEP_API_KEY=YOUR_API_KEY
```

The API returns HTTP `401` when the key is missing or invalid and HTTP `403`
when the partner is not found or is disabled.
