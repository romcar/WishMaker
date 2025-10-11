# Use the official Node.js 18 Alpine image
FROM node:18-alpine

# Install build dependencies for native modules
RUN apk add --no-cache python3 make g++

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json (if available)
COPY package*.json ./

# Install dependencies and rebuild native modules
RUN npm ci && npm rebuild bcrypt

# Copy the rest of the application code (excluding node_modules)
COPY src ./src
COPY tsconfig.json ./

# Build the TypeScript application
RUN npm run build

# Expose the port the app runs on
EXPOSE 8000

# Define the command to run the application
CMD ["npm", "start"]