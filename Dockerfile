FROM node:22-bookworm-slim

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

ENV NODE_ENV=production
EXPOSE 3000

CMD ["npm", "run", "start"]