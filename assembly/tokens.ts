// assembly/tokens.ts
export enum TokKind {
  EXEC,
  HALT,
  KEY,
  ID,
  EQ,
  GT,
  MOVE,
  EOF,
  UNKNOWN,
}
export class Token {
  kind: TokKind;
  lexeme: string;
  line: i32;
  col: i32;
  constructor(kind: TokKind, lexeme: string, line: i32, col: i32) {
    this.kind = kind;
    this.lexeme = lexeme;
    this.line = line;
    this.col = col;
  }
}
