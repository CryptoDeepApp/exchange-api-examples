# Getting started

## Requirements

- Node.js 20.6 or newer
- CryptoDeepApp API key

## Setup

```bash
git clone https://github.com/CryptoDeepApp/exchange-api-examples.git
cd exchange-api-examples
cp .env.example .env
```

On Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

Set `CRYPTODEEP_API_KEY` in `.env`.

## Run examples

```bash
npm run example:currencies
npm run example:rate
npm run example:estimate
npm run example:transactions
```

To get one transaction, set its ID:

```dotenv
CRYPTODEEP_TRANSACTION_ID=YOUR_TRANSACTION_ID
```

Then run:

```bash
npm run example:status
```

## Validate the repository

```bash
npm run check
```
