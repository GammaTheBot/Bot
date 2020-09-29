import { GuildMember } from "discord.js";

export class Perms {
  static noPermEmoji(): string {
    return `⛔`;
  }
  static async hasPermission(
    member: GuildMember,
    perm: BotPermissions | BotPermissions[]
  ): Promise<boolean> {
    if (member.hasPermission("ADMINISTRATOR")) return true;
    /*
    const guild = member.guild;
    const roles = member.roles.cache.map((r) => r.id);
    const rolesDoc = await Utils.getDoc(guild.id, "roleData", 1000);
    const perms = rolesDoc?.permissions;
    if (perms == null) return false;
    for (let permObj of Object.entries(perms)) {
      if (roles.some((r) => r === permObj[0])) {
        const permsObj = permObj[1] as string[];
        if (permsObj.includes(perm) || permsObj.includes("bot administrator"))
          return true;
      }
    }
    */
    return false;
  }
}

export type BotPermissions =
  | "bot administrator"
  | "kick"
  | "mute"
  | "ban"
  | "bypass filter"
  | "music manager"
  | "dj"
  | "punishments"
  | "clear"
  | "counting"
  | "logging"
  | "login flow"
  | "suggestions"
  | "custom commands"
  | "starboard"
  | "roles"
  | "experience"
  | "manage permissions"
  | "embeds";

export const botPermissions = {
  "bot administrator": "Access to all the features",
  kick: "Access to the kick command",
  mute: "Access to the mute and unmute commands",
  ban: "Access to the ban and unban commands",
  "bypass filter": "Bypass the chat filter",
  "music manager": "Manage the music settings",
  dj: "Bypass the music threshold",
  punishments: "Access to the case and punishments commands",
  clear: "Clear messages",
  counting: "Manage the counting settings",
  logging: "Manage logging settings",
  "login flow": "Manage the login flow",
  suggestions: "Manage the suggestions system",
  "custom commands": "Manage custom commands",
  starboard: "Manage the starboard system",
  roles: "Manage the assigning roles system",
  experience: "Manage the chat experience system",
  "manage permissions": "Access to the permissions command",
  embeds: "Create embeds",
};
