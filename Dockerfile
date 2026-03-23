FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install --production

COPY . .

EXPOSE 3000

CMD ["node", "app.js"]

# That's it — kept intentionally simple. Here's what each line does:

# - **`FROM node:20-alpine`** — Uses Node 20 on Alpine Linux. Alpine is a lightweight distro (~5MB vs ~900MB for the full image), perfect for production.
# - **`WORKDIR /app`** — All commands from here on run inside `/app` inside the container.
# - **`COPY package*.json ./`** — Copies both `package.json` and `package-lock.json` first, *before* your app code. This is intentional — see below.
# - **`RUN npm install --production`** — Installs only production dependencies (skips `devDependencies`). Smaller, faster image.
# - **`COPY . .`** — Now copies your actual app code.
# - **`EXPOSE 3000`** — Documents that the app listens on port 3000. Doesn't actually open the port — `docker-compose.yml` does that.
# - **`CMD ["node", "app.js"]`** — Starts your app. Replace `app.js` with whatever your entry file is if it's named differently (e.g. `server.js`, `index.js`).

# ---

# ### Why copy `package.json` before the rest of the code?

# Docker builds in **layers** and caches each one. If you copy everything at once and then run `npm install`, Docker re-runs `npm install` every time *any* file changes — even a typo in a template.

# By copying `package.json` first, Docker only re-runs `npm install` when your dependencies actually change. Everything else uses the cache. Builds go from ~30s to ~2s on repeat runs.

# ---

# ### One thing to add — `.dockerignore`

# Create a `.dockerignore` file in your project root alongside the Dockerfile:
# ```
# node_modules
# .env
# .git
# *.log