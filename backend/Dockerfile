# ============================================================
# Backend Dockerfile (Node.js + Express API)
# ------------------------------------------------------------
# A Dockerfile is a "recipe". Docker reads it from top to bottom
# and builds an IMAGE: a packed box with a small Linux system,
# Node.js, our npm packages and our code.
# A running copy of an image is called a CONTAINER.
#
# Build and run it with docker-compose.yml (one folder up).
# ============================================================

# Start from the official Node.js 22 image (from Docker Hub).
# "alpine" means it is built on Alpine Linux, a very small Linux.
# Small image = faster download and fewer extra programs that
# could have security problems.
FROM node:22-alpine

# Set the working folder inside the image to /app.
# Docker creates the folder if it does not exist.
# All the commands below run inside this folder.
WORKDIR /app

# Copy package.json and package-lock.json into /app.
# ("package*.json" matches both files.)
# Why copy these BEFORE the code? Docker saves the result of each
# step as a "layer" and reuses it next time if nothing changed.
# Our packages change rarely, so when we only edit server.js,
# Docker skips the slow "npm ci" step below. Faster rebuilds!
COPY package*.json ./

# Install the exact package versions written in package-lock.json.
# "npm ci" = clean install, made for automated builds.
# "--omit=dev" = do not install devDependencies (tools we only need
# while developing). Fewer packages = smaller image and fewer
# possible vulnerabilities.
RUN npm ci --omit=dev

# Copy our application code into /app.
# "--chown=node:node" makes the user "node" the owner of this file.
# (The official Node image already has a normal user called "node".)
# node_modules stays owned by root, so the app can READ its packages
# but cannot change them.
COPY --chown=node:node server.js ./

# From now on, run as the normal user "node", not as "root" (admin).
# Security: if an attacker breaks into our app, they only get a
# limited user, not full admin power inside the container.
USER node

# Say that the API listens on port 5000 inside the container.
# This is only documentation: it does NOT open the port on your
# computer. The "ports" line in docker-compose.yml does that.
EXPOSE 5000

# The command that runs when the container starts.
# "npm start" runs the "start" script from package.json: node server.js
# The [ "...", "..." ] form starts the program directly (no extra
# shell), so it receives the stop signal when we stop the container.
# Note: there is NO .env file inside this image (see .dockerignore).
# docker-compose.yml gives the database settings to the container
# as environment variables when it starts.
CMD ["npm", "start"]
