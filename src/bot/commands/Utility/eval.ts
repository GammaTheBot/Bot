import { Language, Lang } from "../../../languages/Language";
import { Command } from "../../commandManager";

const Eval: Command = {
  name: "eval",
  description: Language.getNode(Lang.English, "code.eval"),
  aliases: ["evaluate"],
  clientPermissions: [],
  ownerOnly: true,
  dms: true,
  exec: async (message, args) => {},
};
