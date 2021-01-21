import { Role } from "discord.js";
import { Language } from "../../../../language/Language";
import { UserPermissions } from "../../../../Perms";
import { ArgType, BaseCommand } from "../../../commandManager";

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
  exec: async (
    message,
    { permission, role }: { permission: string; role: Role },
    language
  ) => {
    const permissionList = permission.split(",");
    const botPermissions = Language.getNode<Map<UserPermissions, string>>(
      language,
      "permissions"
    );
    console.log(botPermissions.get(UserPermissions.managePermissions));
  },
};
