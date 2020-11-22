import Discord from "discord.js";
import { all, create } from "mathjs";
import { Guilds } from "../../../Guilds";
import { Language } from "../../../language/Language";
import { ArgType, Command } from "../../commandManager";

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
  name: "command.calc.name",
  aliases: "command.calc.aliases",
  description: "command.calc.description",
  examples: ["{command.calc.name} 1+1", "{command.calc.name} 100*5"],
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
        await Language.getNodeFromGuild(
          message.guild?.id,
          "command.calc.invalid"
        )
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
