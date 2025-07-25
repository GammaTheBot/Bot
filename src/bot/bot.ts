import Discord from "discord.js";
import { readdirSync } from "fs";
import path from "path";
import { numberComma } from "../functions";
import { Utils } from "../Utils";
import { commands } from "./commandManager";
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
  const { loadCommands } = await import("./commandManager");
  await loadCommands(path.join(__dirname, "commands"));
  console.log(
    `Loaded ${commands.length} ${Utils.getPlural(
      commands.length,
      "command",
      "commands"
    )}!`
  );
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
  bot.user?.setPresence({
    activity: {
      name: `${numberComma(serverCount)} servers`,
      type: "WATCHING",
    },
    status: "online",
  });
}
