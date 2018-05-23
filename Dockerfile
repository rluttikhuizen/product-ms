FROM node:latest
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app
COPY src/api/product/package.json /usr/src/app/
RUN npm install
COPY ./src/api/product/ /usr/src/app/
EXPOSE 3000
CMD [ "npm", "start" ]
