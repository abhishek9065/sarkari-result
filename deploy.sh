#!/bin/bash

echo "🚀 Starting Sarkari Results deployment..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Create necessary directories
echo "📁 Creating necessary directories..."
mkdir -p server/uploads
mkdir -p logs/nginx
mkdir -p nginx/ssl

# Create uploads .gitkeep file
touch server/uploads/.gitkeep

# Set environment variables for production
echo "🔧 Setting up environment variables..."
if [ ! -f .env.production ]; then
    echo "Creating .env.production file..."
    cat > .env.production << EOF
# MongoDB Configuration
MONGO_ROOT_USERNAME=admin
MONGO_ROOT_PASSWORD=$(openssl rand -base64 32)

# Database
MONGODB_URI=mongodb://admin:${MONGO_ROOT_PASSWORD}@mongodb:27017/sarkari_results?authSource=admin

# JWT Configuration
JWT_SECRET=$(openssl rand -base64 64)
JWT_EXPIRE=7d

# Admin Configuration
ADMIN_EMAIL=admin@sarkariresults.com
ADMIN_PASSWORD=$(openssl rand -base64 16)
EOF
    echo "✅ Environment file created. Please review .env.production before deployment."
fi

# Build and start services
echo "🔨 Building and starting services..."
docker-compose -f docker-compose.prod.yml --env-file .env.production up --build -d

# Wait for services to start
echo "⏳ Waiting for services to start..."
sleep 30

# Check if services are running
if docker-compose -f docker-compose.prod.yml ps | grep -q "Up"; then
    echo "✅ Deployment successful!"
    echo ""
    echo "📊 Service Status:"
    docker-compose -f docker-compose.prod.yml ps
    echo ""
    echo "🌐 Your application should be available at:"
    echo "   Frontend: http://localhost"
    echo "   Backend API: http://localhost/api"
    echo ""
    echo "🔑 Admin credentials are in .env.production file"
else
    echo "❌ Deployment failed. Check logs:"
    docker-compose -f docker-compose.prod.yml logs
fi
