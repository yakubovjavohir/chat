# 1. Rasmiy Node image
FROM node:22

# 2. Ishchi papkani belgilang
WORKDIR /app

# 3. package.json va package-lock.json fayllarni kopiyalang
COPY package*.json ./

# 4. `node_modules` ni kechikmasdan install qiling
RUN npm install --production

# 5. Qolgan fayllarni kopiyalang (src, tsconfig va h.k.)
COPY . .

# 6. Build qilish
RUN npm run build

# 7. Port ochish
EXPOSE 3000

# 8. Appni ishga tushirish
CMD ["node", "dist/main"]
