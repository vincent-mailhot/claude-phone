FROM node:20-slim

WORKDIR /app

# Install espeak-ng for local TTS (no API key required)
RUN apt-get update && apt-get install -y --no-install-recommends espeak-ng && rm -rf /var/lib/apt/lists/*

# Install dependencies first (better caching)
COPY package*.json ./
RUN npm install --production

# Copy application code
COPY . .

# Create audio directory
RUN mkdir -p /app/audio

# HTTP API port
EXPOSE 3000
# WebSocket for audio streaming
EXPOSE 3001

CMD ["node", "index.js"]
