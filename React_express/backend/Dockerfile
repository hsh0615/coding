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

# 暴露應用所使用的端口
EXPOSE 5000

# 啟動應用程式
CMD ["npm", "start"]
