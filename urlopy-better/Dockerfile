FROM node:20.3.1 AS deps
WORKDIR /app
COPY package*.json .
ARG NODE_ENV
ENV NODE_ENV $NODE_ENV
RUN npm install

# Stage 2: build
FROM node:20.3.1 AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV DATABASE_URL "postgres://postgres:password@db:5432/postgres"
ENV NEXTAUTH_SECRET "secret"
ENV NEXTAUTH_URL "http://localhost:3000"
ENV GOOGLE_CLIENT_ID "id"
ENV GOOGLE_CLIENT_SECRET "secret"
RUN npx prisma generate
RUN npm run build

# Stage 3: run
FROM node:20.3.1
WORKDIR /app
COPY --from=builder /app/ .
EXPOSE 3000

CMD ["npm", "run", "start"]