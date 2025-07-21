FROM node:22

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

# Bu fayl loyihangiz ichida: ./config/filebase/ ichida turishi kerak!
COPY src/config/filebase/nolbir-io-4464-58b8d-firebase-adminsdk-fbsvc-9306551fc8.json ./src/config/filebase/

RUN npm run build

EXPOSE 3000

CMD ["node", "dist/main"]
