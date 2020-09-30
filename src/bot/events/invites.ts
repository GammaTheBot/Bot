import Discord from "discord.js";
import { bot } from "../bot";
import { Guilds } from "../../Guilds";
import { Utils } from "../../Utils";
bot.on("inviteCreate", async (invite) => {
  const doc = await Utils.getDoc(invite.guild.id, "loggingData", 1000);
  if (!doc?.invites || doc?.bypass?.includes(invite.channel.id)) return;
  const embed = new Discord.MessageEmbed()
    .setTimestamp(invite.createdTimestamp)
    .setColor(await Guilds.getColor(invite.guild.id))
    .setTitle(`Invite Created`)
    .setDescription(
      `**Invite:** [${invite.code}](${
        invite.url
      })\n**Creator:** ${invite.inviter.toString()}\n**Max Age:** ${
        invite.maxAge
      }\n**Max Uses:** ${invite.maxUses}`
    );
  const channel = invite.guild.channels.cache.get(
    doc.invites
  ) as Discord.TextChannel;
  if (channel != null) channel.send(embed);
});
bot.on("inviteDelete", async (invite) => {
  const doc = await Utils.getDoc(invite.guild.id, "loggingData", 1000);
  if (!doc?.invites || doc?.bypass?.includes(invite.channel.id)) return;
  const embed = new Discord.MessageEmbed()
    .setTimestamp(invite.createdTimestamp)
    .setColor(await Guilds.getColor(invite.guild.id))
    .setTitle(`Invite Deleted`)
    .setDescription(
      `**Invite:** ${
        invite.code
      }\n**Creator:** ${invite.inviter.toString()}\n**Max Age:** ${
        invite.maxAge
      }\n**Max Uses:** ${invite.maxUses}\n**Uses:** ${invite.uses}`
    );

  const channel = invite.guild.channels.cache.get(
    doc.invites
  ) as Discord.TextChannel;
  if (channel != null) channel.send(embed);
});
