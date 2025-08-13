#!/bin/bash

# Boss Invaders - Staging Deployment Script
# This script deploys the game to the staging server
# 
# CONFIGURATION:
# 1. Update STAGING_USER with your actual username
# 2. Adjust CREATE_BACKUP and CLEAR_CACHES as needed
# 3. Ensure you have SSH access to the staging server

set -e  # Exit on any error

# Configuration
STAGING_HOST="staging9.virtualleadershipprograms.com"
STAGING_USER="your-username"
STAGING_PATH="/public_html/boss-invaders"
LOCAL_PATH="."

# Optional: Set to true if you want to backup before deployment
CREATE_BACKUP=true

# Optional: Set to true if you want to clear any caches after deployment
CLEAR_CACHES=false

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

# Load configuration from file if it exists
if [ -f "deploy-config.local.env" ]; then
    log_info "Loading configuration from deploy-config.local.env"
    source deploy-config.local.env
else
    log_warning "No deploy-config.local.env found, using defaults"
    # Default configuration
    STAGING_HOST="ssh.virtualleadershipprograms.com"
    STAGING_USER="u4-gb7cem5fkumj"
    STAGING_PORT="18765"
    STAGING_PATH="./www/staging9.virtualleadershipprograms.com/public_html/boss-invaders"
    CREATE_BACKUP=true
    CLEAR_CACHES=false
    SSH_OPTIONS="-o ConnectTimeout=10 -o StrictHostKeyChecking=no"
    RSYNC_OPTIONS="-avz --delete --progress"
fi

log_info "Starting deployment to staging server..."

# Create backup of current staging version (if enabled)
if [ "$CREATE_BACKUP" = true ]; then
    log_info "Creating backup of current staging version..."
    ssh -p $STAGING_PORT -o ConnectTimeout=10 $STAGING_USER@$STAGING_HOST "if [ -d '$STAGING_PATH' ]; then cp -r $STAGING_PATH ${STAGING_PATH}_backup_$(date +%Y%m%d_%H%M%S); fi"
else
    log_info "Skipping backup creation (CREATE_BACKUP=false)"
fi

# Ensure staging directory exists
log_info "Ensuring staging directory exists..."
ssh -p $STAGING_PORT $STAGING_USER@$STAGING_HOST "mkdir -p $STAGING_PATH"

# Deploy files using rsync
log_info "Deploying files to staging server..."
rsync -avz --delete -e "ssh -p $STAGING_PORT" \
    --exclude='.git/' \
    --exclude='.DS_Store' \
    --exclude='*.log' \
    --exclude='node_modules/' \
    --exclude='.env*' \
    $LOCAL_PATH/ $STAGING_USER@$STAGING_HOST:$STAGING_PATH/

# Set proper permissions
log_info "Setting file permissions..."
ssh -p $STAGING_PORT $STAGING_USER@$STAGING_HOST "chmod -R 755 $STAGING_PATH && chmod 644 $STAGING_PATH/*.html $STAGING_PATH/*.php"

# Verify deployment
log_info "Verifying deployment..."
if ssh -p $STAGING_PORT $STAGING_USER@$STAGING_HOST "test -f $STAGING_PATH/boss-invaders-prototype.html"; then
    log_success "Deployment completed successfully!"
    log_info "Staging URL: https://staging9.virtualleadershipprograms.com/boss-invaders/"
else
    log_error "Deployment verification failed!"
    exit 1
fi

# Optional: Clear any caches (if enabled)
if [ "$CLEAR_CACHES" = true ]; then
    log_info "Clearing caches..."
    ssh -p $STAGING_PORT $STAGING_USER@$STAGING_HOST "if command -v wp &> /dev/null; then cd $STAGING_PATH && wp cache flush; fi" || log_warning "WordPress CLI not available or cache flush failed"
else
    log_info "Skipping cache clearing (CLEAR_CACHES=false)"
fi

log_success "Staging deployment completed!"
log_info "Next steps:"
log_info "1. Test the game on staging: https://staging9.virtualleadershipprograms.com/boss-invaders/"
log_info "2. Verify game functionality and performance"
log_info "3. Test lead generation functionality"
log_info "4. Check mobile responsiveness"
log_info "5. Verify file permissions and web server access" 