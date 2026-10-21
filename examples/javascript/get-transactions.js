import {
  createClient,
  handleCliError,
  printJson,
  readInteger,
  readString,
} from './client.js';

async function main() {
  const client = createClient();
  const transactions = await client.get('/api/v1/transactions', {
    page: readInteger('CRYPTODEEP_PAGE', 1),
    limit: readInteger('CRYPTODEEP_LIMIT', 20, { max: 100 }),
    search: readString('CRYPTODEEP_TRANSACTION_SEARCH', ''),
  });
  printJson(transactions);
}

main().catch(handleCliError);
