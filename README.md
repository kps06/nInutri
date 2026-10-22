# nInutri

Smart raw-food analysis app with secure account login, nutrition history, and a MySQL-backed API.

## Free deployment

1. Create a MySQL-compatible TiDB Cloud Starter instance and run `schema.tidb.sql` in the `Food` database.
2. Import this repository into Vercel as a personal Hobby project.
3. Set `MYSQL_HOST`, `MYSQL_PORT`, `MYSQL_USER`, `MYSQL_PASSWORD`, `MYSQL_DATABASE`, `MYSQL_SSL=true`, and `JWT_SECRET` as environment variables.
4. Vercel automatically detects `server.js` as an Express application and serves `public/` as static assets.

Never commit a `.env` file or database password.
