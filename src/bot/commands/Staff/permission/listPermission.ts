import { MessageEmbed, Role, User } from "discord.js";
import { upperFirst } from "lodash";
import { RoleData } from "../../../../database/schemas/roles";
import { Guilds } from "../../../../Guilds";
import { Language } from "../../../../language/Language";
import { UserPermissions } from "../../../../Perms";
import { ArgType, BaseCommand } from "../../../commandManager";

export const ListPermissions: BaseCommand = {
  name: "command.permissions.list.name",
  description: "command.permissions.list.description",
  args: [
    {
      name: "role",
      type: ArgType.role,
      match: "everything",
      optional: true,
    },
  ],
  userPermissions: UserPermissions.administrator,
  exec: async (message, { role }: { role: Role }, language) => {
    const BotPerms = Language.getNode<
      Map<UserPermissions, Map<"name" | "description", string>>
    >(language, "permissions");
    if (role) {
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
                /\{perms\}/gi,
                permissions
                  .map((p) => {
                    console.log(UserPermissions[p]);
                    return `\`${BotPerms.get(UserPermissions[p]).get(
                      "name"
                    )}\``;
                  })
                  .join(", ")
              )
          );
        return message.channel.send(embed);
      }
    } else {
      const embed = new MessageEmbed()
        .setColor(await Guilds.getColor(message.guild?.id))
        .setAuthor(message.author.tag, message.author.displayAvatarURL())
        .setTitle(Language.getNode(language, "command.permissions.perm-list"))
        .setDescription(
          [...BotPerms.values()]
            .map(
              (p) => `\`${p.get("name")}\`: ${upperFirst(p.get("description"))}`
            )
            .join(`\n`)
        );
      return message.channel.send(embed);
    }
  },
};
