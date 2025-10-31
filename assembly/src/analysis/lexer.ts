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

  private advance(): void {
    this.position++;
    if (this.position < this.input.length) {
      this.currentChar = this.input.charAt(this.position);
    } else {
      this.currentChar = '';
    }
  }

  private skipWhitespace(): void {
    while (this.currentChar == ' ' || this.currentChar == '\n' || 
           this.currentChar == '\r' || this.currentChar == '\t') {
      this.advance();
    }
  }

  private readIdentifier(): string {
    let result = '';
    let startPos = this.position;
    while (this.position < this.input.length && this.isAlphaNumeric(this.currentChar)) {
      result += this.currentChar;
      this.advance();
    }
    return result;
  }

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
          // Invalid token
          tokens.push(new Token(TokenType.INVALID, word, startPos));
        }
        continue;
      }

      // If we get here, it's an invalid character
      tokens.push(new Token(TokenType.INVALID, this.currentChar, startPos));
      this.advance();
    }

    tokens.push(new Token(TokenType.EOF, '', this.position));
    return tokens;
  }
}
