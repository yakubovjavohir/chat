FROM node:22

WORKDIR /app

COPY package*.json ./

# ❗ bu yerda --production NI olib tashlaymiz
RUN npm install

COPY . .

# ❗ bu yerda nest topiladi (chunki endi o‘rnatilgan)
RUN npm run build

EXPOSE 3000

CMD ["node", "dist/main"]
