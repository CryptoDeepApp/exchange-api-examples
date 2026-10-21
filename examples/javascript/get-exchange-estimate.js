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
  const estimate = await client.get('/api/v1/rate', {
    depositCoin: readString('CRYPTODEEP_DEPOSIT_COIN', 'BTC'),
    receiveCoin: readString('CRYPTODEEP_RECEIVE_COIN', 'XMR'),
    receiveAmount: readNumber('CRYPTODEEP_RECEIVE_AMOUNT', 1),
    rateMode: readRateMode(),
    depositNetwork: readString('CRYPTODEEP_DEPOSIT_NETWORK', 'BTC'),
    receiveNetwork: readString('CRYPTODEEP_RECEIVE_NETWORK', 'XMR'),
  });
  printJson(estimate);
}

main().catch(handleCliError);
