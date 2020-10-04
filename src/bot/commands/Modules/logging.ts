import { BaseCommand, Command } from "../../commandLoader";

const logTypes = {
  emojis: "Emoji creation/deletion/updates",
  bans: "Ban creation/removal",
  messages: "Message deletion / edits",
  roles: "Role creation/deletion/updates",
  channels: "Channel creation/deletion/updates",
  invites: "Invite creation/deletion",
  nicknames: "Nickname edits",
};

const LoggingSet: BaseCommand = {
  name: "command.logging.set.name",
  clientPermissions: "SEND_MESSAGES",
  exec: (message, args) => {},
};

export const Logging: Command = {
  name: "command.logging.name",
  category: "Modules",
  clientPermissions: ["SEND_MESSAGES", "USE_EXTERNAL_EMOJIS"],
  description: "command.logging.description",
  examples: "command.logging.examples",
  aliases: "command.logging.aliases",
  exec: (message, args) => {},
  subcommands: [LoggingSet],
};
