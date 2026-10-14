import {scryptSync} from 'node:crypto';
import {Pool} from 'pg';

const databaseUrl = process.env.DATABASE_URL;
const username = process.env.ADMIN_INIT_USERNAME?.trim();
const password = process.env.ADMIN_INIT_PASSWORD ?? '';
const displayName = process.env.ADMIN_INIT_DISPLAY_NAME?.trim() || '超级管理员';
const authSecret = process.env.DEBAO_AUTH_SECRET ?? '';
if (!databaseUrl) throw new Error('DATABASE_URL is required');
if (!username || !/^[a-zA-Z0-9._-]{3,120}$/.test(username)) throw new Error('ADMIN_INIT_USERNAME must be 3-120 safe characters');
if (password.length < 12) throw new Error('ADMIN_INIT_PASSWORD must contain at least 12 characters');
if (authSecret.length < 16) throw new Error('DEBAO_AUTH_SECRET must contain at least 16 characters');

const pool = new Pool({connectionString: databaseUrl});
const client = await pool.connect();
try {
  await client.query('begin');
  const existing = await client.query('select count(*)::int as count from admin_users');
  if (existing.rows[0].count > 0) throw new Error('An administrator already exists; one-time initialization refused');
  const role = await client.query("insert into admin_roles (code, name) values ('super_admin', '超级管理员') on conflict (code) do update set name = excluded.name returning id");
  await client.query("insert into admin_permissions (code, name) values ('*', '全部权限') on conflict (code) do update set name = excluded.name");
  await client.query('insert into admin_role_permissions (role_id, permission_code) values ($1, $2) on conflict do nothing', [role.rows[0].id, '*']);
  const passwordHash = scryptSync(password, authSecret, 32).toString('base64');
  const admin = await client.query('insert into admin_users (username, password_hash, display_name, status, mfa_enabled) values ($1, $2, $3, $4, $5) returning id', [username, passwordHash, displayName, 'active', false]);
  await client.query('insert into admin_user_roles (admin_user_id, role_id) values ($1, $2)', [admin.rows[0].id, role.rows[0].id]);
  await client.query('commit');
  console.log(`Created administrator ${username} (${admin.rows[0].id}). Configure MFA before production access.`);
} catch (error) {
  await client.query('rollback');
  throw error;
} finally {
  client.release();
  await pool.end();
}
