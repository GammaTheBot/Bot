import { MessageEmbed } from "discord.js";
import { Language } from "../../../language/Language";
import { Utils } from "../../../Utils";
import { Command } from "../../commandManager";
import { Prefetcher } from "./AnimalPrefetch";

class AwwPrefetcher extends Prefetcher {
  async parse(data: any){
    data = data[0].data.children[0].data;
    if (
      data.is_video ||
      data.thumbnail === "default" ||
      data.score < 3 ||
      data.over_18
    ) {
      this.get();
      return null;
    }
    return data;
  }
}

const prefetcher = new AwwPrefetcher("http://www.reddit.com/r/aww/random.json?limit=1");


export const Aww: Command = {
  name: "command.aww.name",
  description: "command.aww.description",
  category: "Animals",
  dms: true,
  exec: async (message, _, lang) => {
    const msg = await message.channel.send(
      Language.getNode(lang, "command.aww.finding")
    );
    const data = await prefetcher.retrieve();
            if(data == null){
      msg.edit("", Utils.errorEmbed(lang));
      return;
      }
    const embed = new MessageEmbed()
    .setTitle(data.title)
    .setURL(`https://reddit.com${data.permalink}`)
    .setImage(data?.secure_media?.oembed?.thumbnail_url || data.url)
    .setColor("#ffc0cb");
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
