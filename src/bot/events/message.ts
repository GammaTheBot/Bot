import Discord, { Message, TextChannel } from "discord.js";
import { GuildData } from "../../database/schemas/guilds";
import { bot } from "../bot";
import {
  getCommand,
  commands,
  parseArgs,
  BaseCommand,
  isCommandDisabled,
  Arg,
  commandsRunEdit,
} from "../commandManager";
import config from "../config.json";
import stringSimilarity from "string-similarity";
import { Language } from "../../language/Language";
import { Perms } from "../../Perms";
import { Utils } from "../../Utils";
import { Guilds } from "../../Guilds";

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
  if (message.channel.type !== "dm") {
    const guildData = await GuildData.findById(message.guild?.id);
    prefix = guildData?.prefix || config.bot.prefix;
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
  let command = await getCommand(cmd, message.guild?.id, commands);
  if (command) handleCommand(command, message, unparsedArgs);
  else {
    const translatedCommands: string[] = [];
    for await (const c of commands) {
      translatedCommands.push(
        await Language.getNodeFromGuild(message.guild?.id, c.name)
      );
    }
    const bestMatch = stringSimilarity.findBestMatch(cmd, translatedCommands);
    const str = bestMatch.bestMatch.target;
    const unknownCmdMsg =
      (await Language.getNodeFromGuild(message.guild?.id, "commands.unknown")) +
      " " +
      (await Language.getNodeFromGuild(message.guild?.id, "commands.maybe"));
    return message.channel.send(unknownCmdMsg.replace("{cmd}", `\`${str}\``));
  }
}

async function handleCommand(
  command: BaseCommand,
  message: Message,
  unparsedArgs: string[]
) {
  unparsedArgs = unparsedArgs
    .join(" ")
    .match(/((?=["'])(?:"(?!\s)[^"\\]*(?:\\[\s\S][^"\\]*)*(?<!\s)")|[^\s]+)/gi);
  let prefix: string;
  if (message.channel.type !== "dm") {
    const guildData = await GuildData.findById(message.guild?.id);
    prefix = guildData?.prefix || config.bot.prefix;
  } else if (command.dms) prefix = config.bot.prefix;
  else
    return message.channel.send(
      ":x: This command can't be used in direct messages!"
    );
  if (
    command.guildOwnerOnly &&
    (message.guild.ownerID !== message.author.id || command.dms)
  ) {
    return message.channel.send(
      Perms.noPermEmoji +
        Language.getNodeFromGuild(message.guild?.id, "noperms.guildOwner")
    );
  }
  if (command.botOwnerOnly && !(await Utils.isBotOwner(message.author.id))) {
    return message.channel.send(
      Perms.noPermEmoji +
        Language.getNodeFromGuild(message.guild?.id, "noperms.botOwner")
    );
  }
  if (message.channel.type !== "dm") {
    if (
      message.guild.me
        .permissionsIn(message.channel)
        .missing(new Discord.Permissions(command.clientPermissions)).length > 0
    ) {
      return message.channel.send(
        Perms.noPermEmoji +
          (await Language.getNodeFromGuild(message.guild.id, "noperms.bot"))
      );
    }
    if (
      command.userPermissions &&
      !(await Perms.hasPermission(message.member, command.userPermissions))
    ) {
      return message.channel.send(
        Perms.noPermEmoji +
          (await Language.getNodeFromGuild(message.guild.id, "noperms.general"))
      );
    }
    if ("id" in command) {
      const disabled = await isCommandDisabled(
        (<any>command).id,
        message.channel as TextChannel
      );
      if (disabled[0])
        return message.channel.send(
          (
            await Language.getNodeFromGuild(
              message.guild?.id,
              "command.disable.disabled"
            )
          ).replace(/\{cmd\}/, (<any>command).id)
        );
    }
  }
  if (command.subcommands) {
    if (unparsedArgs && unparsedArgs.length > 0) {
      const subCommand = await getCommand(
        unparsedArgs[0],
        message.guild?.id,
        command.subcommands
      );
      if (subCommand)
        return await handleCommand(subCommand, message, unparsedArgs.slice(1));
    }
  }
  let result: { [key: string]: any };
  if (command.args) {
    result = parseArgs(command.args, unparsedArgs, message);
    if (result.error) {
      const missingArgs: Arg[] = result.missingArgs;
      const usage = [
        await Language.getNodeFromGuild(message.guild?.id, command.name),
      ];
      for (const arg of command.args) {
        const t = arg.name || arg.type;
        if (missingArgs.includes(arg)) {
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
          `${await Language.getNodeFromGuild(
            message.guild?.id,
            "command.missing-args"
          )}\n${usage.join(" ")}`
        );
      return message.channel.send(embed);
    }
    command.exec(message, result);
  }
  command.exec(message);
}
