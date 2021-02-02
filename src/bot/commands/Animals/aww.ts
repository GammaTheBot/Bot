import { MessageEmbed } from "discord.js";
import fetch from "node-fetch";
import { Language } from "../../../language/Language";
import { Utils } from "../../../Utils";
import { Command } from "../../commandManager";
export const Aww: Command = {
  name: "command.aww.name",
  description: "command.aww.description",
  category: "Animals",
  dms: true,
  exec: async (message, _2, lang) => {
    const msg = await message.channel.send(
      Language.getNode(lang, "command.aww.finding")
    );
    async function getAnimal(): Promise<MessageEmbed> | null {
      const random = await fetch(
        "http://www.reddit.com/r/aww/random.json?limit=1"
      );
      if (!random.status.toString().startsWith(`2`)) {
        msg.edit("", Utils.errorEmbed(lang));
        return null;
      }
      const json = await random.json();
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
            "https://reddit.com"
          )
        ),
      });
  },
};
