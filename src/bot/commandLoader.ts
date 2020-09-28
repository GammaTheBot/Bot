import { Message, PermissionResolvable } from "discord.js";
import fs from "fs/promises";

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
  for await (let file of files) {
    // Cool ECMAScript feature
    if (file.endsWith(".ts")) {
      const cmds = await import(`${dir}/${file}`);
      Object.values(cmds).forEach((v) => {
        const cmd = <Command>v;
        if ("exec" in cmd) {
          commands.push(cmd);
          if (!categories[cmd.category].commands) {
            categories[cmd.category].commands = [cmd];
          }
        }
      });
    } else if (!file.includes(".")) {
      await loadCommands(`${dir}/${file}`);
    }
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
  description: string;
  match: "everything" | "others";
  optional?: boolean;
  unordered?: boolean | number;
  prompt?: ArgPromptOptions;
}

export interface Command {
  name: string;
  description: string;
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
