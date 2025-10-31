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
}
