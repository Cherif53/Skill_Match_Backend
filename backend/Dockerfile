# ===========================
#  STAGE 1: BUILD
# ===========================
FROM node:20-alpine AS build
WORKDIR /app

# Copie des fichiers nécessaires
COPY package*.json ./
RUN npm install

# Copie du code source
COPY . .

# Build du projet NestJS (compile TypeScript -> dist/)
RUN npm run build

# ===========================
#  STAGE 2: RUN
# ===========================
FROM node:20-alpine
WORKDIR /app

# Copier les fichiers utiles depuis le build
COPY --from=build /app/dist ./dist
COPY --from=build /app/package*.json ./
COPY --from=build /app/wait-for-db.sh ./wait-for-db.sh

# Installer uniquement les dépendances prod + netcat pour le wait-for-db
RUN npm install --omit=dev && apk add --no-cache netcat-openbsd
RUN chmod +x wait-for-db.sh

EXPOSE 3000

CMD ["./wait-for-db.sh", "node", "dist/main.js"]
