# nInutri

Smart raw-food analysis app with secure account login, nutrition history, and a MySQL-backed API.

## Deploy

1. Create a MySQL-compatible TiDB Cloud Starter instance and run `schema.tidb.sql` in the `Food` database.
2. Deploy this folder as a Node web service.
3. Set `MYSQL_HOST`, `MYSQL_PORT`, `MYSQL_USER`, `MYSQL_PASSWORD`, `MYSQL_DATABASE`, `MYSQL_SSL=true`, and `JWT_SECRET` as environment variables.
4. Use `npm ci` to build and `npm start` to run.

Never commit a `.env` file or database password.
