# Fetching the minified node image on apline linux
FROM node:latest

# Declaring env
ENV NODE_ENV development

# Setting up the work directory
WORKDIR /server



# Copying all the files in our project
COPY . .

# Installing dependencies
RUN npm install

# Starting our application
CMD [ "node", "index.js" ]

# Exposing server port
EXPOSE 5000



