FROM node:18-alpine
WORKDIR /app
COPY . .
RUN npm install dotenv
RUN npm install
RUN npm run build
RUN cp .env.local .next/standalone/
RUN cp -r .next/static .next/standalone/.next/static
CMD ["node", ".next/standalone/server.js"]