import {
  createClient,
  handleCliError,
  printJson,
  readString,
} from './client.js';

async function main() {
  const client = createClient();
  const transaction = await client.get('/api/v1/transaction', {
    id: readString('CRYPTODEEP_TRANSACTION_ID', '', { required: true }),
  });
  printJson(transaction);
}

main().catch(handleCliError);
