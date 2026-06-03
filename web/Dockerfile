# Stage 1: Build
FROM node:20-alpine AS build

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install

COPY . .

# Receive build argument for API URL and set it as env variable for Vite
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

# Build the Vite application
RUN npm run build

# Stage 2: Production Server
FROM nginx:1.25-alpine

# Copy build assets to Nginx html directory
COPY --from=build /usr/src/app/dist /usr/share/nginx/html

# Copy custom Nginx configuration for React routing support
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose Nginx port
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
