#!/bin/bash
# verify-build.sh - Verifies chalo build outputs

echo "Verifying chalo build..."

cd packages/chalo

# Clean
rm -rf dist

# Build
npm run build

# Verify outputs
echo ""
echo "Checking build outputs..."

if [ -f "dist/chalo.mjs" ]; then
    echo "✓ ESM build exists"
else
    echo "✗ ESM build missing"
    exit 1
fi

if [ -f "dist/chalo.cjs" ]; then
    echo "✓ CJS build exists"
else
    echo "✗ CJS build missing"
    exit 1
fi

if [ -f "dist/types/index.d.ts" ]; then
    echo "✓ TypeScript declarations exist"
else
    echo "✗ TypeScript declarations missing"
    exit 1
fi

if [ -f "dist/types/index.d.mts" ]; then
    echo "✓ ESM type declarations exist"
else
    echo "✗ ESM type declarations missing"
    exit 1
fi

echo ""
echo "Build verification passed! ✓"
echo ""
echo "Output size:"
du -sh dist/
