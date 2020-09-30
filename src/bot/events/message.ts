import { bot } from "../bot";
import config from "../../config.json";
import { Arg, ArgType, commands, commandsRunEdit } from "../commandLoader";
import Discord, { Message } from "discord.js";
import { GuildData } from "../../database/schemas/guilds";
import { Perms } from "../../Perms";
import { Lang, Language } from "../../languages/Language";
import { Utils } from "../../Utils";
import stringSimilarity from "string-similarity";
import { Guilds } from "../../Guilds";

bot.on("message", async (message) => {
  // All code after this is for the command
  //TODO Make it so if an argument is invalid it'll ask you to type a valid one again
  //Argument parsing here we go!
  handleCommand(message);
});

async function handleCommand(message: Message) {
  if (message.author.bot) return;
  const guildData = await GuildData.findOne({ _id: message.guild.id }); //Looks for a document with the same id as the guild and if it finds it it uses that prefix
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
  const command = commands.find(
    (c) => c.name === cmd || c.aliases?.includes(cmd)
  );
  if (command) {
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
    let args = [...command.args];
    let result = {};
    let unorderedArgs: Arg[] = [];
    for (const arg of command.args) {
      if (arg.unordered) {
        args.shift();
        unorderedArgs.push(arg);
        continue;
      }
      if (arg.match === "everything") {
        const casted = convertType(unparsedArgs.join(" "), arg.type);
        if (casted != null) {
          args.shift();
          result[arg.name] = casted;
          break;
        }
      } else {
        const casted = convertType(unparsedArgs.shift(), arg.type);
        if (casted != null) {
          args.shift();
          result[arg.name] = casted;
          continue;
        }
      }
      const unordered = unorderedArgs.findIndex(
        (a) => convertType(unparsedArgs[0], a.type) != null
      );
      if (unordered >= 0) {
        result[arg.name] = convertType(
          unparsedArgs[0],
          unorderedArgs[unordered].type
        );
        args.shift();
        unorderedArgs.splice(unordered, 1);
      }
    }
    for (let unpArg of unparsedArgs) {
      for (const arg of unorderedArgs) {
        const casted = convertType(unpArg, arg.type);
        if (casted != null) {
          result[arg.name] = casted;
          unorderedArgs.shift();
          continue;
        }
      }
    }
    const missingArgs = [...args, ...unorderedArgs].filter((a) => !a.optional);
    if (missingArgs.length > 0) {
      const usage = [`${command.name}\``];
      for (const arg of command.args) {
        const t = arg.name || arg.type;
        if (missingArgs.includes(arg)) {
          usage.push(`**\` <${t}>\`**`);
        } else {
          usage.push(arg.optional ? ` [${t}]` : ` <${t}>`);
        }
      }
      const embed = new Discord.MessageEmbed()
        .setColor(await Guilds.getColor(message.guild?.id))
        .setTimestamp()
        .setAuthor(message.author.tag, message.author.displayAvatarURL())
        .setDescription(`Arguments missing!\n\`${prefix}${usage.join("")}`);
      return message.channel.send(embed);
    }
    command.exec(message, result);
  } else {
    const bestMatch = stringSimilarity.findBestMatch(
      cmd,
      commands.map((c) => c.name)
    );
    const str = bestMatch.bestMatch.target;
    return message.channel.send(
      Language.getNode(message.guild?.id, ["command", "unknown"]).replace(
        "{cmd}",
        `\`${str}\``
      )
    );
  }
}

function convertType(arg: string, type: ArgType) {
  if (arg?.length < 1) return null;
  switch (type) {
    case "string":
      return arg;
    case "lowercase":
      return arg.toLowerCase();
    case "uppercase":
      return arg.toUpperCase();
    case "number":
      const n = Number(arg);
      return isNaN(n) ? null : n;
    default:
      return arg;
  }
}

bot.on("messageUpdate", async (oldMessage, newMessage) => {
  if (commandsRunEdit.length > 0) {
    newMessage = await newMessage.fetch();
    handleCommand(newMessage);
  }
});
