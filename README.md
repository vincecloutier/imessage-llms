# AI Companion

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

An application that lets you chat with large language models from [OpenRouter](https://openrouter.ai/models) in your browser, iMessage, or Telegram. Built with a Next.js frontend and a Python backend.

![AI Companion Screenshot](https://place-hold.it/1280x720?text=App+Screenshot+Here)
*Replace this with a screenshot of your application.*

## Tech Stack

**Frontend:**
- [Next.js](https://nextjs.org/)
- [React](https://react.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Shadcn UI](https://ui.shadcn.com/)
- [TypeScript](https://www.typescriptlang.org/)

**Backend:**
- [Python](https://www.python.org/)
- [Flask](https://flask.palletsprojects.com/)
- [Supabase](https://supabase.com/) for database and auth
- [Pinecone](https://www.pinecone.io/) for vector storage and long-term memory
- [OpenRouter](https://openrouter.ai/) for LLM access

**Deployment:**
- [Vercel](https://vercel.com/)

## Features

- [x] **Authentication:** Secure user sign-up and login.
- [x] **Multi-platform Chat:** Interact with AI models via web, iMessage, and Telegram.
- [x] **Extensible Tooling:** Connect to external APIs and services (e.g., Exa for search).
- [x] **Vector Database:** Long-term memory and context using Pinecone.
- [x] **Customizable Personas:** Tailor the AI's personality and behavior.

## Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or later)
- [pnpm](https://pnpm.io/)
- [Python](https://www.python.org/downloads/) (v3.9 or later)

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/your-repo-name.git
    cd your-repo-name
    ```
    *Note: Remember to replace `your-username/your-repo-name` with your actual repository details.*

2.  **Install JavaScript dependencies:**
    ```bash
    pnpm install
    ```

3.  **Install Python dependencies:**
    ```bash
    pip install -r requirements.txt
    ```

4.  **Set up your environment variables:**
    - Create a new file named `.env.local` in the root of the project.
    - Copy the contents from the example below and fill in the required API keys and URLs. See the [Environment Variables](#environment-variables) section for more details.

### Running the Application

-   **Start the Next.js frontend:**
    ```bash
    pnpm dev
    ```
    The application will be available at `http://localhost:3000`.

-   **Start the Python backend:**
    ```bash
    pnpm flask-dev
    ```
    The Flask API will run on `http://127.0.0.1:5328`.

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


## Deployment

This application is designed to be deployed on [Vercel](https://vercel.com/).

### Telegram Webhook

After deploying, you need to set the Telegram webhook to point to your Vercel deployment URL.

Run the setup script to configure the webhook:
```bash
bash ./setup.sh
```
Make sure your `.env.local` is configured with the correct `TELEGRAM_API_KEY` and `TELEGRAM_API_SECRET` before running the script. The script currently uses `https://april-python.vercel.app` as the webhook URL; you may need to update this in `setup.sh` to match your deployment's URL.

## License

This project is licensed under the MIT License. It is recommended to create a `LICENSE.md` file in your project with the license details.