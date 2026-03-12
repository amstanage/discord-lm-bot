require("dotenv").config();
const { Client, GatewayIntentBits, Partials } = require("discord.js");

const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
const LM_STUDIO_URL = process.env.LM_STUDIO_URL || "http://localhost:1234";
const SYSTEM_PROMPT = process.env.SYSTEM_PROMPT || "You are a helpful assistant.";

if (!DISCORD_TOKEN) {
  console.error("Missing DISCORD_TOKEN in .env file");
  process.exit(1);
}

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages,
  ],
  partials: [Partials.Channel],
});

// Keep recent conversation history per channel (last 20 messages)
const conversationHistory = new Map();
const MAX_HISTORY = 20;

function getHistory(channelId) {
  if (!conversationHistory.has(channelId)) {
    conversationHistory.set(channelId, []);
  }
  return conversationHistory.get(channelId);
}

function addToHistory(channelId, role, content) {
  const history = getHistory(channelId);
  history.push({ role, content });
  if (history.length > MAX_HISTORY) {
    history.splice(0, history.length - MAX_HISTORY);
  }
}

async function queryLMStudio(channelId, userMessage) {
  addToHistory(channelId, "user", userMessage);

  const messages = [
    { role: "system", content: SYSTEM_PROMPT },
    ...getHistory(channelId),
  ];

  const res = await fetch(`${LM_STUDIO_URL}/v1/chat/completions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`LM Studio returned ${res.status}: ${text}`);
  }

  const data = await res.json();
  const reply = data.choices?.[0]?.message?.content?.trim();

  if (!reply) throw new Error("Empty response from LM Studio");

  addToHistory(channelId, "assistant", reply);
  return reply;
}

// Discord has a 2000 char limit — split long responses
function splitMessage(text, maxLength = 2000) {
  if (text.length <= maxLength) return [text];

  const chunks = [];
  let remaining = text;

  while (remaining.length > 0) {
    if (remaining.length <= maxLength) {
      chunks.push(remaining);
      break;
    }

    // Try to split at a newline, then at a space
    let splitAt = remaining.lastIndexOf("\n", maxLength);
    if (splitAt < maxLength * 0.5) splitAt = remaining.lastIndexOf(" ", maxLength);
    if (splitAt < maxLength * 0.5) splitAt = maxLength;

    chunks.push(remaining.substring(0, splitAt));
    remaining = remaining.substring(splitAt).trimStart();
  }

  return chunks;
}

client.once("ready", () => {
  console.log(`Logged in as ${client.user.tag}`);
  console.log(`LM Studio endpoint: ${LM_STUDIO_URL}`);
});

client.on("messageCreate", async (message) => {
  // Ignore bot messages
  if (message.author.bot) return;

  // Respond when mentioned or in DMs
  const isDM = !message.guild;
  const isMentioned = message.mentions.has(client.user);

  if (!isDM && !isMentioned) return;

  // Strip the bot mention from the message
  const content = message.content
    .replace(new RegExp(`<@!?${client.user.id}>`, "g"), "")
    .trim();

  if (!content) {
    await message.reply("Hey! Ask me something.");
    return;
  }

  try {
    await message.channel.sendTyping();

    const reply = await queryLMStudio(message.channel.id, content);
    const chunks = splitMessage(reply);

    for (let i = 0; i < chunks.length; i++) {
      if (i === 0) {
        await message.reply(chunks[i]);
      } else {
        await message.channel.send(chunks[i]);
      }
    }
  } catch (err) {
    console.error("Error:", err.message);

    const errorMsg = err.message.includes("ECONNREFUSED")
      ? "Can't reach LM Studio — make sure it's running with the local server enabled."
      : `Something went wrong: ${err.message}`;

    await message.reply(errorMsg);
  }
});

client.login(DISCORD_TOKEN);
