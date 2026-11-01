# FS Training Tracker

Training diary for freestyle football. Sign-in uses an FSMeet profile.

## Stack

- Next.js on port **3005**
- FSMeet OAuth (Authorization Code + PKCE)
- MariaDB for synced sessions, IndexedDB on the phone
- Docker / GitHub Actions → Docker Hub (`nilsfs7/fsmeet-training`)

## Local development

```bash
cp .env.example .env
docker compose up -d mysql adminer
npm install
npm run dev
```

Open `http://localhost:3005`. Adminer is on port `6080`. From the host, MariaDB is `127.0.0.1:3309`. Inside Compose it is `mysql:3306`.

The dev server talks to the staging FSMeet API (`https://api.dev.fsmeet.dffb.org/v1`) unless `FSMEET_API_URL` says otherwise.
