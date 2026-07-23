# Servicelink.net.au

Marketing site and admin for [servicelink.net.au](https://servicelink.net.au).

## Apps

| App | Path | Default port |
| --- | --- | --- |
| Public site | `web/` | 3000 |
| Admin | `admin/` | 3001 |

## Local development

```bash
# Public site
cd web
cp .env.example .env   # if present
npm install
npm run dev

# Admin
cd admin
cp .env.example .env   # if present
npm install
npm run dev
```

Both apps expect PostgreSQL via `DATABASE_URL`.

## Repository

https://github.com/Servicelink360/Servicelink.net.au
