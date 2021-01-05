import { Message, MessageEmbed, TextChannel } from "discord.js";
import _ from "lodash";
import stringSimilarity from "string-similarity";
import { LanguageService } from "typescript";
import { Guilds } from "../../Guilds";
import { Lang, Language } from "../../language/Language";
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
  exec: async (message, { command }: { command: string }, language) => {
    if (!command) {
      const embed = new MessageEmbed()
        .setAuthor(message.author.tag, message.author.displayAvatarURL())
        .setTimestamp()
        .setColor(await Guilds.getColor(message.guild?.id))
        .setTitle(
          bot.user.username + " " + Language.parseInnerNodes(language, "help")
        );
      embed.setDescription(
        `${Language.getNode(language, "command.help.info")}\n`
          .replace(/\{prefix\}/gi, await Guilds.getPrefix(message.guild?.id))
          .replace(/\{mention\}/gi, "@" + bot.user.username)
      );
      for await (const category of Object.values(categories)) {
        const name = `${Language.parseInnerNodes(language, category.name)}`;
        let stuff = `${Language.parseInnerNodes(
          language,
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
                Language.getNode(language, cmd.name) +
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
      const name = `${Language.parseInnerNodes(language, c.name)}`
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
            Language.parseInnerNodes(language, "help") +
            " | " +
            _.startCase(translatedName)
        );
      const cmds = [];
      for await (const cmd of cat.commands) {
        cmds.push(
          `\`\`${Language.getNode(language, cmd.name)}\`\`: ${Language.getNode(
            language,
            cmd.description
          )}`
        );
      }
      const translatedDesc = Language.parseInnerNodes(
        language,
        cat.description
      );
      embed.setDescription(
        `${translatedDesc}\n\n**${_.upperFirst(
          Language.getNode(language, "commands.commands") as string
        )}:**\n` + cmds.join("\n")
      );
      return message.channel.send(embed);
    }
    let cmd: Command;
    let cmdList: string[] = [];
    for await (const c of commands) {
      const name = Language.getNode(language, c.name) as string;
      const aliases = aliasesToString(language, c.aliases);
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
          bot.user.username + " " + Language.parseInnerNodes(language, "help")
        );
      embed.setDescription(await getCmdHelp(cmd, message, language));
      message.channel.send(embed);
      return;
    }
    let possibleCmd = stringSimilarity.findBestMatch(command, cmdList);
    message.channel.send(
      _.upperFirst(
        Language.getNode(language, "commands.unknown") +
          "\n" +
          (Language.getNode(language, "commands.maybe") as string).replace(
            /\{cmd\}/gi,
            "``" + possibleCmd.bestMatch.target + "``"
          )
      )
    );
    return;
  },
};

export async function getCmdHelp(
  cmd: BaseCommand | Command,
  message: Message,
  lang: Lang
): Promise<string> {
  let description = [
    `**${Language.getNode(lang, "name")}:** ${Language.getNode(
      lang,
      cmd.name
    )}`,
  ];
  if (cmd.description)
    description.push(
      `**${Language.getNode(lang, "description")}:** ${Language.getNode(
        lang,
        cmd.description
      )}`
    );
  if (cmd.usage)
    description.push(
      `**${Language.getNode(lang, "usage")}:** ${Language.parseInnerNodes(
        lang,
        cmd.usage
      )}`
    );
  if (cmd.aliases) {
    const aliases = aliasesToString(lang, cmd.aliases);
    description.push(
      `**${Language.getNode(lang, "aliases")}:** \`${aliases.join("`, `")}\``
    );
  }
  if ("category" in cmd)
    if (cmd.category)
      description.push(
        `**${Language.getNode(lang, "category")}:** ${Language.parseInnerNodes(
          lang,
          categories[cmd.category].name
        )}`
      );
  if ("examples" in cmd)
    if (cmd.examples)
      description.push(
        `**${Language.getNode(lang, "examples")}:** \`${aliasesToString(
          lang,
          cmd.examples
        )}\``
      );
  if (cmd.subcommands && cmd.subcommands?.length > 0) {
    const subcmds: string[] = [];
    for await (const s of cmd.subcommands) {
      subcmds.push(
        `• \`${getCommandUsage(s)}\`${
          s.description ? `\n${Language.getNode(lang, s.description)}` : ""
        }`
      );
    }
    console.log(subcmds);
    description.push(
      `**${Language.getNode(lang, "subcommands")}:**\n${aliasesToString(
        lang,
        subcmds
      ).join("\n")}`
    );
  }
  return description.join("\n");
}
