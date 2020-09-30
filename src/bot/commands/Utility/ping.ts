import { toTimespan } from "../../../functions";
import { bot } from "../../bot";
import { Command } from "../../commandLoader";

export const Ping: Command = {
  name: "ping",
  aliases: ["pong"],
  description: (guild) => "Get the bot's description",
  category: "Utility",
  clientPermissions: ["SEND_MESSAGES"],
  examples: ["ping"],
  dms: true,
  editable: true,
  exec: async (message) => {
    const msg = await message.channel.send("Pinging...");
    msg.edit(
      `**Bot Latency:** ${toTimespan(
        msg.createdTimestamp - message.createdTimestamp
      )}\n**API Latency:** ${toTimespan(bot.ws.ping)}`
    );
  },
};
