import { Language, Lang } from "../../languages/Language";
import {
  ArgType,
  Command,
  commands,
  categories,
  aliasesToString,
} from "../commandLoader";
import Discord from "discord.js";
import { Guilds } from "../../Guilds";

export var Help: Command = {
  category: "Utility",
  name: "command.help.name",
  editable: true,
  description: "command.help.description",
  clientPermissions: [],
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
    const prefix: string = await Guilds.getPrefix(message.guild.id);
    if (!command) {
      const helpEmbed = new Discord.MessageEmbed()
        .setColor("BLUE")
        .setTitle("Gamma Help")
        .setTimestamp()
        .setDescription(
          `The prefix of this bot is \`${prefix}\` and the user tag of the bot. For example \`@Gamma help\` or \`${prefix}help\`. Execute \`!help <command>\` to find information on specific commands!`
        )
        .setAuthor(message.author.tag, message.author.displayAvatarURL());
      for await (const key of Object.values(categories)) {
        if (key.commands) {
          const cmds: string[] = [];
          for await (const cmd of key.commands) {
            const node = await Language.getNode(message.guild?.id, cmd.name);
            cmds.push(node);
          }
          helpEmbed.addField(
            `${await Language.replaceNodes(message.guild?.id, key.name)}`,
            `\`${cmds.join("`, `")}\``
          );
        }
      }
      return message.channel.send(helpEmbed);
    }
    const cmd = commands.find(
      async (c) =>
        c.name === command ||
        (await aliasesToString(message.guild?.id, c.aliases)).includes(command)
    );
    const helpEmbed = new Discord.MessageEmbed()
      .setColor("BLUE")
      .setTitle(`Gamma Help - ${cmd.name}`)
      .setTimestamp()
      .setAuthor(message.author.tag, message.author.displayAvatarURL())
      .setDescription(
        `**Name:** ${await Language.getNode(message.guild?.id, cmd.name)}\n
        **Description:** ${await Language.getNode(
          message.guild?.id,
          cmd.name
        )}\n
        **Usage:** ${await Language.replaceNodes(
          message.guild?.id,
          cmd.usage
        )}\n
        **Aliases:** \`${(
          await aliasesToString(message.guild?.id, cmd.aliases)
        ).join(`\`, \``)}\`\n
        **Category:** ${await Language.getNode(
          message.guild?.id,
          cmd.category
        )}\n
        **Examples:** \`${(
          await aliasesToString(message.guild?.id, cmd.examples)
        ).join(`\`, \``)}\`\n`
      );
    return message.channel.send(helpEmbed);
  },
};
