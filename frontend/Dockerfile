FROM node:20 AS build

WORKDIR /frontend

COPY package.json package-lock.json ./
RUN npm install

COPY . .

RUN npm run build

RUN npm install -g serve

EXPOSE 3000

CMD ["serve", "-s", "dist", "-l", "3000"]