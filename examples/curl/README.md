# cURL examples

## Variables

macOS or Linux:

```bash
export CRYPTODEEP_BASE_URL='https://api.cryptodeep.app'
export CRYPTODEEP_API_KEY='YOUR_API_KEY'
```

Windows PowerShell:

```powershell
$env:CRYPTODEEP_BASE_URL = 'https://api.cryptodeep.app'
$env:CRYPTODEEP_API_KEY = 'YOUR_API_KEY'
```

## Get currencies

```bash
curl --fail-with-body --silent --show-error \
  --header "Authorization: Bearer $CRYPTODEEP_API_KEY" \
  "$CRYPTODEEP_BASE_URL/api/v1/currencies?page=1&limit=20&search=BTC"
```

```powershell
curl.exe --fail-with-body --silent --show-error --header "Authorization: Bearer $env:CRYPTODEEP_API_KEY" "$env:CRYPTODEEP_BASE_URL/api/v1/currencies?page=1&limit=20&search=BTC"
```

## Get a rate from a deposit amount

```bash
curl --fail-with-body --silent --show-error \
  --header "Authorization: Bearer $CRYPTODEEP_API_KEY" \
  "$CRYPTODEEP_BASE_URL/api/v1/rate?depositCoin=BTC&receiveCoin=XMR&depositAmount=0.01&rateMode=fixed&depositNetwork=BTC&receiveNetwork=XMR"
```

```powershell
curl.exe --fail-with-body --silent --show-error --header "Authorization: Bearer $env:CRYPTODEEP_API_KEY" "$env:CRYPTODEEP_BASE_URL/api/v1/rate?depositCoin=BTC&receiveCoin=XMR&depositAmount=0.01&rateMode=fixed&depositNetwork=BTC&receiveNetwork=XMR"
```

## Get a rate from a receive amount

```bash
curl --fail-with-body --silent --show-error \
  --header "Authorization: Bearer $CRYPTODEEP_API_KEY" \
  "$CRYPTODEEP_BASE_URL/api/v1/rate?depositCoin=BTC&receiveCoin=XMR&receiveAmount=1&rateMode=fixed&depositNetwork=BTC&receiveNetwork=XMR"
```

```powershell
curl.exe --fail-with-body --silent --show-error --header "Authorization: Bearer $env:CRYPTODEEP_API_KEY" "$env:CRYPTODEEP_BASE_URL/api/v1/rate?depositCoin=BTC&receiveCoin=XMR&receiveAmount=1&rateMode=fixed&depositNetwork=BTC&receiveNetwork=XMR"
```

## Get one transaction

```bash
export CRYPTODEEP_TRANSACTION_ID='YOUR_TRANSACTION_ID'

curl --fail-with-body --silent --show-error --get \
  --header "Authorization: Bearer $CRYPTODEEP_API_KEY" \
  --data-urlencode "id=$CRYPTODEEP_TRANSACTION_ID" \
  "$CRYPTODEEP_BASE_URL/api/v1/transaction"
```

```powershell
$env:CRYPTODEEP_TRANSACTION_ID = 'YOUR_TRANSACTION_ID'
curl.exe --fail-with-body --silent --show-error --get --header "Authorization: Bearer $env:CRYPTODEEP_API_KEY" --data-urlencode "id=$env:CRYPTODEEP_TRANSACTION_ID" "$env:CRYPTODEEP_BASE_URL/api/v1/transaction"
```

## Get transactions

```bash
curl --fail-with-body --silent --show-error \
  --header "Authorization: Bearer $CRYPTODEEP_API_KEY" \
  "$CRYPTODEEP_BASE_URL/api/v1/transactions?page=1&limit=20&search="
```

```powershell
curl.exe --fail-with-body --silent --show-error --header "Authorization: Bearer $env:CRYPTODEEP_API_KEY" "$env:CRYPTODEEP_BASE_URL/api/v1/transactions?page=1&limit=20&search="
```
