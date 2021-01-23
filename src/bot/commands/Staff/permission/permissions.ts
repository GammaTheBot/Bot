import { GuildMember, MessageEmbed, Role } from "discord.js";
import { Guilds } from "../../../../Guilds";
import { Language } from "../../../../language/Language";
import { UserPermissions } from "../../../../Perms";
import { bot } from "../../../bot";
import { ArgType, Command } from "../../../commandManager";
import { getCmdHelp } from "../../help";
import { AddPermission } from "./addPermission";
import { ClearPermission } from "./clearPermission";
import { ListPermissions } from "./listPermission";
import { RemovePermission } from "./removePermission";

export const Permission: Command = {
  name: "command.permissions.name",
  category: "Staff",
  aliases: "command.permissions.aliases",
  examples: "command.permissions.examples",
  userPermissions: UserPermissions.administrator,
  args: [
    {
      name: "role",
      type: ArgType.role,
      optional: true,
      positions: [0],
    },
    {
      name: "member",
      type: ArgType.member,
      optional: true,
      positions: [0],
    },
  ],
  exec: async (
    message,
    { role, member }: { role: Role; member: GuildMember },
    language
  ) => {
    if (role) {
      ListPermissions.exec(message, { role }, language);
    } else if (member) {
      ListPermissions.exec(message, { member }, language);
    } else {
      const embed = new MessageEmbed()
        .setAuthor(message.author.tag, message.author.displayAvatarURL())
        .setTimestamp()
        .setColor(await Guilds.getColor(message.guild?.id))
        .setTitle(
          bot.user.username + " " + Language.parseInnerNodes(language, "help")
        );
      embed.setDescription(await getCmdHelp(Permission, message, language));
      message.channel.send(embed);
    }
  },
  subcommands: [
    ListPermissions,
    AddPermission,
    ClearPermission,
    RemovePermission,
  ],
};
