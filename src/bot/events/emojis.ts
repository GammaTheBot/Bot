import Discord from "discord.js";
import { objDifference } from "../../functions";
import { Guilds } from "../../Guilds";
import { Utils } from "../../Utils";
import { bot } from "../bot";

bot.on("emojiCreate", async (emoji) => {
  const doc = await Utils.getDoc(emoji.guild.id, "loggingData", 1000);
  if (!doc?.emojis) return;
  const embed = new Discord.MessageEmbed()
    .setTitle("Emoji Created")
    .setColor(await Guilds.getColor(emoji.guild.id))
    .setTimestamp(emoji.createdTimestamp)
    .setThumbnail(emoji.url)
    .setDescription(
      `**Emoji name:** ${emoji.name}\n**Author:** ${
        emoji.deleted
          ? "Unable to fetch, emoji was already deleted"
          : await emoji.fetchAuthor()
      }`
    );
  const channel = emoji.guild.channels.cache.get(
    doc.emojis
  ) as Discord.TextChannel;
  channel.send(embed);
});
bot.on("emojiDelete", async (emoji) => {
  const doc = await Utils.getDoc(emoji.guild.id, "loggingData", 1000);
  if (!doc?.emojis) return;
  const embed = new Discord.MessageEmbed()
    .setTitle("Emoji Deleted")
    .setColor(await Guilds.getColor(emoji.guild.id))
    .setThumbnail(emoji.url)
    .setDescription(`**Emoji name:** ${emoji.name}`);
  if (doc.useAudits) {
    const entry = (
      await emoji.guild.fetchAuditLogs({ type: "EMOJI_DELETE" })
    ).entries.first();
    embed.setDescription(
      (embed.description += `\n**Deleted by:** ${entry.executor.toString()}`)
    );
  }
  const channel = emoji.guild.channels.cache.get(
    doc.emojis
  ) as Discord.TextChannel;
  channel.send(embed);
});
bot.on("emojiUpdate", async (oldEmoji, newEmoji) => {
  const doc = await Utils.getDoc(newEmoji.guild.id, "loggingData", 1000);
  if (!doc?.emojis) return;
  const changes = objDifference(oldEmoji.toJSON(), newEmoji.toJSON());
  let desc = [];
  if (changes.name) {
    desc.push(`**Old Name:** ${oldEmoji.name}\n**New Name:** ${newEmoji.name}`);
  }
  if (changes.url) {
    desc.push(`**Old URL:** ${oldEmoji.url}\n**New URL:** ${newEmoji.url}`);
  }
  if (doc?.useAudits) {
    const entry = (
      await newEmoji.guild.fetchAuditLogs({ type: "EMOJI_UPDATE" })
    ).entries.first();
    desc.push(`\n**Updated by:** ${entry.executor.toString()}`);
  }
  const embed = new Discord.MessageEmbed()
    .setTitle("Emoji Updated")
    .setColor(await Guilds.getColor(newEmoji.guild.id))
    .setThumbnail(newEmoji.url)
    .setDescription(desc.join("\n"));
  const channel = newEmoji.guild.channels.cache.get(
    doc.emojis
  ) as Discord.TextChannel;
  return channel.send(embed);
});
