import Discord, { Message } from "discord.js";
import stringSimilarity from "string-similarity";
import config from "../../config.json";
import { GuildData } from "../../database/schemas/guilds";
import { Guilds } from "../../Guilds";
import { Language } from "../../languages/Language";
import { Perms } from "../../Perms";
import { Utils } from "../../Utils";
import { bot } from "../bot";
import {
  Arg,
	BaseCommand,
  commands,
  commandsRunEdit,
  convertType,
  getCommand,
} from "../commandLoader";

bot.on("message", async (message) => {
  // All code after this is for the command
  //TODO Make it so if an argument is invalid it'll ask you to type a valid one again
  //Argument parsing here we go!
  startCommandParsing(message);
});

async function startCommandParsing(message: Message) {
  if (message.author.bot) return;
  const guildData = await GuildData.findOne({ _id: message.guild.id });
  const prefix = guildData?.prefix || config.bot.prefix;
  let cmd: string;
  let unparsedArgs: string[];
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
  if (command) {
    handleCommand(command, message, unparsedArgs);
  } else {
    const bestMatch = stringSimilarity.findBestMatch(
      cmd,
      commands.map((c) => c.name)
    );
    const str = bestMatch.bestMatch.target;
    const unknownCmdMsg = await Language.getNode(
      message.guild?.id,
      "command.unknown"
    );
    return message.channel.send(unknownCmdMsg.replace("{cmd}", `\`${str}\``));
  }
}

async function handleCommand(
  command: BaseCommand,
  message: Message,
  unparsedArgs: string[]
) {
  const guildData = await GuildData.findOne({ _id: message.guild.id });
  const prefix = guildData?.prefix || config.bot.prefix;
  if (!command.dms && message.channel.type === "dm")
    return message.channel.send(
      ":x: This command can't be used in direct messages!"
    );
  if (command.guildOwnerOnly && message.guild.ownerID !== message.member.id) {
    return message.channel.send(
      Perms.noPermEmoji() +
        Language.getNode(message.guild.id, ["noperms", "guildOwner"])
    );
  }
  if (command.botOwnerOnly && !(await Utils.isBotOwner(message.member.id)))
    return message.channel.send(
      Perms.noPermEmoji() +
        Language.getNode(message.guild.id, ["noperms", "botOwner"])
    );
  if (
    message.guild.me
      .permissionsIn(message.channel)
      .missing(new Discord.Permissions(command.clientPermissions)).length > 0
  ) {
    return message.channel.send(
      Perms.noPermEmoji() +
        Language.getNode(message.guild.id, ["noperms", "bot"])
    );
  }
  if (
    command.userPermissions &&
    !(await Perms.hasPermission(message.member, command.userPermissions))
  ) {
    return message.channel.send(
      Perms.noPermEmoji() +
        Language.getNode(message.guild.id, ["noperms", "general"])
    );
  }
  let result: any = {};
  if (command.subcommands) {
    if (unparsedArgs && unparsedArgs.length > 0) {
      const subCommand = await getCommand(
        unparsedArgs[0],
        message.guild?.id,
        command.subcommands
      );
      if (subCommand)
        return await handleCommand(subCommand, message, unparsedArgs.slice(1));
    } else {
      return await command.exec(message);
    }
  }
  if (command.args) {
    result = parseArgs(command.args, unparsedArgs, message);
    if (result.error) {
      const missingArgs: Arg[] = result.missingArgs;
      const usage = [
        `${await Language.getNode(message.guild?.id, command.name)} \``,
      ];
      for (const arg of command.args) {
        const t = arg.name || arg.type;
        if (missingArgs.includes(arg)) {
          usage.push(`**__\`<${t}>\`__**`);
        } else {
          usage.push(arg.optional ? ` [${t}]` : `<${t}> `);
        }
      }
      const embed = new Discord.MessageEmbed()
        .setColor(await Guilds.getColor(message.guild?.id))
        .setTimestamp()
        .setAuthor(message.author.tag, message.author.displayAvatarURL())
        .setDescription(
          `${await Language.parseNodes(
            message.guild?.id,
            "command.missing-args"
          )}\n\`${prefix}${usage.join("")}`
        );
      return message.channel.send(embed);
    }
  }
  command.exec(message, result);
}
function parseArgs(argss: Arg[], unparsedArgs: string[], message: Message) {
  const result = {};
  let args = [...argss];

  let unorderedArgs: Arg[] = [];
  for (const arg of argss) {
    if (arg.unordered) {
      args.shift();
      unorderedArgs.push(arg);
      continue;
    }
    if (arg.match === "everything") {
      const casted = convertType(unparsedArgs.join(" "), arg.type, message);
      if (casted != null) {
        args.shift();
        result[arg.name] = casted;
        break;
      }
    } else {
      const casted = convertType(unparsedArgs.shift(), arg.type, message);
      if (casted != null) {
        args.shift();
        result[arg.name] = casted;
        continue;
      }
    }
    const unordered = unorderedArgs.findIndex(
      (a) => convertType(unparsedArgs[0], a.type, message) != null
    );
    if (unordered >= 0) {
      result[arg.name] = convertType(
        unparsedArgs[0],
        unorderedArgs[unordered].type,
        message
      );
      args.shift();
      unorderedArgs.splice(unordered, 1);
    }
  }
  for (let unpArg of unparsedArgs) {
    for (const arg of unorderedArgs) {
      const casted = convertType(unpArg, arg.type, message);
      if (casted != null) {
        result[arg.name] = casted;
        unorderedArgs.shift();
        continue;
      }
    }
  }
  const missingArgs = [...args, ...unorderedArgs].filter((a) => !a.optional);
  if (missingArgs.length > 0) return { error: true, missingArgs };
  return result;
}

bot.on("messageUpdate", async (oldMessage, newMessage) => {
  if (commandsRunEdit.length > 0) {
    newMessage = await newMessage.fetch();
    startCommandParsing(newMessage);
  }
});
