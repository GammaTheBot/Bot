import {
  Collection,
  GuildChannel,
  Message,
  PermissionResolvable,
  TextChannel,
} from "discord.js";
import { ChannelData } from "../database/schemas/channels";
import { toMs } from "../functions";
import { Language } from "../language/Language";
import { BotPermissions } from "../Perms";
import { Utils } from "../Utils";
import { bot } from "./bot";

export interface BaseCommand {
  name: string;
  usage?: string;
  description?: string;
  aliases?: string | string[];
  dms?: boolean | true;
  botOwnerOnly?: boolean;
  guildOwnerOnly?: boolean;
  clientPermissions?: PermissionResolvable | PermissionResolvable[];
  userPermissions?: BotPermissions | BotPermissions[];
  args?: Arg[];
  exec(message: Message, args?: any): Promise<any> | any | void;
  subcommands?: BaseCommand[];
}

export interface Command extends BaseCommand {
  examples?: string | string[];
  editable?: boolean | true;
  category: string;
  id?: string;
}

export enum ArgType { //You can choose different arg type
  uppercase = "uppercase",
  lowercase = "lowercase",
  string = "string",
  number = "number",
  integer = "integer",
  role = "role",
  channel = "channel",
  user = "user",
  member = "member",
  flag = "flag",
  timestamp = "timestamp",
}

export interface Arg {
  type: ArgType;
  match?: "everything" | "others";
  optional?: boolean;
  default?: any;
  otherPositions?: number[];
  name: string;
}

export function convertType(
  arg: string,
  type: ArgType,
  message: Message,
  impartial?: boolean
) {
  if (arg?.length < 1) return null;
  switch (type) {
    case "string":
      return arg;
    case "lowercase":
      return arg.toLowerCase();
    case "uppercase":
      return arg.toUpperCase();
    case "number": {
      const n = Number(arg);
      return isNaN(n) ? null : n;
    }
    case "integer": {
      const n = Number(arg);
      if (isNaN(n)) return null;
      if ((n | 0) !== n) return null;
      return n | 0;
    }
    case "flag": {
      if (arg.startsWith("--")) return arg.slice(2);
      return null;
    }
    case "timestamp": {
      return toMs(arg);
    }
    case "role": {
      return Utils.resolveRole(arg, message.guild.roles.cache, impartial);
    }
    case "user": {
      return Utils.resolveUser(arg, bot.users.cache, impartial);
    }
    case "member": {
      return Utils.resolveMember(arg, message.guild.members.cache, impartial);
    }
    case "channel": {
      const channel = Utils.resolveChannel(
        arg,
        message.guild.channels.cache,
        impartial
      );
      if (channel) return channel;
      return Utils.resolveChannel(
        arg,
        bot.channels.cache.filter(
          (c) => c.type !== "dm" && c.type !== "group"
        ) as Collection<string, GuildChannel>,
        impartial
      );
    }
    default:
      return arg;
  }
}

function parseArgs(args: Arg[], argString: string, message: Message) {
  const result: Map<string, any> = new Map();
  const argArray: Set<Arg>[] = [];
  let stringArray = argString.match(
    /((?=["'])(?:"(?!\s)[^"\\]*(?:\\[\s\S][^"\\]*)*(?<!\s)")|[^\s]+)/gi
  );
  const missingArgs: Set<string> = new Set();
  for (const [i, arg] of args.entries()) {
    if (!argArray[i]) argArray[i] = new Set();
    argArray[i].add(arg);
    arg.otherPositions?.forEach((op) => {
      if (!argArray[op]) argArray[op] = new Set();
      argArray[op].add(arg);
    });
  }
  const remainingEverythings: Arg[] = [];
  function convertEverything(arg: Arg, stringArray: string[]): boolean {
    const converted = convertType(stringArray.join(" "), arg.type, message);
    if (converted != null) {
      if (!result.has(arg.name)) result.set(arg.name, converted);
      else result.set(arg.name, result.get(arg.name) + ` ${converted}`);
      if (missingArgs.has(arg.name)) missingArgs.delete(arg.name);
    } else if (!arg.optional) {
      missingArgs.add(arg.name);
      return false;
    }
    return true;
  }
  entireLoop: for (const [i, possibleArg] of argArray.entries()) {
    currentArg: for (const arg of possibleArg) {
      if (arg.match === "everything") {
        if (argArray[i + 1]) {
          remainingEverythings.push(arg);
        } else if (!convertEverything(arg, stringArray)) {
          break entireLoop;
        }
        continue;
      }
      for (const [ind, str] of stringArray.entries()) {
        const converted = convertType(str, arg.type, message);
        if (converted != null) {
          stringArray.splice(ind, 1);
          if (!result.has(arg.name)) result.set(arg.name, converted);
          else result.set(arg.name, result.get(arg.name) + ` ${converted}`);
          if (missingArgs.has(arg.name)) missingArgs.delete(arg.name);
          if (remainingEverythings.length > 0) {
            const result = convertEverything(
              remainingEverythings.shift(),
              stringArray.slice(0, ind)
            );
            if (result) break currentArg;
          }
          break;
        } else if (
          !arg.optional &&
          (!arg.otherPositions ||
            arg.otherPositions[arg.otherPositions.length - 1] === i) &&
          remainingEverythings.length < 1
        ) {
          missingArgs.add(arg.name);
          continue currentArg;
        } else if (remainingEverythings.length < 1) {
          break;
        }
      }
    }
  }
  if (missingArgs.size > 0) return result;
  else return { error: true, ...missingArgs };
}

export async function isCommandDisabled(
  thing: string,
  channel: TextChannel
): Promise<[boolean, "channel" | "guild"]> {
  thing = thing.toLowerCase();
  const doc = await ChannelData.findById(channel.guild.id);
  const disabledGuildCmds = [];
  const disabledChannelCmds = [];
  if (doc?.disabledCommands) disabledGuildCmds.push(...doc?.disabledCommands);
  if (doc?.text?.[channel.id]?.commands?.disabled)
    disabledChannelCmds.push(doc?.text?.[channel.id]?.commands?.disabled);
  const enabledCmds = doc?.text?.[channel.id]?.commands?.enabled;
  if (enabledCmds?.includes(thing)) return [false, null];
  if (disabledChannelCmds?.includes(thing)) return [true, "channel"];
  else if (disabledGuildCmds?.includes(thing)) return [true, "guild"];
  else return [false, null];
}

export async function aliasesToString(
  guildId: string,
  aliases: string | string[]
): Promise<string[]> {
  if (!aliases) return null;
  if (typeof aliases === "string") {
    const alises = await Language.getNodeFromGuild(guildId, aliases);
    return typeof alises === "string" ? [alises] : alises;
  }
  const result = [];
  for (const alias of aliases) {
    result.push(await Language.replaceNodesInGuild(guildId, alias));
  }
  return result;
}

export async function getCommand(
  str: string,
  guildId: string,
  commands: BaseCommand[]
): Promise<BaseCommand> {
  let command: BaseCommand;
  for await (const c of commands) {
    const name = await Language.getNodeFromGuild(guildId, c.name);
    const aliases = await aliasesToString(guildId, c.aliases);
    const result = name === str || aliases?.includes(str);
    if (result === true) {
      command = c;
      break;
    }
  }
  return command;
}
