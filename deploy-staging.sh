#!/bin/bash

# Boss Invaders - Staging Deployment Script
# This script deploys the game to the staging server

set -e  # Exit on any error

# Configuration
STAGING_HOST="your-staging-server.com"
STAGING_USER="your-username"
STAGING_PATH="/var/www/html/staging/boss-invaders"
LOCAL_PATH="."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "boss-invaders-prototype.html" ]; then
    log_error "Please run this script from the boss-invaders project directory"
    exit 1
fi

# Check if rsync is available
if ! command -v rsync &> /dev/null; then
    log_error "rsync is required but not installed. Please install it first."
    exit 1
fi

# Check if SSH key is available
if [ ! -f ~/.ssh/id_rsa ] && [ ! -f ~/.ssh/id_ed25519 ]; then
    log_warning "No SSH key found. You may be prompted for a password."
fi

log_info "Starting deployment to staging server..."

# Create backup of current staging version
log_info "Creating backup of current staging version..."
ssh -o ConnectTimeout=10 $STAGING_USER@$STAGING_HOST "if [ -d '$STAGING_PATH' ]; then cp -r $STAGING_PATH ${STAGING_PATH}_backup_$(date +%Y%m%d_%H%M%S); fi"

# Deploy files using rsync
log_info "Deploying files to staging server..."
rsync -avz --delete \
    --exclude='.git/' \
    --exclude='.DS_Store' \
    --exclude='*.log' \
    --exclude='node_modules/' \
    --exclude='.env*' \
    $LOCAL_PATH/ $STAGING_USER@$STAGING_HOST:$STAGING_PATH/

# Set proper permissions
log_info "Setting file permissions..."
ssh $STAGING_USER@$STAGING_HOST "chmod -R 755 $STAGING_PATH && chmod 644 $STAGING_PATH/*.html $STAGING_PATH/*.php"

# Verify deployment
log_info "Verifying deployment..."
if ssh $STAGING_USER@$STAGING_HOST "test -f $STAGING_PATH/boss-invaders-prototype.html"; then
    log_success "Deployment completed successfully!"
    log_info "Staging URL: https://$STAGING_HOST/staging/boss-invaders/"
else
    log_error "Deployment verification failed!"
    exit 1
fi

# Optional: Clear any caches
log_info "Clearing caches..."
ssh $STAGING_USER@$STAGING_HOST "if command -v wp &> /dev/null; then cd $STAGING_PATH && wp cache flush; fi" || log_warning "WordPress CLI not available or cache flush failed"

log_success "Staging deployment completed!"
log_info "Next steps:"
log_info "1. Test the game on staging: https://$STAGING_HOST/staging/boss-invaders/"
log_info "2. Verify WordPress plugin integration"
log_info "3. Test lead generation functionality"
log_info "4. Check mobile responsiveness" 