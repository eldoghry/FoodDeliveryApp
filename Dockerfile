FROM node:20.18.1 as base

FROM base as development

WORKDIR /app
COPY package.json .
RUN npm install
COPY . .
EXPOSE 4000
CMD [ "npm","run", "dev" ]

FROM base as production

WORKDIR /app
COPY package.json .
RUN npm install --only-production
COPY . .
RUN npm run build
EXPOSE 4000
CMD [ "npm", "start" ]