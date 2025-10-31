import { SymbolEntry } from '../components/types';
import { PBASICBlocks } from './pbasicBlocks';

export class CodeGenerator {
  private symbolTable: SymbolEntry[];

  constructor(symbolTable: SymbolEntry[]) {
    this.symbolTable = symbolTable;
  }

  generate(): string {
    let code = '';
    
    // Add header
    code += PBASICBlocks.getHeader();
    
    // Add body - IF statements for each key binding
    for (let i = 0; i < this.symbolTable.length; i++) {
      let entry = this.symbolTable[i];
      let routine = PBASICBlocks.getRoutineName(entry.move);
      let lowerKey = this.toLower(entry.key);
      code += 'IF KEY = "' + entry.key + '" OR KEY = "' + lowerKey + '" THEN GOSUB ' + routine + '\n';
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
    for (let i = 0; i < this.symbolTable.length; i++) {
      let move = this.symbolTable[i].move;
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
