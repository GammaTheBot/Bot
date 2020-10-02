import { toTimespan } from "../../../functions";
import { bot } from "../../bot";
import { Command } from "../../commandLoader";

export const Ping: Command = {
  name: "command.ping.name",
  aliases: "command.ping.aliases",
  description: "command.ping.description",
  category: "Utility",
  clientPermissions: ["SEND_MESSAGES"],
  examples: "command.ping.examples",
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
