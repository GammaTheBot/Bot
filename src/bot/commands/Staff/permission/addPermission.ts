import { Role } from "discord.js";
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
    const permissions = permission.split(",");
  },
};
