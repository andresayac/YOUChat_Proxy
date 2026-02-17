@echo off

REM Install dependencies
call npm install

REM Set active provider (you, perplexity, happyapi)
set ACTIVE_PROVIDER=you

REM Set whether to use manual login
set USE_MANUAL_LOGIN=false

REM Whether to allow non-Pro accounts
set ALLOW_NON_PRO=false

REM Set custom end marker (Used for chat completion markers, such as <CHAR_turn>)
set CUSTOM_END_MARKER="<CHAR_turn>"

REM Set whether to enable delay logic. If false, it will request directly.
set ENABLE_DELAY_LOGIC=false

REM Set whether to enable tunnel
set ENABLE_TUNNEL=false

REM Tunnel type (localtunnel or ngrok)
set TUNNEL_TYPE=ngrok

REM Set localtunnel subdomain (leave blank for random)
set SUBDOMAIN=

REM Set ngrok AUTH TOKEN
REM Visit https://dashboard.ngrok.com to get your auth token.
set NGROK_AUTH_TOKEN=

REM Set ngrok custom domain
REM You can use your own custom domain for ngrok.
set NGROK_CUSTOM_DOMAIN=

REM Set https_proxy environment variable for local socks5 or http(s) proxy
REM Example for HTTP proxy: set https_proxy=http://127.0.0.1:7890
REM Example for SOCKS5 proxy: set https_proxy=socks5://host:port:username:password
set https_proxy=

REM Set PASSWORD API key
set PASSWORD=

REM Set PORT
set PORT=8080

REM Set AI model
set AI_MODEL=

REM Custom chat mode
set USE_CUSTOM_MODE=true

REM Enable mode rotation
REM Only works when USE_CUSTOM_MODE and ENABLE_MODE_ROTATION are both true.
set ENABLE_MODE_ROTATION=false

REM Whether to enable incognito mode
set INCOGNITO_MODE=false

REM Set upload file format (docx or txt)
set UPLOAD_FILE_FORMAT=txt

REM ---------------------------------------------------
REM Whether to enable garbled text at start
set ENABLE_GARBLED_START=false
REM Set min length of garbled text at start
set GARBLED_START_MIN_LENGTH=1000
REM Set max length of garbled text at start
set GARBLED_START_MAX_LENGTH=5000
REM Set length of garbled text at end
set GARBLED_END_LENGTH=500
REM Whether to enable garbled text at end
set ENABLE_GARBLED_END=false
REM ---------------------------------------------------

REM Run Node.js application
node index.mjs

REM Pause script, wait for user key to exit
pause
