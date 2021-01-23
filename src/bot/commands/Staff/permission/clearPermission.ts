import { MessageEmbed, Role } from "discord.js";
import { upperFirst } from "lodash";
import { RoleData } from "../../../../database/schemas/roles";
import { Guilds } from "../../../../Guilds";
import { Language } from "../../../../language/Language";
import { UserPermissions } from "../../../../Perms";
import { ArgType, BaseCommand } from "../../../commandManager";
export const ClearPermission: BaseCommand = {
  name: "command.permissions.clear.name",
  description: "command.permissions.clear.description",
  args: [
    {
      name: "role",
      type: ArgType.role,
      otherPositions: [0],
    },
  ],
  userPermissions: UserPermissions.administrator,
  exec: async (message, { role }: { role: Role }, language) => {
    try {
      await RoleData.findByIdAndUpdate(message.guild.id, {
        $unset: { ["permissions." + role.id]: 1 },
      });
      return message.channel.send(
        Language.getNode<string>(
          language,
          "command.permissions.clear.success"
        ).replace(/\{role\}/gi, role.toString()),
        { allowedMentions: { parse: [] } }
      );
    } catch (err) {
      console.error(err);
    }
  },
};
