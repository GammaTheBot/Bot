import Discord from "discord.js";
import { bot } from "./bot/bot";
import { DbCollections, getDb } from "./database/db";
import stringSimilarity from "string-similarity";
export namespace Utils {
  export const getPlural = (
    number: number,
    text: string,
    plural: string
  ): string => {
    return number === 1 ? text : plural;
  };
  export const isBotOwner = async (id: string): Promise<boolean> => {
    const app = await bot.fetchApplication();
    const owner = app.owner;
    if (owner instanceof Discord.User) return id === owner.id;
    return (<Discord.Team>owner).members.map((m) => m.id).includes(id);
  };
  const cache: {
    [key: string]: {
      [key: string]: [any, number];
    };
  } = {};
  export const getDoc = async (
    id: string,
    collName: DbCollections,
    cache: number = 0
  ): Promise<any> => {
    let doc;
    if (
      cache[collName]?.[id] &&
      cache > 0 &&
      Date.now() + cache > cache[collName][id][1]
    ) {
      doc = cache[collName][id][0];
    } else {
      const collection = getDb().collection(collName);
      doc = await collection.findOne({ _id: id });
      if (!cache[collName]) cache[collName] = {};
      if (cache > 50) {
        cache[collName][id] = [doc, Date.now() + cache];
        setTimeout(() => {
          delete cache[collName][id];
        }, cache);
      }
    }
    return doc;
  };
  export const resolveUser = (
    text: string,
    users: Discord.Collection<string, Discord.User>,
    impartial?: boolean
  ): Discord.User => {
    text.replace(/<@(.+?)>/gi, "$1");
    const user = users.get(text) || users.find((u) => u.tag === text);
    if (user || !impartial) return user;
    const bestMatch = stringSimilarity.findBestMatch(
      text,
      users.map((u) => u.tag)
    ).bestMatch;
    return users.find((u) => u.tag === bestMatch.target);
  };
  export const resolveMember = (
    text: string,
    members: Discord.Collection<string, Discord.GuildMember>,
    impartial?: boolean
  ): Discord.GuildMember => {
    text.replace(/<@(.+?)>/gi, "$1");
    const member =
      members.get(text) || members.find((u) => u.displayName === text);
    if (member || !impartial) return member;
    const bestMatch = stringSimilarity.findBestMatch(
      text,
      members.map((u) => u.displayName)
    ).bestMatch;
    return members.find((u) => u.displayName === bestMatch.target);
  };
  export const resolveChannel = (
    text: string,
    channels: Discord.Collection<string, Discord.GuildChannel>,
    impartial?: boolean
  ): Discord.GuildChannel => {
    text.replace(/<#(.+?)>/gi, "$1");
    const channel = channels.get(text) || channels.find((u) => u.name === text);
    if (channel || !impartial) return channel;
    const bestMatch = stringSimilarity.findBestMatch(
      text,
      channels.map((u) => u.name)
    ).bestMatch;
    return channels.find((u) => u.name === bestMatch.target);
  };
  export const resolveRole = (
    text: string,
    roles: Discord.Collection<string, Discord.Role>,
    impartial?: boolean
  ): Discord.Role => {
    text.replace(/<@&(.+?)>/gi, "$1");
    const channel = roles.get(text) || roles.find((u) => u.name === text);
    if (channel || !impartial) return channel;
    const bestMatch = stringSimilarity.findBestMatch(
      text,
      roles.map((u) => u.name)
    ).bestMatch;
    return roles.find((u) => u.name === bestMatch.target);
  };
  export const resolveDiscordEmoji = (
    text: string,
    emojis: Discord.Collection<string, Discord.Emoji>,
    impartial?: boolean
  ): Discord.Emoji => {
    text.replace(/<\w?:?\w+:(\w+?)>/gi, "$1");
    const emoji = emojis.get(text) || emojis.find((u) => u.name === text);
    if (emoji || !impartial) return emoji;
    const bestMatch = stringSimilarity.findBestMatch(
      text,
      emojis.map((u) => u.name)
    ).bestMatch;
    return emojis.find((u) => u.name === bestMatch.target);
  };
  export const resolveUnicodeEmoji = (text: string) => {
    return text.replace(/\\u[\dA-F]{4}/gi, (m) =>
      String.fromCharCode(parseInt(m.replace(/\\u/g, ""), 16))
    );
  };
}
