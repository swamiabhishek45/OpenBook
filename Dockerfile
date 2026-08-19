FROM node:20-alpine

# Install openssl for Prisma engines
RUN apk add --no-cache openssl

WORKDIR /app

# Copy dependency definitions and Prisma schema
COPY server/package*.json ./
COPY server/.npmrc* ./
COPY server/prisma ./prisma/
COPY server/prisma.config.ts ./
COPY server/tsconfig.json ./

# Install dependencies with legacy peer deps to bypass mem0ai strict pg peer version
RUN npm install --legacy-peer-deps

# Copy server source code
COPY server/src ./src

# Generate Prisma client and build TypeScript
RUN npx prisma generate
RUN npm run build

# Expose application port
EXPOSE 8081

ENV NODE_ENV=production
ENV PORT=8081

# Run the compiled backend server
CMD ["npm", "start"]
