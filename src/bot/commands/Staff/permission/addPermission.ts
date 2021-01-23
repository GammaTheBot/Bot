import { MessageEmbed, Role } from "discord.js";
import { Language } from "../../../../language/Language";
import { UserPermissions } from "../../../../Perms";
import { ArgType, BaseCommand } from "../../../commandManager";
import { Connection } from "mongoose";
import { RoleData } from "../../../../database/schemas/roles";
import { Guilds } from "../../../../Guilds";
import { upperFirst } from "lodash";
export const AddPermission: BaseCommand = {
  name: "command.permissions.add.name",
  description: "command.permissions.add.description",
  aliases: "command.permissions.add.aliases",
  args: [
    {
      name: "permission",
      type: ArgType.string,
      match: "everything",
      otherPositions: [1],
    },
    {
      name: "role",
      type: ArgType.role,
      otherPositions: [0],
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
    const botPermissions = Language.getNode<Map<UserPermissions, string>>(
      language,
      "permissions"
    );
    const actualPerms: Set<string> = new Set();
    let unexistingPerms: string[] = [];
    try {
      const doc = await RoleData.findById(message.guild.id);
      permissionList.forEach((perm) => {
        if (!Array.from(botPermissions.values()).includes(perm))
          unexistingPerms.push(perm);
      });
      bigLoop: for (const perm of permissionList) {
        for (const [v, i] of botPermissions) {
          if (perm === i) {
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
        Language.getNode(language, "added"),
        newPerms
          .map((p) => `\`${botPermissions.get(UserPermissions[p])}\``)
          .join(", ")
      );

      if (unexistingPerms.length > 0)
        embed.addField(
          upperFirst(Language.getNode(language, "unexisting")),
          unexistingPerms.map((p) => `\`${p}\``).join(", ")
        );
      embed.addField(
        upperFirst(Language.getNode(language, "current")),
        [...actualPerms]
          .map((p) => `\`${botPermissions.get(UserPermissions[p])}\``)
          .join(", ")
      );

      return message.channel.send("", {
        embed,
        allowedMentions: {
          parse: [],
        },
      });
    } catch (e) {
      console.log(e);
      return message.channel.send(`:x: ${Language.getNode(language, "error")}`);
    }
  },
};
