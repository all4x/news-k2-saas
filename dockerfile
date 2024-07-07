
# Use uma imagem base adequada para seu aplicativo Node.js
FROM node:20.15.0

# Configuração do ambiente
ENV NIXPACKS_PATH /app/node_modules/.bin:$NIXPACKS_PATH

# Configuração de diretório de trabalho
WORKDIR /app

# Copiar package.json e pnpm-lock.yaml para o contêiner
COPY package.json pnpm-lock.yaml ./

# Instalar dependências usando pnpm com --frozen-lockfile
RUN --mount=type=cache,id=dL67lOCPOLk-/root/local/share/pnpm/store/v3,target=/root/.local/share/pnpm/store/v3 \
  pnpm install --frozen-lockfile

# Copiar o restante do código-fonte para o contêiner
COPY . .

# Comando de inicialização do aplicativo
CMD [ "node", "dist/index.js" ]
