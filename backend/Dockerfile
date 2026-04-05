FROM node:18-alpine

WORKDIR /app

# Copy all source files
COPY . .

# Install all dependencies
RUN npm ci

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Start application using dev script
CMD ["npm", "run", "start:dev"]
