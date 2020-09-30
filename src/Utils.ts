import Discord from "discord.js";
import mongoose from "mongoose";
import { bot } from "./bot/bot";
import { DbCollections, getDb } from "./database/db";
import { ChannelData } from "./database/schemas/channels";

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
  private static cache: {
    [key: string]: {
      [key: string]: [any, number];
    };
  } = {};
  static async getDoc(
    id: string,
    collName: DbCollections,
    cache: number = 0
  ): Promise<any> {
    let doc;
    if (
      this.cache[collName]?.[id] &&
      cache > 0 &&
      Date.now() + cache > this.cache[collName][id][1]
    ) {
      doc = this.cache[collName][id][0];
    } else {
      const collection = getDb().collection(collName);
      doc = await collection.findOne({ _id: id });
      if (!this.cache[collName]) this.cache[collName] = {};
      if (cache > 50) {
        this.cache[collName][id] = [doc, Date.now() + cache];
        setTimeout(() => {
          delete this.cache[collName][id];
        }, cache);
      }
    }
    return doc;
  }
}
