# Используем официальный образ Node.js 18
FROM node:18-alpine

# Устанавливаем рабочую директорию
WORKDIR /app

# Копируем ВСЕ файлы проекта
COPY . .

# Устанавливаем зависимости
RUN npm install --omit=dev

# Указываем команду запуска
CMD ["node", "main.js"]