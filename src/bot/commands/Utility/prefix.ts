import { GuildData } from "../../../database/schemas/guilds";
import { Language } from "../../../languages/Language";
import { ArgType, Command } from "../../commandLoader";
import { bot } from "../../../config.json";
import { Guilds } from "../../../Guilds";
import { Perms } from "../../../Perms";
export const Prefix: Command = {
  name: "command.prefix.name",
  category: "Utility",
  clientPermissions: ["SEND_MESSAGES"],
  dms: true,
  examples: "command.prefix.examples",
  args: [
    {
      type: ArgType.string,
      optional: true,
      name: "prefix",
    },
  ],
  description: "command.prefix.description",
  exec: async (message, { prefix }: { prefix: string }) => {
    if (prefix) {
      if (await Perms.hasPermission(message.member, "bot administrator")) {
        try {
          await GuildData.updateOne(
            { _id: message.guild.id },
            { $set: { prefix } },
            { upsert: true }
          );
          return message.channel.send(
            `:thumbsup: Successfully set the prefix to  \`\`${prefix}\`\`!`
          );
        } catch (err) {
          console.error(err);
          return message.channel.send(":x: An error was encountered!");
        }
      }
    }
    const currentPrefix = await Guilds.getPrefix(message.guild?.id);
    return message.channel.send(
      `The bot's prefix is \`\`${currentPrefix}\`\`!`
    );
  },
};
