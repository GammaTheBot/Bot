import { Command } from "../../commandManager";

export const Aww: Command = {
  name: "aww",
  category: "Animals",
  exec: async (message, _, language) => {
    //http://www.reddit.com/r/aww/random.json?limit=1
  },
};
