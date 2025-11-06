import { TokenType } from './types';

// Token utilities
export class TokenUtils {
  
  static tokenTypeToString(type: TokenType): string {
    if (type == TokenType.EXEC) return 'EXEC';
    if (type == TokenType.HALT) return 'HALT';
    if (type == TokenType.KEY) return 'key';
    if (type == TokenType.EQUALS) return '=';
    if (type == TokenType.GREATER) return '>';
    if (type == TokenType.KEY_ID) return 'KEY_ID';
    if (type == TokenType.MOVE) return 'MOVE';
    if (type == TokenType.EOF) return 'EOF';
    return 'INVALID';
  }

  static isKeyword(str: string): bool {
    return str == 'EXEC' || str == 'HALT' || str == 'key';
  }

  static isKeyID(str: string): bool {
    return str == 'A' || str == 'B' || str == 'C' || str == 'D';
  }

  static isMove(str: string): bool {
    return str == 'DRVF' || str == 'DRVB' || str == 'TRNL' || 
           str == 'TRNR' || str == 'SPNL' || str == 'SPNR';
  }
}
