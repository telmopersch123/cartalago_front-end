#frontend/Dockerfile
FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./

RUN npm install
COPY . .

RUN npm run build

# Servir os arquivos estáticos com nginx
FROM nginx:alpine
COPY --from=build /app/dist/pratic_final /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
