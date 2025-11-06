import { TokenType } from './types';

// Lightweight token utilities used throughout lexer/parser.
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

  // Recognize grammar keywords exactly (case-sensitive)
  static isKeyword(str: string): bool {
    return str == 'EXEC' || str == 'HALT' || str == 'key';
  }

  // Valid key identifiers per grammar
  static isKeyID(str: string): bool {
    return str == 'A' || str == 'B' || str == 'C' || str == 'D';
  }

  // Valid movement mnemonics per grammar
  static isMove(str: string): bool {
    return str == 'DRVF' || str == 'DRVB' || str == 'TRNL' || 
           str == 'TRNR' || str == 'SPNL' || str == 'SPNR';
  }
}
