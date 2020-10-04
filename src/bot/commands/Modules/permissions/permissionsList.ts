import { Role } from "discord.js";
import { LanguageServiceMode } from "typescript";
import { RoleData } from "../../../../database/schemas/roles";
import { Language } from "../../../../languages/Language";
import { ArgType, BaseCommand } from "../../../commandLoader";

export const PermissionsList: BaseCommand = {
  name: "command.permissions.list.name",
  args: [
    {
      name: "role",
      type: ArgType.role,
      optional: true,
    },
  ],
  description: "command.permissions.list.description",
  exec: async (message, { role }: { role: Role }) => {
    if (role) {
      const doc = await RoleData.findById(message.guild.id);
      const rolePerms = doc.permissions[role.id];
      const language: string[] = [];
      for await (const perm of rolePerms) {
        language.push(
          await Language.getNode(message.guild.id, ["perms", perm, "name"])
        );
      }
      return message.channel.send(
        `**${await Language.getNode(
          message.guild.id,
          "permissions.name"
        )}:** \`${language.join("`, `")}\``
      );
    }
    return message.channel.send(
      `**${await Language.getNode(
        message.guild.id,
        "permissions.available"
      )}:**\n\`${Object.values(
        await Language.getNode(message.guild.id, "perms")
      )
        .map((a) => (<any>a).name)
        .join("`, `")}\``
    );
  },
};
