import { MessageEmbed } from "discord.js";
import axios from "axios";
import { Language } from "../../../language/Language";
import { Utils } from "../../../Utils";
import { Command } from "../../commandManager";

export const Bunny: Command = {
  name: "command.bunny.name",
  description: "command.bunny.description",
  aliases: "command.bunny.aliases",
  category: "Animals",
  dms: true,
  exec: async (message, _2, lang) => {
    const msg = await message.channel.send(
      Language.getNode(lang, "command.bunny.finding")
    );
    const embed = await getAnimal();
    return msg.edit("", {
      embed: Utils.setEmbedAuthor(embed, message.author).setFooter(
        Language.getNode<string>(lang, "thanks-to").replace(
          /\{source\}/gi,
          "https://www.bunnies.io"
        )
      ),
    });
  },
};

async function getAnimal(): Promise<MessageEmbed> {
  const random = await axios.get(
    "https://api.bunnies.io/v2/loop/random/?media=gif,png"
  );
  const json = random.data;
  const embed = new MessageEmbed()
    .setImage(json.media.gif || json.media.poster)
    .setColor("#ffc0cb");
  return embed;
}
