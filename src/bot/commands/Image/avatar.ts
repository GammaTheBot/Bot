import { MessageEmbed, User } from "discord.js";
import { Guilds } from "../../../Guilds";
import { Utils } from "../../../Utils";
import { ArgType, Command } from "../../commandManager";

export const Avatar: Command = {
  name: "command.avatar.name",
  description: "command.avatar.description",
  aliases: "command.avatar.aliases",
  category: "Image",
  args: [
    {
      name: "user",
      type: ArgType.user,
      optional: true,
    },
  ],
  dms: true,
  exec: async (message, { user }: { user: User }, _) => {
    const avatarGuy = user || message.author;
    await message.channel.send(
      Utils.setEmbedAuthor(
        new MessageEmbed()
          .setColor(await Guilds.getColor(message.guild?.id))
          .setImage(
            avatarGuy.displayAvatarURL({
              dynamic: true,
              size: 4096,
            })
          ),
        avatarGuy
      )
    );
  },
};
