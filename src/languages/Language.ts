import yaml from "yaml";
import fs from "fs";
import { Utils } from "../Utils";
import { GuildData } from "../database/schemas/guilds";

const files = fs.readdirSync(__dirname);

const nodes: { [key: string]: { [key: string]: string } } = {};

files.forEach((file) => {
  if (file.endsWith("yaml")) {
    const json = yaml.parse(fs.readFileSync(`${__dirname}/${file}`).toString());
    nodes[(file.replace(/\..*/gi, "") as unknown) as Lang] = json;
  }
});

export enum Lang {
  English = "English",
}

export const Language = {
  getNode: async (
    guildId: string,
    subnodess: string[] | string
  ): Promise<string> => {
    try {
      let language =
        (await Utils.getDoc(guildId, "guildData", 1000))?.language ||
        Lang.English;
      let subnodes: string[] = [];
      if (typeof subnodess === "string") subnodes = subnodess.split(".");
      else subnodes = subnodess;
      subnodess = <string[]>subnodess;
      if (guildId) {
        let txt: any = nodes[language];
        subnodes.forEach((node) => {
          txt = txt?.[node];
        });
        if (txt) return txt;
      }
      let txt: any = nodes[Lang.English];
      subnodes.forEach((node) => {
        txt = txt[node];
      });
      if (txt) return txt;
      return `❗ Invalid language node (${subnodes.join(
        "."
      )}, ${language})! Please report this to the Gamma discord server (https://discord.gg/XNDAw7Y)`;
    } catch (err) {
      console.error(subnodess);
    }
  },
  replaceNodes: async (guildId: string, text: string): Promise<string> => {
    for (let i = 0; i < text.length; i++) {
      if (text.charAt(i) === "{") {
        const start = i;
        while (text.charAt(i) !== "}") i++;
        const placeholder = text.substring(start + 1, i);
        text = text.replace(
          `{${placeholder}}`,
          await Language.getNode(guildId, placeholder.split("."))
        );
      }
    }
    return text;
  },
  parseNodes: async (
    guildId: string,
    subnodes: string[] | string
  ): Promise<string> => {
    const node = await Language.getNode(guildId, subnodes);
    return await Language.replaceNodes(guildId, node);
  },
};
