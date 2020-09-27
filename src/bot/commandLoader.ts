import { Message, PermissionResolvable } from "discord.js";
import fs from "fs";

export enum ArgType {
  "uppercase",
  "lowercase",
  "string",
  "number",
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
  unordered?: boolean | number;
  prompt?: ArgPromptOptions;
  index: number;
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

export const commands: Command[] = [];

import schema from "./commands/categories.json";

export const categories: {
  [key: string]: {
    description: string;
    name: string;
    commands?: Command[];
  };
} = schema;

async function loadCommands(dir: string) {
  const files = fs.readdirSync(dir);
  files.forEach(async (file) => {
    if (file.endsWith(".ts")) {
      const cmds = await import(`${dir}/${file}`);
      console.log(cmds);
      Object.values(cmds).forEach((v) => {
        const cmd = <Command>v;
        if (cmd.name) {
          commands.push(cmd);
          if (!categories[cmd.category].commands) {
            categories[cmd.category].commands = [cmd];
          }
        }
      });
    } else if (!file.includes(".")) {
      loadCommands(`${dir}/${file}`);
    }
  });
}

loadCommands(`${__dirname}/commands/`).then(() => {
  console.log(`Loaded the commands!`);
});
console.log(commands);
