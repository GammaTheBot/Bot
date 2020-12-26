import Discord from "discord.js";
import { ChannelData } from "../../../database/schemas/channels";
import { Language } from "../../../language/Language";
import {
  ArgType,
  Command,
  commands,
  isCommandDisabled,
} from "../../commandManager";
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
    { command, channel }: { command: string; channel: Discord.GuildChannel },
    language
  ) => {
    const cmdsByLang: { [key: string]: string } = {};
    for await (const cmd of commands) {
      cmdsByLang[
        Language.getNode(language, cmd.name) as string
      ] = cmd.id.toLowerCase();
    }
    for await (const category of Object.entries(schema)) {
      cmdsByLang[
        (Language.parseInnerNodes(
          language,
          category[1].name.replace(/^.*?(\{.*?\}).*?$/gi, "$1")
        ) as string).toLowerCase()
      ] = category[0].toLowerCase();
    }
    if (!cmdsByLang[command])
      return message.channel.send(
        Language.getNode(language, "command.unknown")
      );
    let disabled = await isCommandDisabled(
      command,
      message.channel as Discord.TextChannel
    );
    if (channel) {
      if (!disabled[0]) {
        return message.channel.send(
          (Language.getNode(
            language,
            "command.enable.alreadyEnabled"
          ) as string).replace(/\{cmd\}/gi, command)
        );
      }
      if (disabled[1] === "guild") {
        await ChannelData.updateOne(
          { _id: message.guild.id },
          {
            $addToSet: {
              [`text.${channel.id}.commands.enabled`]: cmdsByLang[command],
            },
          },
          { upsert: true }
        );
      }
      await ChannelData.updateOne(
        { _id: message.guild.id },
        {
          $pull: {
            [`text.${channel.id}.commands.disabled`]: cmdsByLang[command],
          },
        },
        { upsert: true }
      );
    } else {
      await ChannelData.updateOne(
        { _id: message.guild.id },
        { $pull: { disabledCommands: cmdsByLang[command] } },
        { upsert: true }
      );
    }
    const node = channel
      ? "command.enable.successChannel"
      : "command.enable.successGuild";
    return message.channel.send(
      (Language.getNode(language, node) as string)
        .replace(/\{cmd\}/gi, command)
        .replace(/\{channel\}/gi, channel?.toString())
    );
  },
};
