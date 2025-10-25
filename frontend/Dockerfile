# Use the official Node.js 20 Alpine image (required for Vite 7.1.12+)
FROM node:20-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json (if available)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Accept build arguments for Vite environment variables
ARG VITE_API_URL
ARG VITE_SITE_URL
ARG VITE_GITHUB_PAGES
ARG VITE_DEMO_MODE

# Set environment variables for the build
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_SITE_URL=$VITE_SITE_URL
ENV VITE_GITHUB_PAGES=$VITE_GITHUB_PAGES
ENV VITE_DEMO_MODE=$VITE_DEMO_MODE

# Build the React application
RUN npm run build

# Install serve to run the production build
RUN npm install -g serve

# Expose the port the app runs on
EXPOSE 3000

# Define the command to run the application
CMD ["serve", "-s", "build", "-l", "3000"]