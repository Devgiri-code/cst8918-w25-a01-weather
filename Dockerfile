# Base node image
FROM node:lts-alpine AS base

# Set environment variable for base and all layers that inherit from it
ENV NODE_ENV=production

# Create user and set ownership and permissions as required
RUN addgroup student && \
    adduser -D -H -g "student" -G student student && \
    mkdir /cst8918-a01 && \
    chown -R student:student /cst8918-a01

# Install all node_modules, including dev dependencies
FROM base AS deps

WORKDIR /cst8918-a01

ADD package.json ./
RUN npm install --include=dev

# Setup production node_modules
FROM base AS production-deps

WORKDIR /cst8918-a01

COPY --from=deps /cst8918-a01/node_modules /cst8918-a01/node_modules
ADD package.json ./
RUN npm prune --omit=dev

# Build the app
FROM base AS build

WORKDIR /cst8918-a01

COPY --from=deps /cst8918-a01/node_modules /cst8918-a01/node_modules
ADD . .
RUN npm run build

# Finally, build the production image with minimal footprint
FROM base

# Environment variables
ENV PORT=8080
ENV NODE_ENV=production
# BONUS: This should be injected at runtime from a secrets manager
# This will be reviewed in the next class
ENV WEATHER_API_KEY=15930e1ea895bfebc47d2cff78ab2550

WORKDIR /cst8918-a01

COPY --from=production-deps /cst8918-a01/node_modules /cst8918-a01/node_modules
COPY --from=build /cst8918-a01/build /cst8918-a01/build
COPY --from=build /cst8918-a01/public /cst8918-a01/public
COPY --from=build /cst8918-a01/package.json /cst8918-a01/package.json

# Set ownership and switch to non-root user
RUN chown -R student:student /cst8918-a01
USER student

# Start the application
CMD [ "/bin/sh", "-c", "./node_modules/.bin/remix-serve ./build/index.js" ]
