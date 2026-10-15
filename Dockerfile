FROM node:22-bookworm-slim AS build

WORKDIR /app

RUN apt-get update \
	&& apt-get install -y --no-install-recommends openssl \
	&& rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm ci

COPY prisma ./prisma
COPY prisma.config.ts tsconfig.json index.js ./
COPY src ./src
COPY public ./public

RUN npx prisma generate

FROM node:22-bookworm-slim AS runtime

WORKDIR /app

RUN apt-get update \
	&& apt-get install -y --no-install-recommends openssl \
	&& rm -rf /var/lib/apt/lists/* \
	&& groupadd --system app \
	&& useradd --system --gid app --create-home app

COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package*.json ./
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/prisma.config.ts /app/tsconfig.json /app/index.js ./
COPY --from=build /app/src ./src
COPY --from=build /app/public ./public

RUN mkdir -p /app/public/uploads \
	&& chown -R app:app /app

ENV NODE_ENV=production
EXPOSE 3000

USER app

HEALTHCHECK --interval=10s --timeout=5s --start-period=30s --retries=10 \
	CMD node -e "fetch('http://127.0.0.1:3000/api/health').then(r => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"

CMD ["npm", "run", "start"]