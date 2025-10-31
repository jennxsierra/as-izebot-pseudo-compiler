// assembly/index.ts
import { grammarAsText } from "./grammar";
import { buildDerivation } from "./derivation";
import { parseProgram } from "./parser";
import { renderParseTree } from "./tree";
import { generatePBASIC } from "./codegen";
import { Node } from "./ast";

function esc(s: string): string {
  let out = "";
  for (let i = 0, n = s.length; i < n; i++) {
    const c = s.charCodeAt(i);
    if (c == 34) out += '\\"';
    else if (c == 92) out += "\\\\";
    else if (c == 10) out += "\\n";
    else if (c == 13) out += "\\r";
    else if (c == 9) out += "\\t";
    else out += String.fromCharCode(c);
  }
  return out;
}

export function showGrammar(): string {
  return grammarAsText();
}

export function compile(input: string): string {
  // TODO: replace with real lexer → parser; stubs are fine for now
  const tree: Node = parseProgram(input);
  const deriv = buildDerivation(input);
  const ascii = renderParseTree(tree);
  const pbasic = generatePBASIC(tree);
  const grammar = grammarAsText();

  const derivJson =
    "[" + deriv.map<string>((d: string) => '"' + esc(d) + '"').join(",") + "]";

  const json =
    '{"grammar":"' +
    esc(grammar) +
    '",' +
    '"derivationSteps":' +
    derivJson +
    "," +
    '"parseTreeAscii":"' +
    esc(ascii) +
    '",' +
    '"pbasic":"' +
    esc(pbasic) +
    '"}';

  return json;
}
