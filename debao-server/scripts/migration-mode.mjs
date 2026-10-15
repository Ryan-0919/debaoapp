// Split PostgreSQL statements without splitting quoted strings or DO blocks.
export function sqlStatements(sql) {
  const statements = [];
  let start = 0;
  let quote = '';
  let lineComment = false;
  let blockDepth = 0;
  for (let index = 0; index < sql.length; index += 1) {
    const char = sql[index];
    const next = sql[index + 1];
    if (lineComment) {
      if (char === '\n') lineComment = false;
      continue;
    }
    if (blockDepth) {
      if (char === '/' && next === '*') { blockDepth += 1; index += 1; }
      else if (char === '*' && next === '/') { blockDepth -= 1; index += 1; }
      continue;
    }
    if (quote) {
      if (quote.startsWith('$')) {
        if (sql.startsWith(quote, index)) { index += quote.length - 1; quote = ''; }
      } else if (char === quote) {
        if (next === quote) index += 1;
        else quote = '';
      }
      continue;
    }
    if (char === '-' && next === '-') { lineComment = true; index += 1; }
    else if (char === '/' && next === '*') { blockDepth = 1; index += 1; }
    else if (char === "'" || char === '"') quote = char;
    else if (char === '$') {
      const tag = sql.slice(index).match(/^\$(?:[a-zA-Z_]\w*)?\$/)?.[0];
      if (tag) { quote = tag; index += tag.length - 1; }
    } else if (char === ';') {
      statements.push(sql.slice(start, index + 1));
      start = index + 1;
    }
  }
  if (quote || blockDepth) throw new Error('Unterminated SQL quote or comment');
  if (sql.slice(start).trim()) statements.push(sql.slice(start));
  return statements;
}

const systemTables = new Set(['admin_roles', 'admin_permissions', 'admin_role_permissions']);

export function migrationStatements(sql, withFixtures = false) {
  if (withFixtures) return sqlStatements(sql);
  return sqlStatements(sql).filter(statement => {
    const command = statement.replace(/--[^\n]*/g, '').replace(/\/\*[\s\S]*?\*\//g, '').trim();
    // Historical INSERTs contain sample business records. Keep only role and
    // permission definitions; actual accounts are initialized separately.
    const insert = command.match(/^insert\s+into\s+([a-z_]+)/i);
    if (insert) return systemTables.has(insert[1].toLowerCase());
    // The historical diagnostic DO block only inserts sample questions.
    if (/^do\b/i.test(command) && /\binsert\s+into\b/i.test(command)) return false;
    return true;
  });
}
