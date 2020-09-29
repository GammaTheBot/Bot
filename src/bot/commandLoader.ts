import { Message, PermissionResolvable } from "discord.js";
import { promises as fs } from "fs";

export const commands: Command[] = [];

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
  let helpCmd: Command;
  fileloop: for await (let file of files) {
    // Cool ECMAScript feature
    if (file.endsWith(".ts")) {
      const cmds = await import(`${dir}/${file}`);
      for (const v of Object.values(cmds)) {
        const cmd = <Command>v;
        if ("exec" in cmd) {
          if (cmd.name === "help") {
            helpCmd = cmd;
            continue;
          }
          loadCommand(cmd);
        }
      }
    } else if (!file.includes(".")) {
      await loadCommands(`${dir}/${file}`);
    }
  }
  if (helpCmd != null) {
    loadCommand(helpCmd);
  }
}

function loadCommand(cmd: Command) {
  for (const arg of cmd.args) {
    if (arg.unordered && arg.match === "everything") {
      console.error("An arg can't be unordered and match everything!");
      return;
    }
  }
  if (!cmd.usage) {
    const usage = [cmd.name];
    for (const arg of cmd.args) {
      const t = arg.name || arg.type;
      usage.push(arg.optional ? `[${t}]` : `<${t}>`);
    }
    cmd.usage = usage.join(" ");
  }

  commands.push(cmd);
  if (!categories[cmd.category].commands) {
    categories[cmd.category].commands = [cmd];
  }
}

loadCommands(`${__dirname}/commands/`).then(() => {
  console.log(`Loaded ${commands.length} command(s)!`);
});
export enum ArgType {
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
  description(guild: string): string;
  match?: "everything" | "others";
  optional?: boolean;
  unordered?: boolean | number;
  prompt?: ArgPromptOptions;
  name?: string;
}

export interface Command {
  name: string;
  usage?: string;
  description(guild?: string): string;
  aliases?: string[];
  dms?: boolean | true;
  editable?: boolean | true;
  category: string;
  ownerOnly?: boolean;
  clientPermissions: PermissionResolvable | PermissionResolvable[];
  userPermissions?: PermissionResolvable | PermissionResolvable[];
  args?: Arg[];
  exec(message: Message, args: any): Promise<any> | any | void;
}
