FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --legacy-peer-deps
COPY . .

# Client-side PUBLIC_ vars must be baked into the JS bundle at build time.
# Pass these from CI/CD via --build-arg.
ARG PUBLIC_STORE_API
ARG PUBLIC_PRODUCT_API
ARG PUBLIC_USER_API
ARG PUBLIC_ORDER_API
ARG PUBLIC_PAYMENT_API
ENV PUBLIC_STORE_API=$PUBLIC_STORE_API
ENV PUBLIC_PRODUCT_API=$PUBLIC_PRODUCT_API
ENV PUBLIC_USER_API=$PUBLIC_USER_API
ENV PUBLIC_ORDER_API=$PUBLIC_ORDER_API
ENV PUBLIC_PAYMENT_API=$PUBLIC_PAYMENT_API

RUN npm run build

FROM node:22-alpine AS runner
ENV NODE_ENV=production
ENV HOST=0.0.0.0
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./
RUN npm ci --omit=dev --legacy-peer-deps
EXPOSE 3000
CMD ["node", "dist/server/entry.mjs"]
