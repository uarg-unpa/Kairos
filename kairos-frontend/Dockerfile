# ── Stage 1: Build Angular app ──
FROM node:20-alpine AS build
WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./
RUN npm ci

# Copiar código fuente y compilar
COPY . .
RUN npm run build -- --configuration production

# ── Stage 2: Web Server Nginx ──
FROM nginx:alpine
WORKDIR /usr/share/nginx/html

# Limpiar archivos por defecto
RUN rm -rf ./*

# Copiar build de Angular
COPY --from=build /app/dist/kairos-frontend/browser /usr/share/nginx/html

# Copiar configuración de Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
