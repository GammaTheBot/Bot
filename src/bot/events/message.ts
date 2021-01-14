import Discord, { DataResolver, Message, TextChannel } from "discord.js";
import _ from "lodash";
import stringSimilarity from "string-similarity";
import { GuildData } from "../../database/schemas/guilds";
import { Guilds } from "../../Guilds";
import { Lang, Language } from "../../language/Language";
import { Perms } from "../../Perms";
import { Utils } from "../../Utils";
import { bot } from "../bot";
import {
  BaseCommand,
  commands,
  commandsRunEdit,
  getCommand,
  isCommandDisabled,
  parseArgs,
} from "../commandManager";
import config from "../config.json";

bot.on("messageUpdate", async (oldMessage, newMessage) => {
  if (commandsRunEdit.length > 0) {
    newMessage = await newMessage.fetch();
    startCommandParsing(newMessage);
  }
});

bot.on("message", async (message) => {
  startCommandParsing(message);
});

async function startCommandParsing(message: Message) {
  if (message.author.bot) return;
  let prefix: string;
  let language: Lang;
  if (message.channel.type !== "dm") {
    const guildData = await GuildData.findById(message.guild?.id);
    prefix = guildData?.prefix || config.bot.prefix;
    language = Lang[guildData?.language] || Lang.English;
  } else prefix = config.bot.prefix;
  let cmd: string;
  let unparsedArgs: string[] = [];
  if (message.content.startsWith(`<@${bot.user.id}>`)) {
    const messageArray = message.content.split(" ");
    message.mentions.users.delete(bot.user.id);
    messageArray[0] = messageArray[0].replace(`<@${bot.user.id}>`, "");
    if (messageArray[0].length < 1) messageArray.shift();
    [cmd, unparsedArgs] = [messageArray.shift().toLowerCase(), messageArray];
  } else {
    const messageArray = message.content.trim().split(" ");
    if (messageArray[0].startsWith(prefix)) {
      messageArray[0] = messageArray[0].slice(prefix.length);
      [cmd, unparsedArgs] = [messageArray.shift().toLowerCase(), messageArray];
    }
  }
  if (cmd == null) return;
  let command = getCommand(cmd, language, commands);
  if (command) handleCommand(command, message, unparsedArgs, language);
  else {
    const translatedCommands: string[] = [];
    for (const c of commands) {
      translatedCommands.push(Language.getNode(language, c.name));
    }
    const bestMatch = stringSimilarity.findBestMatch(cmd, translatedCommands);
    const str = bestMatch.bestMatch.target;
    const unknownCmdMsg =
      _.upperFirst(Language.getNode(language, "commands.unknown")) +
      " " +
      Language.getNode(language, "commands.maybe");
    return message.channel.send(unknownCmdMsg.replace("{cmd}", `\`${str}\``));
  }
}

async function handleCommand(
  command: BaseCommand,
  message: Message,
  unparsedArgs: string[],
  language: Lang
) {
  unparsedArgs = unparsedArgs
    .join(" ")
    .match(/((?=["'])(?:"(?!\s)[^"\\]*(?:\\[\s\S][^"\\]*)*(?<!\s)")|[^\s]+)/gi);
  if (message.channel.type === "dm" && !command.dms) {
    message.channel.send(
      Language.parseInnerNodes(language, ":x: {@commands.dms-disabled}")
    );
    return;
  }
  const isBotOwner = await Utils.isBotOwner(message.author.id);
  if (
    command.guildOwnerOnly &&
    (message.guild.ownerID !== message.author.id || !isBotOwner)
  ) {
    message.channel.send(
      Perms.noPermEmoji + Language.getNode(language, "noperms.guildOwner")
    );
    return;
  }
  if (command.botOwnerOnly && !isBotOwner) {
    message.channel.send(
      Perms.noPermEmoji + Language.getNode(language, "noperms.botOwner")
    );
    return;
  }
  if (message.channel.type !== "dm") {
    if (
      message.guild.me
        .permissionsIn(message.channel)
        .missing(new Discord.Permissions(command.clientPermissions)).length > 0
    ) {
      message.channel.send(
        Perms.noPermEmoji + Language.getNode(language, "noperms.bot")
      );
      return;
    }
    if (
      command.userPermissions &&
      !(await Perms.hasPermission(message.member, command.userPermissions))
    ) {
      message.channel.send(
        Perms.noPermEmoji + " " + Language.getNode(language, "noperms.general")
      );
      return;
    }
    if ("id" in command) {
      const disabled = await isCommandDisabled(
        (<any>command).id,
        message.channel as TextChannel
      );
      if (disabled[0]) {
        message.channel.send(
          Language.getNode<string>(
            language,
            "command.disable.disabled"
          ).replace(/\{cmd\}/, (<any>command).id)
        );
        return;
      }
    }
  }
  if (command.subcommands) {
    if (unparsedArgs && unparsedArgs.length > 0) {
      const subCommand = getCommand(
        unparsedArgs[0],
        language,
        command.subcommands
      );
      if (subCommand)
        return await handleCommand(
          subCommand,
          message,
          unparsedArgs.slice(1),
          language
        );
    }
  }
  let result:
    | { error: true; missingArgs: Set<string> }
    | { [key: string]: any };
  if (command.args) {
    result = parseArgs(command.args, unparsedArgs, message);
    if (result.error) {
      const failed = result as { error: true; missingArgs: Set<string> };
      const usage = [Language.getNode(language, command.name)];
      for (const arg of command.args) {
        const t = arg.name || arg.type;
        if (failed?.missingArgs?.has(arg.name)) {
          usage.push(`**<${t}>**`);
        } else {
          usage.push(arg.optional ? `[${t}]` : `<${t}>`);
        }
      }
      const embed = new Discord.MessageEmbed()
        .setColor(await Guilds.getColor(message.guild?.id))
        .setTimestamp()
        .setAuthor(message.author.tag, message.author.displayAvatarURL())
        .setDescription(
          `${Language.getNode(language, "commands.missing-args")}\n${usage.join(
            " "
          )}`
        );
      message.channel.send(embed);
      return;
    } else {
      command.exec(message, result, language);
      return;
    }
  }
  command.exec(message, {}, language);
  return;
}
