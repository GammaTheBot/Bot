import fs from "fs";
import yaml from "yaml";

const files = fs.readdirSync(__dirname);
const nodes: { [key: string]: { [key: string]: string } } = {};

export enum Lang {
  English = "English",
}

files.forEach((file) => {
  if (file.endsWith(`yaml`)) {
    const json = yaml.parse(fs.readFileSync(`${__dirname}/${file}`).toString());
    nodes[(file.replace(/\..*/gi, "") as unknown) as Lang] = json;
  }
});
