# ============================================================
# Frontend Dockerfile (React + Vite, served by Nginx)
# ------------------------------------------------------------
# A Dockerfile is a "recipe" Docker follows to build an IMAGE.
#
# This one is a "multi-stage build" (two FROM lines = two stages):
#   Stage 1 "build": use Node.js to turn our React code into plain
#                    HTML, CSS and JavaScript files.
#   Stage 2 "serve": copy ONLY those finished files into a small
#                    Nginx web server image.
# The final image has no Node.js, no node_modules and no source
# code. It is much smaller and gives an attacker less to work with.
#
# Build and run it with docker-compose.yml (one folder up).
# ============================================================


# ---------- Stage 1: build the React app ----------

# Start from the official Node.js 22 image.
# "alpine" = built on Alpine Linux, a very small Linux.
# "AS build" gives this stage a name, so Stage 2 can copy from it.
FROM node:22-alpine AS build

# Set the working folder inside the image to /app.
# Docker creates the folder if needed, and the commands below run here.
WORKDIR /app

# Copy package.json and package-lock.json into /app.
# ("package*.json" matches both files.)
# Why copy these BEFORE the code? Docker saves each step as a "layer"
# and reuses it if nothing changed. Our packages change rarely, so
# when we only edit our React code, Docker skips "npm ci" below.
COPY package*.json ./

# Install the exact package versions written in package-lock.json.
# Here we need ALL packages, including devDependencies, because
# Vite (a devDependency) is the tool that builds our app.
# That is fine: this stage is thrown away at the end.
RUN npm ci

# Copy the rest of the frontend project (src, index.html,
# vite.config.js, ...) into /app.
# First "."  = the frontend folder on your computer.
# Second "." = the current folder in the image (/app).
# Anything listed in .dockerignore (node_modules, .env, ...) is skipped.
COPY . .

# Build the app for production. Vite creates the final
# HTML, CSS and JS files in the /app/dist folder.
RUN npm run build


# ---------- Stage 2: serve the built files with Nginx ----------

# Start a NEW, clean image from the official Nginx web server
# (small alpine version). Nothing from Stage 1 comes with us,
# except what we copy on purpose in the next line.
FROM nginx:alpine

# Copy the built files from the "build" stage into the folder
# where Nginx looks for website files by default.
COPY --from=build /app/dist /usr/share/nginx/html

# Say that Nginx listens on port 80 (the normal HTTP port) inside
# the container. This is only documentation: it does NOT open the
# port on your computer. The "ports" line in docker-compose.yml
# ("3000:80") does that.
EXPOSE 80

# The command that runs when the container starts: start Nginx.
# "-g 'daemon off;'" keeps Nginx running in the foreground.
# A container only stays alive while its main program is running.
# If Nginx moved itself to the background, Docker would think it
# had finished and would stop the container.
CMD ["nginx", "-g", "daemon off;"]
