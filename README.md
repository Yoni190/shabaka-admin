# Shabaka admin

The Shabaka admin application uses React, TypeScript, Vite, and Tailwind CSS. Administrators can view dashboard statistics, manage products, categories, and brands, and view and update orders. The customers and settings pages are placeholders.

## Run locally

1. Install Node.js and npm, then install dependencies:

   ```sh
   npm ci
   ```

2. Start the Shabaka backend and create an admin account. The backend README describes its development seeder. By default, the admin application sends requests to `http://127.0.0.1:8000/api/v1`. To use another API, create a `.env.local` file in this repository:

   ```dotenv
   VITE_API_URL=http://127.0.0.1:8000/api/v1
   ```

3. Start the development server:

   ```sh
   npm run dev
   ```

Open the URL printed by Vite and sign in with an admin account. The application stores the admin bearer token in browser local storage.

## Commands

- `npm run build` type-checks the project and builds it into `dist/`.
- `npm run lint` runs ESLint.
- `npm run preview` serves the production build locally.

Routes are defined in `src/App.tsx`, admin API calls live in `src/api/admin/`, and authentication state lives in `src/context/`. A deployment must route client-side URLs back to `index.html`.
