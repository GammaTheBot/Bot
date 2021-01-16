import fs from "fs";
import yaml from "yaml";
import { toPath, isMap } from "lodash";

export namespace Language {
  export function parseInnerNodes<T>(language: Lang, newNode: any): T {
    if (newNode == null) return null;
    if (typeof newNode === "string") {
      let node = newNode as string;
      bigLoop: for (let i = 0; i < node.length; i++) {
        if (node.charAt(i) === "{") {
          const start = i++;
          if (node.charAt(i) === "@") {
            for (; i < node.length; i++) {
              if (node[i] === "}") break;
              if (i === node.length - 1) break bigLoop;
            }
            const placeholder = node.substring(start + 2, i);
            const thing = getNode(language, placeholder);
            if (thing != null) {
              const replacement = typeof thing === "string" ? thing : thing[0];
              node = node.replace(`{@${placeholder}}`, replacement);
              i = start + replacement.length - 1;
            } else i = start + placeholder.length + 2;
          }
        }
      }
      return (node as unknown) as T;
    } else if (Array.isArray(newNode)) {
      const nodes: any[] = [];
      for (let i1 = 0; i1 < newNode.length; i1++) {
        nodes[i1] = parseInnerNodes<T>(language, newNode[i1]);
      }
      return (nodes as unknown) as T;
    } else if (typeof newNode === "object") {
      if (isMap(newNode)) {
        newNode.forEach((value, key) => {
          newNode.set(key, parseInnerNodes<T>(language, value));
        });
        return (newNode as unknown) as T;
      } else {
        const nodes = {};
        Object.entries(newNode).forEach((entry) => {
          nodes[entry[0]] = parseInnerNodes<T>(language, entry[1]);
        });
        return (nodes as unknown) as T;
      }
    } else return (newNode as unknown) as T;
  }

  export function getNode<T>(language: Lang, node: string | string[]): T {
    if (typeof node === "string") node = toPath(node);
    let newNode = nodes?.get(language);
    for (let i = 0; i < node.length; i++) {
      if (isMap(newNode)) newNode = newNode.get(node[i]);
      else return (newNode as unknown) as T;
    }
    return (newNode as unknown) as T;
  }
}

const files = fs.readdirSync(`${__dirname}/languages/`);
type Node = Map<string, Node | any>;

const nodes: Map<Lang, Map<string, Node>> = new Map();
export enum Lang {
  English = "English",
}
files.forEach((file) => {
  if (file.endsWith(".yaml")) {
    const json = yaml.parse(
      fs.readFileSync(`${__dirname}/languages/${file}`).toString()
    );
    const language = file.split(".")[0] as Lang;
    nodes.set(language, new Map());
    function valuesToMap(map: Map<string, Node>, json: {}) {
      Object.entries(json).forEach((entry) => {
        if (typeof entry[1] === "object" && !Array.isArray(entry[1])) {
          if (!map.has(entry[0])) map.set(entry[0], new Map());
          valuesToMap(map.get(entry[0]), entry[1]);
        } else {
          map.set(entry[0], entry[1] as any);
        }
      });
    }
    valuesToMap(nodes.get(language), json);
  }
});
Array.from(nodes.entries()).forEach((entry) => {
  nodes.set(entry[0], Language.parseInnerNodes(entry[0], entry[1]));
});
