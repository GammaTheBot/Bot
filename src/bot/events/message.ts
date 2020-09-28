import { bot } from "../bot";
import config from "../../config.json";
import { Arg, ArgType, commands } from "../commandLoader";
import Discord from "discord.js";

bot.on("message", async (message) => {
  const prefix = config.bot.prefix; //TODO Add per guild prefix
  // All code after this is for the command
  let cmd: string;
  let unparsedArgs: string[];
  if (message.mentions.users.firstKey() === bot.user.id) {
    const messageArray = message.content.trim().split(" ");
    message.mentions.users.delete(bot.user.id);
    messageArray[0] = messageArray[0].replace(/<@.*?>/i, "");
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
    //TODO
    //Argument parsing here we go!
    const argResult = argParser(unparsedArgs, command.args);
    command.exec(message, argResult);
  }
});

function argParser(unparsedArgs: string[], args: Arg[]): any[] {
  let result = [];
  const workArgs = [...unparsedArgs];
  let i = 0;
  let optionalArgs: Arg[] = [];
  for (const arg of args) {
    if (arg.match === "everything") {
      result[i] = convertType(workArgs.join(" "), arg.type);
      return result;
    } else if (arg.unordered) {
      const index = workArgs.findIndex((a) => convertType(a, arg.type) != null);
      result[i] = convertType(workArgs[index], arg.type);
      workArgs.splice(index, 1);
    } else if (arg.optional) {
      optionalArgs.push(arg);
      continue;
    } else {
      result[i] = convertType(workArgs.shift(), arg.type);
    }
    i++;
  }
  optionalArgs.forEach((arg) => {
    result[i] = convertType(workArgs.shift(), arg.type);
  });
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
      return Number(arg);
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
