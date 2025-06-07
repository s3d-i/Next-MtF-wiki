#!/bin/bash

# Setup cleanup function to ensure cleanup operations are executed when script exits
cleanup() {
    echo "Executing cleanup operations..."
    rm -rf public/hugo-static
    ln -s ../../../source/static public/hugo-static
}

# Trap exit signals to ensure cleanup function is called
trap cleanup EXIT

unlink public/hugo-static
cp -r ../../source/static public/hugo-static

# Execute build command, continue with cleanup even if it fails
pnpm dlx @cloudflare/next-on-pages || echo "Build command completed (may have errors)"

# Note: Cleanup operations are now handled by trap and will execute automatically on script exit