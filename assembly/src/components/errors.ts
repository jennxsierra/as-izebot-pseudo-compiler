// Error helpers used by the parser to produce exact, testable messages.
// Each helper returns a ParseError instance where the message is prefixed
// with the source tag (e.g., [Program Error]) and includes token context
// where applicable (lexeme and token index).
import { Token } from './types';
export class ParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ParseError';
  }
}

// General error with custom message and source tag
export function errorMessage(message: string, source: string): ParseError {
  return new ParseError('[' + source + ' Error] ' + message);
}

export function errorToken(token: Token, message: string, source: string): ParseError {
  // Include token lexeme and its token array index for clarity in messages
  const lexeme = token.value;
  return new ParseError('[' + source + ' Error] ' + message + " ['" + lexeme + "' @ index " + token.position.toString() + "]");
}

export function errorTokens(tokens: Token[], message: string, source: string): ParseError {
  // Join lexemes for a concise multi-token context and report the first token index
  let tokenString = '';
  for (let i = 0; i < tokens.length; i++) {
    if (i > 0) tokenString += ' ';
    tokenString += tokens[i].value;
  }
  const pos = tokens.length > 0 ? tokens[0].position : 0;
  return new ParseError('[' + source + ' Error] ' + message + " ['" + tokenString + "' @ index " + pos.toString() + "]");
}
