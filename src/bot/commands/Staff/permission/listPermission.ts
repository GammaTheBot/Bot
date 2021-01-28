import { GuildMember, MessageEmbed, Role } from "discord.js";
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
      positions: [0],
    },
    {
      name: "member",
      type: ArgType.member,
      match: "everything",
      optional: true,
      positions: [0],
    },
  ],
  userPermissions: UserPermissions.administrator,
  exec: async (
    message,
    { role, member }: { role?: Role; member?: GuildMember },
    language
  ) => {
    const BotPerms = Language.getNode<
      Map<UserPermissions, Map<"name" | "description", string>>
    >(language, "permissions");
    if (role) {
      if (role.permissions.toArray().includes("ADMINISTRATOR")) {
        return message.channel.send(
          Language.getNode<string>(
            language,
            "command.permissions.hasAdminPerm"
          ).replace(/\{role\}/gi, role.toString()),
          {
            allowedMentions: { parse: [] },
          }
        );
      }
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
        if (permissions.includes(UserPermissions.administrator)) {
          return message.channel.send(
            Language.getNode<string>(
              language,
              "command.permissions.hasAdminPerm"
            ).replace(/\{role\}/gi, role.toString()),
            {
              allowedMentions: { parse: [] },
            }
          );
        }
        const embed = new MessageEmbed()
          .setColor(await Guilds.getColor(message.guild?.id))
          .setAuthor(message.author.tag, message.author.displayAvatarURL())
          .setDescription(
            Language.getNode<string>(language, "command.permissions.list-perms")
              .replace(/\{role\}/gi, role.toString())
              .replace(
                /\{perms\}/gi,
                permissions
                  .map(
                    (p) => `\`${BotPerms.get(UserPermissions[p]).get("name")}\``
                  )
                  .join(", ")
              )
          );
        return message.channel.send(embed);
      }
    } else if (member) {
      const permissions = (await RoleData.findById(message.guild?.id))
        ?.permissions;
      const userPermissions: { [key: string]: string[] } = {};
      for (const index in permissions) {
        if (member.roles.cache.has(index))
          userPermissions[index] = permissions[index];
      }
      if (Object.entries(userPermissions).length < 1) {
        return message.channel.send(
          Language.getNode<string>(
            language,
            "command.permissions.no-specific-perms"
          ).replace(/\{role\}/gi, member.toString()),
          {
            allowedMentions: {
              parse: [],
            },
          }
        );
      }
      const embed = new MessageEmbed()
        .setColor(await Guilds.getColor(message.guild?.id))
        .setAuthor(message.author.tag, message.author.displayAvatarURL())
        .setDescription(
          Language.getNode<string>(language, "command.permissions.member-perms")
            .replace(/\{member\}/gi, member.toString())
            .replace(
              /\{permissions\}/gi,
              Object.entries(userPermissions)
                .map(
                  (p) =>
                    `${message.guild.roles.cache.get(p[0])}: ${p[1]
                      .map(
                        (p2) =>
                          `\`${BotPerms.get(UserPermissions[p2]).get("name")}\``
                      )
                      .join(`, `)}`
                )
                .join("\n")
            )
        );
      return message.channel.send(embed);
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
