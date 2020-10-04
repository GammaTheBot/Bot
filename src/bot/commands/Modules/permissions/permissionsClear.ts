import { Role } from "discord.js";
import { RoleData } from "../../../../database/schemas/roles";
import { Language } from "../../../../languages/Language";
import { BotPermissions } from "../../../../Perms";
import { BaseCommand, ArgType } from "../../../commandLoader";

export const PermissionsAdd: BaseCommand = {
  name: "command.permissions.clear.name",
  args: [
    {
      name: "role",
      type: ArgType.role,
    },
  ],
  description: "command.permissions.clear.description",
  exec: async (message, { role }: { role: Role }) => {
    const permissions: {
      [key in BotPermissions]: {
        name: string;
        description: string;
      };
    } = await Language.getNode(message.guild.id, "perms");
    const permList: { [key: string]: string } = {}; // language: node
    for (const perm of Object.entries(permissions)) {
      permList[perm[1].name] = perm[0];
    }
    await RoleData.updateOne(
      { _id: message.guild.id },
      {
        $unset: {
          ["permissions." + role.id]: true,
        },
      },
      { upsert: true }
    );
    return message.channel.send(
      (
        await Language.getNode(message.guild.id, "permissions.clear.success")
      ).replace(/\{role\}/gi, role.toString()),
      {
        allowedMentions: { parse: [] },
      }
    );
  },
};
