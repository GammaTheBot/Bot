import { Message, MessageEmbed, TextChannel } from "discord.js";
import _ from "lodash";
import stringSimilarity from "string-similarity";
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
  getCommandUsage,
  isCommandDisabled,
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
    let cat: {
      description: string;
      name: string;
      commands?: Command[];
    };
    let translatedName: string;
    for await (const c of Object.values(categories)) {
      const name = `${await Language.replaceNodesInGuild(
        message.guild?.id,
        c.name
      )}`
        ?.split(" ")
        ?.slice(1)
        ?.join(" ");
      if (name.toLowerCase() === command.toLowerCase()) {
        cat = c;
        translatedName = name;
        break;
      }
    }
    if (cat) {
      const embed = new MessageEmbed()
        .setAuthor(message.author.tag, message.author.displayAvatarURL())
        .setTimestamp()
        .setColor(await Guilds.getColor(message.guild?.id))
        .setTitle(
          bot.user.username +
            " " +
            (await Language.replaceNodesInGuild(message.guild?.id, "help"))
        );
      const cmds = [];
      for await (const cmd of cat.commands) {
        cmds.push(
          `\`\`${await Language.getNodeFromGuild(
            message.guild?.id,
            cmd.name
          )}\`\`: ${await Language.getNodeFromGuild(
            message.guild?.id,
            cmd.description
          )}`
        );
      }
      const translatedDesc = await Language.replaceNodesInGuild(
        message.guild?.id,
        cat.description
      );
      embed.setDescription(
        `**__${_.startCase(
          translatedName
        )}__:**\n${translatedDesc}\n\n${_.upperFirst(
          await Language.getNodeFromGuild(
            message.guild?.id,
            "commands.commands"
          )
        )}:\n` + cmds.join("\n")
      );
      return message.channel.send(embed);
    }
    let cmd: Command;
    let cmdList: string[] = [];
    for await (const c of commands) {
      const name = await Language.getNodeFromGuild(message.guild?.id, c.name);
      const aliases = await aliasesToString(message.guild?.id, c.aliases);
      cmdList.push(name);
      const result = name === command || aliases?.includes(command);
      if (result === true) {
        cmd = c;
        break;
      }
    }
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
    let possibleCmd = stringSimilarity.findBestMatch(command, cmdList);
    message.channel.send(
      _.upperFirst(
        (await Language.getNodeFromGuild(
          message.guild.id,
          "commands.unknown"
        )) +
          "\n" +
          (
            await Language.getNodeFromGuild(message.guild.id, "commands.maybe")
          ).replace(/\{cmd\}/gi, "``" + possibleCmd.bestMatch.target + "``")
      )
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
