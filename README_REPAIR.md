# SkillMatch — Repair Kit (TypeORM)

## 1) Remplacer/ajouter ces fichiers
Copie le contenu de ce dossier **par dessus ton repo** en respectant les chemins.

## 2) Désinstaller Prisma s'il est présent
```
cd backend
npm remove prisma @prisma/client
rm -rf prisma
```

## 3) Installer les deps et relancer
```
cp .env.example .env
docker compose down -v
docker system prune -a --volumes -f
docker compose up -d

npm install
npm run start:dev
```
Tu devrais voir `API on http://localhost:3000`.

## 4) Tests rapides (après login/register)
- `GET /documents/presign?key=docs/id.jpg&contentType=image/jpeg` (Bearer)
- `POST /documents` `{ "name":"CNI", "url":"http://localhost:9000/skillmatch/docs/id.jpg" }` (Bearer)
- `GET /documents/me` (Bearer)
- `DELETE /documents/:id` (Bearer)
