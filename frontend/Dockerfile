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

# Accept build arguments for React environment variables
ARG PUBLIC_URL=/
ARG REACT_APP_API_URL
# Note: Supabase anon keys are designed to be client-side public keys
# They are meant to be embedded in frontend applications
# Security is provided by Row Level Security (RLS) policies, not by hiding the key
ARG REACT_APP_SUPABASE_URL
ARG REACT_APP_SUPABASE_ANON_KEY
ARG REACT_APP_SITE_URL

# Set environment variables for the build
ENV PUBLIC_URL=$PUBLIC_URL
ENV REACT_APP_API_URL=$REACT_APP_API_URL
ENV REACT_APP_SUPABASE_URL=$REACT_APP_SUPABASE_URL
ENV REACT_APP_SUPABASE_ANON_KEY=$REACT_APP_SUPABASE_ANON_KEY
ENV REACT_APP_SITE_URL=$REACT_APP_SITE_URL

# SECURITY NOTE: For production deployments with truly sensitive keys:
# - Use Docker BuildKit secrets: --mount=type=secret,id=mykey
# - Use multi-stage builds with secret mounting
# - Use CI/CD secret management (GitHub Secrets, etc.)
# - However, Supabase anon keys are specifically designed to be client-side# Build the React application
RUN npm run build

# Install serve to run the production build
RUN npm install -g serve

# Expose the port the app runs on
EXPOSE 3000

# Define the command to run the application
CMD ["serve", "-s", "build", "-l", "3000"]