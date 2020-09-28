import Discord from "discord.js";
import fs from "fs";
import path from "path";
const bot = new Discord.Client({
  messageCacheMaxSize: 100,
  partials: ["REACTION", "CHANNEL", "USER", "GUILD_MEMBER", "MESSAGE"],
  retryLimit: 2,
  presence: {
    status: "online",
    activity: {
      type: "WATCHING",
      name: "myself start up",
    },
  },
});

bot.login(process.env.bot_token);

bot.on("ready", async () => {
  console.log("Starting up...");
  console.log("loading all events...");
  const eventFiles = fs.readdirSync(path.join(__dirname, "events"));
  eventFiles.forEach(async (file) => {
    await import(path.join(__dirname, "events", file));
  });
  console.log("Loaded all events!");
  await import("./commandLoader");
  updateStatus();
  setInterval(updateStatus, 60000);
});

export { bot };

async function updateStatus() {
  const serverCount = bot.guilds.cache.size;
  bot.user.setPresence({
    activity: {
      name: `on ${serverCount} server${serverCount === 1 ? "" : "s"}!`,
      type: "PLAYING",
    },
    status: "online",
  });
}
