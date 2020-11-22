import { GuildData } from "./database/schemas/guilds";
import { bot } from "./config.json";

export namespace Guilds {
  export async function getPrefix(guildId?: string): Promise<string> {
    if (guildId == null) return bot.prefix;
    return (await GuildData.findById(guildId))?.prefix || bot.prefix;
  }
  export async function getColor(guildId?: string): Promise<string> {
    if (guildId == null) return bot.color;
    return (await GuildData.findById(guildId))?.color || bot.color;
  }
}
