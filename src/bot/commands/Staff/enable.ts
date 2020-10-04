import Discord from "discord.js";
import { ChannelData } from "../../../database/schemas/channels";
import { Language } from "../../../languages/Language";
import { ArgType, Command, commands, isDisabled } from "../../commandLoader";
import schema from "../categories.json";
export const Disable: Command = {
  name: "command.enable.name",
  description: "command.enable.description",
  category: "Staff",
  args: [
    {
      name: "command",
      type: ArgType.string,
    },
    {
      name: "channel",
      optional: true,
      type: ArgType.channel,
    },
  ],
  userPermissions: "botAdministrator",
  exec: async (
    message,
    { command, channel }: { command: string; channel: Discord.GuildChannel }
  ) => {
    const cmdsByLang: { [key: string]: string } = {};
    for await (const cmd of commands) {
      cmdsByLang[
        await Language.getNode(message.guild.id, cmd.name)
      ] = cmd.id.toLowerCase();
    }
    for await (const category of Object.entries(schema)) {
      cmdsByLang[
        (
          await Language.replaceNodes(
            message.guild.id,
            category[1].name.replace(/^.*?(\{.*?\}).*?$/gi, "$1")
          )
        ).toLowerCase()
      ] = category[0].toLowerCase();
    }
    if (!cmdsByLang[command])
      return message.channel.send(
        await Language.getNode(message.guild.id, "command.unknown")
      );
    const disabled = await isDisabled(
      command,
      message.channel as Discord.TextChannel
    );
    if (channel) {
      if (!disabled[0]) {
        return message.channel.send(
          (
            await Language.getNode(
              message.guild.id,
              "command.enable.alreadyEnabled"
            )
          ).replace(/\{cmd\}/gi, command)
        );
      }
      await ChannelData.updateOne(
        { _id: message.guild.id },
        {
          $addToSet: {
            [`text.${channel.id}.commands.enabled`]: cmdsByLang[command],
          },
          $pull: {
            [`text.${channel.id}.commands.disabled`]: cmdsByLang[command],
          },
        },
        { upsert: true }
      );
      const node =
        disabled[1] === "channel"
          ? "command.enable.successChannel"
          : "command.enable.successGuild";
      return message.channel.send(
        (await Language.getNode(message.guild.id, node))
          .replace(/\{cmd\}/gi, command)
          .replace(/\{channel\}/gi, channel.toString())
      );
    }
  },
};
