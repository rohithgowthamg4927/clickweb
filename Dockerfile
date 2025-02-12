# Use a lightweight Node.js image
FROM node:18-alpine

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install --only=production

# Copy server files
COPY src/server.js ./src/server.js

# Expose the port the server will run on
EXPOSE 5000

# Command to run the server
CMD ["node", "src/server.js"]
