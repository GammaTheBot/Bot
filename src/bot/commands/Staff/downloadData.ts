import { MessageAttachment } from "discord.js";
import { db } from "../../../database/db";
import { Language } from "../../../language/Language";
import { Command } from "../../commandManager";

export const DownloadData: Command = {
  name: "command.downloaddata.name",
  aliases: "command.downloaddata.aliases",
  description: "command.downloaddata.description",
  usage: "",
  category: "Staff",
  guildOwnerOnly: true,
  dms: false,
  exec: async (message, _args, language) => {
    const collections = Object.values(db().collections);
    const json = {};
    for await (let collection of collections) {
      const doc = await collection.findOne({
        _id: message.guild?.id,
      });
      if (doc != null) {
        delete doc._id;
        delete doc.__v;
        json[collection.name.replace("datas", "")] = doc;
      }
    }
    const attachment = new MessageAttachment(
      Buffer.from(JSON.stringify(json)),
      `${message.guild.name}-${
        message.guild.id
      }-${new Date().toISOString()}.json`
    );
    const channel = await message.author.createDM();
    try {
      await channel.send(attachment);
    } catch (err) {
      return message.channel.send(
        ":x: " + Language.getNode(language, "dms.closed-message")
      );
    }
  },
};
