FROM node:alpine AS BUILDER

WORKDIR /src

ADD package.json package-lock.json ./
RUN npm install --build-from-source

FROM node:alpine

WORKDIR /src

COPY --from=BUILDER /src/node_modules ./node_modules
COPY package.json ./
COPY src ./src

CMD ["npm", "start"]
