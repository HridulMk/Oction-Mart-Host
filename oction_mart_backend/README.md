# oction_mart

## Deploying the backend to Render

Create a Render Blueprint from the repository root using `render.yaml`. Set
`DATABASE_URL` to the PostgreSQL connection string from the Supabase project's
database settings (not the Supabase REST API URL or API key). Also provide
`FRONTEND_URL`, `CORS_ALLOWED_ORIGINS`, and `CSRF_TRUSTED_ORIGINS` when prompted;
the origin values should include `https://` and the frontend's deployed origin.
Keep local credentials in the ignored backend `.env` file and do not commit it.