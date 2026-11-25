FROM node:20-alpine
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install --ignore-scripts --no-audit --no-fund
COPY . .
RUN npx prisma generate
RUN npm run build
# entrypoint.sh da duoc copy cung voi "COPY . ." o tren.
RUN chmod +x ./entrypoint.sh
EXPOSE 3001
CMD ["./entrypoint.sh"]
