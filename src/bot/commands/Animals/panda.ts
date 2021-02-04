import { MessageEmbed } from "discord.js";
import axios, { AxiosResponse } from "axios";
import { Language } from "../../../language/Language";
import { Utils } from "../../../Utils";
import { Command } from "../../commandManager";

export const Panda: Command = {
  name: "command.panda.name",
  description: "command.panda.description",
  category: "Animals",
  dms: true,
  exec: async (message, _, lang) => {
    const msg = await message.channel.send(
      Language.getNode(lang, "command.panda.finding")
    );
    let response: AxiosResponse<any>;
    try {
      response = await axios.get("https://some-random-api.ml/img/panda");
    } catch (error) {
      msg.edit("", Utils.errorEmbed(lang));
      return;
    }
    const data = response.data;
    const embed = new MessageEmbed()
      .setImage(data.link)
      .setColor("#ffc0cb")
      .setTitle(Language.getNode(lang, "image_missing"))
      .setURL(data.link);
    return msg.edit("", {
      embed: Utils.setEmbedAuthor(embed, message.author).setFooter(
        Language.getNode<string>(lang, "thanks-to").replace(
          /\{source\}/gi,
          "some-random-api.ml"
        )
      ),
    });
  },
};
