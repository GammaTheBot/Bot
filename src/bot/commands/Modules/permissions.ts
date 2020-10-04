import { MessageEmbed, Role } from "discord.js";
import { Guilds } from "../../../Guilds";
import { Language } from "../../../languages/Language";
import { bot } from "../../bot";
import { ArgType, BaseCommand, Command } from "../../commandLoader";
import { getCmdHelp } from "../help";

const PermissionsAdd: BaseCommand = {
  name: "command.permissions.add.name",
  args: [
    {
      name: "role",
      type: ArgType.role,
    },
    {
      name: "permission",
      type: ArgType.string,
    },
  ],
  exec: (
    message,
    { role, permission }: { role: Role; permission: string }
  ) => {},
};

export const Permissions: Command = {
  name: "command.permissions.name",
  description: "command.permissions.description",
  aliases: "command.permissions.aliases",
  clientPermissions: "SEND_MESSAGES",
  userPermissions: "managePermissions",
  category: "Modules",
  exec: async (message) => {
    const embed = new MessageEmbed()
      .setAuthor(message.author.tag, message.author.displayAvatarURL())
      .setTimestamp()
      .setColor(await Guilds.getColor(message.guild?.id))
      .setTitle(
        bot.user.username +
          " " +
          (await Language.replaceNodes(message.guild?.id, "help"))
      );
    embed.setDescription(await getCmdHelp(Permissions, message));
    return message.channel.send(embed);
  },
};
