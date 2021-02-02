import { MessageEmbed } from "discord.js";
import fetch from "node-fetch";
import { Language } from "../../../language/Language";
import { Utils } from "../../../Utils";
import { Command } from "../../commandManager";

export const Aww: Command = {
  name: "command.aww.name",
  description: "command.aww.description",
  category: "Animals",
  exec: async (message, _2, lang) => {
    const msg = await message.channel.send(
      Language.getNode(lang, "command.aww.finding")
    );
    const embed = await getAnimal();
    return msg.edit("", { embed: Utils.setEmbedAuthor(embed, message.author) });
  },
};

async function getAnimal(): Promise<MessageEmbed> {
  const random = await fetch("http://www.reddit.com/r/aww/random.json?limit=1");
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
