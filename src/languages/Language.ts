import yaml from "yaml";
import fs from "fs";

const files = fs.readdirSync(__dirname);

const nodes: Map<Lang, { [key: string]: string }> = new Map();

files.forEach((file) => {
  if (file.endsWith("yaml")) {
    nodes[file.replace(/\..*/gi, "")] = yaml.parse(
      fs.readFileSync(`${__dirname}/${file}`).toString()
    );
  }
});

export enum Lang {
  English,
}

export class Language {
  static getNode(language: Lang, node: string): string {
    const txt = nodes.get(language)[node];
    if (txt) return txt;
    const english = nodes.get(Lang.English)[node];
    if (english) return english;
    return `❗ Invalid language node (${node}, ${language})! Please report this to the Gamma discord server (https://discord.gg/XNDAw7Y)`;
  }
}
