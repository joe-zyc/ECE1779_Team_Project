FROM node:22
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

EXPOSE 8080

CMD ["sh", "-c", "npm run build && npm run preview -- --host 0.0.0.0 --port ${PORT:-8080} --strictPort"]
