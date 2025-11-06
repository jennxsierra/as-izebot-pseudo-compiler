import { PBASICBlocks } from './pbasicBlocks';

export class CodeGenerator {
  private symbolMap: Map<string,string>;

  constructor(symbolMap: Map<string,string>) {
    this.symbolMap = symbolMap;
  }

  generate(): string {
    let code = '';
    
    // Add header
    code += PBASICBlocks.getHeader();
    
    // Add body - IF statements for each key binding (iterate map keys)
    let keys = this.symbolMap.keys();
    for (let i = 0; i < keys.length; i++) {
      let key = keys[i];
      let move = this.symbolMap.get(key);
      let routine = PBASICBlocks.getRoutineName(move);
      let lowerKey = this.toLower(key);
      code += '          IF KEY = "' + key + '" OR KEY = "' + lowerKey + '" THEN GOSUB ' + routine + '\n';
    }
    
    // Add footer 1
    code += PBASICBlocks.getFooter1();
    
    // Add movement subroutines (only those referenced)
    let usedMoves: string[] = this.getUsedMoves();
    for (let i = 0; i < usedMoves.length; i++) {
      code += PBASICBlocks.getMovementSubroutine(usedMoves[i]);
    }
    
    // Add footer 2
    code += PBASICBlocks.getFooter2();
    
    return code;
  }

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
