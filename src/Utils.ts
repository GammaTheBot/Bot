import Discord from "discord.js";
import { bot } from "./bot/bot";

export class Utils {
  static getPlural(number: number, text: string, plural: string): string {
    return number === 1 ? text : plural;
  }
  static async isBotOwner(id: string): Promise<boolean> {
    const app = await bot.fetchApplication();
    const owner = app.owner;
    if (owner instanceof Discord.User) return id === owner.id;
    return (<Discord.Team>owner).members.map((m) => m.id).includes(id);
  }
}
