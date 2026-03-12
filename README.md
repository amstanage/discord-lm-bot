# Companion Bot

A Discord bot that uses a local AI model running on your PC through [LM Studio](https://lmstudio.ai/) to answer messages. No cloud API keys or subscriptions needed — everything runs on your own hardware.

---

## How It Works

```
You send a message in Discord
        |
        v
Companion Bot receives it
        |
        v
Forwards it to LM Studio (running locally on your PC)
        |
        v
LM Studio generates a response using your chosen AI model
        |
        v
Companion Bot sends the response back to Discord
```

---

## What You'll Need

- **Node.js** (v18 or newer) — [Download here](https://nodejs.org/)
- **LM Studio** — [Download here](https://lmstudio.ai/)
- **A Discord account** — to create the bot

---

## Setup Guide

### Step 1: Set Up LM Studio

1. Download and install [LM Studio](https://lmstudio.ai/)
2. Open LM Studio and go to the **Discover** tab (the magnifying glass icon)
3. Search for a model — here are some good ones to start with:

   | Model | Size | Good For |
   |-------|------|----------|
   | `Llama 3.1 8B` | ~5 GB | General use, works on most PCs |
   | `Mistral 7B` | ~4 GB | Fast responses, good quality |
   | `Phi-3 Mini` | ~2 GB | Lightweight, great for older hardware |

   > **Tip:** Pick a model that fits your RAM. As a rough guide, you need about as much free RAM as the model file size. If you have 8 GB of RAM, stick with smaller models (4 GB or under).

4. Click **Download** on the model you want
5. Once downloaded, go to the **Developer** tab (the `<>` icon)
6. Select your downloaded model from the dropdown at the top
7. Click **Start Server** — you should see `Server started on port 1234`

   > Leave LM Studio running in the background. The bot needs it to generate responses.

### Step 2: Create a Discord Bot

1. Go to the [Discord Developer Portal](https://discord.com/developers/applications)
2. Click **New Application** and name it `Companion Bot` (or whatever you like)
3. Go to the **Bot** tab on the left sidebar
4. Click **Reset Token**, then **Copy** — save this token somewhere safe, you'll need it in a moment

   > **Important:** Never share your bot token with anyone. It gives full control of your bot.

5. Scroll down to **Privileged Gateway Intents** and enable:
   - **Message Content Intent** (this lets the bot read messages)

6. Go to **OAuth2 > URL Generator** on the left sidebar
7. Under **Scopes**, check `bot`
8. Under **Bot Permissions**, check:
   - `Send Messages`
   - `Read Message History`
9. Copy the **Generated URL** at the bottom, paste it in your browser, and select your server to invite the bot

### Step 3: Set Up the Bot Code

1. Open a terminal and navigate to the bot folder:

   ```bash
   cd path/to/discord-lm-bot
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create your config file by copying the example:

   ```bash
   cp .env.example .env
   ```

4. Open `.env` in a text editor and paste your bot token:

   ```
   DISCORD_TOKEN=paste-your-token-here
   ```

   The other settings have sensible defaults, but you can tweak them:

   | Setting | Default | What It Does |
   |---------|---------|-------------|
   | `DISCORD_TOKEN` | *(required)* | Your bot's login token from Step 2 |
   | `LM_STUDIO_URL` | `http://localhost:1234` | Where LM Studio's server is running |
   | `SYSTEM_PROMPT` | `You are a helpful assistant.` | Sets the AI's personality and behavior |

### Step 4: Start the Bot

```bash
npm start
```

You should see:

```
Logged in as Companion Bot#1234
LM Studio endpoint: http://localhost:1234
```

---

## Using the Bot

- **In a server:** Mention the bot — `@Companion Bot what is a black hole?`
- **In DMs:** Just send a message directly, no mention needed

The bot remembers the last 20 messages per channel, so you can have back-and-forth conversations.

---

## Customizing the System Prompt

The system prompt tells the AI how to behave. Edit it in your `.env` file:

```
SYSTEM_PROMPT=You are a friendly coding tutor. Explain things simply and use examples.
```

Some ideas:

- `You are a creative writing assistant. Help users brainstorm and improve their stories.`
- `You are a study buddy. Help users understand concepts and quiz them.`
- `You are a sarcastic robot who answers questions reluctantly but accurately.`

---

## Troubleshooting

**"Can't reach LM Studio"**
- Make sure LM Studio is open and the server is running (Developer tab > Start Server)
- Check that the port matches — default is `1234`

**Bot is online but not responding**
- Make sure you enabled **Message Content Intent** in the Discord Developer Portal
- In a server, you must `@mention` the bot — it doesn't read every message
- Check that the bot has permission to send messages in that channel

**Responses are slow**
- This is normal — the AI is running on your PC, not a data center
- Try a smaller model for faster responses
- Close other heavy applications to free up RAM

**Bot goes offline when you close the terminal**
- The bot only runs while the `npm start` process is active
- Keep the terminal window open, or look into tools like [PM2](https://pm2.keymetrics.io/) to run it in the background
