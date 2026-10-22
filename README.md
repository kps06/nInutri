# nInutri

Smart raw-food analysis app with secure account login, nutrition history, and a MySQL-backed API.

## Deploy

1. Create a private MySQL service and run `schema.sql`.
2. Deploy this folder as a Node web service.
3. Set `MYSQL_HOST`, `MYSQL_PORT`, `MYSQL_USER`, `MYSQL_PASSWORD`, `MYSQL_DATABASE`, and `JWT_SECRET` as environment variables.
4. Use `npm ci` to build and `npm start` to run.

Never commit a `.env` file or database password.
