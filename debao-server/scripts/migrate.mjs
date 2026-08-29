import {readFile, readdir} from 'node:fs/promises';
import {join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {Pool} from 'pg';

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error('DATABASE_URL is required for migrations');
const pool = new Pool({connectionString: databaseUrl});
try {
  const directory = fileURLToPath(new URL('../migrations/', import.meta.url));
  const files = (await readdir(directory)).filter(file => file.endsWith('.sql')).sort();
  for (const file of files) {
    console.log(`Applying ${file}`);
    await pool.query(await readFile(join(directory, file), 'utf8'));
  }
} finally {
  await pool.end();
}
