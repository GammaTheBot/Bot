import { MessageEmbed } from "discord.js";
import axios, { AxiosResponse } from "axios";
import { Language } from "../../../language/Language";
import { Utils } from "../../../Utils";
import { Command } from "../../commandManager";

export const Duck: Command = {
  name: "command.duck.name",
  description: "command.duck.description",
  aliases: "command.duck.aliases",
  category: "Animals",
  dms: true,
  exec: async (message, _, lang) => {
    const msg = await message.channel.send(
      Language.getNode(lang, "command.duck.finding")
    );
    let response: AxiosResponse<any>;
    try {
      response = await axios.get(
        "https://random-d.uk/api/v2/random?format=json",
        {
          headers: {
            "x-api-key": process.env.cat_api_key,
          },
        }
      );
    } catch (error) {
      msg.edit("", Utils.errorEmbed(lang));
      return;
    }
    const data = response.data;
    const embed = new MessageEmbed()
      .setImage(data.url)
      .setColor("#ffc0cb")
      .setTitle(Language.getNode(lang, "image_missing"))
      .setURL(data.url);
    return msg.edit("", {
      embed: Utils.setEmbedAuthor(embed, message.author).setFooter(
        Language.getNode<string>(lang, "thanks-to").replace(
          /\{source\}/gi,
          "random-d.uk"
        )
      ),
    });
  },
};
