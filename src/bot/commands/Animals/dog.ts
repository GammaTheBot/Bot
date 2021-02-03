import { MessageEmbed } from "discord.js";
import axios, { AxiosResponse } from "axios";
import { Language } from "../../../language/Language";
import { Utils } from "../../../Utils";
import { Command } from "../../commandManager";

export const Dog: Command = {
  name: "command.dog.name",
  description: "command.dog.description",
  aliases: "command.dog.aliases",
  category: "Animals",
  dms: true,
  exec: async (message, _, lang) => {
    const msg = await message.channel.send(
      Language.getNode(lang, "command.dog.finding")
    );
    let response: AxiosResponse<any>;
    try {
      response = await axios.get("https://api.thedogapi.com/v1/images/search", {
        headers: {
          "x-api-key": process.env.cat_api_key,
        },
      });
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
          "thedogapi.com"
        )
      ),
    });
  },
};
