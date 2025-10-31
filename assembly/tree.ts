// assembly/tree.ts
import { Node } from "./ast";

export function renderParseTree(root: Node): string {
  const lines = new Array<string>();
  const nodeStack = new Array<Node>();
  const prefStack = new Array<string>();
  const lastStack = new Array<bool>();

  nodeStack.push(root);
  prefStack.push("");
  lastStack.push(true);

  while (nodeStack.length > 0) {
    const n = nodeStack.pop()!;
    const pref = prefStack.pop()!;
    const last = lastStack.pop()!;

    const head = pref.length ? (last ? "└─ " : "├─ ") : "";
    const label = n.value.length ? n.kind + "(" + n.value + ")" : n.kind;
    lines.push(pref + head + label);

    const nextPref = pref + (last ? "   " : "│  ");
    const kids = n.children;
    for (let i = kids.length - 1; i >= 0; i--) {
      const child = kids[i];
      nodeStack.push(child);
      prefStack.push(nextPref);
      lastStack.push(i == kids.length - 1);
    }
  }
  return lines.join("\n");
}
