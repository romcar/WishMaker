# Use the official Node.js 20 Alpine image (required for Vite 7.1.12+)
FROM node:20-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json (if available)
COPY package*.json ./

# Install dependencies
RUN npm install

# Install dotenvx globally via npm (more reliable than shell script)
RUN npm install -g @dotenvx/dotenvx

# Copy environment files first
COPY .env.* ./

# Copy the rest of the application code
COPY . .

# Load environment variables and build the React application
RUN export $(dotenvx run --env-file=.env.development -- printenv | grep ^VITE_ | xargs) && npm run build

# Install serve to run the production build
RUN npm install -g serve

# Expose the port the app runs on
EXPOSE 3000

# Define the command to run the application
CMD ["dotenvx", "run", "--env-file=.env.development", "--", "serve", "-s", "build", "-l", "3000"]