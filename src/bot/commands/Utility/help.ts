import { Language, Lang } from "../../../languages/Language";
import { ArgType, Command, commands, categories } from "../../commandLoader";
import Discord from 'discord.js';
import { bot } from "../../bot"

export var Eval: Command = {
  category: "Utility",
  name: "help",
  description: Language.getNode(Lang.English, "command.help.description"),
  clientPermissions: [],
  args: [
    {
      unordered: false,
      type: ArgType.lowercase,
      match: "everything",
      description: "The command to describe",
      optional: true,
    },
  ],
  dms: true,
  exec: async (message, [text]: [string]) => {
    if (!text) {
        const helpEmbed = new Discord.MessageEmbed()
        .setColor("BLUE")
        .setTitle("Gamma Help")
        .setTimestamp()
        .setDescription("Execute `!help <command>` to find information on specific commands!")
        .setAuthor(message.author.tag, message.author.displayAvatarURL());
        for (const key of Object.values(categories)) {
            if (key.commands) {
                helpEmbed.addField(`${key.name}`, `${key.commands.map((e) => `\`${e.name}\``).join(", ")}`)
            }
        }
        return message.channel.send(helpEmbed);
    }
    const command = commands.find(
        (c) => c.name === text || c.aliases?.includes(text)
    );
    const helpEmbed = new Discord.MessageEmbed()
    .setColor("BLUE")
    .setTitle(`Gamma Help - ${command.name}`)
    .setTimestamp()
    .setAuthor(message.author.tag, message.author.displayAvatarURL())
    .setDescription(
        `Name: \`${command.name}\`\nDescription: \`delta did this bad, will add later lol\`\nCategory: \`${command.category}\`\nAliases: \`${command.aliases ? command.aliases.join(", ") : "None"}\``
        
    );
    return message.channel.send(helpEmbed);

  },
};
