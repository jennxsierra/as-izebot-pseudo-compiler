// Generate PBASIC code from the parser's symbol map.
// Responsibilities:
// - Emit the fixed HEADER and FOOTER blocks exactly as specified
// - Emit BODY IF lines in same order as bindings were added to the symbol map
// - Include only the movement subroutines that are actually referenced
import { PBASICBlocks } from './pbasicBlocks';
export class CodeGenerator {
  private symbolMap: Map<string,string>;

  constructor(symbolMap: Map<string,string>) {
    this.symbolMap = symbolMap;
  }

  // Produce the full PBASIC program as a single string
  generate(): string {
    let code = '';
    // Header (static)
    code += PBASICBlocks.getHeader();

    // Body - emit IF lines for each binding in insertion order
    let keys = this.symbolMap.keys();
    for (let i = 0; i < keys.length; i++) {
      let key = keys[i];
      let move = this.symbolMap.get(key);
      let routine = PBASICBlocks.getRoutineName(move);
      let lowerKey = this.toLower(key);
      // Per spec: accept uppercase or lowercase key at runtime
      code += '          IF KEY = "' + key + '" OR KEY = "' + lowerKey + '" THEN GOSUB ' + routine + '\n';
    }

    // Footer1 (static): loop and movement section header
    code += PBASICBlocks.getFooter1();

    // Emit only used movement subroutines
    let usedMoves: string[] = this.getUsedMoves();
    for (let i = 0; i < usedMoves.length; i++) {
      code += PBASICBlocks.getMovementSubroutine(usedMoves[i]);
    }

    // Footer2 (static): Motor_OFF and trailer
    code += PBASICBlocks.getFooter2();

    return code;
  }

  // Determine unique movement mnemonics referenced by the symbol map
  private getUsedMoves(): string[] {
    let moves: string[] = [];
    let keys = this.symbolMap.keys();
    for (let i = 0; i < keys.length; i++) {
      let k = keys[i];
      let move = this.symbolMap.get(k);
      if (!this.arrayContains(moves, move)) {
        moves.push(move);
      }
    }
    return moves;
  }

  private arrayContains(arr: string[], item: string): bool {
    for (let i = 0; i < arr.length; i++) {
      if (arr[i] == item) return true;
    }
    return false;
  }

  private toLower(str: string): string {
    // Simple lowercase for single character A-D
    if (str == 'A') return 'a';
    if (str == 'B') return 'b';
    if (str == 'C') return 'c';
    if (str == 'D') return 'd';
    return str;
  }
}
