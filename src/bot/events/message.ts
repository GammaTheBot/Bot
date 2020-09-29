import { bot } from "../bot";
import config from "../../config.json";
import { Arg, ArgType, commands } from "../commandLoader";
import Discord from "discord.js";
import { GuildData } from "../../database/schemas";

bot.on("message", async (message) => {
  // All code after this is for the command
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
    if (command.ownerOnly && !(await isBotOwner(message.member.id)))
      return message.channel.send(
        ":no_entry: Only the owners of the bot can run this command!"
      );
    if (
      message.guild.me
        .permissionsIn(message.channel)
        .missing(new Discord.Permissions(command.clientPermissions)).length > 0
    ) {
      return message.channel.send(":x: ");
    }
    if (command.userPermissions) {
    } // TODO Check for permissions
    //TODO Create command usage automatically and make it so if an argument is invalid it'll ask you to type a valid one again
    //Argument parsing here we go!
    const argResult = argParser(unparsedArgs, command.args);
    command.exec(message, argResult);
  }
});

function argParser(unparsedArgs: string[], argss: Arg[]): any[] {
  let args = [...argss];
  let result = [];
  let unorderedArgs: Arg[] = [];
  for (const arg of argss) {
    if (arg.unordered) {
      args.shift();
      unorderedArgs.push(arg);
      continue;
    }
    if (arg.match === "everything") {
      const casted = convertType(unparsedArgs.join(" "), arg.type);
      if (casted != null) {
        args.shift();
        result.push(casted);
        break;
      }
    } else {
      const casted = convertType(unparsedArgs.shift(), arg.type);
      if (casted != null) {
        args.shift();
        result.push(casted);
      }
    }
    if (arg.optional) continue;
    const unordered = unorderedArgs.findIndex(
      (a) => convertType(unparsedArgs[0], a.type) != null
    );
    if (unordered >= 0) {
      result.push(convertType(unparsedArgs[0], unorderedArgs[unordered].type));
      args.shift();
      unorderedArgs.splice(unordered, 1);
    }
  }
  for (let unpArg of unparsedArgs) {
    for (const arg of unorderedArgs) {
      if (arg.optional) {
        const casted = convertType(unpArg, arg.type);
        if (casted != null) {
          result.push(casted);
          unorderedArgs.shift();
          continue;
        }
      }
      const casted = convertType(unparsedArgs.shift(), arg.type);
      if (casted != null) {
        result.push(casted);
        unorderedArgs.shift();
        continue;
      }
    }
  }
  return result;
}

function convertType(arg: string, type: ArgType) {
  if (arg.length < 1) return null;
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

async function isBotOwner(id: string): Promise<boolean> {
  const app = await bot.fetchApplication();
  const owner = app.owner;
  if (owner instanceof Discord.User) return id === owner.id;
  return (<Discord.Team>owner).members.map((m) => m.id).includes(id);
}
