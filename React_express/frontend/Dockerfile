# 使用官方 Node.js 基礎映像
FROM node:16

# 設置工作目錄
WORKDIR /app

# 複製 package.json 和 package-lock.json 到工作目錄
COPY package*.json ./

# 安裝依賴
RUN npm install

# 複製其餘的應用程式代碼
COPY . .

# 編譯前端應用程式
RUN npm run build

# 使用 nginx 作為前端靜態資源伺服器
FROM nginx:alpine
COPY --from=0 /app/build /usr/share/nginx/html

# 暴露 Nginx 預設的 80 端口
EXPOSE 80
