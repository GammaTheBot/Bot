import { MessageEmbed } from "discord.js";
import axios, { AxiosResponse } from "axios";
import { Language } from "../../../language/Language";
import { Utils } from "../../../Utils";
import { Command } from "../../commandManager";

export const DogFact: Command = {
  name: "command.dogfact.name",
  description: "command.dpgfact.description",
  aliases: "command.dogfact.aliases",
  category: "Animals",
  dms: true,
  exec: async (message, _, lang) => {
    const msg = await message.channel.send(
      Language.getNode(lang, "command.dogfact.finding")
    );
    let response: AxiosResponse<any>;
    try {
      response = await axios.get("https://some-random-api.ml/facts/dog");
    } catch (error) {
      msg.edit("", Utils.errorEmbed(lang));
      return;
    }
    const data = response.data;
    const embed = new MessageEmbed()
      .setColor("#ffc0cb")
      .setTitle(Language.getNode(lang, "command.dogfact.fact") + "| English")
      .setDescription(data.fact);
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
