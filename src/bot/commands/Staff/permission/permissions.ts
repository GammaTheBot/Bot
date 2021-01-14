import { MessageEmbed, Role } from "discord.js";
import { RoleData } from "../../../../database/schemas/roles";
import { Guilds } from "../../../../Guilds";
import { Language } from "../../../../language/Language";
import { Utils } from "../../../../Utils";
import { bot } from "../../../bot";
import { ArgType, Command } from "../../../commandManager";
import { getCmdHelp } from "../../help";
import { AddPermission } from "./addPermission";
import { ListPermissions } from "./listPermission";

export const Permission: Command = {
  name: "command.permissions.name",
  category: "Staff",
  aliases: "command.permissions.aliases",
  examples: "command.permissions.examples",
  userPermissions: "managePermissions",
  args: [
    {
      name: "role",
      type: ArgType.role,
      optional: true,
      match: "everything",
    },
  ],
  exec: async (message, { role }: { role: Role }, language) => {
    if (!role) {
      const embed = new MessageEmbed()
        .setAuthor(message.author.tag, message.author.displayAvatarURL())
        .setTimestamp()
        .setColor(await Guilds.getColor(message.guild?.id))
        .setTitle(
          bot.user.username + " " + Language.parseInnerNodes(language, "help")
        );
      embed.setDescription(await getCmdHelp(Permission, message, language));
      message.channel.send(embed);
    } else {
      const permissions = (await RoleData.findById(message.guild?.id))
        ?.permissions[role.id];
      if (!permissions)
        return message.channel.send(
          Language.getNode<string>(
            language,
            "command.permissions.no-specific-perms"
          ).replace(/\{role\}/gi, role.toString()),
          {
            allowedMentions: {
              parse: [],
            },
          }
        );
      else {
        const embed = new MessageEmbed()
          .setColor(await Guilds.getColor(message.guild?.id))
          .setAuthor(message.author.tag, message.author.displayAvatarURL())
          .setDescription(
            Language.getNode<string>(language, "command.permissions.list-perms")
              .replace(/\{role\}/gi, role.toString())
              .replace(
                /\{permissions\}/gi,
                permissions.map((p) => `\`${p}\``).join("`, `")
              )
          );
        return message.channel.send(embed);
      }
    }
  },
  subcommands: [ListPermissions, AddPermission],
};
