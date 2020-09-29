import { Language, Lang } from "../../../languages/Language";
import { ArgType, Command } from "../../commandLoader";
const Discord = require("discord.js");
const bot = require("../../bot").bot;

export var Eval: Command = {
  category: "Utility",
  name: "eval",
  description: Language.getNode(Lang.English, "command.eval.description"),
  aliases: ["evaluate"],
  clientPermissions: [],
  ownerOnly: true,
  args: [
    {
      unordered: false,
      type: ArgType.string,
      match: "everything",
      description: "The code to be evaluated",
    },
  ],
  dms: true,
  exec: async (message, [text]: [string]) => {
    try {
      const evaled = await eval(text);
      let content = `\`\`\`xl\n${evaled}\`\`\``;
      if (content.length > 1990) {
        console.log(evaled);
        return message.channel.send(
          `:x: (SUCCESS) Content too long, pasting in console...`
        );
      }
      const embed = new Discord.MessageEmbed()
        .setColor("GREEN")
        .setTimestamp()
        .setAuthor(message.author.tag, message.author.displayAvatarURL())
        .setDescription(content);
      return message.channel.send(embed);
    } catch (err) {
      let content = `\`\`\`xl\n${err}\`\`\``;
      if (content.length > 1990) {
        console.log(err);
        return message.channel.send(
          `:x: (ERROR) Content too long, pasting in console...`
        );
      }
      const embed = new Discord.MessageEmbed()
        .setColor("RED")
        .setTimestamp()
        .setAuthor(message.author.tag, message.author.displayAvatarURL())
        .setDescription(content);
      return message.channel.send(embed);
    }
  },
};
