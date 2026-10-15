import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile, readdir} from 'node:fs/promises';
import {migrationStatements, sqlStatements} from './migration-mode.mjs';

test('PostgreSQL strings, comments and dollar bodies retain embedded semicolons', () => {
  const sql = `-- ; comment
create table example(id text);
insert into example values ('a;''b');
do $$ begin perform ';'; end $$;
/* ; */ alter table example add column title text;`;
  assert.equal(sqlStatements(sql).length, 4);
  assert.equal(migrationStatements(sql).length, 3);
  assert.equal(migrationStatements(sql, true).length, 4);
});

test('real migrations omit seeded users, content and nested diagnostic samples', async () => {
  const directory = new URL('../migrations/', import.meta.url);
  for (const file of await readdir(directory)) {
    if (!file.endsWith('.sql')) continue;
    const statements = migrationStatements(await readFile(new URL(file, directory), 'utf8'));
    for (const statement of statements) {
      assert.doesNotMatch(statement, /insert\s+into\s+(?:users|subjects|questions|courses|products|orders|learning_diagnostic_questions|app_legal_documents)\b/i, file);
    }
  }
});
