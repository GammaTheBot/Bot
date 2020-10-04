import { MessageEmbed } from "discord.js";
import { Guilds } from "../../../../Guilds";
import { Language } from "../../../../languages/Language";
import { bot } from "../../../bot";
import { Command } from "../../../commandLoader";
import { getCmdHelp } from "../../help";
import { PermissionsAdd } from "./permissionsAdd";
import { PermissionsRemove } from "./permissionsRemove";
import { PermissionsList } from "./permissionsList";

export const Permissions: Command = {
  name: "command.permissions.name",
  description: "command.permissions.description",
  aliases: "command.permissions.aliases",
  clientPermissions: "SEND_MESSAGES",
  userPermissions: "managePermissions",
  examples: "command.permissions.examples",
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
    embed.setDescription(
      `${await getCmdHelp(Permissions, message)}\n\n**${await Language.getNode(
        message.guild.id,
        "permissions.available"
      )}:**\n\`${Object.values(
        await Language.getNode(message.guild.id, "perms")
      )
        .map((a) => (<any>a).name)
        .join("`, `")}\``
    );
    return message.channel.send(embed);
  },
  subcommands: [PermissionsAdd, PermissionsRemove, PermissionsList],
};
