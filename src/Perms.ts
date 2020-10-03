import { GuildMember } from "discord.js";
import { Utils } from "./Utils";

export class Perms {
  static noPermEmoji(): string {
    return `⛔`;
  }
  static async hasPermission(
    member: GuildMember,
    perm: BotPermissions | BotPermissions[]
  ): Promise<boolean> {
    if (member.hasPermission("ADMINISTRATOR")) return true;
    const guild = member.guild;
    const roles = member.roles.cache.map((r) => r.id);
    const rolesDoc = await Utils.getDoc(guild.id, "roleData", 1000);
    const perms = rolesDoc?.permissions;
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
  | "bypassFilter"
  | "musicManager"
  | "dj"
  | "punishments"
  | "clear"
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

export const botPermissions = {
  botAdministrator: "Access to all the features",
  kick: "Access to the kick command",
  mute: "Access to the mute and unmute commands",
  ban: "Access to the ban and unban commands",
  bypassFilter: "Bypass the chat filter",
  musicManager: "Manage the music settings",
  dj: "Bypass the music threshold",
  punishments: "Access to the case and punishments commands",
  clear: "Clear messages",
  counting: "Manage the counting settings",
  logging: "Manage logging settings",
  loginFlow: "Manage the login flow",
  suggestions: "Manage the suggestions system",
  customCommands: "Manage custom commands",
  starboard: "Manage the starboard system",
  roles: "Manage the assigning roles system",
  experience: "Manage the chat experience system",
  managePermissions: "Access to the permissions command",
  embeds: "Create embeds",
};
