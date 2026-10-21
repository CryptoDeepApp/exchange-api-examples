import { readdir } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import path from 'node:path';

const roots = ['examples', 'scripts', 'tests'];
const files = [];

for (const root of roots) {
  files.push(...(await findJavaScriptFiles(root)));
}

for (const file of files.sort()) {
  const result = spawnSync(process.execPath, ['--check', file], {
    stdio: 'inherit',
  });
  if (result.status !== 0) process.exit(result.status ?? 1);
}

console.log(`Syntax OK: ${files.length} JavaScript files.`);

async function findJavaScriptFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map(async (entry) => {
      const item = path.join(directory, entry.name);
      if (entry.isDirectory()) return findJavaScriptFiles(item);
      return entry.isFile() && entry.name.endsWith('.js') ? [item] : [];
    }),
  );
  return nested.flat();
}
