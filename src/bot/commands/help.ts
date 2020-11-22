import { Message, MessageEmbed, TextChannel } from "discord.js";
import { Guilds } from "../../Guilds";
import { Language } from "../../language/Language";
import { bot } from "../bot";
import {
  aliasesToString,
  ArgType,
  BaseCommand,
  categories,
  Command,
  commands,
  getCommand,
  isCommandDisabled,
  getCommandUsage,
} from "../commandManager";

export const Help: Command = {
  category: "Utility",
  name: "command.help.name",
  description: "command.help.description",
  editable: true,
  args: [
    {
      type: ArgType.lowercase,
      match: "everything",
      optional: true,
      name: "command",
    },
  ],
  clientPermissions: ["SEND_MESSAGES", "USE_EXTERNAL_EMOJIS"],
  exec: async (message, { command }: { command: string }) => {
    if (!command) {
      const embed = new MessageEmbed()
        .setAuthor(message.author.tag, message.author.displayAvatarURL())
        .setTimestamp()
        .setColor(await Guilds.getColor(message.guild?.id))
        .setTitle(
          bot.user.username +
            " " +
            (await Language.replaceNodesInGuild(message.guild.id, "help"))
        );
      embed.setDescription(
        `${await Language.getNodeFromGuild(
          message.guild?.id,
          "command.help.info"
        )}\n`
          .replace(/\{prefix\}/gi, await Guilds.getPrefix(message.guild?.id))
          .replace(/\{mention\}/gi, "@" + bot.user.username)
      );
      for await (const category of Object.values(categories)) {
        const name = `${await Language.replaceNodesInGuild(
          message.guild?.id,
          category.name
        )}`;
        let stuff = `${await Language.replaceNodesInGuild(
          message.guild?.id,
          category.description
        )}`;
        const cmds: string[] = [];
        if (category.commands) {
          for await (const cmd of category.commands) {
            cmds.push(
              ((
                await isCommandDisabled(cmd.id, message.channel as TextChannel)
              )[0]
                ? "🔒`"
                : "`") +
                (await Language.getNodeFromGuild(message.guild?.id, cmd.name)) +
                "`"
            );
          }
          stuff += `\n${cmds.join(", ")}`;
          embed.addField(name, stuff);
        }
      }
      return message.channel.send(embed);
    }
    const cmd = await getCommand(command, message.guild?.id, commands);
    if (cmd) {
      const embed = new MessageEmbed()
        .setAuthor(message.author.tag, message.author.displayAvatarURL())
        .setTimestamp()
        .setColor(await Guilds.getColor(message.guild?.id))
        .setTitle(
          bot.user.username +
            " " +
            (await Language.replaceNodesInGuild(message.guild?.id, "help"))
        );
      embed.setDescription(await getCmdHelp(cmd, message));
      message.channel.send(embed);
      return;
    }
    message.channel.send(
      await Language.getNodeFromGuild(message.guild.id, "commands.unknown")
    );
    return;
  },
};

export async function getCmdHelp(
  cmd: BaseCommand | Command,
  message: Message
): Promise<string> {
  let description = [
    `**${await Language.getNodeFromGuild(
      message.guild?.id,
      "name"
    )}:** ${await Language.getNodeFromGuild(message.guild?.id, cmd.name)}`,
  ];
  if (cmd.description)
    description.push(
      `**${await Language.getNodeFromGuild(
        message.guild?.id,
        "description"
      )}:** ${await Language.getNodeFromGuild(
        message.guild?.id,
        cmd.description
      )}`
    );
  if (cmd.usage)
    description.push(
      `**${await Language.getNodeFromGuild(
        message.guild?.id,
        "usage"
      )}:** ${await Language.replaceNodesInGuild(message.guild?.id, cmd.usage)}`
    );
  if (cmd.aliases)
    description.push(
      `**${await Language.getNodeFromGuild(
        message.guild?.id,
        "aliases"
      )}:** \`${(await aliasesToString(message.guild?.id, cmd.aliases)).join(
        "`, `"
      )}\``
    );
  if ("category" in cmd)
    if (cmd.category)
      description.push(
        `**${await Language.getNodeFromGuild(
          message.guild?.id,
          "category"
        )}:** ${await Language.replaceNodesInGuild(
          message.guild?.id,
          categories[cmd.category].name
        )}`
      );
  if ("examples" in cmd)
    if (cmd.examples)
      description.push(
        `**${await Language.getNodeFromGuild(
          message.guild?.id,
          "examples"
        )}:** \`${await aliasesToString(message.guild?.id, cmd.examples)}\``
      );
  if (cmd.subcommands) {
    const subcmds: string[] = [];
    for await (const s of cmd.subcommands) {
      subcmds.push(
        `• \`${getCommandUsage(s)}\`${
          s.description
            ? `\n${await Language.getNodeFromGuild(
                message.guild?.id,
                s.description
              )}`
            : ""
        }`
      );
    }
    description.push(
      `**${await Language.getNodeFromGuild(
        message.guild?.id,
        "subcommands"
      )}:**\n${(await aliasesToString(message.guild?.id, subcmds)).join("\n")}`
    );
  }
  return description.join("\n");
}
