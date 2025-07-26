#!/bin/bash

echo "🧪 Running development environment..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."

# Install server dependencies
cd server
if [ ! -d "node_modules" ]; then
    echo "Installing server dependencies..."
    npm install
fi

# Install client dependencies
cd ../client
if [ ! -d "node_modules" ]; then
    echo "Installing client dependencies..."
    npm install
fi

cd ..

# Check if MongoDB is running
if ! pgrep -x "mongod" > /dev/null; then
    echo "⚠️  MongoDB is not running. Please start MongoDB first."
    echo "   Ubuntu/Debian: sudo systemctl start mongod"
    echo "   macOS: brew services start mongodb-community"
    echo "   Windows: net start MongoDB"
fi

# Start development servers
echo "🚀 Starting development servers..."

# Start server in background
cd server
npm run dev &
SERVER_PID=$!

# Wait a bit for server to start
sleep 5

# Start client
cd ../client
npm start &
CLIENT_PID=$!

echo "✅ Development environment started!"
echo ""
echo "🌐 Your application is available at:"
echo "   Frontend: http://localhost:3000"
echo "   Backend API: http://localhost:5000"
echo ""
echo "🛑 To stop the servers, press Ctrl+C"

# Wait for user interrupt
trap "echo 'Stopping servers...'; kill $SERVER_PID $CLIENT_PID; exit" INT
wait
