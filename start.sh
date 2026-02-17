#!/bin/bash

# Install dependencies
npm install

# Set active provider: you, perplexity, happyapi
export ACTIVE_PROVIDER=you

# Set whether to use manual login
export USE_MANUAL_LOGIN=true

# Whether to allow non-Pro accounts
export ALLOW_NON_PRO=false

# Set custom end marker (Used for chat completion markers, such as <CHAR_turn>)
export CUSTOM_END_MARKER="<CHAR_turn>"

# Set whether to enable delay logic. If false, it will request directly.
export ENABLE_DELAY_LOGIC=false

# Set whether to enable tunnel
export ENABLE_TUNNEL=false

# Set tunnel type (localtunnel or ngrok)
export TUNNEL_TYPE=ngrok

# Set localtunnel subdomain (leave blank for random)
export SUBDOMAIN=

# Set ngrok AUTH TOKEN
# Visit https://dashboard.ngrok.com to get your auth token.
export NGROK_AUTH_TOKEN=

# Set ngrok custom domain
# You can use your own custom domain for ngrok.
export NGROK_CUSTOM_DOMAIN=

# Set https_proxy environment variable for local socks5 or http(s) proxy
# Example for HTTP proxy: export https_proxy=http://127.0.0.1:7890
# Example for SOCKS5 proxy: export https_proxy=socks5://host:port:username:password
export https_proxy=

# Set PASSWORD API key
export PASSWORD=

# Set PORT
export PORT=8080

# Set AI model
export AI_MODEL=

# Custom chat mode
export USE_CUSTOM_MODE=false

# Enable mode rotation
# Only works when USE_CUSTOM_MODE and ENABLE_MODE_ROTATION are both true.
export ENABLE_MODE_ROTATION=false

# Whether to enable incognito mode
export INCOGNITO_MODE=false

# Set upload file format (docx or txt)
export UPLOAD_FILE_FORMAT=docx

# ---------------------------------------------------
# Whether to enable garbled text at start
export ENABLE_GARBLED_START=false
# Set min length of garbled text at start
export GARBLED_START_MIN_LENGTH=1000
# Set max length of garbled text at start
export GARBLED_START_MAX_LENGTH=5000
# Set length of garbled text at end
export GARBLED_END_LENGTH=500
# Whether to enable garbled text at end
export ENABLE_GARBLED_END=false
# ---------------------------------------------------

# Run Node.js application
node index.mjs

read -p "Press any key to exit..."
