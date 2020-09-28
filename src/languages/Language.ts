import yaml from "yaml";
import fs from "fs";

const files = fs.readdirSync(__dirname);

const nodes: { [key: string]: { [key: string]: string } } = {};

files.forEach((file) => {
  if (file.endsWith("yaml")) {
    const json = yaml.parse(fs.readFileSync(`${__dirname}/${file}`).toString());
    nodes[(file.replace(/\..*/gi, "") as unknown) as Lang] = json;
    console.log(nodes);
  }
});

export enum Lang {
  English = "English",
}

export const Language = {
  getNode: (language: Lang, node: string): string => {
    console.log(language);
    const txt = nodes[language][node];
    if (txt) return txt;
    const english = nodes[Lang.English][node];
    if (english) return english;
    return `❗ Invalid language node (${node}, ${language})! Please report this to the Gamma discord server (https://discord.gg/XNDAw7Y)`;
  },
};
