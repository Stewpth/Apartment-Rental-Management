# Apartmentium

Apartment rental management application with a React frontend and an Express, Prisma, and PostgreSQL backend. Supabase Storage holds private request attachments and profile photos.

## Project layout

```text
Apartment-Rental-Management/
├── apartmentium-backend/
│   ├── prisma/                 Database schema and migrations
│   └── src/
│       ├── config/             Prisma and Supabase clients
│       ├── controllers/        HTTP handlers grouped by feature
│       ├── middleware/         Authentication and authorization
│       ├── routes/             Role-protected API route definitions
│       ├── services/           Shared feature logic and response shaping
│       ├── templates/          Email templates
│       └── utils/              Small shared helpers
└── apartmentium-frontend/
    └── src/
        ├── api/                Authenticated API client
        ├── auth/               Session context and route protection
        ├── components/         Shared layout and UI components
        ├── hooks/              Shared React hooks
        ├── pages/              Route-level pages, grouped by feature
        ├── utils/              Frontend formatters and view helpers
        └── assets/             Images and other static assets
```

## Backend feature organization

- `request.controller.js` handles request submission, attachment retrieval, and request review.
- `settlement.controller.js` handles move-out confirmation, final settlements, refunds, and adjustments.
- `request-data.js` shares request validation, response formatting, and Prisma relation includes.
- `admin-dashboard.controller.js` and `tenant-dashboard.controller.js` keep role-specific dashboard endpoints separate.
- `profile-image.service.js` owns profile-photo validation and private Supabase Storage operations.

Routes are mounted from `src/app.js` under `/api`. Admin and tenant route modules apply authentication and role checks before dispatching to controllers.

## Running locally

Run the backend and frontend in separate terminals:

```sh
cd apartmentium-backend
npm run dev
```

```sh
cd apartmentium-frontend
npm run dev
```

The backend requires its database, JWT, and Supabase settings in its local environment. Keep server secrets in the backend environment only.
