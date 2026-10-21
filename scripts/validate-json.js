import { readFile } from 'node:fs/promises';

const files = [
  'package.json',
  'package-lock.json',
  'postman/CryptoDeepApp.postman_collection.json',
  'postman/CryptoDeepApp.manual.postman_collection.json',
  'postman/CryptoDeepApp.postman_environment.json',
];

for (const file of files) {
  JSON.parse(await readFile(file, 'utf8'));
  console.log(`Valid JSON: ${file}`);
}
