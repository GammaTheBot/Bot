import Discord from "discord.js";
import { all, create } from "mathjs";
import { Guilds } from "../../../Guilds";
import { ArgType, Command } from "../../commandLoader";

const math = create(all, {});
const limitedEvaluate = math.evaluate;

math.import(
  {
    import: function () {
      throw new Error("Function import is disabled");
    },
    createUnit: function () {
      throw new Error("Function createUnit is disabled");
    },
    evaluate: function () {
      throw new Error("Function evaluate is disabled");
    },
    parse: function () {
      throw new Error("Function parse is disabled");
    },
    simplify: function () {
      throw new Error("Function simplify is disabled");
    },
    derivative: function () {
      throw new Error("Function derivative is disabled");
    },
  },
  { override: true }
);

export const Calc: Command = {
  category: "Utility",
  clientPermissions: ["SEND_MESSAGES"],
  name: "calc",
  aliases: ["calculate", "math", "mathematic", "mathematics", "maths"],
  description: (guild) => "Calculates something",
  examples: ["calc 1+1", "calc 100*5"],
  editable: true,
  args: [
    {
      name: "expression",
      type: ArgType.string,
      match: "everything",
    },
  ],
  dms: true,
  exec: async (message, { expression }: { expression: string }) => {
    let resp: any;
    try {
      resp = limitedEvaluate(expression);
    } catch (err) {
      return message.channel.send(
        "Please input a valid expression to calculate!"
      );
    }
    const embed = new Discord.MessageEmbed()
      .setTitle("Math")
      .setTimestamp()
      .addField("Input", `\`\`\`js\n${expression}\n\`\`\``)
      .addField("Output", `\`\`\`js\n${resp}\n\`\`\``)
      .setColor(await Guilds.getColor(message.guild.id));

    message.channel.send(embed);
  },
};
