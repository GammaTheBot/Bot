import { MessageEmbed, Role } from "discord.js";
import { RoleData } from "../../../../database/schemas/roles";
import { Guilds } from "../../../../Guilds";
import { Language } from "../../../../language/Language";
import { ArgType, BaseCommand } from "../../../commandManager";

export const ListPermissions: BaseCommand = {
  name: "command.permissions.list.name",
  description: "command.permissions.list.description",
  args: [
    {
      name: "role",
      type: ArgType.role,
      match: "everything",
    },
  ],
  exec: async (message, { role }: { role: Role }, language) => {
    const permissions = (await RoleData.findById(message.guild?.id))
      ?.permissions[role.id];
    if (!permissions)
      return message.channel.send(
        (Language.getNode(
          language,
          "command.permissions.no-specific-perms"
        ) as string).replace(/\{role\}/gi, role.toString()),
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
          (Language.getNode(
            language,
            "command.permissions.list-perms"
          ) as string)
            .replace(/\{role\}/gi, role.toString())
            .replace(
              /\{permissions\}/gi,
              permissions.map((p) => `\`${p}\``).join("`, `")
            )
        );
      return message.channel.send(embed);
    }
  },
};
