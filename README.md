# Apartmentium

Apartmentium is an apartment rental management system with a React/Vite frontend and an Express, Prisma, and PostgreSQL backend. Supabase Storage stores private request attachments and profile photos. Gmail SMTP delivers account and activation emails.

## System workflow

- Admins create units, assign tenants, publish announcements, review requests, record payments, and process move-out settlements.
- Tenants view their rental and payment history, submit requests, and see the three latest announcements on their dashboard.
- Notifications are stored per user. New announcements notify active tenants, tenant requests notify active admins, and request updates and recorded payments notify the tenant.
- Admin and tenant pages are protected by role-aware routes, while the API verifies a signed bearer token and account status.

## Repository layout

```text
Apartment-Rental-Management/
├── .github/workflows/ci.yml
├── apartmentium-backend/
│   ├── prisma/                 Schema and SQL migrations
│   └── src/
│       ├── config/             Database and Supabase clients
│       ├── controllers/        API handlers grouped by feature
│       ├── middleware/         Authentication, authorization, rate limits
│       ├── routes/             API route definitions
│       ├── services/           Shared application logic
│       └── templates/          Email templates
└── apartmentium-frontend/
    └── src/
        ├── api/                Authenticated API client
        ├── auth/               Session and route protection
        ├── components/         Shared layout and UI components
        └── pages/              Feature-oriented screens
```

## Local development

The frontend and backend require Node.js `>=24 <27` (currently supported LTS lines are tested in CI).

Copy `apartmentium-backend/.env.example` to `apartmentium-backend/.env` and `apartmentium-frontend/.env.example` to `apartmentium-frontend/.env.local`. Fill in real credentials in the ignored `.env` files; never commit them.

Run the backend and frontend in separate terminals:

```sh
cd apartmentium-backend
npm ci
npm run db:generate
npm run dev
```

```sh
cd apartmentium-frontend
npm ci
npm run dev
```

## Deployment configuration

Configure these variables in the deployment platform’s secret/environment settings:

| Variable | Used by | Notes |
| --- | --- | --- |
| `DATABASE_URL` | Backend runtime | PostgreSQL connection string, preferably the Neon pooled/runtime URL. |
| `DATABASE_URL_UNPOOLED` | Prisma CLI | Direct/unpooled PostgreSQL URL for migrations. Must target the same database as `DATABASE_URL`. |
| `JWT_SECRET` | Backend | Unique random secret; use at least 32 random characters. |
| `FRONTEND_URL` | Backend CORS | Exact deployed frontend origin, including scheme. |
| `EMAIL_USER` | Backend email | Gmail sender address. |
| `EMAIL_APP_PASSWORD` | Backend email | Gmail app password, stored only on the server. |
| `SUPABASE_URL` | Backend storage | Supabase project URL. |
| `SUPABASE_SECRET_KEY` | Backend storage | Server-side secret/service key; never expose it in a `VITE_` variable. |
| `VITE_API_URL` | Frontend build | Public API base URL, for example `https://api.example.com/api`. |
| `TRUST_PROXY_HOPS` | Backend, optional | Set to the exact trusted proxy hop count when the host sits behind a reverse proxy. |

`PORT` and `SUPABASE_REQUEST_ATTACHMENTS_BUCKET` are optional; defaults are `3000` and `request-attachments`. The attachment bucket must exist and be accessible to the configured Supabase server key.

### Release steps

1. Configure production variables and provision PostgreSQL, Gmail SMTP, and the Supabase bucket.
2. Build the frontend with `npm run build` in `apartmentium-frontend`, then deploy its `dist/` directory to a static host. Configure the host to serve `index.html` for client-side routes.
3. In `apartmentium-backend`, run `npm ci`, `npm run db:generate`, and `npm run db:deploy` against the intended database. `db:deploy` applies pending migrations; do not use `prisma migrate reset` on a database with required data.
4. Start the API with `npm start`. Configure the platform’s readiness probe to call `/api/health/ready`; `/api/health` is the liveness endpoint.
5. Run the staging smoke checklist below before promoting a release.

Use `npm run db:deploy` for the shared Neon database. Use `prisma migrate dev` only against a separate development database. Keep the migration directory committed and do not edit migrations after they have been applied.

## Checks and tests

The GitHub Actions workflow runs frontend lint/build, Prisma generation/schema validation, backend unit tests, and backend syntax checks on pushes and pull requests.

Locally:

```sh
cd apartmentium-frontend && npm run lint && npm run build
cd ../apartmentium-backend && npm test && npm run db:generate
```

The current backend tests cover request date validation. They do not replace end-to-end tests against staging services.

## Staging smoke checklist

- Sign in as both admin and tenant; confirm role restrictions and sign-out behavior.
- Create a unit, assign a tenant, and verify activation email delivery.
- Upload and retrieve a request attachment and profile photo through Supabase Storage.
- Create an announcement and confirm tenant dashboard and notification behavior.
- Submit a tenant request, update its status as admin, and verify tenant notification/read state.
- Record a partial payment and confirm dues, balances, history, and tenant notification.
- Test move-out settlement confirmation, adjustment, refund, and unit readiness workflows.
- Verify `/api/health/ready` returns 200 when PostgreSQL and Supabase Storage are available and 503 when a required dependency is unavailable.

## Operational notes

- Login and activation endpoints use IP-based rate limits. The default rate-limit store is in memory and is intended for a single API instance; use a shared store before scaling to multiple instances.
- Configure `TRUST_PROXY_HOPS` only to match the deployment host’s trusted proxy topology. Incorrect proxy trust can weaken IP-based rate limits.
- API responses include standard Helmet security headers. Configure a Content Security Policy at the frontend hosting/CDN layer after accounting for the app’s font, image, and Supabase asset origins.
- The deployment target must provide HTTPS, secret management, SPA route fallback, and persistent logs/alerts. No cloud provider is assumed by this repository.
