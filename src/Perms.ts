import { GuildMember } from "discord.js";
import { RoleData } from "./database/schemas/roles";
import { Utils } from "./Utils";

export namespace Perms {
  export const noPermEmoji = `⛔`;
  export async function hasPermission(
    member: GuildMember,
    perm: BotPermissions | BotPermissions[]
  ): Promise<boolean> {
    if (member.hasPermission("ADMINISTRATOR")) return true;
    const guild = member.guild;
    const roles = member.roles.cache.map((r) => r.id);
    const perms = (await RoleData.findById(guild.id)).permissions;
    if (perms == null) return false;
    for (const permObj of Object.entries(perms)) {
      if (roles.some((r) => r === permObj[0])) {
        const permsObj = permObj[1] as string[];
        if (
          permsObj.includes(perm.toString()) ||
          permsObj.includes("botAdministrator")
        )
          return true;
      }
    }
    return false;
  }
}

export type BotPermissions =
  | "botAdministrator"
  | "kick"
  | "mute"
  | "ban"
  | "bypassChatFilter"
  | "dj"
  | "punishments"
  | "clearChat"
  | "counting"
  | "logging"
  | "loginFlow"
  | "suggestions"
  | "customCommands"
  | "starboard"
  | "roles"
  | "experience"
  | "managePermissions"
  | "embeds";
