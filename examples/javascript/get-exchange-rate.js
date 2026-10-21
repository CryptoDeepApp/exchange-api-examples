import {
  createClient,
  handleCliError,
  printJson,
  readNumber,
  readRateMode,
  readString,
} from './client.js';

async function main() {
  const client = createClient();
  const quote = await client.get('/api/v1/rate', {
    depositCoin: readString('CRYPTODEEP_DEPOSIT_COIN', 'BTC'),
    receiveCoin: readString('CRYPTODEEP_RECEIVE_COIN', 'XMR'),
    depositAmount: readNumber('CRYPTODEEP_DEPOSIT_AMOUNT', 0.01),
    rateMode: readRateMode(),
    depositNetwork: readString('CRYPTODEEP_DEPOSIT_NETWORK', 'BTC'),
    receiveNetwork: readString('CRYPTODEEP_RECEIVE_NETWORK', 'XMR'),
  });
  printJson(quote);
}

main().catch(handleCliError);
