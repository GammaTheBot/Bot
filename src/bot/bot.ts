import Discord from "discord.js";
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
bot.on("ready", () => {
  bot.user.setPresence({
    status: "online",
    activity: {
      type: "WATCHING",
      name: "myself start up",
    },
  });
});
