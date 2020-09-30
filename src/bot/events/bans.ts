import Discord from "discord.js";
import { LoggingData } from "../../database/schemas/logging";
import { Guilds } from "../../Guilds";
import { bot } from "../bot";
bot.on("guildBanAdd", async (guild, user) => {
  const doc = await LoggingData.findById(guild.id);
  if (!doc?.bans) return;

  if (user.partial) user = await user.fetch();
  const ban = await guild.fetchBan(await user.fetch());
  let description = `**User:** ${user.username} (${user.id})\n**Reason:** ${
    ban.reason || "None"
  }`;
  if (doc?.useAudits) {
    const entry = (
      await guild.fetchAuditLogs({ type: "MEMBER_BAN_ADD" })
    ).entries.first();
    description += `\n**Banned by:** ${entry.executor.toString()}`;
  }
  const embed = new Discord.MessageEmbed()
    .setTitle("Ban Added")
    .setColor(await Guilds.getColor(guild.id))
    .setDescription(description);
  const channel = guild.channels.cache.get(doc.bans) as Discord.TextChannel;
  return channel.send(embed);
});

bot.on("guildBanRemove", async (guild, user) => {
  const doc = await LoggingData.findById(guild.id);
  if (!doc?.bans) return;

  if (user.partial) user = await user.fetch();
  const ban = await guild.fetchBan(await user.fetch());
  let description = `**User:** ${user.toString()}\n**Reason:** ${
    ban.reason || "None"
  }`;
  if (doc?.useAudits) {
    const entry = (
      await guild.fetchAuditLogs({ type: "MEMBER_BAN_REMOVE" })
    ).entries.first();
    description += `\n**Banned by:** ${entry.executor.toString()}`;
  }
  const embed = new Discord.MessageEmbed()
    .setTitle("Ban Removed")
    .setColor(await Guilds.getColor(guild.id))
    .setDescription(description);
  const channel = guild.channels.cache.get(doc.bans) as Discord.TextChannel;
  return channel.send(embed);
});
