# LLM's On iMessage, Telegram, and the Web

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
 Go to [Pinecone](https://www.pinecone.io/pricing) and sign up for a free or paid account and then save your API key somewhere. This will be used to allow the model to store and retrieve long-term memory. Once signed in, you will need to create two indexes:
    1. Click on the "Create Index" button.
    2. Create an index called `memories-user` that is configured to use the `llama-text-embed-v2` embedding model, in integrated-embedding serverless mode (not pods), and make sure the field map is set to `text`. The region and the cloud provider can be left as is. 
    3. Create another index called `memories-agent` with the same settings.

4. **Create a Telegram Bot** <br>
 Message [@BotFather](https://t.me/BotFather) and create a bot by messaging `/newbot` and picking a name and then save this bot's HTTP API key somewhere safe. You will also need a secret token to secure your webhook. You can invent something or generate a random one easily [here](https://randomkeygen.com). Save this secret token somewhere safe.

5. **Setup iMessage with BlueBubbles:**
Now go to [BlueBubbles](https://bluebubbles.app/install/) to download and setup the software we will use to handle iMessages from the bot. Make sure to follow the instructions and take note of the server password (we will refer to this password as the `BBL_API_KEY` from now on). Note that, our application does not rely on the google firebase part of this so you can safely skip that step. Further, make sure to follow the setup instructions for the Private API.

6.  **Deploy to Vercel:**
    <div align="center">
      <a href="https://vercel.com/new/clone?repository-url=https://github.com/vincecloutier/imessage-llms&env=BBL_API_KEY,EXA_API_KEY,OPENROUTER_API_KEY,PINECONE_API_KEY,TELEGRAM_API_KEY,TELEGRAM_API_SECRET">
        <img src="https://vercel.com/button" alt="Deploy with Vercel"/>
      </a>
    </div>
    <p>Click the button to deploy. You will be prompted to enter the environment variables you saved from the previous steps. After deploying, you will need to take note of the base URL of your deployment.</p>

7. **Setup a Supabase Project** <br>
Once your project is deployed to Vercel, select the `database` tab in your project, then click `Create Database > Supabase`, and leave all the settings as is and finally click `Connect` after your project is provisioned. Then select the `Open In Supabase` button, and once in your Supabase project, you will need to execute the [lib/supabase/setup.sql](lib/supabase/setup.sql) file in the `SQL Editor` tab. Then you will need to go to the `Authentication > Emails` tab and click the`Emails` subtab and then modify both the `Confirmation Sign Up` and `Magic Link` emails to: 
    ```html
    <h2>One Time Password (OTP): </h2>
    <h3> {{ .Token }}</h3>
    ```
Now since we've connected Vercel to Supabase, we need to redeploy the project, so that the automatically populated Supabase environment variables are properly set. At this point, you should be able to login to the application and message the bots you create online!

8. **Link Telegram Bot To Vercel** <br>
Run the following command to link the Telegram bot to Vercel. 
    ```bash
    curl -X POST \
    -F "url=VERCEL_BASE_URL/api/responder?channel=telegram" \
    -F "allowed_updates=[\"message\"]" \
    -F "max_connections=10" \
    -F "secret_token=TELEGRAM_API_SECRET" \
    "https://api.telegram.org/botTELEGRAM_API_KEY/setWebhook"
    ```
Make sure to replace the capitalized environment variables with the correct values! And now you should be able to send and receive messages from the bot over Telegram!

9. **Link BlueBubbles To Vercel** <br>
Launch the BlueBubbles server and go to the `API & Webhooks` tab. Select `Manage > Add Webhook` and then create one webhook for our responder that listens to `New Message` events and points to `VERCEL_BASE_URL/api/responder?channel=imessage` another one for `New Server URL` events and points to `VERCEL_BASE_URL/api/url_updater`. Finally, quit and relaunch the BlueBubbles app to make sure the server URL is updated in Supabase. You should be able to send and receive messages from the bot over iMessage!

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


### Troubleshooting
1. **Messages takes a long time to be marked as delivered over iMessage.** <br>
I struggled with this for a while. It has to do with the way the Apple's Push Notification service works, and nothing to do with Bluebubbles or this service. The good news is that it's an easy fix, you just need a way to increase your TCP timeout on your network. If you can't do this (thanks Rogers), you can buy a top tier TP-Link Router for very cheap.

Feel free to let me know if you are having any other issues with this repo and I will try to help you out as best I can.