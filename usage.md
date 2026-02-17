# Usage Guide

## Prerequisites

1. **Install necessary software:**

   - Node.js
   - Git
   - Python
   - Visual C++ Build Tools ([Download link](https://visualstudio.microsoft.com/visual-cpp-build-tools/)) and check `Desktop development with C++` [Required!]

2. **Obtain a You.com account and subscribe to Pro or Team plan, then log in.**

3. **Global proxy is recommended to ensure stable network connection.**

4. **If needed, you can set up a proxy in the `start.bat` file.**

---

## Setup Steps

### Method 1: Login using Cookie (Default)

#### Step 1: Obtain Cookie

1. **Open browser and log in to [you.com](https://you.com).**

2. **Press `F12` to open developer tools, find the "Console" tab.**

3. **Enter the following code in the console and press enter, then copy all output content (Cookie):**

   ```javascript
   console.log(document.cookie);
   ```

#### Step 2: Configure Project

1. **Download or clone this project code, unzip.**

2. **Edit `config.example.mjs` file, paste the Cookie obtained in the previous step.**

   If there are multiple Cookies, add them in the following format, then save the file as `config.mjs`:

   ```javascript
   export const config = {
       "sessions": [
           {
               "cookie": `cookie1`
           },
           {
               "cookie": `cookie2`
           },
           {
               "cookie": `cookie3`
           }
       ]
   }
   ```

#### Step 3: Configure Environment Variables

1. **Open `start.bat` file, set environment variables as needed.**

#### Step 4: Start Service

1. **Double-click to run `start.bat`.**

2. **Wait for the program to install dependencies and start the service.**

#### Step 5: Configure Client

1. **In SillyTavern, select **Custom (OpenAI-compatible)**.**

2. **Set the reverse proxy address to `http://127.0.0.1:8080/v1`.**

3. **Reverse proxy password needs to be filled (any value will do, unless `PASSWORD` is set in `start.bat`).**

4. **Start using. If it fails or there's no result, try multiple retries.**

---

### Method 2: Manual Login

#### Step 1: Configure `start.bat`

1. **Open `start.bat` file, set `USE_MANUAL_LOGIN` to `true`:**

   ```batch
   set USE_MANUAL_LOGIN=true
   ```

2. **Save and close `start.bat` file.**

#### Step 2: Start Service and Manual Login

1. **Double-click to run `start.bat`.**

2. **The program will start and automatically open a browser window.**

3. **Manually log in to your You.com account in the pop-up browser window.**

4. **After successful login, the program will automatically obtain the session information.**

#### Step 3: Configure Client

*Same as Step 5 in Method 1*

---

## Optional Configurations

### Set Proxy

If you need to set a proxy, please set the `http_proxy` and `https_proxy` environment variables in `start.bat`. For example:

```batch
set http_proxy=http://127.0.0.1:7890
set https_proxy=http://127.0.0.1:7890
```

This project uses the local Chrome browser, which will automatically read and use the system proxy settings.

### Set AI Model

You can switch the model used by setting the `AI_MODEL` environment variable. Supported models include (please refer to the official website for the latest models):

- `gpt_4o`
- `gpt_4_turbo`
- `gpt_4`
- `claude_3_5_sonnet`
- `claude_3_opus`
- `claude_3_sonnet`
- `claude_3_haiku`
- `claude_2`
- `llama3`
- `gemini_pro`
- `gemini_1_5_pro`
- `databricks_dbrx_instruct`
- `command_r`
- `command_r_plus`
- `zephyr`

For example:

```batch
set AI_MODEL=claude_3_opus
```

### Enable Custom Chat Mode

When enabled, it can shorten system message length, disable internet connection, reduce waiting time, which may help break through limitations.

```batch
set USE_CUSTOM_MODE=true
```

### Enable Mode Rotation

Mode rotation will only be enabled when both `USE_CUSTOM_MODE` and `ENABLE_MODE_ROTATION` are set to `true`.

```batch
set ENABLE_MODE_ROTATION=true
```

### Enable Tunnel Access

If you need to access the local service from the external network, you can enable tunnel access. Both `ngrok` and `localtunnel` are supported.

**Using ngrok:**

1. **Set tunnel type:**

   ```batch
   set ENABLE_TUNNEL=true
   set TUNNEL_TYPE=ngrok
   ```

2. **Set ngrok Auth Token (obtain from ngrok dashboard):**

   ```batch
   set NGROK_AUTH_TOKEN=your_ngrok_auth_token
   ```

3. **(Optional) Set custom domain (paid account):**

   ```batch
   set NGROK_CUSTOM_DOMAIN=your_custom_domain
   ```

**Using localtunnel:**

1. **Set tunnel type:**

   ```batch
   set ENABLE_TUNNEL=true
   set TUNNEL_TYPE=localtunnel
   ```

2. **(Optional) Set subdomain:**

   ```batch
   set SUBDOMAIN=your_subdomain
   ```

---

## Important Notes

- **About Cloudflare CAPTCHA:**

  If a CAPTCHA prompt pops up during program operation, please complete the verification within 30 seconds.

- **About `ALLOW_NON_PRO` setting:**

  If set to `true`, it allows the use of non-subscription accounts, but functionality will be limited and may not work properly.

  ```batch
  set ALLOW_NON_PRO=true
  ```

- **About `CUSTOM_END_MARKER` setting:**

  When the output cannot stop, you can set a custom termination marker. The program will automatically stop output after detecting this marker.

  ```batch
  set CUSTOM_END_MARKER="<YOUR_END_MARKER>"
  ```

- **About `ENABLE_DELAY_LOGIC` setting:**

  If requests are stuck, try setting this to `true`.

  ```batch
  set ENABLE_DELAY_LOGIC=true
  ```

- **About upload file format:**

  You can choose to upload files in `docx` or `txt` format.

  ```batch
  set UPLOAD_FILE_FORMAT=docx
  ```
- **About 403 issue (mainly exists in old versions)**

  This issue mainly exists in old versions. The new version is less likely to be blocked as it uses browser simulation for access.

  In the new version, if a CAPTCHA prompt pops up, users only need to complete the CloudFlare CAPTCHA within 30 seconds and wait for the program to continue processing.

  Cloudflare has a risk control score. This is related to your TLS fingerprint, browser fingerprint, IP address reputation, etc.
  The TLS fingerprint and browser fingerprint used in this project have always been very suspicious (all are automation libraries and Node built-in TLS), directly maxing out the score.
  It's equivalent to having 30+30 points in advance, and the rest depends on how many points your IP address reputation takes (40 points)
  (The specific scores are not detailed, just an example)
  So if your IP is indeed white and takes 0 points, your total score is 60.
  Suppose You sets that scores higher than 80 require CAPTCHA, then there's no problem now.
  If your IP is black and takes more than 20 points, then you're >80 points, you need to do CAPTCHA, resulting in 403.
  Then recently You felt it was being abused too much, or for some other reason, set it so that scores above 60 require CAPTCHA.
  As a result, my IP is a bit black, and I can't get through no matter what.
  But with the same IP, if you access with normal Google Chrome, there's no problem, because its fingerprint is very clean, so the previous fingerprint score is very low.
  Even with the IP reputation score added, it doesn't reach that line.
  In short, the above is a simplified version, CF has many more indicators and strategies for anti-bot.

---

## Deploy on Linux

You can deploy using Docker, please refer to the `Dockerfile` in the project.

---

## FAQ

**Q:** How to solve the problem of npm failing to install dependencies?

**A:** Please ensure your network connection is stable, use global proxy if necessary.

**Q:** Why does the program prompt "Both modes have reached the request limit"?

**A:** This may be because frequent requests have caused the mode to be temporarily disabled. It is recommended to wait for a while before trying again.

**Q:** How to switch models?

**A:** Edit the `AI_MODEL` environment variable in `start.bat`, set it to the name of the model you want to use (can now be set in SillyTavern).

---

## Disclaimer

This project is for learning and research purposes only. Please comply with relevant laws and regulations and do not use it for any commercial or illegal purposes.
