// AST Node types for parse tree
export enum NodeType {
  PROGRAM,
  STMT_LIST,
  BINDING,
  KEY,
  KEY_ID,
  MOVE,
  TERMINAL
}

export class ASTNode {
  nodeType: NodeType;
  value: string;
  children: ASTNode[];

  constructor(nodeType: NodeType, value: string) {
    this.nodeType = nodeType;
    this.value = value;
    this.children = [];
  }

  addChild(child: ASTNode): void {
    this.children.push(child);
  }

  getNodeName(): string {
    if (this.nodeType == NodeType.PROGRAM) return '<program>';
    if (this.nodeType == NodeType.STMT_LIST) return '<stmt_list>';
    if (this.nodeType == NodeType.BINDING) return '<binding>';
    if (this.nodeType == NodeType.KEY) return '<key>';
    if (this.nodeType == NodeType.KEY_ID) return '<key_id>';
    if (this.nodeType == NodeType.MOVE) return '<move>';
    return this.value; // Terminal
  }
  
  // Return concatenated terminal text of this node's subtree (space-separated)
  text(): string {
    if (this.children.length == 0) return this.value;
    let parts: string[] = [];
    for (let i = 0; i < this.children.length; i++) {
      parts.push(this.children[i].text());
    }
    return parts.join(" ");
  }

  // Return the first terminal value found in the subtree or empty string
  firstTerminalValue(): string {
    if (this.children.length == 0) return this.value;
    for (let i = 0; i < this.children.length; i++) {
      let v = this.children[i].firstTerminalValue();
      if (v != "") return v;
    }
    return "";
  }
}
