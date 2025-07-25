import { MessageEmbed } from "discord.js";
import axios, { AxiosResponse } from "axios";
import { Language } from "../../../language/Language";
import { Utils } from "../../../Utils";
import { Command } from "../../commandManager";

export const Bunny: Command = {
  name: "command.bunny.name",
  description: "command.bunny.description",
  aliases: "command.bunny.aliases",
  category: "Animals",
  dms: true,
  exec: async (message, _, lang) => {
    const msg = await message.channel.send(
      Language.getNode(lang, "command.bunny.finding")
    );
    let response: AxiosResponse<any>;
    try {
      response = await axios.get(
        "https://api.bunnies.io/v2/loop/random/?media=gif,png"
      );
    } catch (error) {
      msg.edit("", Utils.errorEmbed(lang));
      return;
    }
    const data = response.data;
    const embed = new MessageEmbed()
      .setImage(data.media.gif || data.media.poster)
      .setTitle(Language.getNode(lang, "image_missing"))
      .setURL(data.media.gif || data.media?.poster)
      .setColor("#ffc0cb");
    return msg.edit("", {
      embed: Utils.setEmbedAuthor(embed, message.author).setFooter(
        Language.getNode<string>(lang, "thanks-to").replace(
          /\{source\}/gi,
          "www.bunnies.io"
        )
      ),
    });
  },
};
