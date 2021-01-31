import { MessageEmbed, Role } from "discord.js";
import { upperFirst } from "lodash";
import { RoleData } from "../../../../database/schemas/roles";
import { Guilds } from "../../../../Guilds";
import { Language } from "../../../../language/Language";
import { UserPermissions } from "../../../../Perms";
import { ArgType, BaseCommand } from "../../../commandManager";
import stringSimilarity from "string-similarity";
export const AddPermission: BaseCommand = {
  name: "command.permissions.add.name",
  description: "command.permissions.add.description",
  aliases: "command.permissions.add.aliases",
  args: [
    {
      name: "permission",
      type: ArgType.string,
      match: "everything",
      positions: [0, 1],
    },
    {
      name: "role",
      type: ArgType.role,
      positions: [0, 1],
    },
  ],
  userPermissions: UserPermissions.administrator,
  exec: async (
    message,
    { permission, role }: { permission: string; role: Role },
    language
  ) => {
    let permissionList = permission
      .split(",")
      .map((p) => p.trim().toLowerCase());
    if (permissionList.length < 1)
      return message.channel.send(
        Language.getNode(language, "command.permissions.enterPerms")
      );
    const botPermissions = Language.getNode<
      Map<UserPermissions, Map<"name" | "description", string>>
    >(language, "permissions");
    const actualPerms: Set<string> = new Set();
    let unexistingPerms: string[] = [];
    try {
      const doc = await RoleData.findById(message.guild.id);
      bigLoop: for (const perm of permissionList) {
        for (const [v, i] of botPermissions) {
          if (perm === i.get("name")) {
            actualPerms.add(v.toString());
            continue bigLoop;
          }
        }
        unexistingPerms.push(perm);
      }
      if (actualPerms.size < 1)
        return message.channel.send(
          Language.getNode<string>(language, "command.permissions.enterPerms")
        );
      const newPerms = [...actualPerms];
      doc?.permissions?.[role.id]?.forEach((p) => actualPerms.add(p));
      await RoleData.findByIdAndUpdate(
        message.guild.id,
        {
          $set: { [`permissions.${role.id}`]: [...actualPerms] },
        },
        { upsert: true }
      );
      const embed = new MessageEmbed()
        .setColor(await Guilds.getColor(message.guild.id))
        .setTitle(Language.getNode(language, "command.permissions.add.added"))
        .setFooter(message.author.tag, message.author.displayAvatarURL());
      embed.addField(
        upperFirst(Language.getNode(language, "added")),
        newPerms
          .map(
            (p) => `\`${botPermissions.get(UserPermissions[p]).get("name")}\``
          )
          .join(", ")
      );

      if (unexistingPerms.length > 0) {
        const botValues = [...botPermissions.values()].map((p) =>
          p.get("name")
        );
        embed.addField(
          upperFirst(Language.getNode(language, "unexisting")),
          unexistingPerms
            .map(
              (p) =>
                `\`${p}\` (🤔 ${
                  stringSimilarity.findBestMatch(p, botValues).bestMatch.target
                })`
            )
            .join(", ")
        );
      }
      embed.addField(
        upperFirst(Language.getNode(language, "current")),
        [...actualPerms]
          .map(
            (p) => `\`${botPermissions.get(UserPermissions[p]).get("name")}\``
          )
          .join(", ")
      );

      return message.channel.send("", {
        embed,
        allowedMentions: {
          parse: [],
        },
      });
    } catch (e) {
      console.error(e);
      return message.channel.send(`:x: ${Language.getNode(language, "error")}`);
    }
  },
};
