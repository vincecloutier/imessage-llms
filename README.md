# LLM's On iMessage, Telegram, and Web

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

An application that lets you chat with large language models from [OpenRouter](https://openrouter.ai/models) in your browser, iMessage, or Telegram. Built with a Next.js frontend and a Python backend.

![AI Companion Screenshot](https://place-hold.it/1280x720?text=App+Screenshot+Here)

## Features
- [x] **Authentication:** Secure user sign-up and login.
- [x] **Multi-platform Chat:** Interact with AI models via web, iMessage, and Telegram.
- [x] **Extensible Tooling:** Connect to external APIs and services (e.g., Exa for search).
- [x] **Vector Database:** Long-term memory and context using Pinecone.
- [x] **Customizable Personas:** Tailor the AI's personality and behavior.

## Getting Started

Follow these instructions to get a copy of the project up and runnning.


### Deployment

1. **Setup Exa** <br>
 Go to [Exa](https://dashboard.exa.ai/login?redirect=/home) and sign up for a free or paid account and then save your API key. This will be used to allow the model to search the web.

2. **Setup OpenRouter** <br>
 Go to [OpenRouter](https://openrouter.ai/models) and sign up for an account and then save your API key somewhere. This will be used to allow the model to access the OpenRouter API.

3. **Setup Pinecone** <br>
 Go to [Pinecone](https://www.pinecone.io/pricing) and sign up for a free or paid account and then save your API key somewhere. This will be used to allow the model to store and retrieve long-term memory. Note that here you will also need to create an index. 
    1. Go to the [Pinecone dashboard](https://app.pinecone.io/login) and sign in.
    2. Click on the "Create Index" button.
    3. Create an index called `memories-user` that is configured to use the `llama-text-embed-v2` embedding model, in integrated-embedding serverless mode (not pods), and make sure the field map is set to `text`. The region and the cloud provider can be left as is. 
    4. Create another index called `memories-agent` with the same settings.

4. **Create a Telegram Bot** <br>
 Go to [Telegram](https://telegram.org/) and create a bot and then save your API key and secret token somewhere.

5. **Setup iMessage with BlueBubbles:**


6.  **Deploy to Vercel:** <br>
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/vincecloutier/imessage-llms&env=BBL_API_KEY,EXA_API_KEY,OPENROUTER_API_KEY,PINECONE_API_KEY,TELEGRAM_API_KEY,TELEGRAM_API_SECRET)

6. **Setup a Supabase project and get the project URL and anon key.** <br>
 Go to [Supabase](https://supabase.com/) and sign up for an account and then save your project URL and anon key somewhere. This will be used to allow the model to store and retrieve user data.


7. **Link Telegram Bot To Vercel** <br>

### Local Development
After deploying, you can run the application locally to test and develop.

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/vincecloutier/imessage-llms.git
    cd imessage-llms
    ```

2.  **Install JavaScript dependencies:**
    ```bash
    pnpm install
    ```

3.  **Install Python dependencies:**
    ```bash
    pip install -r requirements.txt
    ```

4.  **Set up your environment variables:**
    ```bash
    vercel link
    vercel env pull
    ```

5.  **Start the Next.js frontend:**
    ```bash
    pnpm run dev
    ```
    The application will then be available at `http://localhost:3000`. <br> _Note that `vercel dev` will launch the frontend, but not the backend._


### Telegram Webhook

After deploying, you need to set the Telegram webhook to point to your Vercel deployment URL.

Run the setup script to configure the webhook:
```bash
bash ./setup.sh
```
Make sure your `.env.local` is configured with the correct `TELEGRAM_API_KEY` and `TELEGRAM_API_SECRET` before running the script. The script currently uses `https://april-python.vercel.app` as the webhook URL; you may need to update this in `setup.sh` to match your deployment's URL.

## License

This project is licensed under the MIT License. It is recommended to create a `LICENSE.md` file in your project with the license details.