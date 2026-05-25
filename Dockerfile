# syntax=docker/dockerfile:1

# ---------- Stage 1: build ----------
# Compila a app Nuxt/Nitro gerando o bundle standalone em `.output`.
FROM node:22-slim AS builder

WORKDIR /app

# Força o preset de servidor Node (Cloud Run roda um container long-running,
# não funções). Evita que uma auto-detecção de plataforma escolha outro preset.
ENV NITRO_PRESET=node-server

# Instala dependências primeiro (camada cacheável). `--ignore-scripts` evita
# rodar o postinstall (`nuxt prepare`) antes do código-fonte existir — o
# `nuxt build` já faz a preparação necessária.
#
# Usamos `npm install` (e não `npm ci`): o package-lock.json tem uma
# inconsistência de origem do npm com deps transitivas de pacotes opcionais
# (ex.: svgo→commander), que faz o `npm ci` falhar mesmo numa resolução limpa
# em Linux. O `npm install` reconcilia o lockfile e instala normalmente.
COPY package.json package-lock.json ./
RUN npm install --no-audit --no-fund --ignore-scripts

# Copia o restante do código e gera o build de produção.
COPY . .
RUN npm run build

# ---------- Stage 2: runtime ----------
# Imagem final enxuta: só o `.output` (Nitro empacota o que precisa de node_modules).
FROM node:22-slim AS runner

WORKDIR /app

ENV NODE_ENV=production \
    # Cloud Run injeta PORT (default 8080). Nitro escuta em process.env.PORT.
    PORT=8080 \
    HOST=0.0.0.0

# Roda como usuário sem privilégios (já existe na imagem oficial do Node).
USER node

COPY --chown=node:node --from=builder /app/.output ./.output

EXPOSE 8080

CMD ["node", ".output/server/index.mjs"]
