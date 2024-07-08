# Use uma imagem base do Node.js estável
FROM node:20.15.0

# Criação de diretório de trabalho
WORKDIR /app

# Instalação de dependências usando pnpm
COPY package.json pnpm-lock.yaml ./

RUN npm install -g pnpm@latest && pnpm install --prod

# Copia o código-fonte para o contêiner
COPY . .

# Compilação do código TypeScript (assumindo que já foi transpilado)
RUN pnpm run build

# Expor a porta que o aplicativo utilizará
EXPOSE 3032

# Comando para executar o aplicativo
CMD ["pnpm","run", "start"]

