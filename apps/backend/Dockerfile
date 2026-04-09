# Build context must be the monorepo root so libs/shared-types is accessible.
# Build with: docker build -f apps/backend/Dockerfile -t calorie-tracker-backend .

# ─── Stage 1: Builder ────────────────────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app

# Copy workspace manifests first for layer caching
COPY package.json package-lock.json tsconfig.base.json ./

# Copy backend and shared libs
COPY apps/backend/ ./apps/backend/
COPY libs/ ./libs/

# Install all dependencies (dev included — needed for nest build)
RUN npm ci --workspace=apps/backend

# Generate Prisma client
RUN cd apps/backend && npx prisma generate

# Compile TypeScript
RUN cd apps/backend && npm run build

# ─── Stage 2: Runner ─────────────────────────────────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# Copy workspace manifests for production install
COPY package.json package-lock.json ./
COPY apps/backend/package.json ./apps/backend/

# Install production dependencies only
RUN npm ci --workspace=apps/backend --omit=dev

# Copy Prisma schema (required for migrate deploy at startup)
COPY apps/backend/prisma/ ./apps/backend/prisma/

# Regenerate Prisma client in production node_modules
RUN cd apps/backend && npx prisma generate

# Copy compiled output from builder
COPY --from=builder /app/apps/backend/dist ./apps/backend/dist

EXPOSE 3000

# Run pending migrations then start the server
CMD ["sh", "-c", "cd apps/backend && npx prisma migrate deploy && node dist/apps/backend/src/main.js"]
