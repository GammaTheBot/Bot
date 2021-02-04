import { MessageEmbed } from "discord.js";
import axios, { AxiosResponse } from "axios";
import { Language } from "../../../language/Language";
import { Utils } from "../../../Utils";
import { Command } from "../../commandManager";
export const Aww: Command = {
  name: "command.snake.name",
  description: "command.snake.description",
  category: "Animals",
  aliases: "command.snake.aliases",
  dms: true,
  exec: async (message, _, lang) => {
    const msg = await message.channel.send(
      Language.getNode(lang, "command.snake.finding")
    );
    async function getAnimal(): Promise<MessageEmbed> | null {
      let random: AxiosResponse<any>;
      try {
        random = await axios.get(
          "http://www.reddit.com/r/snek/random.json?limit=1"
        );
      } catch (err) {
        msg.edit("", Utils.errorEmbed(lang));
        return;
      }
      const json = random.data;
      const data = json[0].data.children[0].data;
      if (
        data.is_video ||
        data.thumbnail === "default" ||
        data.score < 3 ||
        data.over_18
      )
        return await getAnimal();
      const embed = new MessageEmbed()
        .setTitle(data.title)
        .setURL(`https://reddit.com${data.permalink}`)
        .setImage(data?.secure_media?.oembed?.thumbnail_url || data.url)
        .setColor("#ffc0cb");
      return embed;
    }

    const embed = await getAnimal();
    if (embed)
      return msg.edit("", {
        embed: Utils.setEmbedAuthor(embed, message.author).setFooter(
          Language.getNode<string>(lang, "thanks-to").replace(
            /\{source\}/gi,
            "reddit.com"
          )
        ),
      });
  },
};
