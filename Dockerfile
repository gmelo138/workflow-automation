# Use the official Node.js image
FROM node:22

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy only the package.json and package-lock.json files
COPY package*.json ./

# Install the dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Expose the application port
EXPOSE 3000

# Command to run the application
CMD ["npm", "run", "start"]