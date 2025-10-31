import { TokenType } from './types';
import { TokenUtils } from './tokens';

export class ErrorReporter {
  
  static reportLexicalError(char: string, position: i32): string {
    let msg = 'LEXICAL ERROR at position ' + position.toString() + ': ';
    msg += 'Illegal character \'' + char + '\'. ';
    msg += 'Expected one of: EXEC, HALT, key, =, >, A, B, C, D, DRVF, DRVB, TRNL, TRNR, SPNL, SPNR';
    return msg;
  }

  static reportSyntaxError(nonterminal: string, lookahead: string, expected: string[]): string {
    let msg = 'SYNTAX ERROR: While parsing ' + nonterminal + ', found \'' + lookahead + '\'. ';
    msg += 'Expected: ';
    for (let i = 0; i < expected.length; i++) {
      if (i > 0) msg += ', ';
      msg += expected[i];
    }
    return msg;
  }

  static invalidSentence(): string {
    return 'Invalid sentence of the meta-language';
  }
}
