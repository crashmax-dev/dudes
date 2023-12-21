# Dudes

<a alt="Nx logo" href="https://nx.dev" target="_blank" rel="noreferrer"><img src="https://raw.githubusercontent.com/nrwl/nx/master/images/nx-logo.png" width="45"></a>

✨ **This workspace has been generated by [Nx, Smart Monorepos · Fast CI.](https://nx.dev)** ✨


## Start the app

1. Copy env `cp .env.example .env`
2. Run `npm run dev`.

http://localhost:4200 - admin panel frontend
http://localhost:3000 - admin panel backend
http://localhost:4300 - client

## Run migration

Run `npm run db:migrate`

## Linters

Run `npm run lint`

## Environment

| Variable name           | Variable description         | Example                                                            |
|-------------------------|------------------------------|--------------------------------------------------------------------|
| ORIGIN                  | Application base url         | http://localhost:4200                                              |
| TWITCH_CLIENT_ID        | Oauth2 twitch client id      | lvit12o5wp2dtuysbjvikog7mf39jz                                     |
| TWITCH_CLIENT_SECRET    | Oauth2 twitch client secret  | 38r88n280n85fw16rfb4sohl8k2v4f                                     |
| TWITCH_CALLBACK_URL     | Oauth2 twitch client secret. | http://localhost:3000/auth/callback                                |
| SESSION_SECRET          | A secret string.             | asioda...                                                          |
| DATABASE_URL            | PG DB connection URL         | postgresql://dudes:dudes@home-studio.work:6969/dudes?schema=public |
| VITE_CJS_IGNORE_WARNING | AVOID CJS WARNING            | true                                                               |
