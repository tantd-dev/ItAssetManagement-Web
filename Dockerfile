FROM node:22-bookworm-slim AS base

WORKDIR /app
ENV COREPACK_HOME=/tmp/corepack
ENV NEXT_TELEMETRY_DISABLED=1

RUN corepack enable && corepack prepare yarn@1.22.22 --activate

FROM base AS dependencies

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

FROM dependencies AS build

# NEXT_PUBLIC_* values are inlined into the client bundle at build time, so the public API URL
# has to be known here: changing it later means rebuilding the image.
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}

COPY . .
RUN yarn build

FROM base AS runtime

ENV NODE_ENV=production

# `next start` loads next.config.ts, which needs typescript (a devDependency), so the full
# node_modules is kept.
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/.next ./.next
COPY --from=build /app/public ./public
COPY --from=build /app/package.json /app/next.config.ts ./

USER node
EXPOSE 3000

CMD ["node", "node_modules/next/dist/bin/next", "start"]
