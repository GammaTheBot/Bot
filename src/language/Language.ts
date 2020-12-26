import fs from "fs";
import yaml from "yaml";
import { GuildData } from "../database/schemas/guilds";

export namespace Language {
  export function parseInnerNodes(language: Lang, newNode: string | string[]) {
    if (newNode == null) return null;
    if (typeof newNode === "string") {
      for (let i = 0; i < newNode.length; i++) {
        if (newNode.charAt(i) === "{") {
          const start = ++i;
          if (newNode.charAt(i) === "@") {
            while (newNode.charAt(i) !== "}") i++;
            const placeholder = newNode.substring(start + 1, i);
            const thing = getNode(language, placeholder);
            if (thing != null)
              newNode = newNode.replace(
                `{@${placeholder}}`,
                typeof thing === "string" ? thing : thing[0]
              );
          }
        }
      }
      return newNode;
    } else {
      const nodes: any[] = [];
      for (let i1 = 0; i1 < newNode.length; i1++) {
        nodes[i1] = parseInnerNodes(language, newNode[i1]);
      }
      return nodes;
    }
  }

  export async function languageInGuild(guildId: string): Promise<Lang> {
    return (
      ((await GuildData.findById(guildId))?.language as Lang) || Lang.English
    );
  }

  export function getNode(language: Lang, node: string): string | string[] {
    let newNode = nodes?.get(language)?.get(node);
    return parseInnerNodes(language, newNode);
  }
}

const files = fs.readdirSync(`${__dirname}/languages/`);
const nodes: Map<Lang, Map<string, string | string[]>> = new Map();
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
          if (typeof json[k] === "object" && !Array.isArray(json[k]))
            search(json[k], (path ? path + "." : "") + k);
          else {
            if (!nodes.has(language)) nodes.set(language, new Map());
            nodes.get(language).set((path ? path + "." : "") + k, json[k]);
          }
      }
    }
    search(json);
  }
});
for (const [i, v] of Array.from(nodes.entries())) {
  for (const [i2, v2] of Array.from(v.entries())) {
    if (typeof v2 === "string") {
      nodes.get(Lang[i]).set(i2, Language.parseInnerNodes(Lang[i], v2));
    } else {
      const nodess: any[] = [];
      for (let i1 = 0; i1 < v2.length; i1++) {
        nodess.push(Language.parseInnerNodes(Lang[i], v2[i1]));
      }
      nodes.get(Lang[i]).set(i2, nodess);
    }
  }
}
