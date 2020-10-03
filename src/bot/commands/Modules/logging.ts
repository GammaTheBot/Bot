import { Command } from "../../commandLoader";

const LoggingSet: Command = {
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
