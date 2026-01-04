# Backend Dockerfile
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including devDependencies for build)
RUN npm ci

# Copy source code
COPY . .

# Copy scripts (needed for migrations) - copy before build
COPY scripts ./scripts

# Build TypeScript
RUN npm run build

# Install production dependencies only
RUN npm ci --only=production

# Expose port
EXPOSE 3001

# Start the server (migrations disabled - already in DB)
CMD ["npm", "start"]
