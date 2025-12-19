# Dockerfile para Frontend React Vite
FROM node:20-alpine

# Crear directorio de trabajo
WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Copiar el resto de archivos
COPY . .

# Exponer puerto de Vite
EXPOSE 5173

# Comando de inicio (desarrollo)
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
