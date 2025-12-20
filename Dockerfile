# Multi-stage build: build with Node, serve with NGINX

FROM node:18-alpine AS build
WORKDIR /app

# Install dependencies first (leverages Docker layer cache)
COPY package*.json ./
RUN npm ci

# Copy the rest of the project and build
COPY . .
RUN npm run build

FROM nginx:alpine AS runtime

# Copy built assets to NGINX html directory
COPY --from=build /app/dist /usr/share/nginx/html

# Expose port 80 by default
EXPOSE 80

# Default command provided by nginx image
CMD ["nginx", "-g", "daemon off;"]

