import { Language, Lang } from "../../languages/Language";
import {
  ArgType,
  Command,
  commands,
  categories,
  getCommand,
  aliasesToString,
  getUsage,
} from "../commandLoader";
import Discord, { Message } from "discord.js";
import { Guilds } from "../../Guilds";
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
    const cmd = await getCommand(command, message.guild?.id, commands);
    const embed = new Discord.MessageEmbed()
      .setAuthor(message.author.tag, message.author.displayAvatarURL())
      .setTimestamp()
      .setColor(await Guilds.getColor(message.guild?.id))
      .setTitle(
        bot.user.username +
          " " +
          (await Language.replaceNodes(message.guild?.id, "help"))
      );
    embed.setDescription(await getCmdHelp(cmd, message));
    return message.channel.send(embed);
  },
};

export async function getCmdHelp(
  cmd: Command,
  message: Message
): Promise<string> {
  let description = [
    `**${await Language.getNode(
      message.guild?.id,
      "name"
    )}:** ${await Language.getNode(message.guild?.id, cmd.name)}`,
  ];
  if (cmd.description)
    description.push(
      `**${await Language.getNode(
        message.guild?.id,
        "description"
      )}:** ${await Language.getNode(message.guild?.id, cmd.description)}`
    );
  if (cmd.usage)
    description.push(
      `**${await Language.getNode(
        message.guild?.id,
        "usage"
      )}:** ${await Language.replaceNodes(message.guild?.id, cmd.usage)}`
    );
  if (cmd.aliases)
    description.push(
      `**${await Language.getNode(message.guild?.id, "aliases")}:** \`${(
        await aliasesToString(message.guild?.id, cmd.aliases)
      ).join("`, `")}\``
    );
  if (cmd.category)
    description.push(
      `**${await Language.getNode(
        message.guild?.id,
        "category"
      )}:** ${await Language.replaceNodes(
        message.guild?.id,
        categories[cmd.category].name
      )}`
    );
  if (cmd.examples)
    description.push(
      `**${await Language.getNode(
        message.guild?.id,
        "examples"
      )}:** \`${await aliasesToString(message.guild?.id, cmd.examples)}\``
    );
  if (cmd.subcommands)
    description.push(
      `**${await Language.getNode(message.guild?.id, "subcommands")}:**\n${(
        await aliasesToString(
          message.guild?.id,
          cmd.subcommands.map((s) => {
            console.log(getUsage(s));
            return `• \`${getUsage(s)}\``;
          })
        )
      ).join("\n")}`
    );
  return description.join("\n");
}
