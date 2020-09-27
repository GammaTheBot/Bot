import { Message, PermissionResolvable } from "discord.js";

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
  ownerOnly?: boolean;
  clientPermissions: PermissionResolvable | PermissionResolvable[];
  userPermissions?: PermissionResolvable | PermissionResolvable[];
  args?: Arg[];
  exec(message: Message, args: any): Promise<any> | any | void;
}
