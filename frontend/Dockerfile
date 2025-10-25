# Use the official Node.js 18 Alpine image
FROM node:18-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json (if available)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Accept build arguments for non-sensitive React environment variables only
ARG PUBLIC_URL=/
ARG REACT_APP_API_URL

# Set environment variables for the build (non-sensitive only)
ENV PUBLIC_URL=$PUBLIC_URL
ENV REACT_APP_API_URL=$REACT_APP_API_URL

# Note: Sensitive environment variables (SUPABASE keys, etc.) should be
# provided through build secrets or external configuration in production.
# For local development, they're loaded from .env files during build.

# Build the React application
RUN npm run build

# Install serve to run the production build
RUN npm install -g serve

# Expose the port the app runs on
EXPOSE 3000

# Define the command to run the application
CMD ["serve", "-s", "build", "-l", "3000"]