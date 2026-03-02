# Frontend (Vite + React + Tailwind)

This frontend is a Vite + React app using Tailwind CSS and Axios to consume the ASP.NET Core backend API.

Quick start:

```bash
cd frontend
npm install
npm run dev
```

Notes:
- The Axios base URL is configured in `src/services/api.js`. Update to match your backend (e.g., `https://localhost:5001/api`).
- JWT is stored in `localStorage` under `token` and basic user info under `user`.
- Routes are protected based on the `role` field returned by the backend.

Next steps:
- Implement management pages for Books, Loans and Users under `src/pages`.
- Add reusable components (tables, forms, notifications) in `src/components`.
