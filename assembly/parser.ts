// assembly/parser.ts
import { Node } from "./ast";

export function parseProgram(_src: string): Node {
  // Placeholder parser - NOT FINALIZED
  const moves = new Node("MoveSeq", "", [
    new Node("Move", "DRVF"),
    new Node("Move", "TRNL"),
  ]);
  const k = new Node("KeyStmt", "key A =", [moves]);
  return new Node("Program", "", [new Node("EXEC"), k, new Node("HALT")]);
}
