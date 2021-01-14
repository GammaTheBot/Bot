import {
  Collection,
  GuildChannel,
  Message,
  PermissionResolvable,
  TextChannel,
} from "discord.js";
import { promises as fs } from "fs";
import { ChannelData } from "../database/schemas/channels";
import { toMs } from "../functions";
import { Lang, Language } from "../language/Language";
import { BotPermissions } from "../Perms";
import { Utils } from "../Utils";
import { bot } from "./bot";
/*
 *
 *
 *              COMMAND LOADING
 *
 *
 * */
import schema from "./commands/categories.json";

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
  exec(
    message: Message,
    args?: any,
    language?: Lang
  ): Promise<any> | any | void;
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
  if (arg?.length < 1 || arg == null) return null;
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

export function parseArgs(
  args: Arg[],
  stringArray: string[],
  message: Message
): { [key: string]: any } | { error: true; missingArgs: Set<string> } {
  const result: Map<string, any> = new Map();
  const argArray: Set<Arg>[] = [];

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
    const converted = convertType(stringArray?.join(" "), arg.type, message);
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
      for (const [ind, str] of stringArray?.entries() || [""].entries()) {
        const converted = convertType(str, arg.type, message);
        if (converted != null) {
          stringArray?.splice(ind, 1);
          if (!result.has(arg.name)) result.set(arg.name, converted);
          else result.set(arg.name, result.get(arg.name) + ` ${converted}`);
          if (missingArgs.has(arg.name)) missingArgs.delete(arg.name);
          if (remainingEverythings.length > 0) {
            const result = convertEverything(
              remainingEverythings.shift(),
              stringArray?.slice(0, ind)
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
  if (missingArgs.size < 1) return Object.fromEntries(result.entries());
  else return { error: true, missingArgs: missingArgs };
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
  if (enabledCmds?.includes(thing))
    return [false, disabledGuildCmds?.includes(thing) ? "guild" : null];
  if (disabledChannelCmds?.includes(thing)) return [true, "channel"];
  else if (disabledGuildCmds?.includes(thing)) return [true, "guild"];
  else return [false, null];
}

export function aliasesToString(
  language: Lang,
  aliases: string | string[]
): string[] {
  if (!aliases) return null;
  if (typeof aliases === "string") {
    const alises = Language.getNode<string|string[]>(language, aliases);
    return typeof alises === "string" ? [alises] : alises;
  }
  const result = [];
  for (const alias of aliases) {
    result.push(Language.parseInnerNodes<string|string[]>(language, alias));
  }
  return result;
}

export function getCommand(
  str: string,
  language: Lang,
  commands: BaseCommand[]
): BaseCommand {
  let command: BaseCommand;
  for (const c of commands) {
    const name = Language.getNode(language, c.name);
    const aliases = aliasesToString(language, c.aliases);
    const result = name === str || aliases?.includes(str);
    if (result === true) {
      command = c;
      break;
    }
  }
  return command;
}

export const commands: Command[] = [];

export const commandsRunEdit: Command[] = [];
export const categories: {
  [key: string]: { description: string; name: string; commands?: Command[] };
} = schema;

async function loadCommands(dir: string): Promise<any> {
  const files = await fs.readdir(dir);
  for await (let file of files) {
    if (file.endsWith(".ts")) {
      const cmds = await import(`${dir}/${file}`);
      for (const v of Object.entries(cmds)) {
        const cmd = <Command>v[1];
        if ("category" in cmd) {
          loadCommand(cmd, v[0].toLowerCase());
        }
      }
    } else if (!file.includes(".")) {
      await loadCommands(`${dir}/${file}`);
    }
  }
}

export function getCommandUsage(cmd: Command | BaseCommand): string {
  if (!cmd.usage) {
    const usage = [`{@${cmd.name}}`];
    if (cmd.args)
      for (const arg of cmd.args) {
        const t = arg.name || arg.type;
        usage.push(arg.optional ? `[${t}]` : `<${t}>`);
      }
    return usage.join(" ");
  }
  return cmd.usage;
}

function loadCommand(cmd: Command, id: string) {
  cmd.usage = getCommandUsage(cmd);
  if (!cmd.id) cmd.id = id;
  commands.push(cmd);
  if (cmd.editable) commandsRunEdit.push(cmd);
  if (!categories[cmd.category]) {
    console.error(`Category ${cmd.category} not found!`);
    return;
  }
  if (!categories[cmd.category].commands) {
    categories[cmd.category].commands = [cmd];
  } else categories[cmd.category].commands.push(cmd);
}

loadCommands(`${__dirname}/commands/`).then(() => {
  console.log(
    `Loaded ${commands.length} ${Utils.getPlural(
      commands.length,
      "command",
      "commands"
    )}!`
  );
});
