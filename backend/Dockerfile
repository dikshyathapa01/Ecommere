#Node Js Install
#project setup
#packages install
#build
#run

#Use official Noje.js LTS image as the base image
FROM node:22-alpine
#Set the working directory inside the container
WORKDIR /app
#Copy package.json and package-lock.json to the working directory
COPY package*json ./

#Install project dependencies
RUN npm install
#Install frontend dependencies
COPY frontend/package*.json ./frontend/
RUN npm install --prefix frontend
#Copy the rest of the application code to the working directory
COPY . .
#Build the backend and frontend
RUN npm run build
RUN npm --prefix frontend run build
#Expose the port the app runs on 
EXPOSE 3000
#Start Application
CMD ["node","dist/main.js"]