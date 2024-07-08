# Etapa 1: Compilação
FROM node:20.15.0 AS build

# Definir diretório de trabalho
WORKDIR /app

# Copiar arquivos de dependências
COPY package.json pnpm-lock.yaml ./

# Instalar pnpm e dependências de produção e desenvolvimento
RUN npm install -g pnpm@latest && pnpm install

# Copiar o restante do código
COPY . .

# Compilar o código TypeScript
RUN pnpm run build

# Verificar conteúdo da pasta dist após compilação
RUN ls -la /app/dist/

# Etapa 2: Execução
FROM node:20.15.0

# Definir diretório de trabalho
WORKDIR /app

# Copiar somente os artefatos necessários da etapa de compilação
COPY --from=build /app .

# Instalar apenas as dependências de produção
RUN npm install -g pnpm@latest && pnpm install --prod

# Verificar conteúdo da pasta dist no contêiner final
RUN ls -la /app/dist

# Expor a porta que o aplicativo utilizará
EXPOSE 3032

# Definir a variável de ambiente NODE_ENV como produção
ENV NODE_ENV=production

# Comando para executar o aplicativo
CMD ["node", "./dist/src/index.js"]

