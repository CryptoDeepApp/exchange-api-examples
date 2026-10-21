# Endpoints

Base URL: `https://api.cryptodeep.app`

All requests use:

```http
Authorization: Bearer YOUR_API_KEY
```

## Summary

| Method | Path | Description |
|---|---|---|
| `POST` | `/api/v1/transaction` | Create a transaction |
| `GET` | `/api/v1/transaction` | Get one transaction |
| `GET` | `/api/v1/transactions` | Get transactions |
| `GET` | `/api/v1/rate` | Get an exchange rate |
| `GET` | `/api/v1/currencies` | Get currencies and networks |

## GET `/api/v1/currencies`

| Parameter | Type | Required | Default |
|---|---|---|---|
| `page` | integer | No | `1` |
| `limit` | integer | No | `20` |
| `search` | string | No | Empty string |

`page` starts from `1`, and `limit` accepts values from `1` to `100`. `search`
matches a coin symbol or full name.

```http
GET /api/v1/currencies?page=1&limit=20&search=BTC
```

## GET `/api/v1/rate`

| Parameter | Type | Required |
|---|---|---|
| `depositCoin` | string | Yes |
| `receiveCoin` | string | Yes |
| `depositAmount` | number | Conditional |
| `receiveAmount` | number | Conditional |
| `rateMode` | string | Yes |
| `depositNetwork` | string | No |
| `receiveNetwork` | string | No |

Send exactly one of `depositAmount` or `receiveAmount`. `rateMode` accepts
`fixed` or `float`.

```http
GET /api/v1/rate?depositCoin=BTC&receiveCoin=XMR&depositAmount=0.01&rateMode=fixed&depositNetwork=BTC&receiveNetwork=XMR
```

## GET `/api/v1/transaction`

| Parameter | Type | Required |
|---|---|---|
| `id` | string | Yes |

```http
GET /api/v1/transaction?id=m0j2w48p
```

## GET `/api/v1/transactions`

| Parameter | Type | Required | Default |
|---|---|---|---|
| `page` | integer | No | `1` |
| `limit` | integer | No | `20` |
| `search` | string | No | Empty string |

```http
GET /api/v1/transactions?page=1&limit=20&search=m0j2
```

## POST `/api/v1/transaction`

POST requests use `Content-Type: application/json`.

| Field | Type | Required |
|---|---|---|
| `depositCoin` | string | Yes |
| `depositAmount` | number | Conditional |
| `depositNetwork` | string | Yes |
| `receiveCoin` | string | Yes |
| `receiveAmount` | number | Conditional |
| `receiveNetwork` | string | Yes |
| `receiveAddress` | string | Yes |
| `rateMode` | string | Yes |
| `refundAddress` | string | No |
| `refundMemo` | string or null | No |
| `memo` | string | No |

Send exactly one of `depositAmount` or `receiveAmount`. Get coin and network
values from `GET /api/v1/currencies`.

```json
{
  "depositCoin": "USDT",
  "depositAmount": 70,
  "depositNetwork": "TRX",
  "receiveCoin": "TRX",
  "receiveNetwork": "TRX",
  "receiveAddress": "YOUR_RECEIVE_ADDRESS",
  "rateMode": "float",
  "refundAddress": "YOUR_REFUND_ADDRESS",
  "refundMemo": null,
  "memo": ""
}
```

Successful creation returns HTTP `201`.

## Transaction statuses

| Value | Description |
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

See the [API documentation](https://cryptodeep.app/api-docs) for response
fields and examples.
