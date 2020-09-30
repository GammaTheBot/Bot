import Discord from "discord.js";
import { numberComma, objDifference } from "../../functions";
import { bot } from "../bot";
import { Guilds } from "../../Guilds";
import { Utils } from "../../Utils";

bot.on("roleCreate", async (role) => {
  const doc = await Utils.getDoc(role.guild.id, "loggingData", 1000);
  if (!doc?.roles) return;
  let desc = `**Role:** ${role.toString()} (${role.id})\n**Color:** ${
    role.hexColor
  }\n**Position:** ${role.position}\n**Member size:** ${numberComma(
    role.members.size
  )}`;
  if (doc?.useAudits) {
    const entry = (
      await role.guild.fetchAuditLogs({ type: "ROLE_CREATE" })
    ).entries.first();
    desc += `\n**Created by:** ${entry.executor.toString()}`;
  }
  const embed = new Discord.MessageEmbed()
    .setTitle("Role Created")
    .setColor(await Guilds.getColor(role.guild.id))
    .setTimestamp(role.createdTimestamp)
    .setDescription(desc);
  const channel = role.guild.channels.cache.get(
    doc.roles
  ) as Discord.TextChannel;
  channel.send(embed);
});

bot.on("roleDelete", async (role) => {
  const doc = await Utils.getDoc(role.guild.id, "loggingData", 1000);

  if (!doc?.roles) return;
  let desc = `**Role:** ${role.name} (${role.id})\n**Color:** ${
    role.hexColor
  }\n**Position:** ${role.position}\n**Member size:** ${numberComma(
    role.members.size
  )}`;
  if (doc?.useAudits) {
    const entry = (
      await role.guild.fetchAuditLogs({ type: "ROLE_DELETE" })
    ).entries.first();
    desc += `\n**Deleted by:** ${entry.executor.toString()}`;
  }
  const embed = new Discord.MessageEmbed()
    .setTitle("Role Deleted")
    .setColor(await Guilds.getColor(role.guild.id))
    .setTimestamp()
    .setDescription(desc);
  const channel = role.guild.channels.cache.get(
    doc.roles
  ) as Discord.TextChannel;
  channel.send(embed);
});

bot.on("roleUpdate", async (oldRole, newRole) => {
  const doc = await Utils.getDoc(newRole.guild.id, "loggingData", 1000);

  if (!doc?.roles) return;
  const changes = objDifference(oldRole.toJSON(), newRole.toJSON());
  let desc = [];
  delete changes.rawPosition;
  if (Object.values(changes).length <= 0) return;
  desc.push(`**Role:** ${newRole.toString()} (${newRole.id})`);
  if (doc?.useAudits) {
    const entry = (
      await newRole.guild.fetchAuditLogs({ type: "ROLE_UPDATE" })
    ).entries.first();
    desc.push(`\n**Updated by:** ${entry.executor.toString()}`);
  }
  Object.entries(changes).forEach((change) => {
    if (change[0] === "permissions") {
      const oldPerms = oldRole.permissions;
      const newPerms = newRole.permissions;
      const oldPermChanges = objDifference(
        oldPerms.toArray(),
        newPerms.toArray(),
        true,
        true
      );
      const newPermChanges = objDifference(
        oldPerms.toArray(),
        newPerms.toArray(),
        false,
        true
      );
      let text = "";
      if (oldPermChanges)
        text += `**Permissions removed:** ${oldPermChanges.join(", ")}\n`;
      if (newPermChanges)
        text += `**Permissions added:** ${newPermChanges.join(", ")}`;
      desc.push(text + "\n");
    } else
      desc.push(
        `**Old ${change[0]}:** ${oldRole[change[0]]}\n**New ${change[0]}:** ${
          change[1]
        }\n`
      );
  });

  const embed = new Discord.MessageEmbed()
    .setTitle("Role Updated")
    .setColor(await Guilds.getColor(newRole.guild.id))
    .setDescription(desc.join("\n"));
  const channel = newRole.guild.channels.cache.get(
    doc.roles
  ) as Discord.TextChannel;
  return channel.send(embed);
});
