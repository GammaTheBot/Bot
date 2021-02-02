import { MessageEmbed } from "discord.js";
import fetch from "node-fetch";
import { Language } from "../../../language/Language";
import { Utils } from "../../../Utils";
import { Command } from "../../commandManager";

export const Bird: Command = {
  name: "command.bird.name",
  description: "command.bird.description",
  aliases: "command.bird.aliases",
  category: "Animals",
  dms: true,
  exec: async (message, _2, lang) => {
    const msg = await message.channel.send(
      Language.getNode(lang, "command.bird.finding")
    );
    const embed = await getAnimal();
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

async function getAnimal(): Promise<MessageEmbed> {
  const random = await fetch(
    "http://www.reddit.com/r/birb/random.json?limit=1"
  );
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
