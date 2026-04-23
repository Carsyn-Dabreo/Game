#!/bin/bash

# CyberGrid Full-Stack Setup Script
# This script sets up the entire development environment

echo "🚀 Setting up CyberGrid Full-Stack Environment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_step() {
    echo -e "${BLUE}[STEP]${NC} $1"
}

# Check if Docker is installed
check_docker() {
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
        print_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi
    
    print_status "Docker and Docker Compose are installed"
}

# Check if Node.js is installed
check_node() {
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js 18 or later."
        exit 1
    fi
    
    NODE_VERSION=$(node -v | cut -d'v' -f2)
    REQUIRED_VERSION="18.0.0"
    
    if ! node -e "process.exit(require('semver').gte('$NODE_VERSION', '$REQUIRED_VERSION') ? 0 : 1)" 2>/dev/null; then
        print_error "Node.js version $NODE_VERSION is too old. Please install Node.js 18 or later."
        exit 1
    fi
    
    print_status "Node.js $NODE_VERSION is installed"
}

# Setup backend
setup_backend() {
    print_step "Setting up backend..."
    
    cd server
    
    # Install dependencies
    print_status "Installing backend dependencies..."
    npm install
    
    # Create .env file if it doesn't exist
    if [ ! -f .env ]; then
        print_warning ".env file not found. Creating from template..."
        cp .env.example .env
        print_warning "Please edit server/.env file with your API keys and configuration"
    fi
    
    # Create logs directory
    mkdir -p logs uploads
    
    cd ..
    print_status "Backend setup completed"
}

# Setup frontend
setup_frontend() {
    print_step "Setting up frontend..."
    
    # Install dependencies
    print_status "Installing frontend dependencies..."
    npm install
    
    # Create .env file if it doesn't exist
    if [ ! -f .env ]; then
        print_warning "Frontend .env file not found. Creating..."
        cat > .env << EOF
VITE_API_URL=http://localhost:3001
VITE_SOCKET_URL=http://localhost:3001
VITE_APP_TITLE=CyberGrid
EOF
    fi
    
    print_status "Frontend setup completed"
}

# Setup database
setup_database() {
    print_step "Setting up database with Docker..."
    
    # Start database
    print_status "Starting PostgreSQL database..."
    docker-compose up -d db
    
    # Wait for database to be ready
    print_status "Waiting for database to be ready..."
    sleep 10
    
    # Check if database is accessible
    if docker-compose exec -T db pg_isready -U cyber -d cybergrid; then
        print_status "Database is ready"
    else
        print_error "Database failed to start"
        exit 1
    fi
    
    print_status "Database setup completed"
}

# Start development servers
start_dev_servers() {
    print_step "Starting development servers..."
    
    # Start backend in background
    print_status "Starting backend server..."
    cd server
    npm run dev &
    BACKEND_PID=$!
    cd ..
    
    # Wait for backend to start
    sleep 5
    
    # Check if backend is running
    if curl -s http://localhost:3001/health > /dev/null; then
        print_status "Backend server is running on http://localhost:3001"
    else
        print_error "Backend server failed to start"
        kill $BACKEND_PID 2>/dev/null
        exit 1
    fi
    
    # Start frontend
    print_status "Starting frontend server..."
    npm run dev &
    FRONTEND_PID=$!
    
    print_status "Frontend server is starting on http://localhost:5173"
    
    # Save PIDs for cleanup
    echo $BACKEND_PID > .backend.pid
    echo $FRONTEND_PID > .frontend.pid
    
    print_status "Development servers are running!"
    print_status "Frontend: http://localhost:5173"
    print_status "Backend API: http://localhost:3001"
    print_status "Database: localhost:5432"
    
    print_warning "Press Ctrl+C to stop all servers"
}

# Cleanup function
cleanup() {
    print_status "Stopping development servers..."
    
    if [ -f .backend.pid ]; then
        kill $(cat .backend.pid) 2>/dev/null
        rm .backend.pid
    fi
    
    if [ -f .frontend.pid ]; then
        kill $(cat .frontend.pid) 2>/dev/null
        rm .frontend.pid
    fi
    
    # Stop Docker containers
    docker-compose down
    
    print_status "Cleanup completed"
    exit 0
}

# Setup signal handlers
trap cleanup SIGINT SIGTERM

# Main setup flow
main() {
    print_status "Starting CyberGrid setup..."
    
    check_docker
    check_node
    setup_backend
    setup_frontend
    setup_database
    start_dev_servers
    
    # Keep script running
    wait
}

# Show help
show_help() {
    echo "CyberGrid Setup Script"
    echo ""
    echo "Usage: $0 [options]"
    echo ""
    echo "Options:"
    echo "  -h, --help     Show this help message"
    echo "  -c, --clean    Stop all services and cleanup"
    echo "  -b, --backend  Setup backend only"
    echo "  -f, --frontend Setup frontend only"
    echo "  -d, --database Setup database only"
    echo ""
    echo "Examples:"
    echo "  $0              # Full setup and start development servers"
    echo "  $0 --clean      # Stop all services"
    echo "  $0 --backend    # Setup backend only"
}

# Parse command line arguments
case "${1:-}" in
    -h|--help)
        show_help
        exit 0
        ;;
    -c|--clean)
        cleanup
        ;;
    -b|--backend)
        check_node
        setup_backend
        ;;
    -f|--frontend)
        check_node
        setup_frontend
        ;;
    -d|--database)
        check_docker
        setup_database
        ;;
    "")
        main
        ;;
    *)
        print_error "Unknown option: $1"
        show_help
        exit 1
        ;;
esac
