# Use a versão oficial do Node.js
FROM node:22

# Defina o diretório de trabalho na imagem
WORKDIR /usr/src/app

# Copie apenas os arquivos necessários para instalar as dependências
COPY package*.json ./

# Instale as dependências
RUN npm install

# Copie todo o código da aplicação
COPY . .

# Exponha a porta usada pela aplicação
EXPOSE 3000

# Instrução padrão ao rodar a aplicação (alterada para ser manual neste caso)
CMD ["npm", "run", "start:dev"]
