import {
  createClient,
  handleCliError,
  printJson,
  readInteger,
  readString,
} from './client.js';

async function main() {
  const client = createClient();
  const currencies = await client.get('/api/v1/currencies', {
    page: readInteger('CRYPTODEEP_PAGE', 1),
    limit: readInteger('CRYPTODEEP_LIMIT', 20, { max: 100 }),
    search: readString('CRYPTODEEP_SEARCH', ''),
  });
  printJson(currencies);
}

main().catch(handleCliError);
