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

1. *Setup Exa, OpenRouter, Pinecone*


2. *Setup a Supabase project and get the project URL and anon key.*

3. *Setup Telegram Bot API key and secret token.*


4. *Setup iMessage with BlueBubbles:*


5.  **Deploy to Vercel:** <br>
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/vincecloutier/imessage-llms&env=BBL_API_KEY,EXA_API_KEY,OPENROUTER_API_KEY,PINECONE_API_KEY,TELEGRAM_API_KEY,TELEGRAM_API_SECRET)


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


## Environment Variables

This project requires the following environment variables to be set in your `.env.local` file. You can create a `.env.example` file with the content below for reference.

| Variable                      | Description                                                                 |
| ----------------------------- | --------------------------------------------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`    | The URL for your Supabase project.                                          |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | The anonymous public key for your Supabase project.                       |
| `SUPABASE_SERVICE_ROLE_KEY`   | The service role (secret) key for your Supabase project.                    |
| `OPENROUTER_API_KEY`          | Your API key for OpenRouter.                                                |
| `TELEGRAM_API_KEY`            | Your Telegram Bot API key.                                                  |
| `TELEGRAM_API_SECRET`         | A secret token for validating Telegram webhooks.                            |
| `PINECONE_API_KEY`            | Your API key for Pinecone.                                                  |
| `EXA_API_KEY`                 | (Optional) Your API key for Exa for search capabilities.                    |
| `BBL_API_KEY`                 | (Optional) Your API key for BeMyEyes.                                       |


### Telegram Webhook

After deploying, you need to set the Telegram webhook to point to your Vercel deployment URL.

Run the setup script to configure the webhook:
```bash
bash ./setup.sh
```
Make sure your `.env.local` is configured with the correct `TELEGRAM_API_KEY` and `TELEGRAM_API_SECRET` before running the script. The script currently uses `https://april-python.vercel.app` as the webhook URL; you may need to update this in `setup.sh` to match your deployment's URL.

## License

This project is licensed under the MIT License. It is recommended to create a `LICENSE.md` file in your project with the license details.