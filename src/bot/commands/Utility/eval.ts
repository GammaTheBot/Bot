import { Language, Lang } from "../../../languages/Language";
import { ArgType, Command } from "../../commandLoader";
const Discord = require("discord.js");
const bot = require("../../bot").bot;

export var Eval: Command = {
  category: "Utility",
  name: "command.eval.name",
  editable: true,
  description: "command.eval.description",
  aliases: "command.eval.aliases",
  clientPermissions: [],
  botOwnerOnly: true,
  examples: ["{command.eval.name} true"],
  args: [
    {
      unordered: false,
      type: ArgType.string,
      match: "everything",
      name: "code",
    },
  ],
  dms: true,
  exec: async (message, { code }: { code: string }) => {
    try {
      const evaled = await eval(code);
      let content = `\`\`\`xl\n${evaled}\`\`\``;
      if (content.length > 1990) {
        console.log(evaled);
        return message.channel.send(
          `:: (SUCCESS) Content too long, pasting in console...`
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
