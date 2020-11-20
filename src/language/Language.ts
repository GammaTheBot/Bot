import yaml from "yaml";
import fs from "fs";
import { GuildData } from "../database/schemas/guilds";
const files = fs.readdirSync(`${__dirname}/languages/`);
const nodes: Map<Lang, Map<string, string>> = new Map();
export enum Lang {
  English = "English",
}
files.forEach((file) => {
  if (file.endsWith(".yaml")) {
    const json = yaml.parse(
      fs.readFileSync(`${__dirname}/languages/${file}`).toString()
    );
    const language = file.split(".")[0] as Lang;
    function search(json: Object, path = "") {
      for (const k in json) {
        if (json.hasOwnProperty(k))
          if (typeof json[k] === "object")
            search(json[k], (path ? path + "." : "") + k);
          else {
            if (!nodes.has(language)) nodes.set(language, new Map());
            nodes.get(language).set((path ? path + "." : "") + k, json[k]);
          }
      }
    }
    search(json);
    console.log(nodes);
  }
});

export namespace Language {
  export function getNode(language: Lang, node: string): string {
    return nodes?.get(language)?.get(node);
  }
  export async function getNodeFromGuild(
    guildId: string,
    node: string
  ): Promise<string> {
    const lang = (await GuildData.findById(guildId)).language as Lang;
    return getNode(lang, node);
  }
  export async function replaceNodesInGuild(
    guildId: string,
    text: string
  ): Promise<string> {
    for (let i = 0; i < text.length; i++) {
      if (text.charAt(i) === "{") {
        const start = i;
        while (text.charAt(i) !== "}") i++;
        const placeholder = text.substring(start + 1, i);
        text = text.replace(
          `{${placeholder}}`,
          await Language.getNodeFromGuild(guildId, placeholder)
        );
      }
    }
    return text;
  }
}
