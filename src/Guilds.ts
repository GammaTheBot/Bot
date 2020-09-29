import { GuildData } from "./database/schemas";
import { bot } from "./config.json";

export class Guilds {
  static async getPrefix(guildId?: string): Promise<string> {
    if (guildId == null) return bot.prefix;
    return (await GuildData.findById(guildId)).prefix || bot.prefix;
  }
}
