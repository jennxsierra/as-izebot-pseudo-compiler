// assembly/ast.ts
export class Node {
  kind: string;
  value: string;
  children: Array<Node>;

  constructor(
    kind: string,
    value: string = "",
    children: Array<Node> = new Array<Node>()
  ) {
    this.kind = kind;
    this.value = value;
    this.children = children;
  }
}
