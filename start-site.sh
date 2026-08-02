#!/usr/bin/env bash
# Starts the UN-VC website locally. Then open http://127.0.0.1:5199/ in your browser.
export PATH="$HOME/.npm-global/bin:$PATH"
cd "$(dirname "$0")/artifacts/un-vc"
export PORT=5199 BASE_PATH=/ NODE_ENV=development
echo "Starting UN-VC... open http://127.0.0.1:5199/ in your browser (Ctrl+C here to stop)."
exec pnpm exec vite --config vite.config.ts --host 127.0.0.1 --port 5199
