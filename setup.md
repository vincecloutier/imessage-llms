# Telegram Webhook Setup

```bash
#!/bin/bash

# script to set up Telegram Webhook

# get the directory where the script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
ENV_FILE="${SCRIPT_DIR}/.env.local"

# load environment variables from .env.local
if [ -f "$ENV_FILE" ]; then
  # using set -a to export all variables defined from now on
  # and sourcing the file in a subshell to avoid polluting the current shell
  # if the script is sourced, and to handle lines with spaces/special chars better.
  set -a
  # shellcheck source=/dev/null
  source "$ENV_FILE"
  set +a
else
  echo "Error: .env.local file not found at $ENV_FILE"
  exit 1
fi

# check if tokens are set
if [ -z "$TELEGRAM_API_KEY" ]; then
  echo "Error: TELEGRAM_API_KEY is not set in $ENV_FILE"
  exit 1
fi

if [ -z "$TELEGRAM_API_SECRET" ]; then
  echo "Error: TELEGRAM_API_SECRET is not set in $ENV_FILE"
  exit 1
fi

echo "Setting up Telegram Webhook..."

# telegram webhook setup
curl -X POST \
  -F "url=https://april-python.vercel.app/api/telegram" \
  -F "allowed_updates=[\"message\"]" \
  -F "max_connections=10" \
  -F "secret_token=${TELEGRAM_API_SECRET}" \
  "https://api.telegram.org/bot${TELEGRAM_API_KEY}/setWebhook"

# add a newline for cleaner output in the terminal
echo
echo "Webhook setup command executed."
echo "Check Telegram's response above for success or error messages."

```