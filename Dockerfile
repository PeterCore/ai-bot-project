# 使用官方 Node LTS 版本镜像
FROM node:20.18

# 在容器内创建并切换到工作目录
WORKDIR /app

# 复制 package.json 和 package-lock.json (如果有) 先行安装依赖
COPY package*.json ./

RUN npm install

# 复制全部项目文件
COPY . .

RUN npx prisma generate

# 构建
RUN npm run build

# 验证 bcrypt 或 bcryptjs 安装
RUN node -e "require('bcrypt');" || node -e "require('bcryptjs');"

# 暴露应用端口
EXPOSE 3000

# 启动命令
CMD ["npm", "run", "start:prod"]
