// AST node definitions used to build a simple parse tree.
// The AST is intentionally small: each node stores a NodeType and
// either a terminal value or children for internal nodes. Utility
// methods provide convenient textual views used by the renderer and
// the code generator.
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

  // Append a child node to this node's children array
  addChild(child: ASTNode): void {
    this.children.push(child);
  }

  // Human-readable node label used by the tree renderer. Internal
  // nodes return their grammar nonterminal name; terminals return
  // the stored lexeme value.
  getNodeName(): string {
    if (this.nodeType == NodeType.PROGRAM) return '<program>';
    if (this.nodeType == NodeType.STMT_LIST) return '<stmt_list>';
    if (this.nodeType == NodeType.BINDING) return '<binding>';
    if (this.nodeType == NodeType.KEY) return '<key>';
    if (this.nodeType == NodeType.KEY_ID) return '<key_id>';
    if (this.nodeType == NodeType.MOVE) return '<move>';
    return this.value; // Terminal
  }
  
  // Return concatenated terminal text of this node's subtree (space-separated).
  // Useful for building derivation prefixes and for code generation.
  text(): string {
    if (this.children.length == 0) return this.value;
    let parts: string[] = [];
    for (let i = 0; i < this.children.length; i++) {
      parts.push(this.children[i].text());
    }
    return parts.join(" ");
  }

  // Return the first terminal value found in the subtree or an empty string.
  // This is handy when a node's semantic value is stored as the left-most
  // terminal (for example, the key identifier under a <key> node).
  firstTerminalValue(): string {
    if (this.children.length == 0) return this.value;
    for (let i = 0; i < this.children.length; i++) {
      let v = this.children[i].firstTerminalValue();
      if (v != "") return v;
    }
    return "";
  }
}
