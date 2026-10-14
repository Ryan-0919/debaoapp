# Admin Testing

## Automated checks

```bash
pnpm.cmd typecheck
pnpm.cmd lint
pnpm.cmd test
pnpm.cmd build
```

The server contract suite is run from `debao-server` with `npm.cmd run check`. It covers admin session cookies, CSRF rejection, question publishing/edit/version history, user operations, dynamic navigation, roles, and community report resolution.

## Manual smoke flow

1. Start `debao-server` on port `4000`.
2. Start `debao-admin` on port `8002`.
3. Sign in with the local development account documented in `README.md`.
4. Verify `/users`, `/content/questions`, `/courses`, `/commerce/products`, `/commerce/refunds`, `/community/reports`, `/operations/announcements`, and `/system/admins` load data from the API.
5. Verify every write action shows a success/error state and the browser never receives an admin bearer token.

## Playwright

Run `pnpm.cmd test:e2e`. The suite uses the installed Chrome channel at 1440x1000 and 390x844, starts or reuses the API/admin development servers, signs in through the real cookie session, visits every registered admin module, and stores desktop/mobile screenshots under `test-results`.

## Security checks

- Admin auth uses an HttpOnly cookie and CSRF header for state-changing requests.
- Admin routes accept only the HttpOnly admin cookie; APP bearer tokens and `admin-token` are rejected in every environment.
- Provider integrations report `unconfigured`/`503` instead of returning fake success.
