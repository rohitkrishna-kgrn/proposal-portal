# Use Node.js 24 as the base image
FROM node:24

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json (if exists) and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the application code
COPY . .

# Expose the port your app runs on
EXPOSE 5000

# Start the application
CMD ["npm", "start"]