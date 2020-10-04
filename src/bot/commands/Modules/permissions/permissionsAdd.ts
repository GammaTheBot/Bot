import { Role } from "discord.js";
import { RoleData } from "../../../../database/schemas/roles";
import { Language } from "../../../../languages/Language";
import { BotPermissions } from "../../../../Perms";
import { BaseCommand, ArgType } from "../../../commandLoader";

export const PermissionsAdd: BaseCommand = {
  name: "command.permissions.add.name",
  args: [
    {
      name: "role",
      type: ArgType.role,
    },
    {
      name: "permission",
      type: ArgType.string,
      match: "everything",
    },
  ],
  description: "command.permissions.add.description",
  exec: async (
    message,
    { role, permission }: { role: Role; permission: string }
  ) => {
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
    if (!permList[permission])
      return message.channel.send(
        `:x: ${await Language.getNode(
          message.guild.id,
          "permissions.nonexistent"
        )}\n**${await Language.getNode(
          message.guild.id,
          "permissions.available"
        )}:** \`${Object.keys(permList).join("`, `")}\``
      );
    const doc = await RoleData.findById(message.guild.id);
    if (doc?.permissions?.[role.id]?.includes(permList[permission])) {
      return message.channel.send(
        (
          await Language.getNode(
            message.guild.id,
            "permissions.add.alreadyExists"
          )
        )
          .replace(/\{perm\}/gi, permission)
          .replace(/\{role\}/gi, role.toString()),
        {
          allowedMentions: { parse: [] },
        }
      );
    }
    await RoleData.updateOne(
      { _id: message.guild.id },
      {
        $addToSet: {
          ["permissions." + role.id]: permList[permission],
        },
      },
      { upsert: true }
    );
    return message.channel.send(
      (await Language.getNode(message.guild.id, "permissions.add.success"))
        .replace(/\{perm\}/gi, permList[permission])
        .replace(/\{role\}/gi, role.toString()),
      {
        allowedMentions: { parse: [] },
      }
    );
  },
};
