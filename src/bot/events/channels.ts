import Discord, { GuildChannel } from "discord.js";
import { firstCharToUpperCase, objDifference } from "../../functions";
import { Guilds } from "../../Guilds";
import { Utils } from "../../Utils";
import { bot } from "../bot";

bot.on("channelCreate", async (channel) => {
  if (channel.type === "dm" || channel.type === "group") return;
  let guildChannel = channel as GuildChannel;
  const doc = await Utils.getDoc(guildChannel.guild.id, "loggingData", 1000);
  if (!doc?.channels || doc?.bypass?.includes(channel.id)) return;
  let desc = `**Channel:** ${guildChannel.toString()} (${
    guildChannel.id
  })\n**Type:** ${firstCharToUpperCase(guildChannel.type)}`;
  if (doc?.useAudits) {
    const entry = (
      await guildChannel.guild.fetchAuditLogs({ type: "CHANNEL_CREATE" })
    ).entries.first();
    desc += `\n**Created by:** ${entry.executor.toString()}`;
  }
  const embed = new Discord.MessageEmbed()
    .setTitle("Channel Created")
    .setColor(await Guilds.getColor(guildChannel.guild.id))
    .setTimestamp(guildChannel.createdTimestamp)
    .setDescription(desc);
  const logChannel = guildChannel.guild.channels.cache.get(
    doc.channels
  ) as Discord.TextChannel;
  logChannel.send(embed);
});

bot.on("channelDelete", async (channel) => {
  if (channel.type === "dm" || channel.type === "group") return;
  const guildChannel = channel as GuildChannel;
  const doc = await Utils.getDoc(guildChannel.guild.id, "loggingData", 1000);
  if (!doc?.channels) return;
  const yes = bot.emojis.cache.get("743128557966065785");
  const no = bot.emojis.cache.get("743128064937951322");
  let desc = `**Channel:** ${guildChannel.name} (${
    guildChannel.id
  })\n**Type:** ${guildChannel.type}\n**Position:** ${
    guildChannel.position
  }\n**Permissions:** ${guildChannel.permissionOverwrites.map(
    (p) =>
      `**${
        p.type === "role"
          ? guildChannel.guild.roles.cache.get(p.id).toString()
          : guildChannel.guild.members.cache.get(p.id).toString()
      }:**\n ${yes}\n${p.allow}\n${no}\n${p.deny}`
  )}`;
  if (doc?.useAudits) {
    const entry = (
      await guildChannel.guild.fetchAuditLogs({ type: "CHANNEL_DELETE" })
    ).entries.first();
    desc += `\n**Deleted by:** ${entry.executor.toString()}`;
  }
  const embed = new Discord.MessageEmbed()
    .setTitle("Channel Deleted")
    .setColor(await Guilds.getColor(guildChannel.guild.id))
    .setTimestamp()
    .setDescription(desc);
  const logsChannel = guildChannel.guild.channels.cache.get(
    doc.channels
  ) as Discord.TextChannel;
  logsChannel.send(embed);
});

bot.on("channelUpdate", async (oldChannel, newChannel) => {
  if (newChannel.type === "dm" || newChannel.type === "group") return;
  const oldGuildChannel = oldChannel as GuildChannel;
  const newGuildChannel = newChannel as GuildChannel;
  const doc = await Utils.getDoc(newGuildChannel.guild.id, "loggingData", 1000);
  if (!doc?.channels || doc?.bypass?.includes(newChannel.id)) return;
  const changes = objDifference(
    oldGuildChannel.toJSON(),
    newGuildChannel.toJSON()
  );
  const overWriteChanges = objDifference(
    oldGuildChannel.permissionOverwrites.toJSON(),
    newGuildChannel.permissionOverwrites.toJSON()
  );

  let desc = [];
  if (
    Object.keys(changes).length < 1 &&
    Object.keys(overWriteChanges).length < 1
  )
    return;
  desc.push(
    `**Channel:** ${newGuildChannel.toString()} (${newGuildChannel.id})`
  );
  if (doc?.useAudits) {
    const entry = (
      await newGuildChannel.guild.fetchAuditLogs({ type: "CHANNEL_UPDATE" })
    ).entries.first();
    desc.push(`**Updated by:** ${entry.executor.toString()}`);
  }
  Object.entries(changes).forEach((change) => {
    desc.push(
      `**Old ${change[0]}:** ${oldChannel[change[0]]}\n**New ${change[0]}:** ${
        change[1]
      }\n`
    );
  });
  if (Object.values(overWriteChanges).length > 0) {
    desc.push(`Permission Overwrites:`);
    Object.entries(overWriteChanges).forEach((overWriteChange) => {
      const oldPerms = oldGuildChannel.permissionOverwrites.array()[
        overWriteChange[0]
      ] as Discord.PermissionOverwrites;
      desc.push(
        `**${oldPerms.channel.toString()}**\n` +
          Object.entries(overWriteChange[1]).map((o) => {
            const newPermissions = new Discord.Permissions(o[1]);
            return `**${o[0]}:**\n__Old:__ ${new Discord.Permissions(
              oldPerms[o[0]]
            )
              .toArray()
              .map((e) => `\`${e}\``)
              .join(`, `)}\n__New:__ ${newPermissions
              .toArray()
              .map((e) => `\`${e}\``)
              .join(`, `)}`;
          })
      );
    });
  }

  const embed = new Discord.MessageEmbed()
    .setTitle("Channel Updated")
    .setColor(await Guilds.getColor(newGuildChannel.guild.id))
    .setDescription(desc.join("\n"));
  const channel = newGuildChannel.guild.channels.cache.get(
    doc.channels
  ) as Discord.TextChannel;
  return channel.send(embed);
});
