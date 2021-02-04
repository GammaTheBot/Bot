import { MessageEmbed } from "discord.js";
import axios, { AxiosResponse } from "axios";
import { Language } from "../../../language/Language";
import { Utils } from "../../../Utils";
import { Command } from "../../commandManager";

export const Lizard: Command = {
  name: "command.lizard.name",
  description: "command.lizard.description",
  aliases: "command.lizard.aliases",
  category: "Animals",
  dms: true,
  exec: async (message, _, lang) => {
    const msg = await message.channel.send(
      Language.getNode(lang, "command.lizard.finding")
    );
    let response: AxiosResponse<any>;
    try {
      response = await axios.get("https://nekos.life/api/v2/img/lizard");
    } catch (error) {
      msg.edit("", Utils.errorEmbed(lang));
      return;
    }
    const data = response.data;
    console.log(data);
    const embed = new MessageEmbed()
      .setImage(data.url)
      .setColor("#ffc0cb")
      .setTitle(Language.getNode(lang, "image_missing"))
      .setURL(data.url);
    return msg.edit("", {
      embed: Utils.setEmbedAuthor(embed, message.author).setFooter(
        Language.getNode<string>(lang, "thanks-to").replace(
          /\{source\}/gi,
          "nekos.life"
        )
      ),
    });
  },
};
