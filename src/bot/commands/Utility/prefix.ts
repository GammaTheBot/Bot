import { GuildData } from "../../../database/schemas/guilds";
import { Guilds } from "../../../Guilds";
import { Language } from "../../../language/Language";
import { Perms } from "../../../Perms";
import { ArgType, Command } from "../../commandManager";
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
  exec: async (message, { prefix }: { prefix: string }, language) => {
    if (prefix) {
      if (await Perms.hasPermission(message.member, "botAdministrator")) {
        try {
          await GuildData.updateOne(
            { _id: message.guild.id },
            { $set: { prefix } },
            { upsert: true }
          );
          return message.channel.send(
            `:thumbsup: ${Language.getNode<string>(
              language,
              "command.prefix.changeSuccess"
            ).replace(/\{prefix\}/gi, `\`\`${prefix}\`\``)}!`
          );
        } catch (err) {
          console.error(err);
          return message.channel.send(
            `:x: ${Language.getNode(language, "command.prefix.changeFailure")}`
          );
        }
      }
    }
    const currentPrefix = await Guilds.getPrefix(message.guild?.id);
    await message.channel.send(
      `${Language.getNode<string>(language, "command.prefix.current").replace(
        /\{prefix\}/gi,
        `\`\`${currentPrefix}\`\``
      )}`
    );
    return;
  },
};
