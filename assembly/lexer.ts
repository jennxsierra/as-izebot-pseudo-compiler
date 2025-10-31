// assembly/lexer.ts
import { Token, TokKind } from "./tokens";

export function lex(_src: string): Array<Token> {
  // Placeholder lexer - NOT FINALIZED
  const out = new Array<Token>();
  out.push(new Token(TokKind.EXEC, "EXEC", 1, 1));
  out.push(new Token(TokKind.HALT, "HALT", 1, 6));
  out.push(new Token(TokKind.EOF, "", 1, 10));
  return out;
}
