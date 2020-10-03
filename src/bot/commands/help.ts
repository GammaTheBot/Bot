import { Language, Lang } from "../../languages/Language";
import {
  ArgType,
  Command,
  commands,
  categories,
  aliasesToString,
  getUsage,
  getCommand,
} from "../commandLoader";
import Discord from "discord.js";
import { Guilds } from "../../Guilds";
import { Utils } from "../../Utils";
import { bot } from "../bot";

export var Help: Command = {
  category: "Utility",
  name: "command.help.name",
  editable: true,
  description: "command.help.description",
  args: [
    {
      unordered: false,
      type: ArgType.lowercase,
      match: "everything",
      optional: true,
      name: "command",
    },
  ],
  dms: true,
  examples: ["help", "help eval"],
  exec: async (message, { command }: { command: string }) => {
    if (!command) {
      const embed = new Discord.MessageEmbed()
        .setAuthor(message.author.tag, message.author.displayAvatarURL())
        .setTimestamp()
        .setColor(await Guilds.getColor(message.guild?.id))
        .setTitle(
          bot.user.username +
            " " +
            (await Language.replaceNodes(message.guild?.id, "help"))
        );
      let description = `${await Language.getNode(
        message.guild?.id,
        "command.help.info"
      )}\n`
        .replace(/\{prefix\}/gi, await Guilds.getPrefix(message.guild?.id))
        .replace(/\{mention\}/gi, "@" + bot.user.username);
      for await (const category of Object.values(categories)) {
        const name = `**${await Language.replaceNodes(
          message.guild?.id,
          category.name
        )}**`;
        let stuff = "";
        const cmds: string[] = [];
        if (category.commands)
          for await (const cmd of category.commands) {
            cmds.push(await Language.getNode(message.guild?.id, cmd.name));
          }
        stuff += `${await Language.replaceNodes(
          message.guild?.id,
          category.description
        )}`;
        if (cmds.length > 0) stuff += `\n\`${cmds.join("`, `")}\``;
        embed.addField(name, stuff);
      }
      return message.channel.send(embed.setDescription(description));
    }
  },
};
