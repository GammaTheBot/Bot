import { Language, Lang } from "../../../languages/Language";
import { ArgType, Command, commands, categories } from "../../commandLoader";
import Discord from "discord.js";
// import { bot } from "../../bot";

export var Help: Command = {
  category: "Utility",
  name: "help",
  usage: "help [command]",
  description: (guild) =>
    Language.getNode(guild, ["command", "help", "description"]),
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
    if (!command) {
      const helpEmbed = new Discord.MessageEmbed()
        .setColor("BLUE")
        .setTitle("Gamma Help")
        .setTimestamp()
        .setDescription(
          "Execute `!help <command>` to find information on specific commands!"
        )
        .setAuthor(message.author.tag, message.author.displayAvatarURL());
      for (const key of Object.values(categories)) {
        if (key.commands) {
          helpEmbed.addField(
            `${key.name}`,
            `${key.commands.map((e) => `\`${e.name}\``).join(", ")}`
          );
        }
      }
      return message.channel.send(helpEmbed);
    }
    const cmd = commands.find(
      (c) => c.name === command || c.aliases?.includes(command)
    );
    const helpEmbed = new Discord.MessageEmbed()
      .setColor("BLUE")
      .setTitle(`Gamma Help - ${cmd.name}`)
      .setTimestamp()
      .setAuthor(message.author.tag, message.author.displayAvatarURL())
      .setDescription(
        `Name: \`${cmd.name}\`` +
          `\n${cmd.usage ? `Usage: \`${cmd.usage}\`` : ``}` +
          `\n${
            cmd.aliases
              ? `${
                  cmd.aliases.length > 1 ? `Aliases: ` : `Alias:`
                } \`${cmd.aliases.join(", ")}\``
              : ``
          }` +
          `\nCategory: \`${cmd.category}\`` +
          `\nDescription: \`${cmd.description(message.guild.id)}\`` +
          `\n${
            cmd.examples.length > 1 ? `Examples: ` : `Example: `
          } ${cmd.examples.map((m) => `\`${m}\``).join(", ")}`
      );
    return message.channel.send(helpEmbed);
  },
};
