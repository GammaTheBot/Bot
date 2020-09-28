import { bot } from "../bot";
import botConfig from "../botConfig.json";

bot.on("message", async (message) => {
  const prefix = botConfig.prefix; //TODO Add per guild prefix
  let cmd: string;
  let unparsedArgs: string[];
  if (message.mentions.users.firstKey() === bot.user.id) {
    const messageArray = message.content.trim().split(" ");
    message.mentions.users.delete(bot.user.id);
    messageArray[0] = messageArray[0].replace(/<@.*?>/i, "");
    if (messageArray[0].length < 1) messageArray.shift();
    [cmd, unparsedArgs] = [messageArray.shift().toLowerCase(), messageArray];
  } else {
    const messageArray = message.content.trim().split(" ");
    if (messageArray[0].startsWith(prefix)) {
      messageArray[0] = messageArray[0].slice(prefix.length);
      [cmd, unparsedArgs] = [messageArray.shift().toLowerCase(), messageArray];
    }
  }
  if (cmd == null) return;
});
