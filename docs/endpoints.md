# Exchange API endpoints

Base URL:

```text
https://api.cryptodeep.app
```

Every route requires the Bearer authentication described in
[Authentication](authentication.md). JSON request bodies require
`Content-Type: application/json`. Unknown body or query properties are rejected
with HTTP `400`.

## Endpoint summary

| Method | Path | Purpose | Data or state impact |
|---|---|---|---|
| `GET` | `/api/v1/currencies` | List active coins and networks | Read-only |
| `GET` | `/api/v1/rate` | Quote an exchange in either amount direction | Read-only |
| `GET` | `/api/v1/transaction` | Read one partner-owned transaction | Private read |
| `GET` | `/api/v1/transactions` | List partner-owned transactions | Private read |
| `POST` | `/api/v1/transaction` | Create an exchange with the provider | **State-changing** |

There is no separate exchange-estimate route. A reverse estimate uses
`GET /api/v1/rate` with `receiveAmount` instead of `depositAmount`.

## List currencies

```http
GET /api/v1/currencies?page=1&limit=20&search=BTC
```

### Query parameters

| Name | Type | Required | Default | Rules |
|---|---|---:|---:|---|
| `page` | integer | No | `1` | Minimum `1` |
| `limit` | integer | No | `20` | From `1` through `100` |
| `search` | string | No | Empty | Case-insensitive match on coin symbol or full name |

The service returns active coins that have at least one active network. Coins
are ordered by the backend's rating priority and then by symbol. The internal
rating value is not returned.

### Response

```json
{
  "pagination": {
    "totalCount": 1,
    "pageCount": 1,
    "page": 1,
    "limit": 20
  },
  "coins": [
    {
      "image": "https://cdn.example.com/btc.png",
      "name": "BTC",
      "fullName": "Bitcoin",
      "networks": [
        {
          "name": "BTC",
          "fullName": "Bitcoin",
          "memo": false
        }
      ]
    }
  ]
}
```

`memo` is `true` when that network requires a memo, tag, or extra ID.

## Get an exchange rate or estimate

Quote a known deposit amount:

```http
GET /api/v1/rate?depositCoin=BTC&receiveCoin=XMR&depositAmount=0.01&rateMode=fixed&depositNetwork=BTC&receiveNetwork=XMR
```

To calculate from a desired receive amount, replace `depositAmount` with
`receiveAmount`.

### Query parameters

| Name | Type | Required | Rules |
|---|---|---:|---|
| `depositCoin` | string | Yes | Deposit coin symbol |
| `receiveCoin` | string | Yes | Receive coin symbol |
| `depositAmount` | number | Conditional | Send this or `receiveAmount`, never both |
| `receiveAmount` | number | Conditional | Send this or `depositAmount`, never both |
| `rateMode` | string | Yes | `fixed` or `float` |
| `depositNetwork` | string | No | Recommended for unambiguous pair selection |
| `receiveNetwork` | string | No | Recommended for unambiguous pair selection |

Use coin and network identifiers from `/api/v1/currencies`.

### Response

```json
{
  "depositCoin": "BTC",
  "receiveCoin": "XMR",
  "depositAmount": 0.01,
  "receiveAmount": 1.2345,
  "rate": 123.45,
  "withdrawMax": 100
}
```

`withdrawMax` is optional and is omitted when the provider does not return it.
The successful public response does not include provider `status`,
`minAmount`, `maxAmount`, or `withdrawMin` fields.

## Get one transaction

```http
GET /api/v1/transaction?id=abc12345
```

| Name | Type | Required | Rules |
|---|---|---:|---|
| `id` | string | Yes | Exact public transaction `uniqueId` |

The backend trims and lowercases the supplied ID before lookup. It also filters
by the authenticated partner. A missing or foreign transaction returns HTTP
`404`.

### Response

```json
{
  "uniqueId": "abc12345",
  "status": "success",
  "rateMode": "fixed",
  "refundMemo": null,
  "source": "api",
  "depositCoin": "BTC",
  "depositAmount": 0.01,
  "depositNetwork": "BTC",
  "depositCoinFullName": "Bitcoin",
  "depositAddress": "PROVIDER_DEPOSIT_ADDRESS",
  "depositMemo": "",
  "receiveCoin": "XMR",
  "receiveAmount": 1.23,
  "receiveNetwork": "XMR",
  "receiveCoinFullName": "Monero",
  "receiveAddress": "CUSTOMER_RECEIVE_ADDRESS",
  "receiveMemo": "",
  "deposit": {
    "txId": "DEPOSIT_TRANSACTION_HASH",
    "link": "https://explorer.example/tx/DEPOSIT_TRANSACTION_HASH",
    "createdAt": "2026-09-01T19:10:00.000Z"
  },
  "withdrawal": {
    "txId": "WITHDRAWAL_TRANSACTION_HASH",
    "link": "https://explorer.example/tx/WITHDRAWAL_TRANSACTION_HASH",
    "createdAt": "2026-09-01T19:15:00.000Z"
  },
  "createdAt": "2026-09-01T19:08:30.370Z",
  "profit": 0.35
}
```

`deposit` and `withdrawal` are each either `null` or an object containing
`txId`, `link`, and `createdAt`. `profit` is a number or `null`.

## List transactions

```http
GET /api/v1/transactions?page=1&limit=20&search=abc1
```

| Name | Type | Required | Default | Rules |
|---|---|---:|---:|---|
| `page` | integer | No | `1` | Minimum `1` |
| `limit` | integer | No | `20` | From `1` through `100` |
| `search` | string | No | Empty | Case-insensitive partial match on `uniqueId` |

Results are limited to the authenticated partner and ordered from newest to
oldest.

```json
{
  "pagination": {
    "totalCount": 1,
    "pageCount": 1,
    "page": 1,
    "limit": 20
  },
  "transactions": []
}
```

Each item in `transactions` has the same shape as the single-transaction
response, including `profit`.

## Create a transaction

> **Warning:** `POST /api/v1/transaction` is state-changing. It contacts the
> exchange provider and creates a real exchange. Do not send this request as a
> connectivity test, an automated collection test, or a public demo action.

```http
POST /api/v1/transaction
Content-Type: application/json
```

### Request body

| Name | Type | Required | Rules |
|---|---|---:|---|
| `depositCoin` | string | Yes | Non-empty coin symbol |
| `depositAmount` | number | Conditional | Send this or `receiveAmount`, never both; non-negative at DTO validation |
| `depositNetwork` | string | Yes | Non-empty network identifier |
| `receiveAddress` | string | Yes | Destination address |
| `receiveCoin` | string | Yes | Non-empty coin symbol |
| `receiveAmount` | number | Conditional | Send this or `depositAmount`, never both; non-negative at DTO validation |
| `receiveNetwork` | string | Yes | Non-empty network identifier |
| `rateMode` | string | Yes | `fixed` or `float` |
| `refundAddress` | string | No | Address for a provider refund |
| `refundMemo` | string or `null` | No | Refund memo, tag, or extra ID |
| `memo` | string | No | Destination memo, tag, or extra ID |

The deposit coin and network combination cannot be identical to the receive
coin and network combination. A provider can impose a minimum amount greater
than the DTO's non-negative validation boundary.

Illustrative body only—do not submit it unless you intend to create an exchange:

```json
{
  "depositCoin": "BTC",
  "depositAmount": 0.01,
  "depositNetwork": "BTC",
  "receiveAddress": "CUSTOMER_RECEIVE_ADDRESS",
  "receiveCoin": "XMR",
  "receiveNetwork": "XMR",
  "rateMode": "fixed",
  "refundAddress": "CUSTOMER_REFUND_ADDRESS",
  "refundMemo": null,
  "memo": ""
}
```

### Response

A successful create returns HTTP `201` and the same base transaction fields
shown above. Immediately after creation, `status` is `created`; `deposit` and
`withdrawal` are normally `null`. The create response does **not** include the
`profit` property.

## Transaction status values

The verified API type permits these values:

| Status | Meaning documented by the backend |
|---|---|
| `created` | Created and waiting for a deposit |
| `confirmation` | Deposit is waiting for network confirmations |
| `exchanging` | Exchange is in progress |
| `sending` | Exchange result is being sent |
| `success` | Exchange completed successfully |
| `overdue` | The transaction's waiting period expired |
| `error` | An exchange error occurred |
| `pause` | Processing is paused |
| `frozen` | The transaction is frozen |
| `refunded` | Funds were refunded |

The inspected API service sets the initial status to `created`. Status-update
and late-deposit transition logic lives outside this repository, so no stricter
transition sequence is asserted here.

