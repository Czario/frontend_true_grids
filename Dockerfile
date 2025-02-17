# Development stage
FROM node:20-alpine AS development

WORKDIR /usr/src/app

COPY package.json ./
COPY package-lock.json ./

RUN npm install

COPY . .

RUN npm install

# Production stage
FROM node:20-alpine AS production

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

WORKDIR /usr/src/app

COPY package.json ./
COPY package-lock.json ./

RUN npm install --frozen-lockfile --only=production

COPY --from=development /usr/src/app/.next ./.next
COPY --from=development /usr/src/app/public ./public

EXPOSE 4000

CMD ["npm", "start"]