import Discord from "discord.js";
import { bot } from "../bot";
import { Guilds } from "../../Guilds";
import { Utils } from "../../Utils";

bot.on("guildMemberUpdate", async (oldMember, newMember) => {
  const doc = await Utils.getDoc(newMember.guild.id, "loggingData", 1000);
  if (!doc?.nicknames) return null;
  if (
    (oldMember.nickname || oldMember.user.username) !=
    (newMember.nickname || newMember.user.username)
  ) {
    const embed = new Discord.MessageEmbed()
      .setTimestamp()
      .setTitle(`Nickname Change`)
      .setColor(await Guilds.getColor(newMember.guild.id));
    embed.setDescription(
      `**Old:** ${oldMember.nickname || oldMember.user.username}\n**New:** ${
        newMember.nickname || newMember.user.username
      }`
    );
    const logChannel = oldMember.guild.channels.cache.get(
      doc.nicknames
    ) as Discord.TextChannel;
    logChannel.send(embed);
  }
});
