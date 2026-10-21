# cURL examples

These commands call only verified read endpoints. They do not create an exchange transaction.

Set the production API origin and the complete authorization value. If your key-management screen already includes `Bearer `, keep it exactly once.

To keep the credential out of shell history, read it from an interactive,
masked prompt.

macOS or Linux:

```bash
export CRYPTODEEP_BASE_URL='https://api.cryptodeep.app'
read -rsp 'CryptoDeepApp Authorization value: ' CRYPTODEEP_API_KEY && echo
export CRYPTODEEP_API_KEY
```

Windows PowerShell 7.1 or newer:

```powershell
$env:CRYPTODEEP_BASE_URL = 'https://api.cryptodeep.app'
$env:CRYPTODEEP_API_KEY = Read-Host -MaskInput 'CryptoDeepApp Authorization value'
```

Enter the complete `Bearer YOUR_API_KEY` value at the prompt. Never place a
real key in a tracked script or a command stored in shell history.

## List currencies

```bash
curl --fail-with-body --silent --show-error \
  --header "Accept: application/json" \
  --header "Authorization: $CRYPTODEEP_API_KEY" \
  "$CRYPTODEEP_BASE_URL/api/v1/currencies?page=1&limit=20&search=BTC"
```

PowerShell:

```powershell
curl.exe --fail-with-body --silent --show-error --header "Accept: application/json" --header "Authorization: $env:CRYPTODEEP_API_KEY" "$env:CRYPTODEEP_BASE_URL/api/v1/currencies?page=1&limit=20&search=BTC"
```

## Quote from a deposit amount

Exactly one of `depositAmount` and `receiveAmount` must be sent.

```bash
curl --fail-with-body --silent --show-error \
  --header "Accept: application/json" \
  --header "Authorization: $CRYPTODEEP_API_KEY" \
  "$CRYPTODEEP_BASE_URL/api/v1/rate?depositCoin=BTC&receiveCoin=XMR&depositAmount=0.01&rateMode=fixed&depositNetwork=BTC&receiveNetwork=XMR"
```

PowerShell:

```powershell
curl.exe --fail-with-body --silent --show-error --header "Accept: application/json" --header "Authorization: $env:CRYPTODEEP_API_KEY" "$env:CRYPTODEEP_BASE_URL/api/v1/rate?depositCoin=BTC&receiveCoin=XMR&depositAmount=0.01&rateMode=fixed&depositNetwork=BTC&receiveNetwork=XMR"
```

## Estimate the deposit for a receive amount

This uses the same `/rate` route in the reverse amount direction.

```bash
curl --fail-with-body --silent --show-error \
  --header "Accept: application/json" \
  --header "Authorization: $CRYPTODEEP_API_KEY" \
  "$CRYPTODEEP_BASE_URL/api/v1/rate?depositCoin=BTC&receiveCoin=XMR&receiveAmount=1&rateMode=fixed&depositNetwork=BTC&receiveNetwork=XMR"
```

PowerShell:

```powershell
curl.exe --fail-with-body --silent --show-error --header "Accept: application/json" --header "Authorization: $env:CRYPTODEEP_API_KEY" "$env:CRYPTODEEP_BASE_URL/api/v1/rate?depositCoin=BTC&receiveCoin=XMR&receiveAmount=1&rateMode=fixed&depositNetwork=BTC&receiveNetwork=XMR"
```

## Get transaction status

The transaction must belong to the authenticated partner.

```bash
export CRYPTODEEP_TRANSACTION_ID='YOUR_TRANSACTION_ID'

curl --fail-with-body --silent --show-error --get \
  --header "Accept: application/json" \
  --header "Authorization: $CRYPTODEEP_API_KEY" \
  --data-urlencode "id=$CRYPTODEEP_TRANSACTION_ID" \
  "$CRYPTODEEP_BASE_URL/api/v1/transaction"
```

PowerShell:

```powershell
$env:CRYPTODEEP_TRANSACTION_ID = Read-Host 'Partner-owned transaction ID'
curl.exe --fail-with-body --silent --show-error --get --header "Accept: application/json" --header "Authorization: $env:CRYPTODEEP_API_KEY" --data-urlencode "id=$env:CRYPTODEEP_TRANSACTION_ID" "$env:CRYPTODEEP_BASE_URL/api/v1/transaction"
```

## List transactions

This response can contain partner-specific wallet and blockchain transaction data.

```bash
curl --fail-with-body --silent --show-error \
  --header "Accept: application/json" \
  --header "Authorization: $CRYPTODEEP_API_KEY" \
  "$CRYPTODEEP_BASE_URL/api/v1/transactions?page=1&limit=20&search="
```

PowerShell:

```powershell
curl.exe --fail-with-body --silent --show-error --header "Accept: application/json" --header "Authorization: $env:CRYPTODEEP_API_KEY" "$env:CRYPTODEEP_BASE_URL/api/v1/transactions?page=1&limit=20&search="
```

## Creating a transaction

`POST /api/v1/transaction` creates a real provider exchange. A copy-and-run cURL command is intentionally omitted to reduce accidental state-changing requests. The verified body fields are documented in [the endpoint reference](../../docs/endpoints.md). A separate `postman/CryptoDeepApp.manual.postman_collection.json` contains the guarded manual request; never include that collection in Postman Collection Runner, Newman, CI, monitors, schedules, or other automation. Its exact opt-in value is cleared before each request, so intentional manual use requires a fresh confirmation every time.
