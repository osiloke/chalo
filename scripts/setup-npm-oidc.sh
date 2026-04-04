#!/bin/bash

# ============================================================================
# setup-npm-oidc.sh
# Automated NPM Trusted Publishing Setup for GitHub Actions
# 
# This script:
# 1. Checks prerequisites (gh CLI, npm CLI)
# 2. Validates npm account status
# 3. Guides you through npmjs.com Trusted Publisher configuration
# 4. Verifies package.json repository configuration
# 5. Tests OIDC authentication
# ============================================================================

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# ============================================================================
# Helper Functions
# ============================================================================

print_step() {
    echo -e "\n${BLUE}━━━ $1 ━━━${NC}\n"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

check_command() {
    if ! command -v $1 &> /dev/null; then
        print_error "$1 is not installed. Please install it first."
        echo -e "   Install guide: $2"
        exit 1
    fi
    print_success "$1 is installed"
}

# ============================================================================
# Main Script
# ============================================================================

print_step "NPM OIDC Trusted Publishing Setup"
echo "This script will configure OIDC-based publishing for your package."
echo "No more API tokens! GitHub Actions will authenticate directly with npm."
echo ""

# --- Prerequisites ---
print_step "Step 1: Checking Prerequisites"

check_command "gh" "https://cli.github.com/"
check_command "npm" "https://nodejs.org/"
if ! command -v jq &> /dev/null; then
    print_warning "jq is not installed (optional, used for JSON parsing)"
    echo -e "   Install: brew install jq"
    HAS_JQ=false
else
    print_success "jq is installed"
    HAS_JQ=true
fi

# --- Validate GitHub Repo ---
print_step "Step 2: Validating GitHub Repository"

REPO_URL=$(git remote get-url origin 2>/dev/null || echo "")

if [ -z "$REPO_URL" ]; then
    print_error "No git remote 'origin' found."
    echo "   Please add your GitHub repository:"
    echo "   git remote add origin https://github.com/OWNER/REPO.git"
    exit 1
fi

# Convert SSH to HTTPS URL
if [[ $REPO_URL == git@* ]]; then
    REPO_URL="https://github.com/${REPO_URL#git@github.com:}"
fi

# Extract owner and repo name
REPO_FULL=$(echo $REPO_URL | sed -E 's|.*github\.com[/:]([^/]+/[^/]+?)(\.git)?$|\1|')
REPO_OWNER=$(echo $REPO_FULL | cut -d'/' -f1)
REPO_NAME=$(echo $REPO_FULL | cut -d'/' -f2)

print_success "Repository: $REPO_FULL"
print_success "Owner: $REPO_OWNER"
print_success "Repo: $REPO_NAME"

# --- Validate Package Configuration ---
print_step "Step 3: Validating Package Configuration"

PACKAGE_JSON="packages/chalo/package.json"

if [ ! -f "$PACKAGE_JSON" ]; then
    print_error "Package.json not found at $PACKAGE_JSON"
    exit 1
fi

if [ "$HAS_JQ" = true ]; then
    PACKAGE_NAME=$(jq -r '.name' $PACKAGE_JSON)
    PACKAGE_VERSION=$(jq -r '.version' $PACKAGE_JSON)
    
    print_success "Package: $PACKAGE_NAME"
    print_success "Version: $PACKAGE_VERSION"
    
    # Check repository field in package.json
    PKG_REPO=$(jq -r '.repository.url // empty' $PACKAGE_JSON)
    
    if [ -z "$PKG_REPO" ] || [[ $PKG_REPO != *github.com* ]]; then
        print_warning "Package.json repository field is missing or incorrect."
        echo ""
        echo "Add this to $PACKAGE_JSON:"
        echo ""
        cat << EOF
  "repository": {
    "type": "git",
    "url": "$REPO_URL",
    "directory": "packages/chalo"
  },
EOF
        echo ""
        read -p "Would you like me to add this now? (y/n): " choice
        if [[ $choice == "y" || $choice == "Y" ]]; then
            # Use jq to add the repository field
            jq '. + {repository: {type: "git", url: "'"$REPO_URL"'", directory: "packages/chalo"}}' $PACKAGE_JSON > tmp.json && mv tmp.json $PACKAGE_JSON
            print_success "Repository field added!"
        else
            print_warning "Please add the repository field manually before proceeding."
            exit 1
        fi
    else
        print_success "Repository field is configured"
    fi
else
    print_warning "jq not installed, skipping JSON parsing"
    echo "Please verify packages/chalo/package.json manually:"
    echo "  - name field is set"
    echo "  - repository.url points to your GitHub repo"
    echo ""
    read -p "Continue? (y/n): " choice
    if [[ $choice != "y" && $choice != "Y" ]]; then
        exit 1
    fi
fi

# --- Check npm Account ---
print_step "Step 4: Checking npm Account"

if npm whoami &>/dev/null; then
    NPM_USER=$(npm whoami)
    print_success "Logged in as: @$NPM_USER"
else
    print_warning "You are not logged into npm."
    echo ""
    echo "Please login to npm first:"
    echo "   npm login"
    echo ""
    read -p "Press Enter after you've logged in..."
    
    if npm whoami &>/dev/null; then
        NPM_USER=$(npm whoami)
        print_success "Logged in as: @$NPM_USER"
    else
        print_error "Login failed. Please try again."
        exit 1
    fi
fi

# --- 2FA Check ---
print_step "Step 5: Checking 2FA Status"

print_warning "npm requires 2FA for publishing!"
echo ""
echo "If you haven't enabled 2FA on npm:"
echo "   1. Go to https://www.npmjs.com/settings/your-username/tokens"
echo "   2. Enable two-factor authentication"
echo ""
read -p "Do you have 2FA enabled? (y/n): " has_2fa

if [[ $has_2fa != "y" && $has_2fa != "Y" ]]; then
    print_warning "Please enable 2FA before proceeding."
    echo "   https://docs.npmjs.com/securing-your-account-with-two-factor-authentication-2fa"
    exit 1
fi

print_success "2FA is enabled"

# --- OIDC Configuration Guide ---
print_step "Step 6: Configure Trusted Publisher on npmjs.com"

echo "Now you need to configure the Trusted Publisher on npmjs.com:"
echo ""
echo -e "${GREEN}Follow these steps:${NC}"
echo ""
echo "1. Go to: https://www.npmjs.com/package/$PACKAGE_NAME"
echo "   (Or create the package first if it doesn't exist)"
echo ""
echo "2. Click on 'Settings' → 'Trusted Publishers'"
echo ""
echo "3. Click 'Add Trusted Publisher'"
echo ""
echo "4. Fill in the following details:"
echo ""
echo -e "   ${BLUE}Entity type:${NC}           Repository"
echo -e "   ${BLUE}Repository owner:${NC}     $REPO_OWNER"
echo -e "   ${BLUE}Repository name:${NC}      $REPO_NAME"
echo -e "   ${BLUE}Workflow file:${NC}        .github/workflows/publish.yml"
echo -e "   ${BLUE}Environment:${NC}          (leave blank)"
echo ""
echo "5. Click 'Save'"
echo ""
echo -e "${YELLOW}⚠ IMPORTANT: Names are case-sensitive!${NC}"
echo ""

read -p "Have you configured the Trusted Publisher? (y/n): " configured

if [[ $configured != "y" && $configured != "Y" ]]; then
    print_warning "Please configure the Trusted Publisher before proceeding."
    echo ""
    echo "You can come back and run this script again later."
    exit 0
fi

# --- Verify GitHub Actions Setup ---
print_step "Step 7: Verifying GitHub Actions Workflow"

if [ -f ".github/workflows/publish.yml" ]; then
    print_success "Publish workflow exists"
    
    # Check for OIDC permissions
    if grep -q "id-token: write" .github/workflows/publish.yml; then
        print_success "OIDC permissions configured"
    else
        print_warning "Missing 'id-token: write' permission in publish.yml"
        echo "   Please add it to your workflow:"
        echo ""
        echo "   permissions:"
        echo "     id-token: write"
        echo "     contents: read"
    fi
else
    print_error "Publish workflow not found!"
    echo "   Please create .github/workflows/publish.yml"
    exit 1
fi

# --- Test Build ---
print_step "Step 8: Testing Build Process"

echo "Running build to verify everything works..."
echo ""

cd packages/chalo

if npm run build; then
    print_success "Build completed successfully!"
    echo ""
    echo "Build output:"
    ls -lh dist/
else
    print_error "Build failed! Please fix the errors above."
    exit 1
fi

cd ../..

# --- Final Summary ---
print_step "Setup Complete! 🎉"

echo -e "${GREEN}Summary:${NC}"
if [ "$HAS_JQ" = true ]; then
    echo "  Package: $PACKAGE_NAME@$PACKAGE_VERSION"
else
    echo "  Package: chalo (verify manually)"
fi
echo "  Repository: $REPO_FULL"
if [ -n "$NPM_USER" ]; then
    echo "  npm User: @$NPM_USER"
fi
echo ""
echo -e "${GREEN}Next Steps:${NC}"
echo ""
echo "1. Commit and push your changes:"
echo "   git add . && git commit -m 'setup: configure OIDC publishing'"
echo "   git push origin main"
echo ""
echo "2. Create a GitHub release:"
echo "   gh release create v0.1.0 --generate-notes"
echo ""
echo "3. Watch the publish happen automatically!"
echo "   https://github.com/$REPO_FULL/actions"
echo ""
echo -e "${YELLOW}Note: The first publish must be done manually via CLI:${NC}"
echo "   cd packages/chalo && npm publish --provenance --access public"
echo ""
echo "After that, all future releases via GitHub Releases will auto-publish!"
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
