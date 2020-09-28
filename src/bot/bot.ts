import Discord from "discord.js";
import fs from "fs";
import path from "path";
import { numberComma } from "../functions";
const bot = new Discord.Client({
  // Creates a discordjs client
  messageCacheMaxSize: 100, // How many messages per channel should be cached
  partials: ["REACTION", "CHANNEL", "USER", "GUILD_MEMBER", "MESSAGE"], // Structures allowed to be partial (basically usually discord only sends events if they have all the structure data, but by selecting those intents discord will send events even when there isn't the entire data)
  retryLimit: 2, // Retry two times if discord returns server-side errors
  presence: {
    status: "online",
    activity: {
      type: "WATCHING",
      name: "myself start up",
    },
  },
});

bot.login(process.env.bot_token); // Logs in the bot

bot.on("ready", async () => {
  console.log("Starting up...");
  console.log("loading all events...");
  const eventFiles = fs.readdirSync(path.join(__dirname, "events"));
  eventFiles.forEach(async (file) => {
    await import(path.join(__dirname, "events", file)); // Imports each event file
  });
  console.log("Loaded all events!");
  await import("./commandLoader"); // Loads commands
  updateStatus();
  setInterval(updateStatus, 60000); // Updates the status every 60 seconds (Rather than doing it every time the bot leaves/joins a guild as if more than 1 guild gets added per minute it'll be inefficient (I hope we'll reach that stage))
});

export { bot };

async function updateStatus() {
  const serverCount = bot.guilds.cache.size;
  bot.user.setPresence({
    activity: {
      name: `on ${numberComma(serverCount)} server${
        serverCount === 1 ? "" : "s"
      }!`,
      type: "PLAYING",
    },
    status: "online",
  });
}
