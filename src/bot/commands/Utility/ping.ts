import { toTimespan } from "../../../functions";
import { bot } from "../../bot";
import { Command } from "../../commandManager";

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
      `**Bot:** ${toTimespan(
        msg.createdTimestamp - message.createdTimestamp,
        true
      )}\n**API:** ${toTimespan(bot.ws.ping, true)}`
    );
  },
};
