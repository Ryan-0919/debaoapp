import {readFile, readdir} from 'node:fs/promises';
import {join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {Pool} from 'pg';
import {migrationStatements} from './migration-mode.mjs';

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error('DATABASE_URL is required for migrations');
const pool = new Pool({connectionString: databaseUrl});
try {
  const directory = fileURLToPath(new URL('../migrations/', import.meta.url));
  const files = (await readdir(directory)).filter(file => file.endsWith('.sql')).sort();
  for (const file of files) {
    console.log(`Applying ${file}`);
    const statements = migrationStatements(
      await readFile(join(directory, file), 'utf8'),
      process.env.DEBAO_TEST_FIXTURES === 'true',
    );
    const client = await pool.connect();
    try {
      await client.query('begin');
      for (const statement of statements) await client.query(statement);
      await client.query('commit');
    } catch (error) {
      await client.query('rollback');
      throw error;
    } finally {
      client.release();
    }
  }
} finally {
  await pool.end();
}
