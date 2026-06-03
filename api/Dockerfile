# Base image
FROM node:20-alpine

# Install openssl for Prisma client
RUN apk add --no-cache openssl bash

# Create app directory
WORKDIR /usr/src/app

# Copy dependency files
COPY package*.json ./

# Install dependencies (including devDependencies to build)
RUN npm install

# Copy application source
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build TypeScript code
RUN npm run build

# Make start.sh executable
RUN chmod +x start.sh

# Expose port
EXPOSE 3000

# Use start.sh to run migrations and start the server
CMD ["./start.sh"]
