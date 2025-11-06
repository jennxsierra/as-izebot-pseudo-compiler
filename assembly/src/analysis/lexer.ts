// Lexer: convert input string into a stream of tokens for the parser.
// Keeps logic small and deterministic: whitespace is skipped and any
// unknown lexeme is emitted as an INVALID token for later contextual
// reporting by the parser.
import { Token, TokenType } from '../components/types';
import { TokenUtils } from '../components/tokens';

export class Lexer {
  private input: string;
  private position: i32;
  private currentChar: string = '';

  constructor(input: string) {
    this.input = input;
    this.position = 0;
    if (this.position < this.input.length) {
      this.currentChar = this.input.charAt(this.position);
    }
  }

  // Advance the current position by one character and update 'currentChar'.
  // Keeps a sentinel empty string when we pass the end of input.
  private advance(): void {
    this.position++;
    if (this.position < this.input.length) {
      this.currentChar = this.input.charAt(this.position);
    } else {
      this.currentChar = '';
    }
  }

  // Consume ASCII whitespace (space, newline, CR, tab) until a non-space char
  // or end-of-input is reached.
  private skipWhitespace(): void {
    while (this.currentChar == ' ' || this.currentChar == '\n' || 
           this.currentChar == '\r' || this.currentChar == '\t') {
      this.advance();
    }
  }

  // Read an adjacent alphanumeric sequence (keyword, key id, or move mnemonic).
  // Stops at the first non-alphanumeric character and returns the lexeme.
  private readIdentifier(): string {
    let result = '';
    let startPos = this.position;
    while (this.position < this.input.length && this.isAlphaNumeric(this.currentChar)) {
      result += this.currentChar;
      this.advance();
    }
    return result;
  }

  // Simple ASCII-only alphanumeric check (letters and digits).
  // This intentionally avoids unicode handling for determinism.
  private isAlphaNumeric(char: string): bool {
    if (char.length == 0) return false;
    let code = char.charCodeAt(0);
    return (code >= 65 && code <= 90) || (code >= 97 && code <= 122) || (code >= 48 && code <= 57);
  }

  tokenize(): Token[] {
    let tokens: Token[] = [];
    
    while (this.position < this.input.length) {
      this.skipWhitespace();
      
      if (this.position >= this.input.length) break;

      let startPos = this.position;

      // Single character tokens
      if (this.currentChar == '=') {
        tokens.push(new Token(TokenType.EQUALS, '=', startPos));
        this.advance();
        continue;
      }

      if (this.currentChar == '>') {
        tokens.push(new Token(TokenType.GREATER, '>', startPos));
        this.advance();
        continue;
      }

      // Multi-character tokens (keywords, identifiers)
      if (this.isAlphaNumeric(this.currentChar)) {
        let word = this.readIdentifier();

        if (word == 'EXEC') {
          tokens.push(new Token(TokenType.EXEC, word, startPos));
        } else if (word == 'HALT') {
          tokens.push(new Token(TokenType.HALT, word, startPos));
        } else if (word == 'key') {
          tokens.push(new Token(TokenType.KEY, word, startPos));
        } else if (TokenUtils.isKeyID(word)) {
          tokens.push(new Token(TokenType.KEY_ID, word, startPos));
        } else if (TokenUtils.isMove(word)) {
          tokens.push(new Token(TokenType.MOVE, word, startPos));
        } else {
          // Unknown lexeme: emit INVALID token rather than throwing.
          // Higher-level parser will produce contextual error messages.
          tokens.push(new Token(TokenType.INVALID, word, startPos));
        }
        continue;
      }

      // Non-alphanumeric single character that isn't recognized — emit INVALID
      tokens.push(new Token(TokenType.INVALID, this.currentChar, startPos));
      this.advance();
    }

    tokens.push(new Token(TokenType.EOF, '', this.position));
    return tokens;
  }
}
