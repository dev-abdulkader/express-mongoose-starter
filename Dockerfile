# Stage 1: Build image
FROM node:23-slim AS build

WORKDIR /app
COPY package*.json ./

# Install all dependencies (including devDependencies)
RUN npm install

# Copy source files
COPY . .

# Build TypeScript code
RUN npm run build

# Stage 2: Production image
FROM node:23-slim

WORKDIR /app
COPY package*.json ./ 

# Install only production dependencies
RUN npm install --production

# Copy the built files from the build stage
COPY --from=build /app/dist /app/dist

# Copy the .env file into the container
COPY .env ./

# Copy the uploads folder into the container (optional if you want to include it)
COPY ./uploads /app/uploads

# Expose port
EXPOSE 5001

# Start the application
CMD ["npm", "start"]
