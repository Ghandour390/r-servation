# Reservation / EventHub 

## Présentation

Ce dépôt est un monorepo contenant :

- `api/` : backend NestJS avec Prisma (PostgreSQL), authentification (JWT), notifications, Redis et MinIO
- `client/` : frontend Next.js (port 4200)

## Démarrage rapide (Docker)

1. Préparez les variables d'environnement :

```bash
cp .env.example .env
cp api/.env.example api/.env
```

2. Construisez et lancez avec Docker Compose :

```bash
docker compose up --build
```

Services (local) :

- Client : http://localhost:4200
- API : http://localhost:5000
- Postgres : localhost:5434
- pgAdmin : http://localhost:5050
- MinIO : http://localhost:9000 (console : http://localhost:9001)
- Redis : localhost:6379

## Développement (sans Docker pour Node)

Si vous préférez exécuter les services Node localement tout en gardant la base de données et l'infra dans Docker :

1. Démarrez seulement les services requis :

```bash
docker compose up -d db redis minio
```

2. API (mode dev) :

```bash
cd api
npm ci
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
npm run start:dev
```

3. Client (mode dev) :

```bash
cd client
npm ci
npm run dev
```

## Remarques

- `NEXT_PUBLIC_API_URL` doit pointer vers l'URL de l'API accessible depuis le navigateur (par exemple `http://localhost:5000`).
- En Docker, `API_INTERNAL_URL` permet au serveur Next d'atteindre l'API via le réseau interne (par exemple `http://api:5000`).

## Seed (dev)

Script de seed : `api/prisma/seed.ts`

- Admin : `admin@reservation.com`
- Mot de passe : `Password123!`

## CI/CD

Workflow : `.github/workflows/ci.yml`

- Les tests s'exécutent sur toutes les branches.
- Le déploiement s'exécute uniquement sur `main` et nécessite les secrets Docker Hub :
  - `DOCKERHUB_USERNAME`
  - `DOCKERHUB_TOKEN`

## Dépannage

- Si les migrations échouent, vérifiez la connectivité à la base de données et les valeurs dans `.env`.
- Pour les problèmes Prisma/DB, exécutez `npm run prisma:generate` et `npm run prisma:migrate` dans `api/`.

---

Pour plus de détails, consultez les dossiers `api/` et `client/` et leurs README respectifs.
