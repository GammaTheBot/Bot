import { Message, PermissionResolvable } from "discord.js";
import { promises as fs } from "fs";
import { Type } from "yaml/util";
import { Language } from "../languages/Language";
import { BotPermissions } from "../Perms";

export const commands: Command[] = [];

export const commandsRunEdit: Command[] = [];

import schema from "./commands/categories.json";

export const categories: {
  [key: string]: {
    description: string;
    name: string;
    commands?: Command[];
  };
} = schema;

async function loadCommands(dir: string): Promise<any> {
  const files = await fs.readdir(dir);
  for await (let file of files) {
    // Cool ECMAScript feature
    if (file.endsWith(".ts")) {
      const cmds = await import(`${dir}/${file}`);
      for (const v of Object.values(cmds)) {
        const cmd = <Command>v;
        if ("exec" in cmd) {
          loadCommand(cmd);
        }
      }
    } else if (!file.includes(".")) {
      await loadCommands(`${dir}/${file}`);
    }
  }
}

function loadCommand(cmd: Command) {
  if (cmd.args)
    for (const arg of cmd.args) {
      if (arg.unordered && arg.match === "everything") {
        console.error("An arg can't be unordered and match everything!");
        return;
      }
    }
  if (!cmd.usage) {
    const usage = [cmd.name];
    if (cmd.args)
      for (const arg of cmd.args) {
        const t = arg.name || arg.type;
        usage.push(arg.optional ? `[${t}]` : `<${t}>`);
      }
    cmd.usage = usage.join(" ");
  }
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
  console.log(`Loaded ${commands.length} command(s)!`);
});
export enum ArgType { //You can choose different arg type
  uppercase = "uppercase",
  lowercase = "lowercase",
  string = "string",
  number = "number",
}

export interface ArgPromptOptions {
  cancelWord: string | "cancel";
  start(message: Message): string;
  retry(message: Message): string;
  timeout(): string;
  cancel(): string;
  ended(): string;
  retries: number | 1;
  time: number | 30000;
}

export interface Arg {
  type: ArgType;
  match?: "everything" | "others";
  optional?: boolean;
  unordered?: boolean | number;
  prompt?: ArgPromptOptions;
  name: string;
}

export interface Command {
  name: string;
  usage?: string;
  description: string;
  aliases?: string | string[];
  dms?: boolean | true;
  examples: string | string[];
  editable?: boolean | true;
  category: string;
  botOwnerOnly?: boolean;
  guildOwnerOnly?: boolean;
  clientPermissions: PermissionResolvable | PermissionResolvable[];
  userPermissions?: BotPermissions | BotPermissions[];
  args?: Arg[];
  exec(message: Message, args: any): Promise<any> | any | void;
}

export async function aliasesToString(
  guildId: string,
  aliases: string | string[]
): Promise<string[]> {
  if (!aliases) return null;
  if (typeof aliases === "string")
    return [await Language.getNode(guildId, aliases)];
  const result = [];
  for (const alias of aliases) {
    result.push(await Language.replaceNodes(guildId, alias));
  }
  return result;
}
