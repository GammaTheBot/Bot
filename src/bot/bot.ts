import Discord from "discord.js";
import { readdirSync } from "fs";
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
      type: "COMPETING",
      name: "starting up",
    },
  },
  ws: {
    properties: {
      $device: "Gamma",
      $browser: "discord.js",
    },
  },
});
bot.login(process.env.bot_token);
bot.on("debug", console.info);
bot.on("ready", async () => {
  console.log("Bot ready! Starting up modules...");
  console.log("Loading all commands...");
  await import("./commandManager");
  console.log("Loading all events...");
  const eventFiles = readdirSync(path.join(__dirname, "events"));
  eventFiles.forEach(async (file) => {
    await import(path.join(__dirname, "events", file)); // Imports each event file
  });
  console.log("Loaded all events!");
  updateStatus();
  setInterval(updateStatus, 60000);
});

export { bot };

async function updateStatus() {
  const serverCount = bot.guilds.cache.size;
  bot.user.setPresence({
    activity: {
      name: `${numberComma(serverCount)} servers`,
      type: "WATCHING",
    },
    status: "online",
  });
}
