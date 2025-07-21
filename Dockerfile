FROM node:22

WORKDIR /app

COPY package*.json ./

# ❗ bu yerda --production NI olib tashlaymiz
RUN npm install

COPY . .

COPY config/filebase/nolbir-io-4464-58b8d-firebase-adminsdk-fbsvc-9306551fc8.json ./config/filebase/

# ❗ bu yerda nest topiladi (chunki endi o‘rnatilgan)
RUN npm run build

EXPOSE 3000

CMD ["node", "dist/main"]
