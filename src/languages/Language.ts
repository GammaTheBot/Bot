import yaml from "yaml";
import fs from "fs";

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
  getNode: (guild: string, subnodes: string[]): string => {
    let language = Lang.English;
    let txt: any = nodes[language];
    subnodes.forEach((node) => {
      txt = txt[node];
    });
    if (txt) return txt;
    txt = nodes[Lang.English];
    subnodes.forEach((node) => {
      txt = txt[node];
    });
    if (txt) return txt;
    return `❗ Invalid language node (${subnodes.join(
      "."
    )}, ${language})! Please report this to the Gamma discord server (https://discord.gg/XNDAw7Y)`;
  },
};
