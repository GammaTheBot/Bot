import Discord, { MessageEmbed } from "discord.js";
import stringSimilarity from "string-similarity";
import { bot } from "./bot/bot";

export namespace Utils {
  export const isBotOwner = async (id: string): Promise<boolean> => {
    const app = await bot.fetchApplication();
    const owner = app.owner;
    if (owner instanceof Discord.User) return id === owner.id;
    return (<Discord.Team>owner).members.map((m) => m.id).includes(id);
  };

  export const getPlural = (
    number: number,
    text: string,
    plural: string
  ): string => {
    return number === 1 ? text : plural;
  };
  export const resolveUser = (
    text: string,
    users: Discord.Collection<string, Discord.User>,
    impartial?: boolean
  ): Discord.User => {
    if (!text) return null;
    text = text.replace(/<@(.+?)>/gi, "$1");
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
    if (!text) return null;
    text = text.replace(/<@(.+?)>/gi, "$1");
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
    if (!text) return null;
    text = text.replace(/<#(.+?)>/gi, "$1");
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
    if (!text) return null;
    text = text.replace(/<@&(.+?)>/gi, "$1");
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
    if (!text) return null;
    text = text.replace(/<\w?:?\w+:(\w+?)>/gi, "$1");
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

  export const resolvePermissionNumber = (
    number: number
  ): Discord.PermissionString[] => {
    const resolved = [];
    for (const key of Object.keys(Discord.Permissions.FLAGS)) {
      if (number & Discord.Permissions.FLAGS[key]) resolved.push(key);
    }
    return resolved;
  };

  export const setEmbedAuthor = (
    embed: MessageEmbed,
    member: Discord.User | Discord.GuildMember
  ): MessageEmbed => {
    if (member instanceof Discord.User)
      return embed.setAuthor(member.tag, member.displayAvatarURL());

    return embed.setAuthor(member.user.tag, member.user.displayAvatarURL());
  };
}
